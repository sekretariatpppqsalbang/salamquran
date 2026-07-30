'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, KeyRound, User as UserIcon, ShieldAlert } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, logout, setShowPasswordModal } = useAuth();

  if (!currentUser) return null;

  const roleLabel = 
    currentUser.role === 'GURU' ? "Guru Qur'an" :
    currentUser.role === 'WALI' ? "Wali Siswa" : "Admin Sekolah";

  const roleBadgeColor = 
    currentUser.role === 'GURU' ? "bg-teal-50 text-teal-700 border-teal-200" :
    currentUser.role === 'WALI' ? "bg-sky-50 text-sky-700 border-sky-200" :
    "bg-purple-50 text-purple-700 border-purple-200";

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & School Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00C2A0] to-[#009b80] flex items-center justify-center text-white shadow-md shadow-[#00C2A0]/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#3F4E5A] text-lg tracking-tight">
                SALAM <span className="text-[#00C2A0]">Quran</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00C2A0]/10 text-[#00C2A0] uppercase hidden sm:inline-block">
                PWA ONLINE
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 uppercase hidden md:inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Supabase API
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-none">
              SDIT Salsabila 3 Banguntapan
            </p>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-[#00C2A0]/10 text-[#00C2A0] flex items-center justify-center font-bold text-xs">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {currentUser.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${roleBadgeColor}`}>
                  {roleLabel}
                </span>
                {currentUser.kelas && (
                  <span className="text-[10px] text-slate-500 font-medium">
                    • Kelas {currentUser.kelas}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Change Password Button */}
          <button
            onClick={() => setShowPasswordModal(true)}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-[#00C2A0] hover:bg-teal-50/50 hover:border-teal-200 transition-all text-xs font-semibold flex items-center gap-1.5"
            title="Ubah Password"
          >
            <KeyRound className="w-4 h-4 text-[#00C2A0]" />
            <span className="hidden sm:inline">Ubah Password</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-all text-xs font-semibold flex items-center gap-1.5"
            title="Keluar / Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
