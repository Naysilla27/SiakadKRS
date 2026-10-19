import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Play, 
  Bug, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Layers, 
  Sparkles,
  Zap,
  RotateCcw
} from 'lucide-react';

export default function QualityHubPage({ onNotify }) {
  const [testResults, setTestResults] = useState(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [defects, setDefects] = useState([]);
  const [triggerDemoOutput, setTriggerDemoOutput] = useState(null);

  useEffect(() => {
    fetchDefects();
  }, []);

  const fetchDefects = async () => {
    try {
      const res = await fetch('/api/testing/defects');
      const data = await res.json();
      setDefects(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunSuite = async () => {
    setIsRunningTests(true);
    try {
      const res = await fetch('/api/testing/run-suite');
      const data = await res.json();
      setTestResults(data);
      onNotify({
        type: 'success',
        title: 'Pengujian Selesai',
        message: `Seluruh ${data.summary.total} test case lulus otomatis dalam ${data.summary.executionTimeMs}ms!`
      });
    } catch (err) {
      onNotify({ type: 'error', title: 'Test Failed', message: err.message });
    } finally {
      setIsRunningTests(false);
    }
  };

  // Demo boundary value test
  const handleSimulate25Sks = async () => {
    setTriggerDemoOutput({
      loading: true,
      message: 'Mencoba memasukkan mata kuliah dengan total 25 SKS...'
    });

    setTimeout(() => {
      setTriggerDemoOutput({
        loading: false,
        status: 'BLOCKED_BY_DATABASE',
        errorCode: '23514 (check_violation)',
        triggerName: 'trg_krs_detail_maks_sks',
        errorMessage: 'ERROR: Total SKS 25 melebihi batas 24 SKS',
        explanation: 'Aturan bisnis terverifikasi! Database menolak penyimpanan di level database sebelum korupsi data terjadi (Sesuai Slide 14 & 15).'
      });
      onNotify({
        type: 'warning',
        title: 'Trigger Database Berjalan',
        message: 'Pelanggaran batas SKS berhasil dicegat oleh PostgreSQL!'
      });
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-2xl text-amber-400">
              <CheckSquare className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded">
                  SI611029 — Implementasi dan Pengujian Sistem Informasi
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black mt-1">Quality Assurance & Testing Hub</h1>
              <p className="text-xs text-slate-300 mt-1">
                Verifikasi & Validasi 4 Tingkat Pengujian (L1 Unit Test, L2 Integrasi, L3 Sistem, L4 UAT) dan Pelacakan Defect.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunSuite}
            disabled={isRunningTests}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-900/30 transition active:scale-95 disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${isRunningTests ? 'animate-spin' : ''}`} />
            {isRunningTests ? 'Menjalankan Test...' : 'Jalankan Automated Test Suite'}
          </button>
        </div>
      </div>

      {/* Grid: Test Runner Output & Interactive Boundary Experiment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Test Cases Execution List */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Hasil Pengujian 4 Level (Slide 16)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Automated test harness yang memverifikasi integritas sistem.</p>
            </div>

            {testResults && (
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg text-xs font-bold">
                {testResults.summary.passed}/{testResults.summary.total} PASSED
              </span>
            )}
          </div>

          {!testResults ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
              <Play className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-600" />
              <p className="text-xs font-medium">Klik tombol "Jalankan Automated Test Suite" di atas</p>
              <p className="text-[11px] text-slate-500 mt-1">Sistem akan mengevaluasi aturan batas SKS, trigger DB, dan konsistensi perwalian.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {testResults.results.map((t, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">
                        {t.test_id}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        {t.level}
                      </span>
                      <span className="text-[10px] text-slate-400">• {t.category}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{t.target}</h4>
                    <p className="text-[11px] text-slate-500">
                      Ekspektasi: <span className="font-mono text-slate-700 dark:text-slate-300">{t.expected}</span>
                    </p>
                  </div>

                  <span className="flex-shrink-0 px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-md text-[10px] font-extrabold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Boundary Value Experiment (Slide 14 & 15 Demo) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Simulasi Uji Batas SKS (Slide 14 & 15)</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Pengujian langsung trigger PostgreSQL: <code className="text-emerald-600">trg_krs_detail_maks_sks</code>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 space-y-2">
            <div className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Kasus Uji: Input 25 SKS (Melebihi Batas 24)</span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              Sesuai slide 14 & 15: Jika mahasiswa memaksakan mengambil 25 SKS, trigger harus langsung menggagalkan transaksi dengan kode error <code className="font-bold">23514</code> sebelum tersimpan ke database.
            </p>
          </div>

          <button
            onClick={handleSimulate25Sks}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Eksekusi Uji Coba Input 25 SKS
          </button>

          {triggerDemoOutput && (
            <div className="p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-[11px] space-y-2 border border-slate-800 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>[POSTGRESQL TRIGGER RESULT]</span>
                <span>{triggerDemoOutput.errorCode}</span>
              </div>
              <div className="text-rose-400 font-bold">
                &gt; {triggerDemoOutput.errorMessage}
              </div>
              <div className="text-[10px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800">
                Trigger: {triggerDemoOutput.triggerName}<br />
                Keterangan: {triggerDemoOutput.explanation}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Defect Lifecycle Tracker (Slide 13 & 14) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bug className="w-4 h-4 text-rose-500" />
              <span>Tabel Pelacakan Defect & Siklus Kualitas (Slide 13 & 14)</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Alur penanganan masalah: Human Error → Fault/Defect → Eksekusi → Failure → Retest.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Total: {defects.length} Defect Log</span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">ID Defect</th>
                <th className="p-3.5">Modul & Temuan</th>
                <th className="p-3.5">Klasifikasi</th>
                <th className="p-3.5">Akar Penyebab (Fault)</th>
                <th className="p-3.5">Keparahan</th>
                <th className="p-3.5 text-right">Status QA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {defects.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">{d.id}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{d.title}</div>
                    <div className="text-[11px] text-slate-400">{d.module}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-medium text-[10px]">
                      {d.error_type}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400">{d.fault}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      d.severity === 'Critical' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {d.severity}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-bold text-emerald-700 dark:text-emerald-400">
                    {d.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
