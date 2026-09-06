import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Monitor, 
  Download, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { CHURCH_LOGO } from '../data/initialData';
import { playAudioFeedback } from '../utils/sound';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstalled?: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstalled
}) => {
  const [deviceTab, setDeviceTab] = useState<'auto' | 'android' | 'ios' | 'desktop'>('auto');
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      // Detect user device
      const ua = navigator.userAgent || '';
      if (/iphone|ipad|ipod/i.test(ua)) {
        setDeviceTab('ios');
      } else if (/android/i.test(ua)) {
        setDeviceTab('android');
      } else {
        setDeviceTab('desktop');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (!deferredPrompt) {
      return;
    }
    playAudioFeedback('tap');
    setIsInstalling(true);
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        playAudioFeedback('success');
        setInstalledSuccess(true);
        onInstalled?.();
        setTimeout(() => {
          onClose();
        }, 2500);
      }
    } catch (e) {
      console.warn('Install prompt error', e);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white text-center relative shrink-0 border-b border-slate-800">
          <button
            onClick={() => {
              playAudioFeedback('tap');
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 p-0.5 mx-auto mb-2 flex items-center justify-center shadow-md overflow-hidden">
            <img 
              src={CHURCH_LOGO} 
              alt="Logo SacristyConnect" 
              className="w-full h-full object-cover rounded-[14px] bg-white"
            />
          </div>

          <h3 className="text-xl font-black font-headline tracking-tight">
            Pasang Pintasan Aplikasi
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Buka langsung dari Layar Utama HP atau Desktop tanpa perlu mengetik alamat URL lagi
          </p>

          {/* Device Tabs */}
          <div className="mt-5 grid grid-cols-3 gap-1 bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700/60 text-xs">
            <button
              type="button"
              onClick={() => {
                playAudioFeedback('tap');
                setDeviceTab('desktop');
              }}
              className={`py-2 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                deviceTab === 'desktop'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Laptop/PC</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playAudioFeedback('tap');
                setDeviceTab('android');
              }}
              className={`py-2 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                deviceTab === 'android'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playAudioFeedback('tap');
                setDeviceTab('ios');
              }}
              className={`py-2 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                deviceTab === 'ios'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>iPhone/iPad</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[65vh] bg-slate-50/50">
          
          {/* Instant 1-Click Install Button if supported by browser */}
          {deferredPrompt && !installedSuccess && (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100/70 border-2 border-amber-300 rounded-2xl space-y-2 text-center shadow-xs">
              <span className="text-xs font-black text-amber-950 uppercase tracking-wider block">
                ⭐ Pasang Otomatis 1-Klik Tersedia
              </span>
              <p className="text-xs text-amber-900 leading-relaxed">
                Browser Anda mendukung pemasangan langsung. Klik tombol di bawah untuk membuat ikon pintasan di layar Anda.
              </p>
              <button
                type="button"
                onClick={handleNativeInstall}
                disabled={isInstalling}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>{isInstalling ? 'Memproses...' : 'Pasang Aplikasi Sekarang'}</span>
              </button>
            </div>
          )}

          {installedSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl flex items-center gap-3 text-xs font-bold shadow-xs">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-black">Aplikasi Berhasil Dipasang!</p>
                <p className="text-emerald-800 font-normal mt-0.5">Ikon SacristyConnect telah ditambahkan ke Layar Utama perangkat Anda.</p>
              </div>
            </div>
          )}

          {/* Guide for Laptop / PC */}
          {deviceTab === 'desktop' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3">
                <h4 className="font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                  <Laptop className="w-4 h-4 text-indigo-600" />
                  <span>Cara Pasang di Laptop / Komputer (Chrome, Edge, Brave)</span>
                </h4>
                <ol className="space-y-2.5 text-slate-700 list-decimal list-inside leading-relaxed">
                  <li>
                    Lihat ke ujung kanan <strong>Bilah Alamat URL browser</strong> Anda di bagian atas.
                  </li>
                  <li>
                    Klik ikon <strong>"Install / Pasang Aplikasi"</strong> (berbentuk layar komputer kecil dengan tanda panah ke bawah atau simbol komputer bertanda plus).
                  </li>
                  <li>
                    Klik tombol konfirmasi <strong>"Install"</strong>.
                  </li>
                  <li>
                    <strong>Selesai!</strong> Pintasan aplikasi SacristyConnect akan langsung muncul di Desktop &amp; Menu Start Windows/Mac Anda.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* Guide for Android */}
          {deviceTab === 'android' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3">
                <h4 className="font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Cara Pasang di HP Android (Google Chrome)</span>
                </h4>
                <ol className="space-y-2.5 text-slate-700 list-decimal list-inside leading-relaxed">
                  <li>
                    Buka situs ini di browser <strong>Google Chrome</strong> di HP Anda.
                  </li>
                  <li>
                    Tekan ikon <strong>Titik Tiga (⋮)</strong> di pojok kanan atas browser.
                  </li>
                  <li>
                    Pilih menu <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Install Aplikasi"</strong> (Add to Home screen).
                  </li>
                  <li>
                    Tekan <strong>"Tambah / Install"</strong>.
                  </li>
                  <li>
                    <strong>Selesai!</strong> Ikon SacristyConnect akan muncul di layar utama HP Anda layaknya aplikasi asli.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* Guide for iPhone / iPad */}
          {deviceTab === 'ios' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3">
                <h4 className="font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                  <Share className="w-4 h-4 text-blue-600" />
                  <span>Cara Pasang di iPhone / iPad (Safari)</span>
                </h4>
                <ol className="space-y-2.5 text-slate-700 list-decimal list-inside leading-relaxed">
                  <li>
                    Buka situs ini menggunakan browser bawaan <strong>Safari</strong> di iPhone/iPad Anda.
                  </li>
                  <li>
                    Tekan tombol <strong>Bagikan (Share)</strong> di bagian bawah layar (ikon kotak dengan panah ke atas <Share className="inline w-3.5 h-3.5 text-blue-500 mx-0.5" />).
                  </li>
                  <li>
                    Gulir menu ke bawah lalu pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.
                  </li>
                  <li>
                    Tekan <strong>"Tambah" (Add)</strong> di pojok kanan atas.
                  </li>
                  <li>
                    <strong>Selesai!</strong> Ikon SacristyConnect akan langsung tersimpan di beranda iPhone Anda dan dapat dibuka satu sentuhan tanpa browser URL bar.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* Benefits Box */}
          <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1.5">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Keuntungan Menggunakan Pintasan Aplikasi:
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              <li>Membuka layar penuh mandiri (*standalone mode*) tanpa terganggu bilah alamat web.</li>
              <li>Akses cepat instan untuk presensi numpad kiosk, cek jadwal misa pribadi, dan laporan.</li>
              <li>Tetap tersinkronisasi otomatis dengan server paroki setiap kali dibuka.</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>SacristyConnect PWA Standalone Ready</span>
          <button
            type="button"
            onClick={() => {
              playAudioFeedback('tap');
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-2xs"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
