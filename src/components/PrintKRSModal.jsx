import React from 'react';
import { Printer, X, ShieldCheck, QrCode } from 'lucide-react';

export default function PrintKRSModal({ isOpen, onClose, student, krs, details, dosen }) {
  if (!isOpen || !student) return null;

  const totalSks = details.reduce((sum, item) => sum + (item.sks || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto print:fixed print:inset-0 print:p-0 print:bg-white print:overflow-visible print:z-[9999]">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:max-w-none print:w-full print:max-h-none print:shadow-none print:rounded-none print:overflow-visible print:border-none">
        
        {/* Modal Top Actions (Hidden on Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 print:hidden no-print">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-700 text-sm">Pratinjau Lembar KRS Resmi</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-medium shadow-sm transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official UNJANI KRS Document */}
        <div id="print-area" className="p-8 sm:p-12 overflow-y-auto bg-white font-sans text-slate-900 print:p-6 print:overflow-visible">
          
          {/* Header Kop Surat UNJANI */}
          <div className="flex items-center gap-6 border-b-4 border-emerald-900 pb-4 mb-6">
            <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center bg-emerald-800 text-amber-400 rounded-full font-extrabold text-2xl shadow-md border-2 border-amber-400">
              UJ
            </div>
            <div className="flex-1 text-center">
              <h3 className="text-xs font-semibold tracking-wider text-slate-600 uppercase">Yayasan Kartika Eka Paksi</h3>
              <h1 className="text-xl sm:text-2xl font-black text-emerald-950 uppercase tracking-tight">Universitas Jenderal Achmad Yani</h1>
              <h2 className="text-sm font-bold text-slate-800 uppercase">Fakultas Sains dan Informatika — Program Studi Sistem Informasi</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Jl. Terusan Jenderal Sudirman, Cimahi, Jawa Barat 40525 | info@unjani.ac.id | siakad.unjani.ac.id</p>
            </div>
          </div>

          <div className="text-center my-6">
            <h2 className="text-lg font-extrabold tracking-wide text-slate-900 uppercase underline decoration-2 decoration-emerald-700">
              Kartu Rencana Studi (KRS)
            </h2>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              SEMESTER GANJIL TAHUN AKADEMIK 2026/2027 (PERIODE: 20261)
            </p>
          </div>

          {/* Student & Academic Info */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-32 text-slate-500 font-medium">NIM</span>
                <span className="font-bold text-slate-900">: {student.nim}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-medium">Nama Mahasiswa</span>
                <span className="font-bold text-slate-900">: {student.nama}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-medium">Program Studi</span>
                <span className="text-slate-800 font-medium">: {student.nama_prodi || 'S1 Sistem Informasi'}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-36 text-slate-500 font-medium">Tahun Angkatan</span>
                <span className="text-slate-800 font-medium">: {student.tahun_masuk || 2023}</span>
              </div>
              <div className="flex">
                <span className="w-36 text-slate-500 font-medium">Dosen Pembimbing PA</span>
                <span className="font-semibold text-slate-900">: {student.nama_dosen_pa || dosen?.nama || 'Dr. Ir. Sigit Anggoro, S.T., M.T.'}</span>
              </div>
              <div className="flex items-center">
                <span className="w-36 text-slate-500 font-medium">Status Validasi</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  : <span className="uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px]">{krs?.status || 'disetujui'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Courses Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-emerald-800 text-white font-semibold uppercase text-[11px]">
                <tr>
                  <th className="p-2.5 border-r border-emerald-700 w-10 text-center">No</th>
                  <th className="p-2.5 border-r border-emerald-700 w-24">Kode MK</th>
                  <th className="p-2.5 border-r border-emerald-700">Nama Mata Kuliah</th>
                  <th className="p-2.5 border-r border-emerald-700 w-12 text-center">SKS</th>
                  <th className="p-2.5 border-r border-emerald-700 w-14 text-center">Kelas</th>
                  <th className="p-2.5 border-r border-emerald-700">Dosen Pengampu</th>
                  <th className="p-2.5 w-32">Jadwal / Ruang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {details.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-4 text-center text-slate-400 italic">Belum ada mata kuliah yang diambil.</td>
                  </tr>
                ) : (
                  details.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 text-center text-slate-500">{idx + 1}</td>
                      <td className="p-2 font-mono font-semibold text-slate-800">{item.kode_mk}</td>
                      <td className="p-2 font-medium text-slate-900">{item.nama_mk}</td>
                      <td className="p-2 text-center font-bold text-emerald-700">{item.sks}</td>
                      <td className="p-2 text-center font-medium text-slate-700">{item.nama_kelas}</td>
                      <td className="p-2 text-slate-700 text-[11px]">{item.nama_dosen}</td>
                      <td className="p-2 text-slate-600 text-[11px]">{item.hari}, {item.jam} ({item.ruang})</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-900">
                <tr>
                  <td colSpan="3" className="p-2.5 text-right uppercase tracking-wider">Total Beban SKS Semester Ini:</td>
                  <td className="p-2.5 text-center text-emerald-800 text-sm">{totalSks} SKS</td>
                  <td colSpan="3" className="p-2.5 text-xs text-slate-500">(Batas Maksimum: 24 SKS Sesuai Aturan Akademik)</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Verification Barcode & Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-6 text-xs text-slate-800">
            {/* Digital Verification */}
            <div className="flex flex-col items-center justify-center p-3 border border-dashed border-slate-300 rounded-xl bg-slate-50 text-center">
              <QrCode className="w-16 h-16 text-emerald-900 mb-1" />
              <span className="font-mono text-[9px] text-slate-500">DIGITAL VERIFIED ID</span>
              <span className="font-mono text-[9px] font-bold text-slate-700">UNJANI-KRS-20261-{student.nim}</span>
              <div className="flex items-center gap-1 text-[10px] text-emerald-700 mt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Dokumen Sah SIAKAD</span>
              </div>
            </div>

            {/* Student Signature */}
            <div className="text-center flex flex-col justify-between">
              <p className="text-slate-600">Cimahi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="text-slate-600">Mahasiswa yang Bersangkutan,</p>
              <div className="my-8"></div>
              <div>
                <p className="font-bold underline text-slate-900">{student.nama}</p>
                <p className="text-[11px] text-slate-500">NIM. {student.nim}</p>
              </div>
            </div>

            {/* Advisor Signature */}
            <div className="text-center flex flex-col justify-between">
              <p className="text-slate-600">Mengetahui & Menyetujui,</p>
              <p className="text-slate-600">Dosen Pembimbing Akademik,</p>
              <div className="my-8"></div>
              <div>
                <p className="font-bold underline text-slate-900">{student.nama_dosen_pa || dosen?.nama || 'Dr. Ir. Sigit Anggoro, S.T., M.T.'}</p>
                <p className="text-[11px] text-slate-500">NIDN. {dosen?.nidn || '0415088001'}</p>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between">
            <span>* Dicetak secara otomatis melalui Sistem Informasi Akademik (SIAKAD) UNJANI.</span>
            <span>Halaman 1 dari 1</span>
          </div>

        </div>
      </div>
    </div>
  );
}
