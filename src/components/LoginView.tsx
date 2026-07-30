import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CLASSES_LIST } from '../data/students';
import { getTeachers, getStudents } from '../services/storageService';
import { Teacher, Student } from '../types';
import { 
  BookOpen, 
  UserCheck, 
  Users, 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  AlertCircle, 
  Sparkles,
  Search,
  CheckCircle2,
  BookMarked
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginGuru, loginWali, loginWaliByString, loginAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'GURU' | 'WALI' | 'ADMIN'>('GURU');

  // Common State
  const [password, setPassword] = useState('salsabila3');
  const [errorMsg, setErrorMsg] = useState('');

  // Guru Login State
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedGuruUsername, setSelectedGuruUsername] = useState('');
  const [customGuruInput, setCustomGuruInput] = useState('');
  const [guruInputMode, setGuruInputMode] = useState<'SELECT' | 'TYPE'>('SELECT');

  // Wali Login State
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedWaliKelas, setSelectedWaliKelas] = useState('1A');
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [customWaliUsername, setCustomWaliUsername] = useState('');
  const [waliInputMode, setWaliInputMode] = useState<'SELECT' | 'TYPE'>('SELECT');

  useEffect(() => {
    const teacherList = getTeachers();
    setTeachers(teacherList);
    if (teacherList.length > 0) {
      setSelectedGuruUsername(teacherList[0].username);
    }

    const studentList = getStudents();
    setStudents(studentList);
  }, []);

  // Filter students by selected class for Wali select mode
  const filteredStudents = students.filter(s => s.kelas === selectedWaliKelas);

  useEffect(() => {
    if (filteredStudents.length > 0) {
      setSelectedStudentName(filteredStudents[0].name);
    } else {
      setSelectedStudentName('');
    }
  }, [selectedWaliKelas]);

  const handleGuruSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const targetUsername = guruInputMode === 'SELECT' ? selectedGuruUsername : customGuruInput;
    
    if (!targetUsername) {
      setErrorMsg('Silakan pilih atau masukkan nama/username guru.');
      return;
    }

    const res = loginGuru(targetUsername, password);
    if (!res.success && res.message) {
      setErrorMsg(res.message);
    }
  };

  const handleWaliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (waliInputMode === 'TYPE') {
      if (!customWaliUsername) {
        setErrorMsg('Masukkan username wali sesuai format. Contoh: wali.1A.ABIMANYU FACHRI CHRISTIANTO');
        return;
      }
      const res = loginWaliByString(customWaliUsername, password);
      if (!res.success && res.message) {
        setErrorMsg(res.message);
      }
    } else {
      if (!selectedStudentName) {
        setErrorMsg('Silakan pilih nama siswa.');
        return;
      }
      const res = loginWali(selectedWaliKelas, selectedStudentName, password);
      if (!res.success && res.message) {
        setErrorMsg(res.message);
      }
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = loginAdmin(password);
    if (!res.success && res.message) {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-[#00C2A0] text-white flex items-center justify-center mx-auto shadow-xl shadow-[#00C2A0]/25 transform hover:rotate-3 transition-transform">
            <BookOpen className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            SALAM <span className="text-[#00C2A0]">Quran</span>
          </h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            SD Islam Terpadu Salsabila 3 Banguntapan
          </p>
          <p className="text-xs text-slate-600 italic">
            Salsabila Achievement, Learning, And Application for Monitoring Qur’an
          </p>
        </div>

        {/* Tab Selection */}
        <div className="bg-slate-200/70 p-1.5 rounded-2xl grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => { setActiveTab('GURU'); setErrorMsg(''); setPassword('salsabila3'); }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'GURU'
                ? 'bg-white text-[#00C2A0] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Guru</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('WALI'); setErrorMsg(''); setPassword('salsabila3'); }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'WALI'
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Wali Siswa</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('ADMIN'); setErrorMsg(''); setPassword('salsabila3'); }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'ADMIN'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin</span>
          </button>
        </div>

        {/* Login Form Container */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-5">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl p-3.5 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* DEFAULT PASSWORD NOTICE */}
          <div className="bg-teal-50/60 border border-teal-200/70 rounded-2xl p-3 text-xs text-teal-900 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#00C2A0] shrink-0" />
            <div>
              <span className="font-bold">Password Default Akun:</span>{' '}
              <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-[#00C2A0] border border-teal-200">
                salsabila3
              </code>
            </div>
          </div>

          {/* 1. GURU LOGIN FORM */}
          {activeTab === 'GURU' && (
            <form onSubmit={handleGuruSubmit} className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Pilih Guru Qur'an</span>
                <button
                  type="button"
                  onClick={() => setGuruInputMode(guruInputMode === 'SELECT' ? 'TYPE' : 'SELECT')}
                  className="text-[#00C2A0] hover:underline"
                >
                  {guruInputMode === 'SELECT' ? 'Ketik Manual Username' : 'Pilih dari Daftar'}
                </button>
              </div>

              {guruInputMode === 'SELECT' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Daftar Guru (18 Pengampu)
                  </label>
                  <select
                    value={selectedGuruUsername}
                    onChange={(e) => setSelectedGuruUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00C2A0]"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.username}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Username / Nama Guru
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: annisa"
                    value={customGuruInput}
                    onChange={(e) => setCustomGuruInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00C2A0]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password Guru
                </label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2A0]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#00C2A0] hover:bg-[#00a386] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#00C2A0]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Masuk Dashboard Guru</span>
              </button>
            </form>
          )}

          {/* 2. WALI SISWA LOGIN FORM */}
          {activeTab === 'WALI' && (
            <form onSubmit={handleWaliSubmit} className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Pilih Siswa & Kelas</span>
                <button
                  type="button"
                  onClick={() => setWaliInputMode(waliInputMode === 'SELECT' ? 'TYPE' : 'SELECT')}
                  className="text-sky-600 hover:underline"
                >
                  {waliInputMode === 'SELECT' ? 'Ketik Format wali.(Kelas).(Nama)' : 'Pilih dari Dropdown'}
                </button>
              </div>

              {waliInputMode === 'SELECT' ? (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Kelas
                      </label>
                      <select
                        value={selectedWaliKelas}
                        onChange={(e) => setSelectedWaliKelas(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500"
                      >
                        {CLASSES_LIST.map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Nama Siswa
                      </label>
                      <select
                        value={selectedStudentName}
                        onChange={(e) => setSelectedStudentName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500"
                      >
                        {filteredStudents.map((st) => (
                          <option key={st.id} value={st.name}>
                            {st.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-sky-50 p-2.5 rounded-xl border border-sky-100 text-[11px] text-sky-800">
                    Format Username Wali: <br />
                    <code className="font-mono font-bold text-sky-900">
                      wali.{selectedWaliKelas}.{selectedStudentName || 'NAMA_SISWA'}
                    </code>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Username Wali Siswa
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="wali.1A.ABIMANYU FACHRI CHRISTIANTO"
                    value={customWaliUsername}
                    onChange={(e) => setCustomWaliUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono focus:ring-2 focus:ring-sky-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Format: wali.(Kelas).(Nama siswa)
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password Wali Siswa
                </label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Masuk Dashboard Wali Siswa</span>
              </button>
            </form>
          )}

          {/* 3. ADMIN LOGIN FORM */}
          {activeTab === 'ADMIN' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Username Admin
                </label>
                <input
                  type="text"
                  disabled
                  value="admin"
                  className="w-full bg-slate-100 border border-slate-200 text-slate-600 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password Admin
                </label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan password admin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Masuk Dashboard Admin</span>
              </button>
            </form>
          )}
        </div>

        <div className="text-center text-xs text-slate-400">
          SDIT Salsabila 3 Banguntapan © {new Date().getFullYear()} • Powered by SALAM Quran
        </div>
      </div>
    </div>
  );
};
