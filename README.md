# Sistem Informasi Akademik (SIAKAD) — Modul KRS & Perwalian
**Universitas Jenderal Achmad Yani (UNJANI)**
Mata Kuliah: **SI611029 - Implementasi dan Pengujian Sistem Informasi**  
Dosen Pengampu: **Dr. Ir. Sigit Anggoro, S.T., M.T., IPM** & **Irma Santikarama, S.Kom., M.T**

---

## 1. Deskripsi Proyek
Sistem Informasi KRS & Perwalian adalah aplikasi fullstack berbasis web modern yang mengimplementasikan seluruh proses bisnis akademik di SIAKAD UNJANI. Sistem ini dilengkapi dengan:
- **Pengambilan KRS Mahasiswa**: Pemilihan mata kuliah & jadwal, SKS Meter interaktif, matriks visual jadwal mingguan (Senin-Jumat), dan pengajuan draft KRS.
- **Portal Perwalian Dosen PA**: Verifikasi rencana studi mahasiswa bimbingan, catatan perwalian, dan aksi persetujuan (Approve) atau revisi.
- **Master Data CRUD (Admin Akademik)**: Pengelolaan data mahasiswa, dosen, mata kuliah kurikulum, dan kelas/kuota.
- **Aturan Bisnis & Integritas Data**: Penegakan batas maksimum 24 SKS melalui Database Trigger PostgreSQL (`trg_krs_detail_maks_sks`), pencegahan bentrok jadwal, dan komposit primary key.
- **Testing & Quality Hub**: Modul pengujian otomatis yang mengevaluasi 4 level software testing (L1 Unit Test, L2 Integrasi, L3 Sistem, L4 UAT) dan pelacakan *defect* (Error → Fault → Defect → Failure).
- **Cetak Lembar KRS Resmi**: Dokumen cetak berstandar universitas berkop resmi UNJANI, tanda tangan, dan verifikasi digital QR code.

---

## 2. Prasyarat Sistem
- **Node.js**: v18.0.0 atau lebih baru (Teruji pada v24.11.1)
- **PostgreSQL**: v14.0 atau lebih baru (Teruji pada PostgreSQL 18.0)
- **Python**: v3.10+ (Teruji pada v3.13)
- **Database Client**: DBeaver atau pgAdmin 4

---

## 3. Struktur Direktori Proyek (Sesuai Slide 5 & 18)
```
ipsi_krs/
├── app/
│   └── demo_crud.py              # Skrip demonstrasi CRUD (Slide 30)
├── db/
│   ├── migrations/               # Skrip migrasi skema database (Slide 23)
│   │   ├── 001_create_prodi_dosen.sql
│   │   ├── 002_create_mahasiswa_matakuliah.sql
│   │   ├── 003_create_kelas_krs.sql
│   │   ├── 004_add_aturan_maks_sks.sql
│   │   ├── 005_alter_mahasiswa_add_no_hp.sql
│   │   └── 006_add_indexes.sql
│   ├── seeds/
│   │   └── 001_referensi.sql     # Seed data referensi & demo awal
│   └── test_constraints.py      # Pengujian 16 constraint database (Slide 31)
├── server/                       # REST API Express backend
│   ├── db.js                     # Pool koneksi PostgreSQL (krs_dev)
│   └── index.js                  # Endpoint CRUD, validasi SKS, & perwalian
├── src/                          # Frontend React + Tailwind CSS
│   ├── components/
│   │   ├── Navbar.jsx            # Header, brand UNJANI, & Quick Role Switcher
│   │   ├── Notification.jsx      # Toast alert interaktif
│   │   └── PrintKRSModal.jsx     # Dokumen cetak KRS resmi berkop UNJANI
│   ├── pages/
│   │   ├── MahasiswaPage.jsx     # Pengambilan KRS & jadwal mingguan
│   │   ├── DosenPage.jsx         # Approval & catatan bimbingan perwalian
│   │   ├── AdminPage.jsx         # CRUD Mahasiswa, Dosen, MK, Kelas
│   │   └── QualityHubPage.jsx    # Dashboard pengujian & defect tracker
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── init_krs_database.sql         # Master SQL script (Tabel, Trigger, & Seed)
├── run_web.bat                   # Launcher aplikasi web 1-klik
├── app.bat                       # Runner CLI demo CRUD
├── dbtest.bat                    # Runner CLI pengujian constraint
├── package.json
└── README.md
```

---

## 4. Cara Menjalankan Aplikasi

### A. Menjalankan Aplikasi Web Fullstack (Rekomendasi)
Di terminal Visual Studio Code atau command prompt:
```bash
npm run dev
```
Atau cukup klik dua kali file **`run_web.bat`**.

Aplikasi akan berjalan pada:
- **Frontend Web**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### B. Menjalankan Uji Constraint Database CLI (Slide 31)
```bash
python db\test_constraints.py
# atau:
dbtest.bat
```

### C. Menjalankan Demonstrasi CRUD CLI (Slide 30)
```bash
python app\demo_crud.py
# atau:
app.bat
```

---

## 5. Fitur Utama & Panduan Demonstrasi
1. **Quick Role Switcher (Pojok Kanan Atas)**:
   - Klik menu "Peran Aktif" di navigasi untuk langsung berganti peran antara **Andi Pratama** (Mahasiswa), **Dr. Ir. Sigit Anggoro** (Dosen PA), **Admin Akademik**, atau **QA Tester** tanpa perlu logout-login berulang kali.
2. **Uji Batas 24 SKS (Aturan Bisnis Slide 14 & 15)**:
   - Coba ambil mata kuliah hingga melewati batas 24 SKS. Sistem dan trigger database PostgreSQL akan langsung menampilkan notifikasi penolakan dengan kode error `23514`.
3. **Cetak Lembar KRS**:
   - Klik tombol "Cetak Lembar KRS" untuk menampilkan pratinjau dokumen KRS resmi berkop Universitas Jenderal Achmad Yani, barcode digital verifikasi, dan area tanda tangan.
4. **Testing Hub (Menu Tab 4)**:
   - Jalankan automated test suite untuk memverifikasi 4 level testing dan pelacakan defect secara visual.

---

## 6. Anggota Tim & Kontributor
- **Pengembang**: Mahasiswa Program Studi Sistem Informasi — UNJANI
- **Mata Kuliah**: SI611029 Implementasi dan Pengujian Sistem Informasi (Ganjil 2026/2027)
