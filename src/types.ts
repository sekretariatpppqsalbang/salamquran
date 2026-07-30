export type UserRole = 'GURU' | 'WALI' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  isFirstLogin?: boolean;
  kelas?: string; // For Wali or Guru primary class
  studentName?: string; // For Wali
}

export interface Teacher {
  id: string;
  name: string;
  username: string;
  nip?: string;
}

export interface Student {
  id: string;
  name: string;
  kelas: string;
}

export type LessonType = 'TAHSIN' | 'TAHFIDZ';

export type YanfaunaJilid = 'Jilid 1' | 'Jilid 2' | 'Jilid 3' | 'Jilid 4' | 'Jilid 5' | 'Al-Qur\'an';

export type Grade = 'A (Mumtaz)' | 'A- (Jayyid Jiddan)' | 'B (Jayyid)';

export interface TahsinLog {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  kelas: string;
  type: 'TAHSIN';
  jilid: YanfaunaJilid;
  halaman: string;
  grade: Grade;
  pencapaian: string;
  keterangan: string;
  guruId: string;
  guruName: string;
  createdAt: string;
}

export interface TahfidzLog {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  kelas: string;
  type: 'TAHFIDZ';
  juz: number;
  surahNo: number;
  surahName: string;
  rentangAyat: string;
  grade: Grade;
  pencapaian: string;
  keterangan: string;
  guruId: string;
  guruName: string;
  createdAt: string;
}

export type QuranLog = TahsinLog | TahfidzLog;

export interface Surah {
  number: number;
  name: string;
  arabic: string;
  totalVerses: number;
  defaultJuz: number;
}
