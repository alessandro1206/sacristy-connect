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
    <header className="docked full-width top-0 border-b border-slate-800/80 flex justify-between items-center w-full h-[72px] px-4 md:px-8 bg-slate-900/95 backdrop-blur-md text-white shadow-md select-none shrink-0 z-30">
      {/* Brand & Logo */}
      <div 
        onClick={() => onNavigate('landing')}
        className="flex items-center gap-3.5 cursor-pointer group"
        title="Kembali ke Halaman Utama"
      >
        <div className="h-10 w-10 bg-gradient-to-tr from-amber-400 to-amber-200 rounded-2xl p-0.5 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform overflow-hidden">
          <img 
            alt="Santo Yakobus Logo" 
            className="w-full h-full object-cover rounded-[14px] bg-white" 
            src={CHURCH_LOGO} 
          />
        </div>

        <div>
          <span className="text-base md:text-lg font-black uppercase tracking-wider font-headline text-white flex items-center gap-1.5 drop-shadow-xs">
            Sacristy<span className="text-amber-400">Connect</span>
          </span>
          <p className="text-[10px] text-slate-400 tracking-wide font-medium">Paroki Santo Yakobus</p>
        </div>
      </div>

      {/* Center Nav Links: Menu Utama | Kiosk | Administrasi */}
      <nav className="hidden sm:flex gap-2 h-full items-center">
        <button
          onClick={() => onNavigate('landing')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold tracking-wide transition-all ${
            isLanding
              ? 'bg-white/15 text-white shadow-xs font-black'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Home className="w-4 h-4 text-slate-300" />
          <span>Menu Utama</span>
        </button>

        <button
          onClick={() => onNavigate('kiosk')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold tracking-wide transition-all ${
            isKiosk
              ? 'bg-amber-400 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Touchpad className="w-4 h-4" />
          <span>Kiosk Mode</span>
        </button>

        {/* Administrasi entry point */}
        <button
          onClick={() => onNavigate('admin-dashboard')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold tracking-wide transition-all cursor-pointer ${
            isAdmin
              ? 'bg-rose-900/90 text-amber-200 border border-rose-700/60 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Shield className="w-4 h-4 text-amber-400" />
          <span>Administrasi</span>
        </button>
      </nav>

      {/* Right Controls & Role Badge */}
      <div className="flex items-center gap-2">
        {/* Role Badge */}
        {getRoleBadge()}

        {/* Login Button when not authenticated */}
        {!isAuthed && onOpenLoginModal && (
          <button
            onClick={onOpenLoginModal}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-bold border border-slate-700 transition-all shadow-xs cursor-pointer"
            title="Masuk Akun"
          >
            <LogIn className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Masuk Akun</span>
          </button>
        )}

        {/* Officers My Schedule & Profile Button */}
        {onOpenOfficerSchedule && (
          <button
            onClick={onOpenOfficerSchedule}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer"
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
            className="p-2 hover:bg-white/10 rounded-xl transition-colors h-[38px] w-[38px] flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
            title="Keluar Akun"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}

        {/* Help button */}
        <button
          onClick={onOpenHelp}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors h-[38px] w-[38px] flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
          title="Bantuan & Panduan Sistem"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

