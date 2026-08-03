import { QuranLog, Student, Teacher, User, TahsinLog, TahfidzLog } from '../types';
import { INITIAL_STUDENTS } from '../data/students';
import { INITIAL_TEACHERS } from '../data/teachers';
import { INITIAL_LOGS } from '../data/initialLogs';
import * as XLSX from 'xlsx';
import { getSupabase } from './supabaseClient';

const LOGS_KEY = 'salam_quran_logs_v1';
const PASSWORDS_KEY = 'salam_quran_passwords_v1';
const TEACHERS_KEY = 'salam_quran_teachers_v1';
const STUDENTS_KEY = 'salam_quran_students_v1';

export const DEFAULT_PASSWORD = 'salsabila3';

/**
 * Check connectivity to Supabase instance
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = getSupabase();
    // Simple ping check or table query fallback
    const { error } = await supabase.from('quran_logs').select('id').limit(1);
    if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
      // Table doesn't exist yet or permission error, but API endpoint responded
      return { success: fontConnectionSuccess(error.message), message: `Supabase API Connected (Notice: ${error.message})` };
    }
    return { success: true, message: 'Supabase API successfully connected & ready!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Gagal terhubung ke Supabase.' };
  }
}

function fontConnectionSuccess(msg: string): boolean {
  // If postgrest responds with missing table (42P01), it still confirms valid Supabase API connection
  return msg.includes('relation') || msg.includes('does not exist') || msg.includes('JWT');
}

// Retrieve stored password map or initialize

function getPasswordMap(): Record<string, string> {
  const data = localStorage.getItem(PASSWORDS_KEY);
  if (!data) return {};
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// Save password map
export function saveUserPassword(username: string, newPass: string) {
  const map = getPasswordMap();
  map[username.toLowerCase()] = newPass;
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(map));
}

// Reset password to default
export function resetUserPassword(username: string) {
  saveUserPassword(username, DEFAULT_PASSWORD);
}

// Check password validity
export function checkUserPassword(username: string, inputPass: string): boolean {
  const map = getPasswordMap();
  const storedPass = map[username.toLowerCase()] || DEFAULT_PASSWORD;
  return inputPass === storedPass;
}

// Check if password is still default
export function isDefaultPassword(username: string): boolean {
  const map = getPasswordMap();
  const storedPass = map[username.toLowerCase()] || DEFAULT_PASSWORD;
  return storedPass === DEFAULT_PASSWORD;
}

// TEACHERS DATA
export function getTeachers(): Teacher[] {
  const data = localStorage.getItem(TEACHERS_KEY);
  if (!data) {
    localStorage.setItem(TEACHERS_KEY, JSON.stringify(INITIAL_TEACHERS));
    return INITIAL_TEACHERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_TEACHERS;
  }
}

export function addTeacher(teacher: Omit<Teacher, 'id'>): Teacher {
  const teachers = getTeachers();
  const newTeacher: Teacher = {
    ...teacher,
    id: `t_${Date.now()}`
  };
  teachers.push(newTeacher);
  localStorage.setItem(TEACHERS_KEY, JSON.stringify(teachers));
  return newTeacher;
}

// STUDENTS DATA
export function getStudents(): Student[] {
  const data = localStorage.getItem(STUDENTS_KEY);
  if (!data) {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(INITIAL_STUDENTS));
    return INITIAL_STUDENTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_STUDENTS;
  }
}

export function addStudent(student: Omit<Student, 'id'>): Student {
  const students = getStudents();
  const newStudent: Student = {
    ...student,
    id: `s_${Date.now()}`
  };
  students.push(newStudent);
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  return newStudent;
}

// QURAN LOGS DATA
export async function fetchQuranLogsFromSupabase(): Promise<QuranLog[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('quran_logs')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.warn('Notice loading from Supabase Cloud:', error.message);
      return getQuranLogs();
    }

    if (data && Array.isArray(data)) {
      localStorage.setItem(LOGS_KEY, JSON.stringify(data));
      return data as QuranLog[];
    }
  } catch (err: any) {
    console.warn('Supabase cloud query notice:', err);
  }
  return getQuranLogs();
}

export function getQuranLogs(): QuranLog[] {
  const data = localStorage.getItem(LOGS_KEY);
  if (!data) {
    localStorage.setItem(LOGS_KEY, JSON.stringify([]));
    return [];
  }
  try {
    const parsed: QuranLog[] = JSON.parse(data);
    // Filter out initial simulation logs if any exist in stored state
    const cleanLogs = parsed.filter(l => !['log-1', 'log-2', 'log-3', 'log-4'].includes(l.id));
    if (cleanLogs.length !== parsed.length) {
      localStorage.setItem(LOGS_KEY, JSON.stringify(cleanLogs));
    }
    return cleanLogs;
  } catch {
    return [];
  }
}

export function saveQuranLog(log: Omit<TahsinLog, 'id' | 'createdAt'> | Omit<TahfidzLog, 'id' | 'createdAt'>): QuranLog {
  const logs = getQuranLogs();
  const newLog: QuranLog = {
    ...log,
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    createdAt: new Date().toISOString()
  } as QuranLog;
  
  logs.unshift(newLog); // latest first
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));

  // Sync with Supabase asynchronously (background sync)
  (async () => {
    try {
      const { error } = await getSupabase().from('quran_logs').insert([newLog]);
      if (error) {
        console.warn('Supabase sync notice:', error.message);
      } else {
        console.log('Successfully synced log to Supabase Cloud:', newLog.id);
      }
    } catch (err: any) {
      console.warn('Supabase async sync failed:', err);
    }
  })();

  return newLog;
}

export function deleteQuranLog(id: string) {
  const logs = getQuranLogs().filter(l => l.id !== id);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));

  // Remove from Supabase asynchronously
  (async () => {
    try {
      const { error } = await getSupabase().from('quran_logs').delete().eq('id', id);
      if (error) console.warn('Supabase delete notice:', error.message);
    } catch (err: any) {
      console.warn('Supabase async delete error:', err);
    }
  })();
}

// EXPORT REKAP FUNCTION (GURU & WALI)
export function exportRekapGuru(kelasFilter: string, month: number, year: number) {
  const logs = getQuranLogs();
  
  const filtered = logs.filter(log => {
    const d = new Date(log.date);
    const matchClass = kelasFilter === 'SEMUA' || log.kelas === kelasFilter;
    const matchMonth = d.getMonth() + 1 === month;
    const matchYear = d.getFullYear() === year;
    return matchClass && matchMonth && matchYear;
  });

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const monthLabel = monthNames[month - 1] || `${month}`;

  // Prepare sheet rows
  const excelData = filtered.map((log, idx) => {
    const isTahsin = log.type === 'TAHSIN';
    return {
      'No': idx + 1,
      'Tanggal': log.date,
      'Kelas': log.kelas,
      'Nama Siswa': log.studentName,
      'Jenis Pembelajaran': log.type,
      'Materi / Jilid / Surah': isTahsin ? log.jilid : `Juz ${log.juz} - ${log.surahName}`,
      'Halaman / Ayat': isTahsin ? `Hal. ${log.halaman}` : `Ayat ${log.rentangAyat}`,
      'Penilaian': log.grade,
      'Pencapaian': log.pencapaian,
      'Catatan / Keterangan': log.keterangan || '-',
      'Guru Pengampu': log.guruName
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap_${kelasFilter}`);

  const fileName = `Rekap_Hafalan_SDIT_Salsabila3_${kelasFilter}_${monthLabel}_${year}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
