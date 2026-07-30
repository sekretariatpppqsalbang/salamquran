'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { checkUserPassword, getTeachers, getStudents, isDefaultPassword, saveUserPassword } from '../services/storageService';

interface AuthContextType {
  currentUser: User | null;
  loginGuru: (username: string, pass: string) => { success: boolean; message?: string };
  loginWali: (kelas: string, studentName: string, pass: string) => { success: boolean; message?: string };
  loginWaliByString: (formattedUsername: string, pass: string) => { success: boolean; message?: string };
  loginAdmin: (pass: string) => { success: boolean; message?: string };
  logout: () => void;
  updatePassword: (newPass: string) => void;
  showPasswordModal: boolean;
  setShowPasswordModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const CURRENT_USER_KEY = 'salam_quran_current_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setCurrentUser(u);
      } catch {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
  }, []);

  const saveUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    if (user.isFirstLogin) {
      setShowPasswordModal(true);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const loginGuru = (usernameInput: string, pass: string) => {
    const teachers = getTeachers();
    const cleanUser = usernameInput.trim().toLowerCase();
    
    const teacher = teachers.find(
      t => t.username.toLowerCase() === cleanUser || t.name.toLowerCase().includes(cleanUser)
    );

    if (!teacher) {
      return { success: false, message: 'Username atau nama guru tidak ditemukan.' };
    }

    if (!checkUserPassword(teacher.username, pass)) {
      return { success: false, message: 'Password salah. Default: salsabila3' };
    }

    const firstTime = isDefaultPassword(teacher.username);
    const u: User = {
      id: teacher.id,
      username: teacher.username,
      name: teacher.name,
      role: 'GURU',
      isFirstLogin: firstTime
    };

    saveUser(u);
    return { success: true };
  };

  const loginWali = (kelas: string, studentName: string, pass: string) => {
    const students = getStudents();
    const student = students.find(
      s => s.kelas === kelas && s.name.toUpperCase() === studentName.toUpperCase()
    );

    if (!student) {
      return { success: false, message: 'Data siswa dengan kelas tersebut tidak ditemukan.' };
    }

    const usernameStr = `wali.${kelas}.${student.name}`;
    if (!checkUserPassword(usernameStr, pass)) {
      return { success: false, message: 'Password salah. Default: salsabila3' };
    }

    const firstTime = isDefaultPassword(usernameStr);
    const u: User = {
      id: student.id,
      username: usernameStr,
      name: `Wali dari ${student.name}`,
      role: 'WALI',
      kelas: student.kelas,
      studentName: student.name,
      isFirstLogin: firstTime
    };

    saveUser(u);
    return { success: true };
  };

  const loginWaliByString = (rawString: string, pass: string) => {
    // Expected format: wali.(Kelas).(Nama siswa) or wali.<kelas>.<nama>
    const parts = rawString.trim().split('.');
    if (parts.length < 3 || parts[0].toLowerCase() !== 'wali') {
      return { 
        success: false, 
        message: 'Format username wali harus: wali.(Kelas).(Nama Siswa). Contoh: wali.1A.ABIMANYU FACHRI CHRISTIANTO' 
      };
    }

    const kelas = parts[1].toUpperCase();
    const studentName = parts.slice(2).join('.');

    return loginWali(kelas, studentName, pass);
  };

  const loginAdmin = (pass: string) => {
    if (!checkUserPassword('admin', pass)) {
      return { success: false, message: 'Password admin salah. Default: salsabila3' };
    }

    const firstTime = isDefaultPassword('admin');
    const u: User = {
      id: 'admin_1',
      username: 'admin',
      name: 'Administrator Sekolah SDIT Salsabila 3',
      role: 'ADMIN',
      isFirstLogin: firstTime
    };

    saveUser(u);
    return { success: true };
  };

  const updatePassword = (newPass: string) => {
    if (!currentUser) return;
    saveUserPassword(currentUser.username, newPass);
    const updatedUser = { ...currentUser, isFirstLogin: false };
    setCurrentUser(updatedUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    setShowPasswordModal(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loginGuru,
        loginWali,
        loginWaliByString,
        loginAdmin,
        logout,
        updatePassword,
        showPasswordModal,
        setShowPasswordModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
