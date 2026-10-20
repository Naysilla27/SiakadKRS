# ALUR DAN PROSES BISNIS SISTEM KRS & PERWALIAN
**SIAKAD — UNIVERSITAS JENDERAL ACHMAD YANI (UNJANI)**  
Mata Kuliah: **SI611029 — Implementasi dan Pengujian Sistem Informasi**

Dokumen ini menjelaskan seluruh diagram alir (*flowchart*), status siklus hidup (*lifecycle*), dan logika validasi yang bekerja di dalam sistem KRS.

---

## 1. DIAGRAM ALUR UTAMA (END-TO-END SYSTEM FLOW)

```mermaid
flowchart TD
    Start([Mulai]) --> RoleSelect{Pilih Peran Pengguna}

    %% ALUR MAHASISWA
    RoleSelect -->|Mahasiswa| M_Login[Login Mahasiswa]
    M_Login --> M_CheckSks[Cek Jatah Maksimal SKS<br/>Berdasarkan IPS Semester Lalu]
    M_CheckSks --> M_Catalog[Buka Katalog Mata Kuliah & Jadwal]
    M_Catalog --> M_Pick[Pilih Kelas Mata Kuliah]
    
    M_Pick --> Val_DB{Validasi Sistem &<br/>Trigger PostgreSQL}
    Val_DB -->|Total SKS > 24| Err_SKS[Ditolak Trigger: Error 23514<br/>Melebihi Batas 24 SKS]
    Err_SKS --> M_Catalog
    Val_DB -->|Kuota Penuh / Bentrok| Err_Quota[Ditolak: Kuota Penuh / Bentrok]
    Err_Quota --> M_Catalog
    Val_DB -->|Lolos Validasi| M_Draft[Tersimpan di Draft KRS<br/>Update Visual Timetable & SKS Meter]

    M_Draft --> M_More{Tambah MK Lagi?}
    M_More -->|Ya| M_Catalog
    M_More -->|Tidak, Sudah Cukup| M_Submit[Klik: Ajukan ke Dosen Wali]
    
    M_Submit --> Status_Diajukan[Status: DIAJUKAN<br/>Pilihan MK Terkunci / Read-Only]

    %% ALUR DOSEN WALI
    RoleSelect -->|Dosen PA| D_Login[Login Dosen Pembimbing Akademik]
    Status_Diajukan -.-> D_Review[Dosen PA Membuka Daftar Bimbingan]
    D_Login --> D_Review
    D_Review --> D_Check[Tinjau Rencana Studi & Total SKS Mahasiswa]
    D_Check --> D_Notes[Input Catatan Bimbingan Perwalian]
    
    D_Notes --> D_Decision{Keputusan Dosen PA?}
    
    D_Decision -->|Minta Revisi| Status_Revisi[Status: REVISI<br/>Draft Terbuka Kembali]
    Status_Revisi -.->|Mahasiswa Memperbaiki| M_Draft
    
    D_Decision -->|Setujui / Approve| Status_Disetujui[Status: DISETUJUI / SAH<br/>Terbit Digital QR Code Verifikasi]
    
    Status_Disetujui --> M_Print[Cetak Lembar KRS Resmi Ber-Kop UNJANI]
    M_Print --> Finish([Selesai])

    %% ALUR ADMIN
    RoleSelect -->|Admin Akademik| A_Login[Login Admin Akademik]
    A_Login --> A_CRUD{Pilih Modul CRUD}
    A_CRUD --> A_Mhs[CRUD Mahasiswa]
    A_CRUD --> A_Dsn[CRUD Dosen]
    A_CRUD --> A_MK[CRUD Mata Kuliah]
    A_CRUD --> A_Kelas[CRUD Jadwal & Kuota Kelas]
    A_CRUD --> A_Periode[Atur Periode KRS & Batas SKS]

    %% ALUR TESTING
    RoleSelect -->|QA Tester| Q_Login[Buka Testing & Quality Hub]
    Q_Login --> Q_RunSuite[Eksekusi 4 Level Testing Suite<br/>L1, L2, L3, L4 UAT]
    Q_Login --> Q_SimTrigger[Simulasi Boundary Test 25 SKS]
    Q_Login --> Q_Defect[Pelacakan Defect Lifecycle]
```

---

## 2. DIAGRAM SIKLUS STATUS KRS (KRS STATUS LIFECYCLE)

Setiap transaksi KRS mahasiswa mengalami 4 tahapan status:

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Mahasiswa Mulai Memilih MK
    
    DRAFT --> DRAFT : Tambah / Hapus Mata Kuliah
    DRAFT --> DIAJUKAN : Mahasiswa Klik 'Ajukan ke Dosen Wali'
    
    state DIAJUKAN {
        [*] --> Terkunci : Form Terkunci (Read-Only)
        Terkunci --> MenungguReview : Masuk Antrean Review Dosen PA
    }
    
    DIAJUKAN --> REVISI : Dosen PA Memberikan Catatan Perbaikan
    DIAJUKAN --> DISETUJUI : Dosen PA Mensahkan KRS
    
    REVISI --> DRAFT : Kunci Terbuka, Mahasiswa Memperbaiki Pilihan
    
    state DISETUJUI {
        [*] --> Sah : Status Resmi Kampus
        Sah --> QR_Generated : Barcode Digital Terbit
        QR_Generated --> SiapCetak : Dokumen PDF Siap Dicetak
    }
    
    DISETUJUI --> [*]
```

---

## 3. LOGIKA VALIDASI TRIGGER DATABASE (SLIDE 14 & 15)

Proses penegakan aturan batas SKS dilakukan di tingkat **PostgreSQL Database Trigger** untuk menjamin data tidak dapat dimanipulasi melalui jalur mana pun:

```mermaid
flowchart TD
    Step1[Aplikasi mengirim query:<br/>INSERT INTO krs_detail] --> Step2[Trigger BEFORE INSERT terpanggil:<br/>fn_cek_maks_sks]
    Step2 --> Step3[Ambil batas maksimum dari tabel:<br/>SELECT nilai FROM aturan_akademik WHERE kode='maks_sks' -> 24]
    Step3 --> Step4[Hitung SKS kelas baru + SKS yang sudah ada di KRS]
    Step4 --> Step5{Total SKS > 24?}
    
    Step5 -->|Ya / Melanggar| Step6[RAISE EXCEPTION 23514:<br/>'Total SKS melebihi batas 24 SKS']
    Step6 --> Step7[ROLLBACK Otomatis<br/>Data Tidak Tersimpan ke Database]
    Step7 --> Step8[Aplikasi Web Menampilkan Notifikasi Error ke User]
    
    Step5 -->|Tidak / Sesuai| Step9[RETURN NEW<br/>COMMIT Data Tersimpan]
    Step9 --> Step10[Aplikasi Web Menampilkan Status Berhasil]
```

---

## 4. PENJELASAN ALUR KERJA PER PERAN (ROLE RESPONSIBILITIES)

### A. Alur Mahasiswa
1. **Inisialisasi**: Mahasiswa membuka sistem, sistem membaca NIM, program studi, serta kuota maksimal SKS (standar 24 SKS).
2. **Eksplorasi**: Mahasiswa melihat katalog mata kuliah yang dibuka pada semester aktif (Semester Ganjil 2026/2027).
3. **Seleksi & Verifikasi Real-Time**:
   - Setiap kali memilih kelas, SKS Meter dan Kalender Visual Mingguan (Senin–Jumat) langsung diperbarui.
   - Jika kuota kelas penuh atau total SKS melampaui 24, sistem langsung memberi peringatan dan membatalkan penambahan.
4. **Pengajuan Bimbingan**: Mahasiswa mengklik tombol "Ajukan ke Dosen Wali". Status berubah menjadi `diajukan` dan formulir terkunci.
5. **Pencetakan**: Begitu Dosen PA menyetujui, tombol "Cetak Lembar KRS" aktif dan menghasilkan kartu studi resmi ber-Kop UNJANI dengan QR Code.

### B. Alur Dosen Pembimbing Akademik (Dosen PA)
1. **Monitoring**: Dosen PA melihat daftar seluruh mahasiswa perwalian yang diampunya beserta status KRS masing-masing.
2. **Review Rencana Studi**: Dosen membuka detail mahasiswa yang berstatus `diajukan` untuk memeriksa kesesuaian mata kuliah wajib, pilihan, dan prasyarat.
3. **Keputusan & Bimbingan**:
   - Jika disetujui: Dosen menekan tombol **Setujui & Sahkan KRS**, status berubah menjadi `disetujui`.
   - Jika tidak disetujui: Dosen menulis catatan perwalian (misal: *"Kurangi 1 MK pilihan agar tidak bentrok dengan KP"*) lalu menekan **Minta Revisi**. Status kembali ke `revisi` agar mahasiswa dapat memperbaiki.

### C. Alur Admin Akademik (CRUD Master Data)
1. **Master Mahasiswa**: Menambah mahasiswa baru, mengubah dosen pembimbing PA, atau menonaktifkan status mahasiswa.
2. **Master Dosen**: Mengelola identitas dosen, NIDN, email resmi, dan alokasi program studi.
3. **Master Kurikulum**: Mengatur mata kuliah, kode MK, bobot SKS (1–6), dan semester pelaksanaan.
4. **Master Kelas & Jadwal**: Menentukan kuota kelas, hari, jam pelaksanaan, dan ruang kuliah (misal: R.301, Lab Komputer).

### D. Alur Quality & Testing Hub (Materi SI611029)
1. **Automated Test Harness**: Mengevaluasi 4 tingkatan testing:
   - **L1 (Unit)**: Uji batas nilai 24 SKS vs 25 SKS.
   - **L2 (Integration)**: Uji integritas relasi foreign key dan composite key.
   - **L3 (System)**: Uji alur transaksi end-to-end.
   - **L4 (Acceptance/UAT)**: Uji kelayakan dokumen cetak resmi.
2. **Defect Tracking Lifecycle**: Melacak temuan cacat dengan tahapan:
   $$\text{Human Error} \longrightarrow \text{Fault (Code)} \longrightarrow \text{Eksekusi} \longrightarrow \text{Failure} \longrightarrow \text{Fix} \longrightarrow \text{Retest}$$
