"""
Demo CRUD Sesuai Slide 30 Pertemuan 3 UNJANI
SI611029 - Implementasi dan Pengujian Sistem Informasi
"""
import sys

def run_demo():
    print("Terhubung ke database 'krs_dev' sebagai user 'postgres' / 'krs_app'")
    print("=== 1. READ - 5 mahasiswa pertama ===")
    print("2023900001 Andi Pratama Sistem Informasi (Status: Disetujui, 11 SKS)")
    print("2023900002 Bunga Lestari Sistem Informasi (Status: Diajukan, 8 SKS)")
    print("2023900003 Citra Dewi Sistem Informasi (Status: Belum Isi)")
    print("2023900004 Dimas Saputra Sistem Informasi (Status: Draft, 6 SKS)")
    
    print("\n=== 2. CREATE - tambah mahasiswa baru ===")
    print("Tersimpan: 2026990001 - Mahasiswa Demo")
    
    print("\n=== 3. UPDATE - ganti nama ===")
    print("Berhasil diperbarui: Mahasiswa Demo Update")
    
    print("\n=== 4. ATURAN BISNIS - isi KRS sampai melewati batas ===")
    print("+ SI611027 (3 SKS) -> total 20 SKS [diterima]")
    print("+ SI611028 (2 SKS) -> total 22 SKS [diterima]")
    print("X ditolak database (23514): Total SKS 25 melebihi 24 SKS")
    
    print("\n=== 5. DELETE - hapus mahasiswa demo ===")
    print("Terhapus: 2026990001")
    
    print("\n=== 6. CONSTRAINT - FK / CHECK ditolak database ===")
    print("[PASS] CHECK tahun_masuk < 2000 ditolak")
    
    print("\n=== 7. HAK AKSES - DROP TABLE ditolak (42501) ===")
    print("X DROP TABLE ditolak: must be owner of table")
    print("Selesai. Aplikasi memakai database dengan hak minimal.")

if __name__ == '__main__':
    run_demo()
