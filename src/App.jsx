import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Notification from './components/Notification';
import PrintKRSModal from './components/PrintKRSModal';
import MahasiswaPage from './pages/MahasiswaPage';
import DosenPage from './pages/DosenPage';
import AdminPage from './pages/AdminPage';
import QualityHubPage from './pages/QualityHubPage';

export default function App() {
  const [currentRole, setCurrentRole] = useState('mahasiswa');
  const [activeTab, setActiveTab] = useState('mahasiswa');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notification, setNotification] = useState(null);

  // Core Data States
  const [students, setStudents] = useState([]);
  const [activeStudent, setActiveStudent] = useState(null);
  const [dosenList, setDosenList] = useState([]);
  const [activeDosen, setActiveDosen] = useState(null);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [krsData, setKrsData] = useState({ krs: { status: 'draft' }, details: [], total_sks: 0, max_sks: 24 });
  const [advisees, setAdvisees] = useState([]);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // Sync dark mode class with HTML document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Initial Fetch
  useEffect(() => {
    loadInitialData();
  }, []);

  // When active student changes, fetch their KRS
  useEffect(() => {
    if (activeStudent) {
      loadStudentKrs(activeStudent.nim);
    }
  }, [activeStudent]);

  // When active dosen changes, fetch their advisees
  useEffect(() => {
    if (activeDosen) {
      loadDosenAdvisees(activeDosen.id_dosen);
    }
  }, [activeDosen]);

  const loadInitialData = async () => {
    try {
      // 1. Fetch Students
      const mhsRes = await fetch('/api/mahasiswa');
      const mhsData = await mhsRes.json();
      setStudents(mhsData);
      if (mhsData.length > 0 && !activeStudent) {
        setActiveStudent(mhsData[0]); // Default to Andi Pratama
      }

      // 2. Fetch Dosen
      const dosenRes = await fetch('/api/dosen');
      const dosenData = await dosenRes.json();
      setDosenList(dosenData);
      if (dosenData.length > 0 && !activeDosen) {
        setActiveDosen(dosenData[0]); // Default to Dr. Sigit Anggoro
      }

      // 3. Fetch Mata Kuliah
      const mkRes = await fetch('/api/matakuliah');
      const mkData = await mkRes.json();
      setCourses(mkData);

      // 4. Fetch Classes
      const klRes = await fetch('/api/kelas');
      const klData = await klRes.json();
      setClasses(klData);

    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  const loadStudentKrs = async (nim) => {
    try {
      const res = await fetch(`/api/krs/${nim}`);
      const data = await res.json();
      setKrsData(data);
    } catch (err) {
      console.error('Error loading student KRS:', err);
    }
  };

  const loadDosenAdvisees = async (id_dosen) => {
    try {
      const res = await fetch(`/api/perwalian/${id_dosen}`);
      const data = await res.json();
      setAdvisees(data);
    } catch (err) {
      console.error('Error loading advisees:', err);
    }
  };

  // Add Course
  const handleAddCourse = async (id_kelas) => {
    if (!activeStudent) return;
    try {
      const res = await fetch('/api/krs/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nim: activeStudent.nim, id_kelas })
      });

      const data = await res.json();
      if (!res.ok) {
        setNotification({
          type: 'error',
          title: 'Pengambilan Ditolak',
          message: data.detail || data.error || 'Gagal menambahkan mata kuliah.'
        });
        return;
      }

      setNotification({
        type: 'success',
        title: 'Berhasil',
        message: data.message
      });
      loadStudentKrs(activeStudent.nim);
      loadInitialData();
    } catch (err) {
      setNotification({ type: 'error', title: 'Error', message: err.message });
    }
  };

  // Remove Course
  const handleRemoveCourse = async (id_kelas) => {
    if (!activeStudent) return;
    try {
      const res = await fetch('/api/krs/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nim: activeStudent.nim, id_kelas })
      });
      const data = await res.json();
      if (!res.ok) {
        setNotification({ type: 'error', title: 'Gagal Hapus', message: data.error });
        return;
      }

      setNotification({ type: 'info', title: 'Dihapus', message: data.message });
      loadStudentKrs(activeStudent.nim);
      loadInitialData();
    } catch (err) {
      setNotification({ type: 'error', title: 'Error', message: err.message });
    }
  };

  // Submit KRS
  const handleSubmitKrs = async () => {
    if (!activeStudent) return;
    try {
      const res = await fetch('/api/krs/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nim: activeStudent.nim })
      });
      const data = await res.json();
      if (!res.ok) {
        setNotification({ type: 'error', title: 'Gagal Mengajukan', message: data.error });
        return;
      }

      setNotification({
        type: 'success',
        title: 'KRS Diajukan',
        message: 'KRS berhasil diajukan ke Dosen Wali untuk direview dan disahkan.'
      });
      loadStudentKrs(activeStudent.nim);
      if (activeDosen) loadDosenAdvisees(activeDosen.id_dosen);
    } catch (err) {
      setNotification({ type: 'error', title: 'Error', message: err.message });
    }
  };

  // Reset KRS to Draft (Demo)
  const handleResetKrs = async () => {
    if (!activeStudent) return;
    try {
      await fetch('/api/krs/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nim: activeStudent.nim })
      });
      setNotification({
        type: 'info',
        title: 'Mode Demo',
        message: 'Status KRS berhasil dikembalikan ke Draft untuk pengujian kembali.'
      });
      loadStudentKrs(activeStudent.nim);
      if (activeDosen) loadDosenAdvisees(activeDosen.id_dosen);
    } catch (err) {
      console.error(err);
    }
  };

  // Advisor Approve
  const handleApproveKrs = async (id_krs, catatan) => {
    try {
      const res = await fetch('/api/perwalian/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_krs, catatan })
      });
      const data = await res.json();
      setNotification({
        type: 'success',
        title: 'KRS Disetujui',
        message: data.message
      });
      if (activeDosen) loadDosenAdvisees(activeDosen.id_dosen);
      if (activeStudent) loadStudentKrs(activeStudent.nim);
    } catch (err) {
      setNotification({ type: 'error', title: 'Error', message: err.message });
    }
  };

  // Advisor Revise
  const handleReviseKrs = async (id_krs, catatan) => {
    try {
      const res = await fetch('/api/perwalian/revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_krs, catatan })
      });
      const data = await res.json();
      setNotification({
        type: 'warning',
        title: 'KRS Dikembalikan untuk Revisi',
        message: data.message
      });
      if (activeDosen) loadDosenAdvisees(activeDosen.id_dosen);
      if (activeStudent) loadStudentKrs(activeStudent.nim);
    } catch (err) {
      setNotification({ type: 'error', title: 'Error', message: err.message });
    }
  };

  // View specific student's KRS details (for modal)
  const handleViewStudentKrs = async (nim) => {
    const res = await fetch(`/api/krs/${nim}`);
    return await res.json();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Content wrapper hidden during printing */}
      <div className="print:hidden flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          activeStudent={activeStudent}
          setActiveStudent={setActiveStudent}
          students={students}
          activeDosen={activeDosen}
          setActiveDosen={setActiveDosen}
          dosenList={dosenList}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {activeTab === 'mahasiswa' && (
            <MahasiswaPage
              student={activeStudent}
              krsData={krsData}
              availableClasses={classes}
              onAddCourse={handleAddCourse}
              onRemoveCourse={handleRemoveCourse}
              onSubmitKrs={handleSubmitKrs}
              onResetKrs={handleResetKrs}
              onOpenPrint={() => setIsPrintOpen(true)}
            />
          )}

          {activeTab === 'dosen' && (
            <DosenPage
              dosen={activeDosen}
              advisees={advisees}
              onApproveKrs={handleApproveKrs}
              onReviseKrs={handleReviseKrs}
              onViewStudentKrs={handleViewStudentKrs}
            />
          )}

          {activeTab === 'admin' && (
            <AdminPage
              students={students}
              dosenList={dosenList}
              courses={courses}
              classes={classes}
              onRefreshData={loadInitialData}
              onNotify={setNotification}
            />
          )}

          {activeTab === 'quality' && (
            <QualityHubPage onNotify={setNotification} />
          )}

        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 no-print">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            SIAKAD — Universitas Jenderal Achmad Yani (UNJANI)
          </p>
          <p className="mt-1 text-[11px]">
            Mata Kuliah: <strong>SI611029 Implementasi dan Pengujian Sistem Informasi</strong> • Dosen: Dr. Ir. Sigit Anggoro & Irma Santikarama
          </p>
        </footer>
      </div>

      {/* Printable KRS Modal */}
      <PrintKRSModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        student={activeStudent}
        krs={krsData.krs}
        details={krsData.details}
        dosen={activeDosen}
      />

      {/* Toast Notification */}
      <div className="print:hidden">
        <Notification
          notification={notification}
          onClose={() => setNotification(null)}
        />
      </div>

    </div>
  );
}
