import React from 'react';
import { CHURCH_LOGO } from '../data/initialData';
import { UserSession } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  MessageSquare, 
  History, 
  HelpCircle, 
  LogOut, 
  Touchpad,
  FileSpreadsheet,
  Lock,
  LogIn,
  ShieldCheck,
  Award,
  UserCheck
} from 'lucide-react';
import { playAudioFeedback } from '../utils/sound';

interface SidebarNavProps {
  activeView: string;
  onNavigate: (view: 'landing' | 'kiosk' | 'admin-dashboard' | 'admin-chat' | 'admin-servers' | 'admin-logs' | 'admin-reports' | 'admin-schedule' | 'admin-schedule-editor' | 'schedules' | 'servers') => void;
  onOpenCodeExport?: () => void;
  onOpenHelp: () => void;
  onAdminLogout?: () => void;
  userSession?: UserSession;
  onOpenLoginModal?: () => void;
  onOpenOfficerSchedule?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeView,
  onNavigate,
  onOpenHelp,
  onAdminLogout,
  userSession,
  onOpenLoginModal,
  onOpenOfficerSchedule
}) => {


  const isAdminRole = userSession?.role === 'admin';

  return (
    <aside className="hidden md:flex flex-col bg-white border-r border-slate-200/90 h-full w-[270px] p-5 flex-shrink-0 z-10 select-none shadow-xs">
      {/* Header */}
      <div 
        onClick={() => {
          playAudioFeedback('tap');
          onNavigate('landing');
        }} 
        className="px-1 mb-5 flex items-center gap-3 cursor-pointer group"
        title="Kembali ke Menu Utama"
      >
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 p-0.5 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
          <img 
            className="w-full h-full object-cover rounded-[14px] bg-white" 
            alt="Santo Yakobus Logo" 
            src={CHURCH_LOGO} 
          />
        </div>

        <div>
          <h1 className="text-sm font-black text-slate-900 font-headline tracking-tight group-hover:text-amber-600 transition-colors">
            Sacristy<span className="text-amber-500">Connect</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-medium">
            Paroki Santo Yakobus
          </p>
        </div>
      </div>

      {/* Active Role Indicator Card */}
      <div className="mb-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-xs text-slate-600 flex items-center justify-between shadow-2xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Akses Anda:</span>
          <span className="font-black text-slate-900 text-xs flex items-center gap-1.5 mt-0.5">
            {userSession?.role === 'admin' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Admin (Super)</span>
              </>
            ) : userSession?.role === 'koorlap' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Koorlap Jaga</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Petugas</span>
              </>
            )}
          </span>
        </div>
        {onOpenLoginModal && (
          <button
            onClick={onOpenLoginModal}
            className="text-[10px] bg-slate-900 text-white px-2.5 py-1 rounded-lg font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Ubah
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 flex flex-col gap-1 overflow-y-auto pr-1">
        
        {/* 1. Dashboard Overview (Admin Only) */}
        <button
          onClick={() => {
            playAudioFeedback('tap');
            onNavigate('admin-dashboard');
          }}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
            activeView === 'admin-dashboard'
              ? 'bg-slate-900 text-white font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 font-semibold'
          }`}
        >
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-4 h-4 text-slate-400" />
            <span className="text-xs">Dashboard Overview</span>
          </div>
          {!isAdminRole && <Lock className="w-3.5 h-3.5 text-amber-500" title="Khusus Admin" />}
        </button>

        {/* 2. Database Asisten Imam (Admin Only) */}
        <button
          onClick={() => {
            playAudioFeedback('tap');
            onNavigate('admin-servers');
          }}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
            activeView === 'admin-servers' || activeView === 'servers'
              ? 'bg-slate-900 text-white font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 font-semibold'
          }`}
        >
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-xs">Database Management</span>
          </div>
          {!isAdminRole && <Lock className="w-3.5 h-3.5 text-amber-500" title="Khusus Admin" />}
        </button>

        {/* 3. WA Tukar Jadwal (Admin Only) */}
        <button
          onClick={() => {
            playAudioFeedback('tap');
            onNavigate('admin-chat');
          }}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
            activeView === 'admin-chat'
              ? 'bg-slate-900 text-white font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 font-semibold'
          }`}
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            <span className="text-xs">WA Tukar Jadwal</span>
          </div>
          {!isAdminRole && <Lock className="w-3.5 h-3.5 text-amber-500" title="Khusus Admin" />}
        </button>

        {/* 4. Schedule Generator (Koorlap & Admin) */}
        <button
          onClick={() => {
            playAudioFeedback('tap');
            onNavigate('admin-schedule');
          }}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
            activeView === 'admin-schedule' || activeView === 'schedules'
              ? 'bg-slate-900 text-white font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 font-semibold'
          }`}
        >
          <CalendarDays className="w-4 h-4 text-indigo-500" />
          <span className="text-xs">Schedule Generator</span>
        </button>

        {/* 4b. Kelola & Editor Jadwal (Admin & Koorlap) */}
        <button
          onClick={() => {
            playAudioFeedback('tap');
            onNavigate('admin-schedule-editor');
          }}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
            activeView === 'admin-schedule-editor'
              ? 'bg-slate-900 text-white font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 font-semibold'
          }`}
        >
          <div className="flex items-center gap-3">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-xs">Kelola &amp; Edit Jadwal</span>
          </div>
          <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-md font-black border border-amber-300">
            Baru
          </span>
        </button>

        {/* 5. Laporan Tugas & Presensi (Admin Only) */}
        <button
          onClick={() => {
            playAudioFeedback('tap');
            onNavigate('admin-reports');
          }}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
            activeView === 'admin-reports'
              ? 'bg-slate-900 text-white font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 font-semibold'
          }`}
        >
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="text-xs">Laporan &amp; Presensi</span>
          </div>
          {!isAdminRole && <Lock className="w-3.5 h-3.5 text-amber-500" title="Khusus Admin" />}
        </button>

        {/* 6. Log Sistem & Audit (Admin Only) */}
        <button
          onClick={() => {
            playAudioFeedback('tap');
            onNavigate('admin-logs');
          }}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
            activeView === 'admin-logs'
              ? 'bg-slate-900 text-white font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 font-semibold'
          }`}
        >
          <div className="flex items-center gap-3">
            <History className="w-4 h-4 text-purple-500" />
            <span className="text-xs">Log Sistem &amp; Audit</span>
          </div>
          {!isAdminRole && <Lock className="w-3.5 h-3.5 text-amber-500" title="Khusus Admin" />}
        </button>

        {/* 7. Profil & Tanggal Tugas Saya */}
        {onOpenOfficerSchedule && (
          <button
            onClick={() => {
              playAudioFeedback('tap');
              onOpenOfficerSchedule();
            }}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left bg-gradient-to-r from-amber-50 to-amber-100/60 hover:from-amber-100 hover:to-amber-200/80 text-amber-950 font-black transition-all border border-amber-200 shadow-2xs mt-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-amber-700" />
            <span className="text-xs">Profil &amp; Tugas Saya</span>
          </button>
        )}

      </div>

      {/* Footer Links & Switch Mode CTA */}
      <div className="px-1 mt-auto flex flex-col gap-2 pt-4 border-t border-slate-200">
        {/* Lock / Logout Admin Button */}
        {onAdminLogout && (
          <button
            onClick={() => {
              playAudioFeedback('tap');
              onAdminLogout();
            }}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              <span>Keluar Sesi</span>
            </div>
          </button>
        )}

        {/* Switch to Kiosk Mode Button */}
        <button
          onClick={() => {
            playAudioFeedback('tap');
            onNavigate('kiosk');
          }}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
        >
          <Touchpad className="w-4 h-4 text-amber-400" />
          <span>Buka Mode Kiosk</span>
        </button>

        {/* Quick Help */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
          <span>Sakristi v2.4</span>
          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              className="hover:text-slate-700 flex items-center gap-1 cursor-pointer font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Bantuan</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
