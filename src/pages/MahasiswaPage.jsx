import React, { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Send, 
  Printer, 
  Lock, 
  Search,
  Sparkles,
  Info
} from 'lucide-react';

export default function MahasiswaPage({ 
  student, 
  krsData, 
  availableClasses, 
  onAddCourse, 
  onRemoveCourse, 
  onSubmitKrs, 
  onResetKrs,
  onOpenPrint 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [activeView, setActiveView] = useState('courses'); // 'courses' or 'schedule'

  if (!student) {
    return (
      <div className="p-12 text-center text-slate-500">
        Memuat data mahasiswa...
      </div>
    );
  }

  const krs = krsData?.krs || { status: 'draft' };
  const takenClasses = krsData?.details || [];
  const totalSks = krsData?.total_sks || 0;
  const maxSks = krsData?.max_sks || 24;
  const isLocked = krs.status === 'diajukan' || krs.status === 'disetujui';

  // Filter available classes
  const filteredClasses = availableClasses.filter(c => {
    const matchesSearch = 
      c.nama_mk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.kode_mk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nama_dosen.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSem = selectedSemester === 'all' || String(c.semester_ke) === selectedSemester;
    return matchesSearch && matchesSem;
  });

  // Days of week for timetable
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'disetujui':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 rounded-full font-bold text-xs flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-800"><CheckCircle2 className="w-3.5 h-3.5" /> Disetujui (Sah)</span>;
      case 'diajukan':
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 rounded-full font-bold text-xs flex items-center gap-1.5 border border-amber-300 dark:border-amber-800"><Clock className="w-3.5 h-3.5" /> Menunggu Review Dosen</span>;
      case 'revisi':
        return <span className="px-3 py-1 bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 rounded-full font-bold text-xs flex items-center gap-1.5 border border-rose-300 dark:border-rose-800"><AlertCircle className="w-3.5 h-3.5" /> Perlu Revisi</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 rounded-full font-bold text-xs flex items-center gap-1.5 border border-slate-300 dark:border-slate-700">Draft Pengisian</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Student Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-xl text-amber-400 shadow-inner">
              {student.nama.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">{student.nama}</h1>
                {getStatusBadge(krs.status)}
              </div>
              <p className="text-xs text-emerald-200 mt-1 font-mono">
                NIM: {student.nim} • Prodi: {student.nama_prodi || 'Sistem Informasi'} • Angkatan {student.tahun_masuk || 2023}
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-100/80 mt-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Dosen Pembimbing PA: <strong>{student.nama_dosen_pa || 'Dr. Ir. Sigit Anggoro, S.T., M.T.'}</strong></span>
              </div>
            </div>
          </div>

          {/* SKS Gauge & Action */}
          <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
            <div className="text-center">
              <span className="text-[11px] uppercase font-bold text-emerald-200 tracking-wider block">Beban SKS</span>
              <div className="flex items-baseline justify-center gap-1 mt-0.5">
                <span className={`text-3xl font-black ${totalSks > maxSks ? 'text-rose-400' : 'text-amber-400'}`}>{totalSks}</span>
                <span className="text-xs text-emerald-200">/ {maxSks} Maks</span>
              </div>
            </div>

            <div className="w-px h-10 bg-white/20"></div>

            <div className="flex flex-col gap-2">
              {!isLocked ? (
                <button
                  onClick={onSubmitKrs}
                  disabled={takenClasses.length === 0}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  Ajukan ke Dosen Wali
                </button>
              ) : (
                <button
                  onClick={onOpenPrint}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-emerald-900 font-bold rounded-xl text-xs shadow-lg hover:bg-emerald-50 transition active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak Lembar KRS
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lock Banner if Diajukan / Disetujui */}
        {isLocked && (
          <div className="mt-4 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-emerald-100">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                {krs.status === 'diajukan' 
                  ? 'KRS saat ini sedang dalam proses review oleh Dosen Pembimbing Akademik. Pengeditan sementara dikunci.'
                  : 'KRS telah disahkan dan disetujui resmi oleh Dosen Pembimbing Akademik. Silakan cetak lembar KRS Anda.'}
              </span>
            </div>
            <button
              onClick={onResetKrs}
              className="text-[11px] underline text-emerald-200 hover:text-white transition"
            >
              (Demo: Buka Kunci / Kembalikan ke Draft)
            </button>
          </div>
        )}

        {/* Notes from Dosen PA if any */}
        {krs.catatan_dosen && (
          <div className="mt-3 p-3 bg-amber-500/20 border border-amber-400/40 rounded-xl text-xs text-amber-200 flex items-start gap-2">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <div>
              <strong className="block font-semibold">Catatan Dosen Pembimbing:</strong>
              <p className="mt-0.5">{krs.catatan_dosen}</p>
            </div>
          </div>
        )}
      </div>

      {/* View Toggle Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('courses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeView === 'courses'
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Pilihan Mata Kuliah & KRS ({takenClasses.length})
          </button>
          <button
            onClick={() => setActiveView('schedule')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeView === 'schedule'
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Jadwal Kuliah Mingguan
          </button>
        </div>

        {krs.status === 'disetujui' && (
          <button
            onClick={onOpenPrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl text-xs font-bold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak KRS PDF
          </button>
        )}
      </div>

      {/* VIEW 1: COURSES & TAKEN KRS */}
      {activeView === 'courses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Taken Courses (KRS Mahasiswa) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span>Mata Kuliah Diambil</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 rounded-full text-xs font-mono">
                  {takenClasses.length} MK ({totalSks} SKS)
                </span>
              </h3>
            </div>

            {takenClasses.length === 0 ? (
              <div className="p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 text-center text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40 text-emerald-600" />
                <p className="text-xs font-medium">Belum ada mata kuliah yang dipilih.</p>
                <p className="text-[11px] text-slate-500 mt-1">Pilih kelas dari katalog di sebelah kanan untuk menambahkan rencana studi.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {takenClasses.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 hover:border-emerald-500/50 transition group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded">
                          {item.kode_mk}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">
                          Kelas {item.nama_kelas}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 ml-auto">
                          {item.sks} SKS
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate mt-1">
                        {item.nama_mk}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.hari}, {item.jam} • {item.ruang}
                      </p>
                    </div>

                    {!isLocked && (
                      <button
                        onClick={() => onRemoveCourse(item.id_kelas)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition opacity-80 group-hover:opacity-100"
                        title="Hapus dari KRS"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Available Course Catalog */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari mata kuliah, kode, atau dosen pengampu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>

              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-300"
              >
                <option value="all">Semua Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="5">Semester 5 (Saat ini)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredClasses.map((c) => {
                const isTaken = takenClasses.some(tc => tc.id_kelas === c.id_kelas);
                const isFull = (c.terisi || 0) >= (c.kuota || 40);

                return (
                  <div
                    key={c.id_kelas}
                    className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                      isTaken
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/50 ring-1 ring-emerald-500/30'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {c.kode_mk} • Sem {c.semester_ke}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-bold text-[10px]">
                          {c.sks} SKS
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                        {c.nama_mk}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Dosen: {c.nama_dosen}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <span>{c.hari}, {c.jam}</span>
                        <span className="font-semibold">{c.ruang}</span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Kuota: {c.terisi || 0}/{c.kuota || 40} Mahasiswa</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">Kelas {c.nama_kelas}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2">
                      {isTaken ? (
                        <button
                          onClick={() => onRemoveCourse(c.id_kelas)}
                          disabled={isLocked}
                          className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Batal Ambil
                        </button>
                      ) : (
                        <button
                          onClick={() => onAddCourse(c.id_kelas)}
                          disabled={isLocked || isFull}
                          className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {isFull ? 'Kelas Penuh' : 'Ambil Kelas Ini'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: VISUAL TIMETABLE */}
      {activeView === 'schedule' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Matriks Jadwal Perkuliahan Mingguan (Senin - Jumat)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {days.map((day) => {
              const dayCourses = takenClasses.filter(c => c.hari === day);
              return (
                <div key={day} className="rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/70 dark:border-slate-800/80 p-3 min-h-[300px]">
                  <div className="text-center font-bold text-xs text-slate-700 dark:text-slate-300 pb-2 border-b border-slate-200 dark:border-slate-800 mb-3">
                    {day}
                  </div>

                  <div className="space-y-2">
                    {dayCourses.length === 0 ? (
                      <p className="text-[11px] text-center text-slate-400 italic py-8">Tidak ada jadwal</p>
                    ) : (
                      dayCourses.map((c, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-emerald-800 text-white shadow-sm border border-emerald-600"
                        >
                          <span className="font-mono text-[9px] font-bold text-amber-300 block">{c.jam}</span>
                          <h5 className="font-bold text-xs leading-tight mt-0.5">{c.nama_mk}</h5>
                          <div className="flex items-center justify-between text-[10px] text-emerald-200 mt-2">
                            <span>{c.ruang}</span>
                            <span>{c.sks} SKS</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
