import React, { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  X,
  CheckCircle,
  Layers
} from 'lucide-react';

export default function AdminPage({ 
  students, 
  dosenList, 
  courses, 
  classes, 
  onRefreshData,
  onNotify 
}) {
  const [activeTab, setActiveTab] = useState('mahasiswa');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals for CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentEntity, setCurrentEntity] = useState(null);

  // Form states
  const [formData, setFormData] = useState({});

  const handleOpenCreate = () => {
    setModalMode('create');
    setCurrentEntity(null);
    if (activeTab === 'mahasiswa') {
      setFormData({
        nim: '',
        nama: '',
        email: '',
        tahun_masuk: 2024,
        status: 'aktif',
        kode_prodi: 'SIF',
        id_dosen_pa: dosenList[0]?.id_dosen || 1,
        no_hp: ''
      });
    } else if (activeTab === 'dosen') {
      setFormData({
        nidn: '',
        nama: '',
        email: '',
        kode_prodi: 'SIF'
      });
    } else if (activeTab === 'matakuliah') {
      setFormData({
        kode_mk: '',
        nama_mk: '',
        sks: 3,
        semester_ke: 5
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setModalMode('edit');
    setCurrentEntity(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = async (idOrKey) => {
    if (!window.confirm(`Yakin ingin menghapus data ini?`)) return;

    try {
      let url = '';
      if (activeTab === 'mahasiswa') url = `/api/mahasiswa/${idOrKey}`;
      if (activeTab === 'dosen') url = `/api/dosen/${idOrKey}`;
      if (activeTab === 'matakuliah') url = `/api/matakuliah/${idOrKey}`;

      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        onNotify({ type: 'success', title: 'Berhasil', message: 'Data berhasil dihapus dari sistem.' });
        onRefreshData();
      } else {
        const data = await res.json();
        onNotify({ type: 'error', title: 'Gagal Hapus', message: data.error || 'Terjadi kesalahan' });
      }
    } catch (err) {
      onNotify({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      let url = '';
      let method = modalMode === 'create' ? 'POST' : 'PUT';

      if (activeTab === 'mahasiswa') {
        url = modalMode === 'create' ? '/api/mahasiswa' : `/api/mahasiswa/${currentEntity.nim}`;
      } else if (activeTab === 'dosen') {
        url = modalMode === 'create' ? '/api/dosen' : `/api/dosen/${currentEntity.id_dosen}`;
      } else if (activeTab === 'matakuliah') {
        url = modalMode === 'create' ? '/api/matakuliah' : `/api/matakuliah/${currentEntity.kode_mk}`;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        onNotify({
          type: 'success',
          title: 'Sukses',
          message: `Data berhasil ${modalMode === 'create' ? 'ditambahkan' : 'diperbarui'}!`
        });
        setIsModalOpen(false);
        onRefreshData();
      } else {
        const data = await res.json();
        onNotify({ type: 'error', title: 'Gagal Simpan', message: data.error || 'Terjadi kesalahan' });
      }
    } catch (err) {
      onNotify({ type: 'error', title: 'Error', message: err.message });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Pusat Pengelolaan Master Data (CRUD)
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
            Admin Akademik SIAKAD UNJANI
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data mahasiswa, dosen pengampu & PA, mata kuliah kurikulum, serta kelas perkuliahan.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tambah {activeTab === 'mahasiswa' ? 'Mahasiswa' : activeTab === 'dosen' ? 'Dosen' : 'Mata Kuliah'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => { setActiveTab('mahasiswa'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'mahasiswa'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Master Mahasiswa ({students.length})
        </button>

        <button
          onClick={() => { setActiveTab('dosen'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'dosen'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Master Dosen ({dosenList.length})
        </button>

        <button
          onClick={() => { setActiveTab('matakuliah'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'matakuliah'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Master Mata Kuliah ({courses.length})
        </button>

        <button
          onClick={() => { setActiveTab('kelas'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'kelas'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Jadwal & Kuota Kelas ({classes.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={`Cari dalam data ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* TAB 1: MAHASISWA TABLE */}
      {activeTab === 'mahasiswa' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">NIM</th>
                <th className="p-3.5">Nama Mahasiswa</th>
                <th className="p-3.5">Email & Kontak</th>
                <th className="p-3.5">Prodi & Angkatan</th>
                <th className="p-3.5">Dosen Wali</th>
                <th className="p-3.5 text-center">Status KRS</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students
                .filter(m => m.nama.toLowerCase().includes(searchTerm.toLowerCase()) || m.nim.includes(searchTerm))
                .map((m) => (
                  <tr key={m.nim} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">{m.nim}</td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100">{m.nama}</td>
                    <td className="p-3.5 text-slate-500">
                      <div>{m.email}</div>
                      <div className="text-[11px] text-slate-400">{m.no_hp || '-'}</div>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">
                      {m.nama_prodi || m.kode_prodi} ({m.tahun_masuk})
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">{m.nama_dosen_pa || '-'}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-medium text-[11px] uppercase">
                        {m.status_krs || 'draft'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.nim)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: DOSEN TABLE */}
      {activeTab === 'dosen' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">NIDN</th>
                <th className="p-3.5">Nama Dosen & Gelar</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Program Studi</th>
                <th className="p-3.5 text-center">Bimbingan Aktif</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {dosenList
                .filter(d => d.nama.toLowerCase().includes(searchTerm.toLowerCase()) || d.nidn.includes(searchTerm))
                .map((d) => (
                  <tr key={d.id_dosen} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">{d.nidn}</td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100">{d.nama}</td>
                    <td className="p-3.5 text-slate-500">{d.email}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">{d.nama_prodi || d.kode_prodi}</td>
                    <td className="p-3.5 text-center font-bold text-emerald-700 dark:text-emerald-400">
                      {d.total_bimbingan || 0} Mahasiswa
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(d)}
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id_dosen)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: MATA KULIAH TABLE */}
      {activeTab === 'matakuliah' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Kode MK</th>
                <th className="p-3.5">Nama Mata Kuliah</th>
                <th className="p-3.5 text-center">Beban SKS</th>
                <th className="p-3.5 text-center">Semester Ke</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {courses
                .filter(mk => mk.nama_mk.toLowerCase().includes(searchTerm.toLowerCase()) || mk.kode_mk.includes(searchTerm))
                .map((mk) => (
                  <tr key={mk.kode_mk} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">{mk.kode_mk}</td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100">{mk.nama_mk}</td>
                    <td className="p-3.5 text-center font-bold">{mk.sks} SKS</td>
                    <td className="p-3.5 text-center">Semester {mk.semester_ke}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(mk)}
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(mk.kode_mk)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: KELAS TABLE */}
      {activeTab === 'kelas' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Mata Kuliah</th>
                <th className="p-3.5">Kelas</th>
                <th className="p-3.5">Jadwal Hari & Jam</th>
                <th className="p-3.5">Ruang</th>
                <th className="p-3.5">Dosen Pengampu</th>
                <th className="p-3.5 text-center">Kapasitas Kuota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {classes.map((c) => (
                <tr key={c.id_kelas} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="p-3.5">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{c.nama_mk}</span>
                    <span className="font-mono text-[11px] text-slate-400 block">{c.kode_mk} ({c.sks} SKS)</span>
                  </td>
                  <td className="p-3.5 font-bold text-emerald-700 dark:text-emerald-400">Kelas {c.nama_kelas}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400">{c.hari}, {c.jam}</td>
                  <td className="p-3.5 font-medium">{c.ruang}</td>
                  <td className="p-3.5 text-slate-700 dark:text-slate-300">{c.nama_dosen}</td>
                  <td className="p-3.5 text-center">
                    <span className="font-bold">{c.terisi || 0}</span> / <span className="text-slate-500">{c.kuota || 40} Mahasiswa</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CRUD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base">
                {modalMode === 'create' ? 'Tambah Data Baru' : 'Perbarui Data'} ({activeTab.toUpperCase()})
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              
              {/* FORM FIELDS: MAHASISWA */}
              {activeTab === 'mahasiswa' && (
                <>
                  <div>
                    <label className="block font-bold mb-1">NIM (Nomor Induk Mahasiswa):</label>
                    <input
                      type="text"
                      required
                      disabled={modalMode === 'edit'}
                      value={formData.nim || ''}
                      onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                      placeholder="Contoh: 2023900005"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Nama Lengkap Mahasiswa:</label>
                    <input
                      type="text"
                      required
                      value={formData.nama || ''}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                      placeholder="Nama Lengkap"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Email Mahasiswa:</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                      placeholder="email@student.unjani.ac.id"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">Tahun Masuk / Angkatan:</label>
                      <input
                        type="number"
                        value={formData.tahun_masuk || 2023}
                        onChange={(e) => setFormData({ ...formData, tahun_masuk: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Dosen Pembimbing PA:</label>
                      <select
                        value={formData.id_dosen_pa || 1}
                        onChange={(e) => setFormData({ ...formData, id_dosen_pa: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                      >
                        {dosenList.map(d => (
                          <option key={d.id_dosen} value={d.id_dosen}>{d.nama}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* FORM FIELDS: DOSEN */}
              {activeTab === 'dosen' && (
                <>
                  <div>
                    <label className="block font-bold mb-1">NIDN / NIP:</label>
                    <input
                      type="text"
                      required
                      value={formData.nidn || ''}
                      onChange={(e) => setFormData({ ...formData, nidn: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Nama Lengkap & Gelar:</label>
                    <input
                      type="text"
                      required
                      value={formData.nama || ''}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Email Resmi:</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                    />
                  </div>
                </>
              )}

              {/* FORM FIELDS: MATA KULIAH */}
              {activeTab === 'matakuliah' && (
                <>
                  <div>
                    <label className="block font-bold mb-1">Kode Mata Kuliah:</label>
                    <input
                      type="text"
                      required
                      disabled={modalMode === 'edit'}
                      value={formData.kode_mk || ''}
                      onChange={(e) => setFormData({ ...formData, kode_mk: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                      placeholder="SI611099"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Nama Mata Kuliah:</label>
                    <input
                      type="text"
                      required
                      value={formData.nama_mk || ''}
                      onChange={(e) => setFormData({ ...formData, nama_mk: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">Bobot SKS (1 - 6):</label>
                      <input
                        type="number"
                        min="1"
                        max="6"
                        required
                        value={formData.sks || 3}
                        onChange={(e) => setFormData({ ...formData, sks: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Semester Ke (1 - 8):</label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        required
                        value={formData.semester_ke || 5}
                        onChange={(e) => setFormData({ ...formData, semester_ke: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md shadow-emerald-700/20"
                >
                  {modalMode === 'create' ? 'Simpan Data' : 'Perbarui'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
