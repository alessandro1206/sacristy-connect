import React from 'react';
import { 
  Home, 
  Touchpad, 
  CalendarDays, 
  UserCheck, 
  ShieldCheck 
} from 'lucide-react';
import { UserSession } from '../types';
import { playAudioFeedback } from '../utils/sound';

interface MobileBottomNavProps {
  currentView: string;
  onNavigate: (view: any) => void;
  userSession: UserSession;
  onOpenOfficerSchedule: () => void;
  onOpenAdminLogin: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  userSession,
  onOpenOfficerSchedule,
  onOpenAdminLogin
}) => {
  const isAdmin = userSession.role === 'admin';

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-1.5 flex items-center justify-around shadow-lg safe-area-bottom">
      {/* 1. Menu Utama / Home */}
      <button
        onClick={() => {
          playAudioFeedback('tap');
          onNavigate('landing');
        }}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
          currentView === 'landing' 
            ? 'text-amber-600 font-bold' 
            : 'text-slate-500 hover:text-slate-900 font-medium'
        }`}
      >
        <div className={`p-1 rounded-xl transition-all ${
          currentView === 'landing' ? 'bg-amber-100 text-amber-900 shadow-2xs' : ''
        }`}>
          <Home className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5">Home</span>
      </button>

      {/* 2. Kiosk Presensi */}
      <button
        onClick={() => {
          playAudioFeedback('tap');
          onNavigate('kiosk');
        }}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
          currentView === 'kiosk' 
            ? 'text-amber-600 font-bold' 
            : 'text-slate-500 hover:text-slate-900 font-medium'
        }`}
      >
        <div className={`p-1 rounded-xl transition-all ${
          currentView === 'kiosk' ? 'bg-amber-100 text-amber-900 shadow-2xs' : ''
        }`}>
          <Touchpad className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5">Kiosk Absen</span>
      </button>

      {/* 3. Kalender / Agenda Misa */}
      <button
        onClick={() => {
          playAudioFeedback('tap');
          onNavigate('schedules');
        }}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
          currentView === 'schedules' || currentView === 'admin-schedule' || currentView === 'admin-schedule-editor'
            ? 'text-amber-600 font-bold' 
            : 'text-slate-500 hover:text-slate-900 font-medium'
        }`}
      >
        <div className={`p-1 rounded-xl transition-all ${
          currentView === 'schedules' || currentView === 'admin-schedule' || currentView === 'admin-schedule-editor'
            ? 'bg-amber-100 text-amber-900 shadow-2xs' 
            : ''
        }`}>
          <CalendarDays className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5">Jadwal Misa</span>
      </button>

      {/* 4. Jadwal Saya (Personal) */}
      <button
        onClick={() => {
          playAudioFeedback('tap');
          onOpenOfficerSchedule();
        }}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
      >
        <div className="p-1 rounded-xl">
          <UserCheck className="w-5 h-5 text-slate-600" />
        </div>
        <span className="text-[10px] mt-0.5">Jadwal Saya</span>
      </button>

      {/* 5. Admin Backoffice */}
      <button
        onClick={() => {
          playAudioFeedback('tap');
          if (isAdmin) {
            onNavigate('admin-dashboard');
          } else {
            onOpenAdminLogin();
          }
        }}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
          currentView.startsWith('admin') 
            ? 'text-amber-600 font-bold' 
            : 'text-slate-500 hover:text-slate-900 font-medium'
        }`}
      >
        <div className={`p-1 rounded-xl transition-all ${
          currentView.startsWith('admin') ? 'bg-amber-100 text-amber-900 shadow-2xs' : ''
        }`}>
          <ShieldCheck className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5">{isAdmin ? 'Admin' : 'Login'}</span>
      </button>
    </nav>
  );
};
