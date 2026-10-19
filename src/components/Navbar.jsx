import React from 'react';
import { 
  GraduationCap, 
  Users, 
  Settings, 
  CheckSquare, 
  Database, 
  Moon, 
  Sun,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ 
  currentRole, 
  setCurrentRole, 
  activeStudent, 
  setActiveStudent, 
  students, 
  activeDosen, 
  setActiveDosen, 
  dosenList,
  activeTab, 
  setActiveTab, 
  isDarkMode, 
  setIsDarkMode 
}) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-amber-400 font-extrabold flex items-center justify-center shadow-lg shadow-emerald-900/20 border border-emerald-600/50">
              <span className="text-sm tracking-wider">UJ</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold tracking-tight text-emerald-800 dark:text-emerald-400">UNJANI</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded">SIAKAD</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none">Sistem KRS & Perwalian Online</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => { setActiveTab('mahasiswa'); setCurrentRole('mahasiswa'); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'mahasiswa'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Portal Mahasiswa
            </button>

            <button
              onClick={() => { setActiveTab('dosen'); setCurrentRole('dosen'); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'dosen'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              Portal Dosen PA
            </button>

            <button
              onClick={() => { setActiveTab('admin'); setCurrentRole('admin'); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'admin'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              Kelola Data (CRUD)
            </button>

            <button
              onClick={() => { setActiveTab('quality'); setCurrentRole('qa'); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'quality'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Testing & Quality Hub
            </button>
          </nav>

          {/* Quick Role & User Switcher */}
          <div className="flex items-center gap-3">
            
            {/* Context Switcher Dropdown */}
            <div className="relative group">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 px-3 py-1.5 rounded-xl cursor-pointer hover:border-emerald-500 transition">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-wider">Peran Aktif</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px] block">
                    {currentRole === 'mahasiswa' && (activeStudent ? activeStudent.nama.split(' ')[0] : 'Mahasiswa')}
                    {currentRole === 'dosen' && (activeDosen ? activeDosen.nama.split(',')[0] : 'Dosen')}
                    {currentRole === 'admin' && 'Admin Akademik'}
                    {currentRole === 'qa' && 'QA & Software Tester'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </div>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 hidden group-hover:block animate-in fade-in zoom-in-95 duration-150 z-50">
                <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Pilih Mahasiswa:
                </div>
                {students.map(m => (
                  <button
                    key={m.nim}
                    onClick={() => {
                      setActiveStudent(m);
                      setCurrentRole('mahasiswa');
                      setActiveTab('mahasiswa');
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-slate-800 transition ${
                      activeStudent?.nim === m.nim && currentRole === 'mahasiswa' ? 'text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50/50' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{m.nama}</span>
                    <span className="font-mono text-[10px] text-slate-400">{m.nim.slice(-4)}</span>
                  </button>
                ))}

                <div className="my-1.5 border-t border-slate-100 dark:border-slate-800"></div>

                <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Pilih Dosen PA:
                </div>
                {dosenList.map(d => (
                  <button
                    key={d.id_dosen}
                    onClick={() => {
                      setActiveDosen(d);
                      setCurrentRole('dosen');
                      setActiveTab('dosen');
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-slate-800 transition ${
                      activeDosen?.id_dosen === d.id_dosen && currentRole === 'dosen' ? 'text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50/50' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="truncate">{d.nama}</span>
                  </button>
                ))}

                <div className="my-1.5 border-t border-slate-100 dark:border-slate-800"></div>

                <button
                  onClick={() => {
                    setCurrentRole('admin');
                    setActiveTab('admin');
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-slate-800 transition ${
                    currentRole === 'admin' ? 'text-emerald-700 font-bold' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  <span>Admin Akademik (CRUD)</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentRole('qa');
                    setActiveTab('quality');
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-slate-800 transition ${
                    currentRole === 'qa' ? 'text-amber-600 font-bold' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                  <span>QA & Tester (SI611029 Hub)</span>
                </button>
              </div>
            </div>

            {/* Dark mode button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
