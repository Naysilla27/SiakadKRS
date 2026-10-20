import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Send, 
  Search, 
  ShieldCheck, 
  X,
  MessageSquare,
  BookOpen
} from 'lucide-react';

export default function DosenPage({ 
  dosen, 
  advisees, 
  onApproveKrs, 
  onReviseKrs, 
  onViewStudentKrs 
}) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentForReview, setSelectedStudentForReview] = useState(null);
  const [studentKrsDetails, setStudentKrsDetails] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [loadingDetails, setLoadingDetails] = useState(false);

  if (!dosen) {
    return <div className="p-12 text-center text-slate-500">Memuat data dosen...</div>;
  }

  // Filter advisees
  const filteredAdvisees = advisees.filter(m => {
    const matchesSearch = 
      m.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.nim.includes(searchTerm);
    const matchesFilter = 
      filterStatus === 'all' || 
      m.status_krs === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleOpenReview = async (student) => {
    setSelectedStudentForReview(student);
    setReviewNotes('');
    setLoadingDetails(true);
    try {
      const data = await onViewStudentKrs(student.nim);
      setStudentKrsDetails(data);
    } finally {
      setLoadingDetails(false);
    }
  };

  const submitApproval = async () => {
    if (!studentKrsDetails?.krs?.id_krs) return;
    await onApproveKrs(studentKrsDetails.krs.id_krs, reviewNotes);
    setSelectedStudentForReview(null);
  };

  const submitRevision = async () => {
    if (!studentKrsDetails?.krs?.id_krs) return;
    await onReviseKrs(studentKrsDetails.krs.id_krs, reviewNotes);
    setSelectedStudentForReview(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'disetujui':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Disetujui</span>;
      case 'diajukan':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 animate-pulse"><Clock className="w-3.5 h-3.5 text-amber-600" /> Perlu Review</span>;
      case 'revisi':
        return <span className="px-2.5 py-1 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded-lg text-xs font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Revisi</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 rounded-lg text-xs font-medium">Draft</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Advisor Header Card */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-800/80 border border-emerald-500/30 flex items-center justify-center font-bold text-xl text-amber-400">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-800/80 text-emerald-200 rounded">
                  Dosen Pembimbing Akademik (PA)
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black mt-1">{dosen.nama}</h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                NIDN: {dosen.nidn} • {dosen.email} • {dosen.nama_prodi || 'Program Studi Sistem Informasi'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-3 rounded-2xl">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Mahasiswa Bimbingan</span>
              <span className="text-xl font-black text-amber-400">{advisees.length} Orang</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Advisee Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama mahasiswa atau NIM bimbingan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'diajukan', 'disetujui', 'revisi', 'draft'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition ${
                  filterStatus === status
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {status === 'all' ? 'Semua Status' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Advisees Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">NIM & Mahasiswa</th>
                <th className="p-3.5">Kontak</th>
                <th className="p-3.5 text-center">Beban SKS</th>
                <th className="p-3.5 text-center">Status KRS</th>
                <th className="p-3.5">Tanggal Pengajuan</th>
                <th className="p-3.5 text-right">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredAdvisees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 italic">
                    Tidak ada mahasiswa bimbingan yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredAdvisees.map((m) => (
                  <tr key={m.nim} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{m.nama}</div>
                      <div className="font-mono text-[11px] text-slate-400">{m.nim}</div>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">
                      <div>{m.email}</div>
                      <div className="text-[11px] text-slate-400">{m.no_hp || '-'}</div>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                        {m.total_sks || 0}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{m.jumlah_mk || 0} MK</span>
                    </td>
                    <td className="p-3.5 text-center">
                      {getStatusBadge(m.status_krs)}
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                      {m.tgl_isi ? new Date(m.tgl_isi).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenReview(m)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95 ${
                          m.status_krs === 'diajukan'
                            ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                            : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {m.status_krs === 'diajukan' ? 'Review & Setujui' : 'Lihat Detail'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL REVIEW PERWALIAN */}
      {selectedStudentForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                  Review Perwalian Rencana Studi
                </span>
                <h3 className="text-lg font-black mt-0.5">{selectedStudentForReview.nama}</h3>
                <p className="text-xs text-slate-500 font-mono">NIM: {selectedStudentForReview.nim}</p>
              </div>
              <button
                onClick={() => setSelectedStudentForReview(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="py-12 text-center text-slate-400 text-xs">Memuat rincian mata kuliah...</div>
            ) : (
              <>
                {/* Course List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Mata Kuliah yang Dipilih ({studentKrsDetails?.details?.length || 0} MK)
                    </h4>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      Total: {studentKrsDetails?.total_sks || 0} SKS / 24 SKS Max
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {studentKrsDetails?.details?.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-slate-500">{c.kode_mk}</span>
                            <span className="font-bold">{c.nama_mk}</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">Kls {c.nama_kelas}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">Dosen: {c.nama_dosen}</p>
                        </div>
                        <span className="font-bold text-emerald-600">{c.sks} SKS</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Catatan Bimbingan / Arahan Perwalian:</span>
                  </label>
                  <textarea
                    rows="3"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Contoh: Disetujui, harap perhatikan beban tugas pada mata kuliah Implementasi SI. / Revisi: Harap kurangi 1 MK pilihan."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  ></textarea>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={submitRevision}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 transition"
                  >
                    Minta Revisi Rencana Studi
                  </button>
                  <button
                    onClick={submitApproval}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md shadow-emerald-700/20 transition active:scale-95 flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Setujui & Sahkan KRS
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
