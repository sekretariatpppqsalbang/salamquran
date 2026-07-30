import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 max-w-sm bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00C2A0] flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Pasang Aplikasi SALAM Quran</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Tambahkan ke layar utama HP (Add to Home Screen) untuk akses cepat tanpa browser.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPrompt(false)}
          className="text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          onClick={() => setShowPrompt(false)}
          className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
        >
          Nanti Saja
        </button>
        <button
          onClick={handleInstallClick}
          className="px-4 py-1.5 bg-[#00C2A0] hover:bg-[#00a386] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install Aplikasi</span>
        </button>
      </div>
    </div>
  );
};
