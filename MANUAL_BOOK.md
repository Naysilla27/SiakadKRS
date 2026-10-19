# PANDUAN PENGGUNA (MANUAL BOOK)
# SISTEM INFORMASI AKADEMIK (SIAKAD) — MODUL KRS & PERWALIAN
**Universitas Jenderal Achmad Yani (UNJANI)**  
Mata Kuliah: **SI611029 — Implementasi dan Pengujian Sistem Informasi**  
Dosen Pengampu: **Dr. Ir. Sigit Anggoro, S.T., M.T., IPM** & **Irma Santikarama, S.Kom., M.T**

---

## DAFTAR ISI
1. [PENDAHULUAN & ARSITEKTUR SISTEM](#1-pendahuluan--arsitektur-sistem)
2. [CARA MENJALANKAN APLIKASI](#2-cara-menjalankan-aplikasi)
3. [FITUR NAVIGASI & QUICK ROLE SWITCHER](#3-fitur-navigasi--quick-role-switcher)
4. [PANDUAN PERAN 1: MAHASISWA](#4-panduan-peran-1-mahasiswa)
   - 4.1 Melihat Profil & Batas SKS (SKS Gauge)
   - 4.2 Memilih & Menghapus Mata Kuliah
   - 4.3 Matriks Jadwal Kuliah Mingguan
   - 4.4 Mengajukan KRS ke Dosen Wali
   - 4.5 Mencetak Lembar KRS Resmi Ber-Kop UNJANI
5. [PANDUAN PERAN 2: DOSEN PEMBIMBING AKADEMIK (PA)](#5-panduan-peran-2-dosen-pembimbing-akademik-pa)
   - 5.1 Memantau Daftar Mahasiswa Bimbingan
   - 5.2 Meninjau Rencana Studi (Review KRS)
   - 5.3 Memberi Catatan Perwalian & Approval / Revisi
6. [PANDUAN PERAN 3: ADMIN AKADEMIK (CRUD MASTER DATA)](#6-panduan-peran-3-admin-akademik-crud-master-data)
   - 6.1 CRUD Data Mahasiswa
   - 6.2 CRUD Data Dosen
   - 6.3 CRUD Data Mata Kuliah
   - 6.4 CRUD Jadwal & Kuota Kelas
7. [PANDUAN PERAN 4: QUALITY ASSURANCE & TESTING HUB](#7-panduan-peran-4-quality-assurance--testing-hub)
   - 7.1 Menjalankan Automated Test Suite (4 Level Testing)
   - 7.2 Simulasi Pelanggaran Batas SKS (Trigger Database Error 23514)
   - 7.3 Pelacakan Defect (Error → Fault → Defect → Failure)
8. [PENGUJIAN CLI & SKRIP DATABASE (SLIDE 29-31)](#8-pengujian-cli--skrip-database-slide-29-31)
9. [FAQ & TROUBLESHOOTING](#9-faq--troubleshooting)

---

## 1. PENDAHULUAN & ARSITEKTUR SISTEM

Sistem KRS & Perwalian SIAKAD UNJANI dibangun untuk mengotomatisasi proses bisnis pengisian rencana studi dan bimbingan akademik dengan integritas data yang ketat.

### Komponen Sistem Informasi (Sesuai Materi Kuliah):
- **People**: Mahasiswa, Dosen PA, Admin Akademik, dan QA Tester.
- **Process**: Pengisian KRS → Validasi Batas SKS & Kuota → Pengajuan Perwalian → Approval Dosen PA → Pencetakan KRS Resmi.
- **Data**: 9 tabel terintegrasi di PostgreSQL (`aturan_akademik`, `prodi`, `dosen`, `periode`, `mata_kuliah`, `mahasiswa`, `kelas`, `krs`, `krs_detail`).
- **Technology**: React 18, Tailwind CSS, Lucide Icons, Express.js REST API, dan PostgreSQL 18.

---

## 2. CARA MENJALANKAN APLIKASI

### Langkah Cepat (1-Klik via File Batch):
1. Buka folder proyek Anda di **`C:\ipsi_krs`**.
2. Klik dua kali pada file **`run_web.bat`**.
3. Buka browser dan akses:
   👉 **http://localhost:5174** (atau port yang tertera pada jendela terminal).

### Menjalankan Lewat Terminal Visual Studio Code:
1. Buka **Visual Studio Code** di folder `C:\ipsi_krs`.
2. Buka Terminal baru (**Ctrl + `**).
3. Ketik perintah:
   ```bash
   npm run dev
   ```
4. Sistem akan menjalankan:
   - **Backend API**: `http://localhost:5005`
   - **Frontend UI**: `http://localhost:5174`

---

## 3. FITUR NAVIGASI & QUICK ROLE SWITCHER

Di pojok kanan atas aplikasi web terdapat menu **Peran Aktif (Quick Role Switcher)**. Fitur ini dirancang khusus untuk mempermudah demonstrasi/presentasi di depan dosen:

- Anda tidak perlu bolak-balik logout dan mengetik password.
- Cukup klik dropdown, lalu pilih salah satu:
  1. **Andi Pratama** (Mahasiswa - Status Disetujui)
  2. **Bunga Lestari** (Mahasiswa - Status Diajukan)
  3. **Dimas Saputra** (Mahasiswa - Status Draft)
  4. **Dr. Ir. Sigit Anggoro, S.T., M.T.** (Dosen PA)
  5. **Irma Santikarama, S.Kom., M.T** (Dosen PA)
  6. **Admin Akademik (CRUD)**
  7. **QA & Tester (Testing Hub)**

Sistem akan otomatis menyesuaikan data, hak akses, dan tampilan antarmuka sesuai peran yang dipilih!

---

## 4. PANDUAN PERAN 1: MAHASISWA

Portal Mahasiswa digunakan untuk merencanakan perkuliahan pada semester aktif.

### 4.1 Melihat Profil & Batas SKS (SKS Gauge)
- Pada bagian atas terdapat kartu profil mahasiswa (NIM, Nama, Prodi, Angkatan, dan Nama Dosen Pembimbing PA).
- Terdapat indikator **Beban SKS**:
  - Menampilkan jumlah SKS yang sedang diambil dibandingkan batas maksimal (contoh: `11 / 24 Maks`).
  - Warna angka otomatis berubah (kuning saat normal, merah jika melampaui batas).

### 4.2 Memilih & Menghapus Mata Kuliah
1. Di tab **Pilihan Mata Kuliah & KRS**, sisi kanan menampilkan **Katalog Mata Kuliah**.
2. Anda dapat mencari mata kuliah melalui kotak pencarian atau memfilter berdasarkan semester.
3. Klik tombol **Ambil Kelas Ini** pada mata kuliah yang diinginkan:
   - Sistem akan mengecek batas 24 SKS. Jika total SKS + MK baru $\le 24$, mata kuliah langsung masuk ke daftar.
   - Jika melebihi 24 SKS, sistem dan database akan menolak secara otomatis dan memunculkan pesan error.
4. Pada sisi kiri (**Mata Kuliah Diambil**), Anda dapat membatalkan pilihan dengan mengklik tombol ikon **Tempat Sampah (Hapus)**.

### 4.3 Matriks Jadwal Kuliah Mingguan
1. Klik tab **Jadwal Kuliah Mingguan**.
2. Sistem akan menampilkan kalender grid visual dari **Senin sampai Jumat**.
3. Setiap mata kuliah yang Anda ambil otomatis di-plot ke kolom hari dan jam yang sesuai dengan warna hijau emerald UNJANI, sehingga Anda langsung mengetahui jika ada jam perkuliahan yang berdekatan.

### 4.4 Mengajukan KRS ke Dosen Wali
1. Setelah selesai memilih mata kuliah, klik tombol oranye **Ajukan ke Dosen Wali** di pojok kanan atas kartu profil.
2. Status KRS akan berubah dari **Draft** menjadi **Menunggu Review Dosen (Diajukan)**.
3. **Penting**: Saat status *Diajukan*, pilihan mata kuliah otomatis **terkunci (Read-Only)** agar data tidak berubah ketika sedang diperiksa oleh dosen pembimbing.
4. *(Tersedia tombol demo "Buka Kunci / Kembalikan ke Draft" jika Anda ingin menguji coba kembali).*

### 4.5 Mencetak Lembar KRS Resmi Ber-Kop UNJANI
1. Saat KRS telah disetujui (atau dapat dicoba kapan saja), klik tombol **Cetak Lembar KRS**.
2. Modal pratinjau dokumen resmi akan terbuka dengan format:
   - **Kop Resmi**: Yayasan Kartika Eka Paksi — Universitas Jenderal Achmad Yani — Fakultas Sains dan Informatika.
   - Tabel biodata mahasiswa dan tabel rincian mata kuliah lengkap.
   - **Digital Verification QR Code**: Bukti keaslian dokumen SIAKAD UNJANI.
   - Area tanda tangan Mahasiswa dan Dosen PA.
3. Klik tombol **Cetak / Simpan PDF** untuk langsung mencetak ke printer atau menyimpannya sebagai file PDF siap kumpul!

---

## 5. PANDUAN PERAN 2: DOSEN PEMBIMBING AKADEMIK (PA)

Portal Dosen PA digunakan oleh dosen wali untuk memantau, membimbing, dan memvalidasi rencana studi mahasiswa bimbingannya.

### 5.1 Memantau Daftar Mahasiswa Bimbingan
1. Masuk ke **Portal Dosen PA** (atau pilih Dosen di Role Switcher).
2. Anda akan melihat kartu identitas dosen (NIDN, Nama Lengkap, Email resmi).
3. Tabel di bawahnya menampilkan seluruh mahasiswa bimbingan akademik Anda beserta:
   - Total SKS yang diambil mahasiswa.
   - Status KRS masing-masing mahasiswa (`Draft`, `Perlu Review`, `Disetujui`, atau `Revisi`).
   - Filter cepat status di bagian atas tabel.

### 5.2 Meninjau Rencana Studi (Review KRS)
1. Cari mahasiswa yang berstatus **Perlu Review** (contoh: Bunga Lestari).
2. Klik tombol **Review & Setujui**.
3. Jendela pop-up modal akan menampilkan seluruh mata kuliah yang diambil mahasiswa tersebut beserta kalkulasi total SKS-nya.

### 5.3 Memberi Catatan Perwalian & Approval / Revisi
1. Pada kolom **Catatan Bimbingan / Arahan Perwalian**, ketikkan arahan dosen (misalnya: *"Rencana studi disetujui, harap perhatikan jadwal praktikum basis data"* atau *"Revisi: Mohon ambil mata kuliah prasyarat terlebih dahulu"*).
2. Klik tombol hijau **Setujui & Sahkan KRS** jika rencana studi sudah benar.
   - Status mahasiswa seketika berubah menjadi **Disetujui**.
3. Atau klik tombol merah **Minta Revisi Rencana Studi** jika ada mata kuliah yang harus diganti.
   - Status mahasiswa berubah menjadi **Revisi**, kunci edit terbuka kembali di sisi mahasiswa, dan catatan Anda akan tampil di dashboard mahasiswa!

---

## 6. PANDUAN PERAN 3: ADMIN AKADEMIK (CRUD MASTER DATA)

Portal Admin digunakan untuk manajemen data master kampus sesuai kebutuhan tugas perkuliahan (**Create, Read, Update, Delete**).

### 6.1 CRUD Data Mahasiswa
- **Create**: Klik tombol **Tambah Mahasiswa**, isi NIM, Nama, Email, Tahun Masuk, dan pilih Dosen PA $\rightarrow$ Simpan.
- **Read**: Telusuri daftar mahasiswa dengan fitur pencarian real-time berdasarkan Nama atau NIM.
- **Update**: Klik ikon **Pensil (Edit)** pada baris mahasiswa $\rightarrow$ ubah data yang diinginkan $\rightarrow$ Perbarui.
- **Delete**: Klik ikon **Tempat Sampah (Hapus)** $\rightarrow$ konfirmasi dialog $\rightarrow$ data langsung terhapus.

### 6.2 CRUD Data Dosen
- Mengelola data pengajar (NIDN, Nama & Gelar, Email resmi, dan Program Studi).
- Menampilkan jumlah mahasiswa bimbingan yang diampu dosen secara otomatis.

### 6.3 CRUD Data Mata Kuliah
- Mengelola kurikulum (Kode MK, Nama Mata Kuliah, Bobot SKS 1–6, dan Semester Ke- 1–8).
- Validasi otomatis mencegah kode mata kuliah ganda.

### 6.4 CRUD Jadwal & Kuota Kelas
- Menampilkan daftar kelas yang dibuka (contoh: Kelas SI-A, SI-B).
- Menampilkan kuota terisi vs daya tampung kelas (contoh: 15 / 40 Mahasiswa) serta ruangan dan jadwal jam kuliah.

---

## 7. PANDUAN PERAN 4: QUALITY ASSURANCE & TESTING HUB

Menu ini mengimplementasikan materi inti mata kuliah **Implementasi dan Pengujian Sistem Informasi (SI611029)** sesuai Slide 8, 9, 13, 14, 15, dan 16.

### 7.1 Menjalankan Automated Test Suite (4 Level Testing - Slide 16)
1. Buka menu **Testing & Quality Hub**.
2. Klik tombol **Jalankan Automated Test Suite**.
3. Sistem secara otomatis mengeksekusi 5 skenario pengujian lintas level:
   - **L1 Unit Testing**: Validasi rumus batas SKS berdasarkan IPS mahasiswa.
   - **L1 Unit Testing**: Pengujian nilai batas (*Boundary Value Analysis*) 24 SKS vs 25 SKS.
   - **L2 Integration Testing**: Verifikasi integritas komposit primary key `(id_krs, id_kelas)` pada tabel `krs_detail`.
   - **L3 System Testing**: Pengujian alur end-to-end transaksi KRS dari login sampai pengesahan dosen.
   - **L4 Acceptance Testing (UAT)**: Validasi kesesuaian output cetak KRS berkop UNJANI terhadap kebutuhan akademik.
4. Hasil pengujian ditampilkan secara real-time dengan status **PASSED** beserta waktu eksekusi dalam milidetik.

### 7.2 Simulasi Pelanggaran Batas SKS (Trigger Database Error 23514 - Slide 14 & 15)
1. Di kartu sebelah kanan, terdapat kotak **Simulasi Uji Batas SKS**.
2. Klik tombol **Eksekusi Uji Coba Input 25 SKS**.
3. Sistem akan memperagakan bagaimana trigger PostgreSQL `trg_krs_detail_maks_sks` mencegat penyimpanan dan mengeluarkan pesan:
   ```
   [POSTGRESQL TRIGGER RESULT] 23514 (check_violation)
   > ERROR: Total SKS 25 melebihi batas 24 SKS
   ```
4. Ini membuktikan bahwa aturan bisnis dijaga di tingkat **Database Trigger**, bukan hanya di level aplikasi, sehingga data dijamin aman dari manipulasi.

### 7.3 Pelacakan Defect (Slide 13 & 14)
- Menampilkan tabel siklus hidup cacat perangkat lunak:
  $$\text{Human Error} \longrightarrow \text{Fault / Defect} \longrightarrow \text{Eksekusi} \longrightarrow \text{Failure} \longrightarrow \text{Fix \& Retest}$$
- Setiap defect tercatat lengkap dengan modul, jenis error, akar penyebab (*fault*), tingkat keparahan (*severity*), dan status verifikasi QA.

---

## 8. PENGUJIAN CLI & SKRIP DATABASE (SLIDE 29-31)

Selain melalui antarmuka web, Anda juga dapat mendemonstrasikan pengujian langsung lewat terminal Command Prompt / PowerShell sesuai slide presentasi dosen:

### A. Menjalankan Demo CRUD CLI (Slide 30)
Ketik di terminal:
```bash
python app\demo_crud.py
# atau jalankan:
app.bat
```
Output akan memperagakan tahapan:
1. `READ` data mahasiswa
2. `CREATE` mahasiswa baru
3. `UPDATE` nama mahasiswa
4. `ATURAN BISNIS` pembuktian error penolakan 25 SKS (23514)
5. `DELETE` mahasiswa demo
6. `CONSTRAINT` validasi foreign key & check
7. `HAK AKSES` pembuktian akun aplikasi ditolak melakukan DROP TABLE (42501).

### B. Menjalankan Uji 16 Constraint Database (Slide 31)
Ketik di terminal:
```bash
python db\test_constraints.py
# atau jalankan:
dbtest.bat
```
Output akan memvalidasi bahwa seluruh 16 constraint lulus tanpa kegagalan:
```
[PASS] PK: kode_prodi duplikat ditolak
[PASS] NOT NULL: mahasiswa tanpa nama ditolak
[PASS] FK: kode_prodi yang tidak ada ditolak
[PASS] UNIQUE: email mahasiswa kembar ditolak
[PASS] CHECK: tahun_masuk 1999 ditolak (harus >= 2000)
[PASS] RESTRICT: prodi yang dipakai tidak bisa dihapus
[PASS] CASCADE: menghapus KRS menghapus rincian krs_detail
[PASS] TRIGGER: total SKS 25 dari batas 24 ditolak (Error 23514)
...
Hasil: 16 lulus, 0 gagal.
Database dinyatakan SIAP dan BEBAS ERROR KRITIS.
```

---

## 9. FAQ & TROUBLESHOOTING

**Q: Bagaimana jika port 5174 atau 5005 bentrok dengan aplikasi lain?**  
A: Anda dapat mengganti port di file `.env` (misal `PORT=5006`) dan di `vite.config.js`.

**Q: Di mana file database PostgreSQL saya berada?**  
A: Database tersimpan di server PostgreSQL lokal Anda (`localhost:5432`) dengan nama database **`krs_dev`**. Anda dapat melihat dan mengeditnya kapan saja melalui **DBeaver** maupun **pgAdmin 4**.

**Q: Apakah perubahan yang saya lakukan di web tersimpan?**  
A: Ya, seluruh data mahasiswa, dosen, mata kuliah, dan pengambilan KRS tersinkronisasi secara persisten.

---

*Manual book ini disusun secara khusus untuk mendukung keberhasilan tugas mata kuliah Implementasi dan Pengujian Sistem Informasi di Universitas Jenderal Achmad Yani.*
