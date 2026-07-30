import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { GuruDashboard } from './components/GuruDashboard';
import { WaliDashboard } from './components/WaliDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { BookOpen, Github, ExternalLink } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFD] text-[#3F4E5A]">
      <Navbar />

      <main className="flex-1">
        {currentUser.role === 'GURU' && <GuruDashboard />}
        {currentUser.role === 'WALI' && <WaliDashboard />}
        {currentUser.role === 'ADMIN' && <AdminDashboard />}
      </main>

      <ChangePasswordModal />
      <PWAInstallPrompt />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-xs mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#00C2A0] text-white flex items-center justify-center font-bold text-xs">
              S
            </div>
            <span className="font-semibold text-slate-200">
              SALAM Quran • SDIT Salsabila 3 Banguntapan
            </span>
          </div>

          <p className="text-center sm:text-right text-slate-500">
            Salsabila Achievement, Learning, And Application for Monitoring Qur’an © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
