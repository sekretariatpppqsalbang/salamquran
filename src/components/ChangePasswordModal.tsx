'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, CheckCircle, AlertCircle, X } from 'lucide-react';

export const ChangePasswordModal: React.FC = () => {
  const { currentUser, updatePassword, showPasswordModal, setShowPasswordModal } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!showPasswordModal || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPassword.length < 5) {
      setError('Password baru minimal 5 karakter.');
      return;
    }

    if (newPassword === 'salsabila3') {
      setError('Password baru tidak boleh sama dengan password default (salsabila3).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    updatePassword(newPassword);
    setSuccessMsg('Password berhasil diperbarui!');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#00C2A0] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Lock className="w-5 h-5" />
            <span>Ubah Password Akun</span>
          </div>
          {!currentUser.isFirstLogin && (
            <button
              onClick={() => setShowPasswordModal(false)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {currentUser.isFirstLogin && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Login Pertama Kali Detected!</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Anda menggunakan password default (<code className="bg-amber-100 px-1 py-0.5 rounded font-mono">salsabila3</code>). Demi keamanan, silakan ganti password baru Anda.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl p-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              User / Akun
            </label>
            <input
              type="text"
              disabled
              value={currentUser.name}
              className="w-full bg-slate-100 border border-slate-200 text-slate-600 rounded-xl px-3 py-2 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Password Baru
            </label>
            <input
              type="password"
              required
              placeholder="Masukkan password baru"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2A0] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Konfirmasi Password Baru
            </label>
            <input
              type="password"
              required
              placeholder="Ulangi password baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2A0] focus:border-transparent transition-all"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            {!currentUser.isFirstLogin && (
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2 bg-[#00C2A0] hover:bg-[#00a386] text-white font-medium text-sm rounded-xl shadow-md shadow-[#00C2A0]/20 transition-all flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Simpan Password Baru</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
