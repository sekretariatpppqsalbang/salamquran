import React, { useState } from 'react';
import { CLASSES_LIST } from '../data/students';
import { exportRekapGuru } from '../services/storageService';
import { Download, FileSpreadsheet, Calendar, Filter, FileText, CheckCircle2 } from 'lucide-react';

export const DownloadRekapCard: React.FC = () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [selectedKelas, setSelectedKelas] = useState<string>('SEMUA');
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const monthOptions = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' }
  ];

  const yearOptions = [2024, 2025, 2026, 2027];

  const handleDownloadExcel = () => {
    setIsExporting(true);
    setDownloadSuccess(false);

    setTimeout(() => {
      exportRekapGuru(selectedKelas, selectedMonth, selectedYear);
      setIsExporting(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    }, 400);
  };

  return (
    <div className="bg-[#3F4E5A] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 space-y-6 relative overflow-hidden">
      {/* Background Graphic Accent */}
      <div className="absolute -right-6 -bottom-6 w-48 h-48 bg-[#00C2A0]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#00C2A0] text-white flex items-center justify-center shadow-lg shadow-[#00C2A0]/30 shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-lg tracking-tight">
                UNDUH REKAP BULANAN SISWA
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00C2A0]/20 text-[#00C2A0] uppercase border border-[#00C2A0]/30">
                Format Excel
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Generate file rekapitulasi perkembangan siswa berdasarkan Kelas, Bulan, & Tahun.
            </p>
          </div>
        </div>

        {downloadSuccess && (
          <div className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Rekap Excel Berhasil Diunduh!</span>
          </div>
        )}
      </div>

      {/* Filter Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-white/60 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#00C2A0]" />
            <span>Pilihan Kelas</span>
          </label>
          <select
            value={selectedKelas}
            onChange={(e) => setSelectedKelas(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#00C2A0]"
          >
            <option value="SEMUA" className="text-slate-900">Semua Kelas (1A - 6C)</option>
            {CLASSES_LIST.map((cls) => (
              <option key={cls} value={cls} className="text-slate-900">
                Kelas {cls}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-white/60 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#00C2A0]" />
            <span>Bulan</span>
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#00C2A0]"
          >
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value} className="text-slate-900">
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-white/60 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#00C2A0]" />
            <span>Tahun</span>
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#00C2A0]"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y} className="text-slate-900">
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
        <span className="text-xs text-slate-300 font-medium text-center sm:text-left">
          Target Filter: <strong className="text-[#00C2A0]">Kelas {selectedKelas}</strong> • Bulan <strong className="text-white">{monthOptions.find(m => m.value === selectedMonth)?.label} {selectedYear}</strong>
        </span>

        <button
          onClick={handleDownloadExcel}
          disabled={isExporting}
          className="w-full sm:w-auto px-6 py-3 bg-[#00C2A0] hover:bg-[#00a386] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#00C2A0]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
        >
          {isExporting ? (
            <span className="animate-pulse">Menyiapkan Rekap Excel...</span>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>GENERATE REKAP EXCEL</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
