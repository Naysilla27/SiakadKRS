import React, { useState, useRef, useEffect } from 'react';
import { 
  GraduationCap, 
  Users, 
  Settings, 
  CheckSquare, 
  Database, 
  Moon, 
  Sun,
  ChevronDown,
  Check,
  UserCheck
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking anywhere outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
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
            
            {/* Context Switcher Dropdown (Click-based, stays open until selection or click outside) */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 px-3 py-1.5 rounded-xl cursor-pointer hover:border-emerald-500 transition text-left focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-expanded={isDropdownOpen}
                aria-label="Pilih Peran dan Pengguna"
              >
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
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 ml-1 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
              </button>

              {/* Dropdown Menu - rendered on click, stays open */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 animate-in fade-in zoom-in-95 duration-100 z-50 max-h-[80vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  
                  {/* Mahasiswa Section */}
                  <div className="py-1">
                    <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-emerald-700 dark:text-emerald-400 uppercase flex items-center justify-between">
                      <span>Pilih Mahasiswa ({students.length}):</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-0.5">
                      {students.map(m => {
                        const isSelected = activeStudent?.nim === m.nim && currentRole === 'mahasiswa';
                        return (
                          <button
                            key={m.nim}
                            onClick={() => {
                              setActiveStudent(m);
                              setCurrentRole('mahasiswa');
                              setActiveTab('mahasiswa');
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-slate-800 transition ${
                              isSelected ? 'bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border-l-4 border-emerald-600' : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="truncate pr-2">
                              <span className="block truncate">{m.nama}</span>
                              <span className="font-mono text-[10px] text-slate-400">NIM: {m.nim}</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dosen Section */}
                  <div className="py-1">
                    <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-emerald-700 dark:text-emerald-400 uppercase">
                      Pilih Dosen PA ({dosenList.length}):
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-0.5">
                      {dosenList.map(d => {
                        const isSelected = activeDosen?.id_dosen === d.id_dosen && currentRole === 'dosen';
                        return (
                          <button
                            key={d.id_dosen}
                            onClick={() => {
                              setActiveDosen(d);
                              setCurrentRole('dosen');
                              setActiveTab('dosen');
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-slate-800 transition ${
                              isSelected ? 'bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border-l-4 border-emerald-600' : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="truncate pr-2">{d.nama}</span>
                            {isSelected && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Portals Section */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setCurrentRole('admin');
                        setActiveTab('admin');
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-slate-800 transition ${
                        currentRole === 'admin' ? 'text-emerald-700 font-bold bg-emerald-50/50 border-l-4 border-emerald-600' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Settings className="w-3.5 h-3.5 text-slate-500" />
                        <span>Admin Akademik (CRUD)</span>
                      </div>
                      {currentRole === 'admin' && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>

                    <button
                      onClick={() => {
                        setCurrentRole('qa');
                        setActiveTab('quality');
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-amber-50 dark:hover:bg-slate-800 transition ${
                        currentRole === 'qa' ? 'text-amber-600 font-bold bg-amber-50/50 border-l-4 border-amber-500' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                        <span>QA & Tester (SI611029 Hub)</span>
                      </div>
                      {currentRole === 'qa' && <Check className="w-4 h-4 text-amber-600" />}
                    </button>
                  </div>

                </div>
              )}
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
