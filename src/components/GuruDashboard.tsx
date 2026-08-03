'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CLASSES_LIST } from '../data/students';
import { SURAHS } from '../data/surahs';
import { getStudents, getQuranLogs, fetchQuranLogsFromSupabase, saveQuranLog, deleteQuranLog } from '../services/storageService';
import { QuranLog, Grade, YanfaunaJilid, LessonType } from '../types';
import { DownloadRekapCard } from './DownloadRekapCard';
import { 
  BookOpen, 
  BookMarked, 
  Calendar, 
  UserCheck, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Trash2, 
  Search, 
  History,
  Award,
  Filter
} from 'lucide-react';

export const GuruDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Date default to today
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState<string>(todayStr);
  const [selectedClass, setSelectedClass] = useState<string>('1A');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [lessonType, setLessonType] = useState<LessonType>('TAHSIN');

  // Tahsin fields
  const [jilid, setJilid] = useState<YanfaunaJilid>('Jilid 1');
  const [halaman, setHalaman] = useState<string>('1');

  // Tahfidz fields
  const [juz, setJuz] = useState<number>(30);
  const [surahNo, setSurahNo] = useState<number>(78); // An-Naba' by default
  const [rentangAyat, setRentangAyat] = useState<string>('1-15');

  // Common fields
  const [grade, setGrade] = useState<Grade>('A (Mumtaz)');
  const [pencapaian, setPencapaian] = useState<string>('');
  const [keterangan, setKeterangan] = useState<string>('');

  // Logs & UI feedback
  const [logs, setLogs] = useState<QuranLog[]>([]);
  const [studentList, setStudentList] = useState<any[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Load students & logs
  useEffect(() => {
    const allStudents = getStudents();
    const filtered = allStudents.filter(s => s.kelas === selectedClass);
    setStudentList(filtered);
    if (filtered.length > 0) {
      setSelectedStudentId(filtered[0].id);
    } else {
      setSelectedStudentId('');
    }
  }, [selectedClass]);

  useEffect(() => {
    setLogs(getQuranLogs());
    fetchQuranLogsFromSupabase().then((remoteLogs) => {
      if (remoteLogs && remoteLogs.length > 0) {
        setLogs(remoteLogs);
      }
    });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      alert('Pilih siswa terlebih dahulu!');
      return;
    }

    const currentStudent = studentList.find(s => s.id === selectedStudentId);
    if (!currentStudent || !currentUser) return;

    if (lessonType === 'TAHSIN') {
      saveQuranLog({
        date,
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        kelas: selectedClass,
        type: 'TAHSIN',
        jilid,
        halaman: halaman || '1',
        grade,
        pencapaian: pencapaian || 'Lancar dan tajwid memadai.',
        keterangan,
        guruId: currentUser.id,
        guruName: currentUser.name
      });
    } else {
      const selectedSurah = SURAHS.find(s => s.number === surahNo);
      saveQuranLog({
        date,
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        kelas: selectedClass,
        type: 'TAHFIDZ',
        juz,
        surahNo,
        surahName: selectedSurah ? selectedSurah.name : 'Al-Qur\'an',
        rentangAyat: rentangAyat || '1',
        grade,
        pencapaian: pencapaian || 'Hafalan lancar dan mutqin.',
        keterangan,
        guruId: currentUser.id,
        guruName: currentUser.name
      });
    }

    setLogs(getQuranLogs());
    setSaveSuccess(true);
    setPencapaian('');
    setKeterangan('');

    setTimeout(() => {
      setSaveSuccess(false);
    }, 3500);
  };

  const handleDeleteLog = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data capaian ini?')) {
      deleteQuranLog(id);
      setLogs(getQuranLogs());
    }
  };

  // Filtered logs list for preview table
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.kelas.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || log.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner in Dark Slate #3F4E5A with Teal #00C2A0 Accents */}
      <div className="bg-[#3F4E5A] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#00C2A0]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#00C2A0]/20 text-[#00C2A0] border border-[#00C2A0]/30 px-3 py-1 rounded-full text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dashboard Guru Qur'an</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Input Laporan Capaian Hafalan
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl font-medium">
            Sistem Informasi Capaian Tahsin & Tahfidz Siswa SDIT Salsabila 3 Banguntapan.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 text-left md:text-right shrink-0 relative z-10">
          <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Guru Pengampu Active</p>
          <p className="text-base font-bold text-white mt-0.5">{currentUser?.name}</p>
          <span className="inline-block text-[11px] text-[#00C2A0] font-semibold mt-1 bg-[#00C2A0]/15 px-2.5 py-0.5 rounded-full">
            ● Mode Input Real-Time
          </span>
        </div>
      </div>

      {/* Main Input Form Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-5 bg-[#00C2A0]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00C2A0] text-white flex items-center justify-center font-bold shadow-md shadow-[#00C2A0]/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-[#3F4E5A] text-lg">Formulir Input Capaian Siswa</h2>
              <p className="text-xs text-gray-400 font-medium">Pilih jenis pembelajaran dan isi evaluasi hafalan harian.</p>
            </div>
          </div>

          {/* Lesson Type Switcher */}
          <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setLessonType('TAHSIN')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                lessonType === 'TAHSIN'
                  ? 'bg-white text-[#00C2A0] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>1. TAHSIN (Yanfa'una)</span>
            </button>
            <button
              type="button"
              onClick={() => setLessonType('TAHFIDZ')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                lessonType === 'TAHFIDZ'
                  ? 'bg-[#00C2A0] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <BookMarked className="w-4 h-4" />
              <span>2. TAHFIDZ (Al-Qur'an)</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
          {saveSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-sm flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Data Hasil Hafalan Berhasil Disimpan!</p>
                <p className="text-xs text-emerald-700">
                  Capaian siswa telah tercatat dan dapat dilihat oleh Wali Siswa secara real-time.
                </p>
              </div>
            </div>
          )}

          {/* Row 1: Date, Class, Student */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#00C2A0]" />
                <span>Tanggal Input</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00C2A0] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-[#00C2A0]" />
                <span>Pilihan Kelas (19 Kelas)</span>
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00C2A0] focus:bg-white transition-all"
              >
                {CLASSES_LIST.map((cls) => (
                  <option key={cls} value={cls}>
                    Kelas {cls}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-[#00C2A0]" />
                <span>Data Peserta Didik ({studentList.length} Siswa)</span>
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00C2A0] focus:bg-white transition-all"
              >
                {studentList.length === 0 ? (
                  <option value="">Tidak ada siswa di kelas ini</option>
                ) : (
                  studentList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Conditional Lesson Fields */}
          <div className="p-5 bg-teal-50/30 border border-teal-100 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-[#00C2A0] font-bold text-sm border-b border-teal-100 pb-2">
              {lessonType === 'TAHSIN' ? <BookOpen className="w-4 h-4" /> : <BookMarked className="w-4 h-4" />}
              <span>Detail Pembelajaran: {lessonType}</span>
            </div>

            {lessonType === 'TAHSIN' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Buku Yanfa'una / Al-Qur'an
                  </label>
                  <select
                    value={jilid}
                    onChange={(e) => setJilid(e.target.value as YanfaunaJilid)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-[#00C2A0]"
                  >
                    <option value="Jilid 1">Buku Yanfa'una Jilid 1</option>
                    <option value="Jilid 2">Buku Yanfa'una Jilid 2</option>
                    <option value="Jilid 3">Buku Yanfa'una Jilid 3</option>
                    <option value="Jilid 4">Buku Yanfa'una Jilid 4</option>
                    <option value="Jilid 5">Buku Yanfa'una Jilid 5</option>
                    <option value="Al-Qur'an">Al-Qur'an (Khatam Yanfa'una)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Halaman / Halaman Ke-
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 15 atau 15-18"
                    value={halaman}
                    onChange={(e) => setHalaman(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-[#00C2A0]"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Juz Al-Qur'an (1 - 30)
                  </label>
                  <select
                    value={juz}
                    onChange={(e) => setJuz(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-[#00C2A0]"
                  >
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                      <option key={j} value={j}>
                        Juz {j}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Surah (114 Surah)
                  </label>
                  <select
                    value={surahNo}
                    onChange={(e) => {
                      const num = Number(e.target.value);
                      setSurahNo(num);
                      const s = SURAHS.find(x => x.number === num);
                      if (s) setJuz(s.defaultJuz);
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-[#00C2A0]"
                  >
                    {SURAHS.map((s) => (
                      <option key={s.number} value={s.number}>
                        {s.number}. Surah {s.name} ({s.arabic}) - {s.totalVerses} Ayat
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Rentang Ayat
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 1-15"
                    value={rentangAyat}
                    onChange={(e) => setRentangAyat(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-[#00C2A0]"
                  />
                </div>
              </div>
            )}

            {/* Evaluation Grade & Achievement Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-[#00C2A0]" />
                  <span>Evaluasi Penilaian</span>
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as Grade)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#00C2A0]"
                >
                  <option value="A (Mumtaz)">A (Mumtaz / Sangat Baik)</option>
                  <option value="A- (Jayyid Jiddan)">A- (Jayyid Jiddan / Baik Sekali)</option>
                  <option value="B (Jayyid)">B (Jayyid / Baik)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pencapaian Siswa
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Hafalan mutqin, makhraj fasih"
                  value={pencapaian}
                  onChange={(e) => setPencapaian(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-[#00C2A0]"
                />
              </div>
            </div>
          </div>

          {/* Keterangan Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Kolom Keterangan / Catatan Guru
            </label>
            <textarea
              rows={3}
              placeholder="Tambahkan catatan perkembangan atau evaluasi untuk wali siswa..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-300 rounded-xl p-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00C2A0] focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="px-8 py-3.5 bg-[#00C2A0] hover:bg-[#00a386] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#00C2A0]/25 transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Simpan Data Hafalan</span>
            </button>
          </div>
        </form>

        {/* REKAP BULANAN CARD INTEGRATION */}
        <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-200/80">
          <DownloadRekapCard />
        </div>
      </div>

      {/* Preview Hasil Simpan Data Hari Ini & Inputan Sebelumnya */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00C2A0] flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">
                Preview Data Simpan Hari Ini & Inputan Sebelumnya
              </h3>
              <p className="text-xs text-slate-500">
                Daftar log capaian hafalan yang sudah di-input oleh guru pengampu.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Filter */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari siswa atau kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#00C2A0]"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00C2A0]"
            >
              <option value="ALL">Semua Jenis Log</option>
              <option value="TAHSIN">Tahsin Sahaja</option>
              <option value="TAHFIDZ">Tahfidz Sahaja</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm font-semibold text-slate-600">Belum ada data capaian hafalan.</p>
            <p className="text-xs text-slate-400 mt-1">Gunakan form di atas untuk menginput data baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3">Nama Siswa</th>
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3">Materi / Halaman / Surah</th>
                  <th className="px-4 py-3">Penilaian</th>
                  <th className="px-4 py-3">Guru Pengampu</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const isTahsin = log.type === 'TAHSIN';
                  return (
                    <tr key={log.id} className="hover:bg-teal-50/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                        {log.date}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
                          {log.kelas}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {log.studentName}
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
                            <strong className="text-slate-800">{log.jilid}</strong> • Hal. {log.halaman}
                          </span>
                        ) : (
                          <span>
                            <strong className="text-slate-800">Juz {log.juz}</strong> - Surah {log.surahName} (Ayat {log.rentangAyat})
                          </span>
                        )}
                        {log.pencapaian && (
                          <p className="text-xs text-slate-400 mt-0.5 italic">{log.pencapaian}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-lg border border-emerald-200 text-xs">
                          {log.grade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                        {log.guruName}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus data"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
