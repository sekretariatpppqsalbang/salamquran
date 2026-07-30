import React, { useState, useEffect } from 'react';
import { getTeachers, addTeacher, getStudents, addStudent, resetUserPassword } from '../services/storageService';
import { CLASSES_LIST } from '../data/students';
import { Student, Teacher } from '../types';
import { 
  Users, 
  GraduationCap, 
  UserPlus, 
  KeyRound, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  BookOpen,
  RefreshCw
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<'TEACHERS' | 'STUDENTS'>('TEACHERS');

  // Search filters
  const [searchTeacher, setSearchTeacher] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');

  // Add Teacher Form
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherUsername, setNewTeacherUsername] = useState('');

  // Add Student Form
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('1A');

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    setTeachers(getTeachers());
    setStudents(getStudents());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName || !newTeacherUsername) return;

    const added = addTeacher({
      name: newTeacherName,
      username: newTeacherUsername.toLowerCase().trim()
    });

    setTeachers(getTeachers());
    setNewTeacherName('');
    setNewTeacherUsername('');
    showToast(`Guru baru "${added.name}" berhasil ditambahkan with default password "salsabila3"!`);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName) return;

    const added = addStudent({
      name: newStudentName.toUpperCase().trim(),
      kelas: newStudentClass
    });

    setStudents(getStudents());
    setNewStudentName('');
    showToast(`Siswa "${added.name}" (Kelas ${added.kelas}) berhasil ditambahkan! Username wali: wali.${added.kelas}.${added.name}`);
  };

  const handleResetPassword = (username: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin me-reset password akun "${name}" (${username}) ke default "salsabila3"?`)) {
      resetUserPassword(username);
      showToast(`Password untuk "${name}" berhasil di-reset ke default "salsabila3"!`);
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTeacher.toLowerCase()) ||
    t.username.toLowerCase().includes(searchTeacher.toLowerCase())
  );

  const filteredStudents = students.filter(s => {
    const matchesName = s.name.toLowerCase().includes(searchStudent.toLowerCase());
    const matchesClass = filterClass === 'ALL' || s.kelas === filterClass;
    return matchesName && matchesClass;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Admin */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-purple-950/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Panel Admin Sekolah</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Pengelolaan Data Guru & Siswa
          </h1>
          <p className="text-purple-100 text-sm mt-1 max-w-xl">
            SDIT Salsabila 3 Banguntapan - Tambah guru/siswa baru & reset password akun ke default <code className="bg-white/20 px-1 py-0.5 rounded text-white">salsabila3</code>.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
          <div>
            <p className="text-xs text-purple-200 uppercase font-semibold">Total Guru</p>
            <p className="text-xl font-black text-white">{teachers.length} Orang</p>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div>
            <p className="text-xs text-purple-200 uppercase font-semibold">Total Siswa</p>
            <p className="text-xl font-black text-white">{students.length} Siswa</p>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl p-4 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('TEACHERS')}
          className={`px-5 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'TEACHERS'
              ? 'border-[#00C2A0] text-[#00C2A0]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Kelola Data Guru ({teachers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('STUDENTS')}
          className={`px-5 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'STUDENTS'
              ? 'border-[#00C2A0] text-[#00C2A0]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Kelola Data Siswa & Kelas ({students.length})</span>
        </button>
      </div>

      {/* TAB 1: TEACHERS */}
      {activeTab === 'TEACHERS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Teacher Form */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs h-fit space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#00C2A0]" />
              <span>Tambah Guru Qur'an Baru</span>
            </h3>

            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nama Lengkap Guru (Termasuk Gelar)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Annisa Galuh Kinanti, S.Hum."
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-[#00C2A0]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Username Login Guru</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: annisa"
                  value={newTeacherUsername}
                  onChange={(e) => setNewTeacherUsername(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-[#00C2A0]"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-500 border border-slate-200">
                Password default otomatis diset ke <strong className="text-slate-800">salsabila3</strong>.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#00C2A0] hover:bg-[#00a386] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Simpan Guru Baru</span>
              </button>
            </form>
          </div>

          {/* Teacher List Table */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-800 text-base">Daftar Guru Qur'an Terdaftar</h3>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari guru..."
                  value={searchTeacher}
                  onChange={(e) => setSearchTeacher(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-[#00C2A0]"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-sm text-slate-600 border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                    <th className="px-4 py-3">Nama Lengkap Guru</th>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3 text-right">Reset Password</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTeachers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-800">{t.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{t.username}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleResetPassword(t.username, t.name)}
                          className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reset Ke salsabila3</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENTS */}
      {activeTab === 'STUDENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Student Form */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs h-fit space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#00C2A0]" />
              <span>Tambah Siswa Baru</span>
            </h3>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: MUHAMMAD AL FATIH"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-[#00C2A0]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Pilihan Kelas</label>
                <select
                  value={newStudentClass}
                  onChange={(e) => setNewStudentClass(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-[#00C2A0]"
                >
                  {CLASSES_LIST.map((cls) => (
                    <option key={cls} value={cls}>
                      Kelas {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-500 border border-slate-200 space-y-1">
                <p>Username Wali otomatis berbentuk:</p>
                <code className="text-[#00C2A0] font-bold block">
                  wali.{newStudentClass}.{newStudentName || 'NAMA_SISWA'}
                </code>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#00C2A0] hover:bg-[#00a386] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Simpan Siswa Baru</span>
              </button>
            </form>
          </div>

          {/* Student List Table */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-800 text-base">Daftar Peserta Didik SDIT Salsabila 3</h3>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-[#00C2A0]"
                >
                  <option value="ALL">Semua Kelas (19 Kelas)</option>
                  {CLASSES_LIST.map((cls) => (
                    <option key={cls} value={cls}>
                      Kelas {cls}
                    </option>
                  ))}
                </select>

                <div className="relative w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari siswa..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-[#00C2A0]"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-sm text-slate-600 border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                    <th className="px-4 py-3">Kelas</th>
                    <th className="px-4 py-3">Nama Siswa</th>
                    <th className="px-4 py-3">Username Wali Siswa</th>
                    <th className="px-4 py-3 text-right">Reset Password Wali</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((st) => {
                    const waliUsername = `wali.${st.kelas}.${st.name}`;
                    return (
                      <tr key={st.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
                            {st.kelas}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{st.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{waliUsername}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleResetPassword(waliUsername, `Wali ${st.name}`)}
                            className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Reset Password Wali</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
