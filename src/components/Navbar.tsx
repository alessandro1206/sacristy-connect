import React from 'react';
import { CHURCH_LOGO } from '../data/initialData';
import { Settings, HelpCircle, Sparkles, Home, Shield, Touchpad, LogIn, LogOut, UserCheck, Award, KeyRound, Calendar } from 'lucide-react';
import { UserSession } from '../types';


interface NavbarProps {
  currentView: string;
  onNavigate: (view: 'landing' | 'kiosk' | 'admin-dashboard' | 'admin-chat' | 'admin-servers' | 'admin-logs' | 'admin-reports' | 'admin-schedule' | 'schedules' | 'servers') => void;
  onOpenCodeExport: () => void;
  onOpenHelp: () => void;
  userSession?: UserSession;
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
  onOpenOfficerSchedule?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenCodeExport,
  onOpenHelp,
  userSession = { isAuthenticated: false, role: 'guest', name: 'Tamu / Guest' },
  onOpenLoginModal,
  onLogout,
  onOpenOfficerSchedule
}) => {

  const isLanding = currentView === 'landing';
  const isKiosk = currentView === 'kiosk';
  const isAdmin = currentView.startsWith('admin') || currentView === 'schedules' || currentView === 'servers';

  const role = userSession?.role || 'guest';
  const isAuthed = userSession?.isAuthenticated;

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return (
          <span className="flex items-center gap-1 bg-amber-400/20 text-amber-200 border border-amber-400/40 px-2.5 py-1 rounded-lg text-xs font-extrabold">
            <KeyRound className="w-3.5 h-3.5 text-amber-300" />
            <span>Admin</span>
          </span>
        );
      case 'koorlap':
        return (
          <span className="flex items-center gap-1 bg-emerald-400/20 text-emerald-200 border border-emerald-400/40 px-2.5 py-1 rounded-lg text-xs font-extrabold">
            <Award className="w-3.5 h-3.5 text-emerald-300" />
            <span>Koorlap</span>
          </span>
        );
      case 'officer':
        return (
          <span className="flex items-center gap-1 bg-blue-400/20 text-blue-200 border border-blue-400/40 px-2.5 py-1 rounded-lg text-xs font-extrabold">
            <UserCheck className="w-3.5 h-3.5 text-blue-300" />
            <span>Petugas</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 bg-white/10 text-white/70 border border-white/20 px-2 py-0.5 rounded-lg text-[11px] font-semibold">
            Tamu / Guest
          </span>
        );
    }
  };

  return (
    <header className="docked full-width top-0 border-b border-[#5c1317] flex justify-between items-center w-full h-[72px] px-4 md:px-8 bg-gradient-to-r from-[#6e1418] via-[#7c191e] to-[#541014] text-white shadow-lg select-none shrink-0 z-20 backdrop-blur-md">
      {/* Brand & Logo */}
      <div 
        onClick={() => onNavigate('landing')}
        className="flex items-center gap-3.5 cursor-pointer group"
        title="Kembali ke Halaman Utama"
      >
        <div className="h-11 w-11 bg-white rounded-full p-0.5 flex items-center justify-center border-2 border-white/50 shadow-md group-hover:scale-105 group-hover:border-amber-300 transition-all overflow-hidden">
          <img 
            alt="Santo Yakobus Logo" 
            className="w-full h-full object-cover rounded-full" 
            src={CHURCH_LOGO} 
          />
        </div>

        <div>
          <span className="text-lg md:text-xl font-extrabold uppercase tracking-wider font-headline text-white flex items-center gap-1.5 drop-shadow-xs">
            SACRISTYCONNECT
          </span>
          <p className="text-[10px] text-white/85 tracking-wide font-medium">Paroki Santo Yakobus</p>
        </div>
      </div>


      {/* Center Nav Links: Menu Utama | Kiosk | Administrasi */}
      <nav className="hidden sm:flex gap-1 sm:gap-4 md:gap-6 h-full items-center">
        <button
          onClick={() => onNavigate('landing')}
          className={`flex items-center gap-1.5 h-full px-3 text-xs md:text-sm font-bold tracking-wide transition-all ${
            isLanding
              ? 'border-b-4 border-white text-white opacity-100'
              : 'text-white/75 hover:text-white hover:opacity-100'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Menu Utama</span>
        </button>

        <button
          onClick={() => onNavigate('kiosk')}
          className={`flex items-center gap-1.5 h-full px-3 text-xs md:text-sm font-bold tracking-wide transition-all ${
            isKiosk
              ? 'border-b-4 border-white text-white opacity-100'
              : 'text-white/75 hover:text-white hover:opacity-100'
          }`}
        >
          <Touchpad className="w-4 h-4" />
          <span>Kiosk Mode</span>
        </button>

        {/* Administrasi entry point: Visible to all, protected by handleNavigate security guard */}
        <button
          onClick={() => onNavigate('admin-dashboard')}
          className={`flex items-center gap-1.5 h-full px-3 text-xs md:text-sm font-bold tracking-wide transition-all cursor-pointer ${
            isAdmin
              ? 'border-b-4 border-white text-white opacity-100'
              : 'text-white/75 hover:text-white hover:opacity-100'
          }`}
        >
          <Shield className="w-4 h-4 text-amber-300" />
          <span>Administrasi</span>
        </button>
      </nav>

      {/* Right Controls & Role Badge */}
      <div className="flex items-center gap-2">
        {/* Role Badge */}
        {getRoleBadge()}

        {/* Login / Switch Role Button */}
        {onOpenLoginModal && (
          <button
            onClick={onOpenLoginModal}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold border border-white/20 transition-all shadow-xs cursor-pointer"
            title="Masuk / Ganti Tingkat Akses Akun"
          >
            <LogIn className="w-4 h-4 text-amber-300" />
            <span className="hidden md:inline">{isAuthed ? 'Ganti Level' : 'Masuk Akun'}</span>
          </button>
        )}

        {/* Officers My Schedule & Profile Button */}
        {onOpenOfficerSchedule && (
          <button
            onClick={onOpenOfficerSchedule}
            className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-[#4A0E17] px-3.5 py-1.5 rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer"
            title="Lihat Profil & Tanggal Tugas Misa Saya"
          >
            <UserCheck className="w-4 h-4" />
            <span>Profil Saya</span>
          </button>
        )}



        {/* Logout if authenticated */}
        {isAuthed && onLogout && (
          <button
            onClick={onLogout}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors h-[38px] w-[38px] flex items-center justify-center text-white/80 hover:text-white cursor-pointer"
            title="Keluar Akun"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}

        {/* Code Exporter */}
        <button
          onClick={onOpenCodeExport}
          title="Ekspor File kiosk.html, admin.html, & app.py"
          className="hidden lg:flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/20 transition-all shadow-xs cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Ekspor Kode</span>
        </button>

        {/* Help button */}
        <button
          onClick={onOpenHelp}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors h-[38px] w-[38px] flex items-center justify-center text-white cursor-pointer"
          title="Bantuan & Panduan Sistem"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Settings button */}
        <button
          onClick={() => onNavigate('admin-dashboard')}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors h-[38px] w-[38px] flex items-center justify-center text-white cursor-pointer"
          title="Pengaturan Admin"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

    </header>

  );
};

