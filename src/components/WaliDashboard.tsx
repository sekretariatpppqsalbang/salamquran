'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getQuranLogs, fetchQuranLogsFromSupabase } from '../services/storageService';
import { QuranLog } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { 
  BookOpen, 
  BookMarked, 
  Award, 
  UserCheck, 
  Calendar, 
  Download, 
  Filter, 
  CheckCircle2, 
  Star,
  FileText,
  TrendingUp,
  Clock
} from 'lucide-react';

export const WaliDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState<QuranLog[]>([]);
  const [semesterFilter, setSemesterFilter] = useState<string>('SEMUA');
  const [typeFilter, setTypeFilter] = useState<string>('SEMUA');

  useEffect(() => {
    setLogs(getQuranLogs());
    fetchQuranLogsFromSupabase().then((remoteLogs) => {
      if (remoteLogs && remoteLogs.length > 0) {
        setLogs(remoteLogs);
      }
    });
  }, []);

  // Filter logs specifically for this child
  const childName = currentUser?.studentName || '';
  const childClass = currentUser?.kelas || '';

  const childLogs = logs.filter(l => 
    l.studentName.trim().toUpperCase() === childName.trim().toUpperCase() &&
    (childClass === '' || l.kelas === childClass)
  );

  // Apply semester/date filter
  const filteredLogs = childLogs.filter(l => {
    if (typeFilter !== 'SEMUA' && l.type !== typeFilter) return false;
    
    if (semesterFilter === 'SEM-1') {
      // Month 7 to 12
      const m = new Date(l.date).getMonth() + 1;
      return m >= 7 && m <= 12;
    } else if (semesterFilter === 'SEM-2') {
      // Month 1 to 6
      const m = new Date(l.date).getMonth() + 1;
      return m >= 1 && m <= 6;
    }
    return true;
  });

  // Calculate stats
  const totalSetoran = filteredLogs.length;
  const tahsinLogs = filteredLogs.filter(l => l.type === 'TAHSIN');
  const tahfidzLogs = filteredLogs.filter(l => l.type === 'TAHFIDZ');

  const latestTahsin = tahsinLogs[0];
  const latestTahfidz = tahfidzLogs[0];

  const mumtazCount = filteredLogs.filter(l => l.grade.includes('Mumtaz')).length;
  const mumtazPercentage = totalSetoran > 0 ? Math.round((mumtazCount / totalSetoran) * 100) : 0;

  // Grade Distribution Chart Data
  const gradeCounts = {
    'A (Mumtaz)': filteredLogs.filter(l => l.grade === 'A (Mumtaz)').length,
    'A- (Jayyid Jiddan)': filteredLogs.filter(l => l.grade === 'A- (Jayyid Jiddan)').length,
    'B (Jayyid)': filteredLogs.filter(l => l.grade === 'B (Jayyid)').length
  };

  const pieData = [
    { name: 'Mumtaz (A)', value: gradeCounts['A (Mumtaz)'], color: '#00C2A0' },
    { name: 'Jayyid Jiddan (A-)', value: gradeCounts['A- (Jayyid Jiddan)'], color: '#0EA5E9' },
    { name: 'Jayyid (B)', value: gradeCounts['B (Jayyid)'], color: '#F59E0B' }
  ].filter(d => d.value > 0);

  // Monthly Activity Chart Data
  const monthlyMap: Record<string, number> = {};
  filteredLogs.forEach(l => {
    const monthKey = l.date.substring(0, 7); // YYYY-MM
    monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + 1;
  });

  const barData = Object.keys(monthlyMap).sort().map(k => ({
    bulan: k,
    total: monthlyMap[k]
  }));

  // Handle Export PDF Report for Wali
  const handleExportWaliPDF = () => {
    const doc = new jsPDF();

    // Title & Header
    doc.setFontSize(15);
    doc.setTextColor(63, 78, 90); // Dark Slate #3F4E5A
    doc.text('LAPORAN PERKEMBANGAN HASIL BELAJAR AL-QUR\'AN', 14, 18);

    doc.setFontSize(11);
    doc.setTextColor(0, 194, 160); // Teal #00C2A0
    doc.text('SDIT SALSABILA 3 BANGUNTAPAN', 14, 25);

    doc.setLineWidth(0.5);
    doc.setDrawColor(220, 226, 230);
    doc.line(14, 28, 196, 28);

    // Metadata Student Profile
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Nama Siswa : ${childName || 'ABIMANYU FACHRI CHRISTIANTO'}`, 14, 36);
    doc.text(`Kelas             : ${childClass || '1A'}`, 14, 42);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 14, 48);
    doc.text(`Total Setoran: ${totalSetoran} catatan`, 130, 36);
    doc.text(`Predikat Mumtaz: ${mumtazPercentage}%`, 130, 42);

    // Table Data
    const tableRows = filteredLogs.map((l, idx) => [
      idx + 1,
      l.date,
      l.type,
      l.type === 'TAHSIN' ? l.jilid : `Juz ${l.juz} - ${l.surahName}`,
      l.type === 'TAHSIN' ? `Hal. ${l.halaman}` : `Ayat ${l.rentangAyat}`,
      l.grade,
      l.pencapaian,
      l.guruName
    ]);

    autoTable(doc, {
      startY: 54,
      head: [['No', 'Tanggal', 'Jenis', 'Materi / Surah', 'Hal / Ayat', 'Nilai Evaluasi', 'Catatan / Pencapaian', 'Guru Pengampu']],
      body: tableRows.length > 0 ? tableRows : [['-', '-', '-', 'Belum ada data setoran', '-', '-', '-', '-']],
      headStyles: { 
        fillColor: [63, 78, 90], 
        textColor: [255, 255, 255], 
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: { 
        fontSize: 8, 
        cellPadding: 3,
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 22 },
        2: { cellWidth: 18, fontStyle: 'bold' },
        3: { cellWidth: 32 },
        4: { cellWidth: 22 },
        5: { cellWidth: 28 },
        6: { cellWidth: 36 },
        7: { cellWidth: 24 }
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      }
    });

    const fileName = `Laporan_Hafalan_${(childName || 'Siswa').replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner Wali in Dark Slate #3F4E5A & Teal #00C2A0 */}
      <div className="bg-[#3F4E5A] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#00C2A0]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#00C2A0]/20 text-[#00C2A0] border border-[#00C2A0]/30 px-3 py-1 rounded-full text-xs font-bold mb-3">
            <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Dashboard Wali Siswa</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Laporan Perkembangan Hafalan Siswa
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs font-semibold">
            <span className="bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl backdrop-blur-md">
              Siswa: <strong className="text-[#00C2A0]">{childName || 'ABIMANYU FACHRI CHRISTIANTO'}</strong>
            </span>
            <span className="bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl backdrop-blur-md">
              Kelas: <strong className="text-white">{childClass || '1A'}</strong>
            </span>
            <span className="bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl backdrop-blur-md text-slate-300">
              SDIT Salsabila 3 Banguntapan
            </span>
          </div>
        </div>

        {/* Action Button: Unduh PDF */}
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={handleExportWaliPDF}
            className="px-5 py-3 bg-[#00C2A0] hover:bg-[#00a386] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#00C2A0]/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4 text-white" />
            <span>UNDUH LAPORAN PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
          <Filter className="w-4 h-4 text-[#00C2A0]" />
          <span>Filter Laporan:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Semester Filter */}
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 font-medium text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#00C2A0]"
          >
            <option value="SEMUA">Semua Semester</option>
            <option value="SEM-1">Semester 1 (Juli - Des)</option>
            <option value="SEM-2">Semester 2 (Jan - Juni)</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 font-medium text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#00C2A0]"
          >
            <option value="SEMUA">Semua Pembelajaran (Tahsin & Tahfidz)</option>
            <option value="TAHSIN">Tahsin Yanfa'una</option>
            <option value="TAHFIDZ">Tahfidz Al-Qur'an</option>
          </select>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#00C2A0] flex items-center justify-center font-bold text-lg shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Total Setoran</p>
            <p className="text-2xl font-extrabold text-slate-800">{totalSetoran} Kali</p>
            <p className="text-[11px] text-teal-600 font-semibold mt-0.5">Tercatat di sistem</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-lg shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Capaian Tahsin</p>
            <p className="text-base font-extrabold text-slate-800 truncate">
              {latestTahsin ? `${latestTahsin.jilid} (Hal. ${latestTahsin.halaman})` : 'Belum Ada'}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">Buku Yanfa'una Terakhir</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Capaian Tahfidz</p>
            <p className="text-base font-extrabold text-slate-800 truncate">
              {latestTahfidz ? `Surah ${latestTahfidz.surahName}` : 'Belum Ada'}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              {latestTahfidz ? `Juz ${latestTahfidz.juz} (Ayat ${latestTahfidz.rentangAyat})` : 'Juz 30'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Nilai Mumtaz (A)</p>
            <p className="text-2xl font-extrabold text-slate-800">{mumtazPercentage}%</p>
            <p className="text-[11px] text-amber-600 font-semibold">{mumtazCount} setoran Mumtaz</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      {filteredLogs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
          {/* Chart 1: Grade Distribution */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Award className="w-4 h-4 text-[#00C2A0]" />
                <span>Distribusi Evaluasi Penilaian</span>
              </h3>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Monthly Activity Trend */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00C2A0]" />
                <span>Frekuensi Setoran Hafalan Per Bulan</span>
              </h3>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#00C2A0" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Detailed History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">
              Riwayat Capaian Tahsin & Tahfidz Siswa
            </h3>
            <p className="text-xs text-slate-500">
              Laporan rinci termasuk nama lengkap Guru Pengampu yang menginput data.
            </p>
          </div>
          <span className="text-xs font-bold text-[#00C2A0] bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
            {filteredLogs.length} Catatan
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm font-semibold text-slate-600">Belum ada catatan laporan hafalan.</p>
            <p className="text-xs text-slate-400 mt-1">Laporan hafalan akan muncul otomatis setelah di-input oleh Guru Qur'an.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3">Materi / Surah / Jilid</th>
                  <th className="px-4 py-3">Penilaian</th>
                  <th className="px-4 py-3">Pencapaian & Catatan Guru</th>
                  {/* CRITICAL MANDATORY REQUIREMENT 3: Guru Pengampu Full Name */}
                  <th className="px-4 py-3 text-teal-800 font-extrabold bg-teal-50/50">Guru Pengampu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const isTahsin = log.type === 'TAHSIN';
                  return (
                    <tr key={log.id} className="hover:bg-teal-50/20 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                        {log.date}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            isTahsin
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-teal-50 text-teal-700 border-teal-200'
                          }`}
                        >
                          {log.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isTahsin ? (
                          <span>
                            <strong className="text-slate-900">{log.jilid}</strong> • Hal. {log.halaman}
                          </span>
                        ) : (
                          <span>
                            <strong className="text-slate-900">Juz {log.juz}</strong> - Surah {log.surahName} (Ayat {log.rentangAyat})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-lg border border-emerald-200 text-xs">
                          {log.grade}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        {log.pencapaian && (
                          <p className="text-xs font-semibold text-slate-800">{log.pencapaian}</p>
                        )}
                        {log.keterangan && (
                          <p className="text-xs text-slate-500 italic mt-0.5">"{log.keterangan}"</p>
                        )}
                      </td>
                      {/* Full Name of Teacher displayed prominently */}
                      <td className="px-4 py-3 whitespace-nowrap bg-teal-50/20">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                          <UserCheck className="w-3.5 h-3.5 text-[#00C2A0]" />
                          <span>{log.guruName}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
