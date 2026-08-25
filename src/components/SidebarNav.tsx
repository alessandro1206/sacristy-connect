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
  onNavigate: (view: 'landing' | 'kiosk' | 'admin-dashboard' | 'admin-chat' | 'admin-servers' | 'admin-logs' | 'admin-reports' | 'admin-schedule' | 'schedules' | 'servers') => void;
  onOpenCodeExport?: () => void;
  onOpenHelp: () => void;
  onAdminLogout?: () => void;
  userSession?: UserSession;
  onOpenLoginModal?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeView,
  onNavigate,
  onOpenHelp,
  onAdminLogout,
  userSession,
  onOpenLoginModal
}) => {

  return (
    <aside className="hidden md:flex flex-col bg-[#FAF7F2] border-r border-[#D9CEBA] h-full w-[270px] p-6 flex-shrink-0 z-10 select-none shadow-xs">
      {/* Header */}
      <div 
        onClick={() => {
          playAudioFeedback('tap');
          onNavigate('landing');
        }} 
        className="px-1 mb-6 flex items-center gap-3.5 cursor-pointer group"
        title="Kembali ke Menu Utama"
      >
        <div className="w-12 h-12 rounded-full bg-[#5B1414] flex items-center justify-center overflow-hidden border border-[#D9CEBA] shrink-0 p-1 shadow-inner group-hover:scale-105 transition-transform">
          <img 
            className="w-10 h-10 object-contain" 
            alt="Santo Yakobus Logo" 
            src={CHURCH_LOGO} 
          />
        </div>
        <div>
          <h1 className="text-sm font-extrabold text-[#5B1414] font-headline tracking-tight group-hover:underline">
            SacristyConnect
          </h1>
          <p className="text-[11px] text-[#6E5A4B] font-medium">
            Paroki Santo Yakobus
          </p>
        </div>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 flex flex-col gap-1.5">
        
        {/* 1. Dashboard Overview */}
        <button
          onClick={() => {
            playAudioFeedback('tap');
            onNavigate('admin-dashboard');
          }}
          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-all ${
            activeView === 'admin-dashboard'
              ? 'bg-[#5B1414] text-white font-bold shadow-xs'
              : 'text-[#6E5A4B] hover:bg-[#F3EDE2] hover:text-[#2C2420] font-medium'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-xs">Dashboard Overview</span>
        </button>

        {/* 2. Database Asisten Imam (Database Management) */}
        <button
          onClick={() => {
            playAudioFeedback('tap');
            onNavigate('admin-servers');
          }}
          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-all ${
            activeView === 'admin-servers' || activeView === 'servers'
              ? 'bg-[#5B1414] text-white font-bold shadow-xs'
              : 'text-[#6E5A4B] hover:bg-[#F3EDE2] hover:text-[#2C2420] font-medium'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-xs">Database Management</span>
        </button>

        {/* 3. WA Tukar Jadwal (formerly WA Schedule Generator) */}
        <button
          onClick={() => {
            playAudioFeedback('tap');
            onNavigate('admin-chat');
          }}
          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-all ${
            activeView === 'admin-chat'
              ? 'bg-[#5B1414] text-white font-bold shadow-xs'
              : 'text-[#6E5A4B] hover:bg-[#F3EDE2] hover:text-[#2C2420] font-medium'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-xs">WA Tukar Jadwal</span>
        </button>

        {/* 4. Schedule Generator (formerly Schedule Preview) */}
        <button
          onClick={() => {
            playAudioFeedback('tap');
            onNavigate('admin-schedule');
          }}
          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-all ${
            activeView === 'admin-schedule' || activeView === 'schedules'
              ? 'bg-[#5B1414] text-white font-bold shadow-xs'
              : 'text-[#6E5A4B] hover:bg-[#F3EDE2] hover:text-[#2C2420] font-medium'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span className="text-xs">Schedule Generator</span>
        </button>

        {/* 5. Laporan Tugas & Presensi (Separated Report view) */}
        <button
          onClick={() => {
            playAudioFeedback('tap');
            onNavigate('admin-reports');
          }}
          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-all ${
            activeView === 'admin-reports'
              ? 'bg-[#5B1414] text-white font-bold shadow-xs'
              : 'text-[#6E5A4B] hover:bg-[#F3EDE2] hover:text-[#2C2420] font-medium'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          <span className="text-xs">Laporan Tugas &amp; Presensi</span>
        </button>

        {/* 6. Log Sistem & Audit (Separated Log view) */}
        <button
          onClick={() => {
            playAudioFeedback('tap');
            onNavigate('admin-logs');
          }}
          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-all ${
            activeView === 'admin-logs'
              ? 'bg-[#5B1414] text-white font-bold shadow-xs'
              : 'text-[#6E5A4B] hover:bg-[#F3EDE2] hover:text-[#2C2420] font-medium'
          }`}
        >
          <History className="w-4 h-4 text-amber-700" />
          <span className="text-xs">Log Sistem &amp; Audit</span>
        </button>

      </div>

      {/* Footer Links & Switch Mode CTA */}
      <div className="px-1 mt-auto flex flex-col gap-2 pt-4 border-t border-[#D9CEBA]">
        {/* Lock / Logout Admin Button */}
        {onAdminLogout && (
          <button
            onClick={() => {
              playAudioFeedback('tap');
              onAdminLogout();
            }}
            className="flex items-center gap-3 text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors text-left text-xs font-bold border border-red-200"
            title="Kunci Akses Administrator"
          >
            <Lock className="w-4 h-4 text-red-600" />
            <span>Kunci / Keluar Admin</span>
          </button>
        )}

        <button
          onClick={() => {
            playAudioFeedback('tap');
            onNavigate('landing');
          }}
          className="flex items-center gap-3 text-[#6E5A4B] px-4 py-2 rounded-xl hover:bg-[#F3EDE2] transition-colors text-left text-xs font-semibold"
        >
          <LogOut className="w-4 h-4 text-[#5B1414]" />
          <span>Kembali ke Menu Utama</span>
        </button>

        <button
          onClick={() => {
            playAudioFeedback('tap');
            onNavigate('kiosk');
          }}
          className="flex items-center gap-3 text-[#5B1414] px-4 py-2.5 rounded-xl bg-[#5B1414]/10 hover:bg-[#5B1414]/20 transition-colors text-left text-xs font-bold"
        >
          <Touchpad className="w-4 h-4" />
          <span>Buka Mode Kiosk</span>
        </button>
      </div>
    </aside>
  );
};
