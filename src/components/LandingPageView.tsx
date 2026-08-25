import React from 'react';
import { CHURCH_LOGO } from '../data/initialData';
import { 
  Touchpad, 
  ShieldCheck, 
  Users, 
  MessageSquare, 
  Calendar, 
  FileText, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  Flame,
  LayoutGrid,
  UserCheck
} from 'lucide-react';

import { playAudioFeedback } from '../utils/sound';

import { Officer, ScheduleSlot, UserSession } from '../types';

interface LandingPageViewProps {
  onSelectKiosk: () => void;
  onSelectAdmin: (view?: 'admin-dashboard' | 'admin-servers' | 'admin-chat' | 'admin-schedule' | 'admin-reports' | 'admin-logs') => void;
  officersCount: number;
  activeMassTime: string;
  userSession?: UserSession;
  currentSlot?: ScheduleSlot;
  officers?: Officer[];
  onOpenProfile?: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onSelectKiosk,
  onSelectAdmin,
  officersCount,
  activeMassTime,
  userSession,
  currentSlot,
  officers = [],
  onOpenProfile
}) => {
  const isAdminRole = userSession?.role === 'admin';

  const handleKioskClick = () => {
    playAudioFeedback('tap');
    onSelectKiosk();
  };

  const handleAdminClick = (view: 'admin-dashboard' | 'admin-servers' | 'admin-chat' | 'admin-schedule' | 'admin-reports' | 'admin-logs' = 'admin-dashboard') => {
    playAudioFeedback('tap');
    onSelectAdmin(view);
  };

  // Assigned officers for nearest mass
  const assignedOfficersForNearest = officers.filter(o => {
    if (!currentSlot?.serverIds) return false;
    return currentSlot.serverIds.includes(o.id) || currentSlot.serverIds.includes(o.id.padStart(3, '0'));
  }).slice(0, 12);

  const nearestKoorlapNames = assignedOfficersForNearest.filter(o => o.isKoorlap).map(o => o.name).join(' & ') || 'Koorlap Jaga';

  return (
    <div className="flex-1 bg-[#fbf9f5] overflow-y-auto p-4 sm:p-6 md:p-10 flex flex-col justify-between selection:bg-primary/20">
      <div className="max-w-5xl mx-auto w-full space-y-8 my-auto">
        
        {/* ========================================================================= */}
        {/* BRAND HERO HEADER                                                         */}
        {/* ========================================================================= */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-3 bg-[#f3ede2] border border-[#e6ded2] px-4 py-2 rounded-full shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-0.5 border border-[#d6cbbe] overflow-hidden">
              <img 
                src={CHURCH_LOGO} 
                alt="Paroki Santo Yakobus" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="text-xs font-bold text-[#7c191e] uppercase tracking-wider">
              Paroki Santo Yakobus &bull; Liturgi & Sakristi
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#7c191e] font-serif tracking-tight">
            SacristyConnect
          </h1>
          <p className="text-sm md:text-base text-[#665e55] max-w-2xl mx-auto font-medium">
            Sistem Informasi Terpadu Pelayanan Asisten Imam & Presensi Sakristi Gereja Santo Yakobus
          </p>

          {/* Profil Saya & Jadwal Tugas CTA */}
          {onOpenProfile && (
            <div className="pt-2">
              <button
                onClick={() => {
                  playAudioFeedback('tap');
                  onOpenProfile();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5B1414] hover:bg-[#420D0D] text-white text-xs font-extrabold rounded-2xl shadow-md transition-all cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-amber-300" />
                <span>Profil &amp; Tanggal Tugas Saya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* HERO CARD: MISA TERDEKAT & DAFTAR PETUGAS JAGA                             */}
        {/* ========================================================================= */}
        {currentSlot && (
          <div className="bg-gradient-to-br from-[#5B1414] via-[#7C191E] to-[#420D0D] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/25 relative overflow-hidden backdrop-blur-md">
            {/* Top metallic glow accent */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header / Date & Time */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/20 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-400 text-[#4A0E17] rounded-full text-xs font-black uppercase tracking-wider mb-2 shadow-xs">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Misa Terdekat &amp; Jadwal Sesi Aktif</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tight text-white drop-shadow-xs">
                  {currentSlot.displayDate} — {currentSlot.massTime}
                </h2>
                <p className="text-xs sm:text-sm text-white/90 flex items-center gap-1.5 mt-1 font-medium">
                  <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>{currentSlot.location}</span>
                </p>
              </div>

              <button
                onClick={handleKioskClick}
                className="px-5 py-2.5 bg-white text-[#5B1414] hover:bg-amber-100 rounded-2xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0 border border-white/40"
              >
                <Touchpad className="w-4 h-4 text-[#5B1414]" />
                <span>Absen Kiosk Misa Ini</span>
              </button>
            </div>

            {/* Who Will Be The Tugas (Daftar Petugas Jaga) */}
            <div className="pt-6 space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-wider font-extrabold text-amber-300 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Petugas Misa Terdekat ({assignedOfficersForNearest.length} Asisten Imam)</span>
                </h3>
                <span className="text-[11px] text-white/85 font-medium">
                  Koorlap: <strong className="text-amber-200">{nearestKoorlapNames}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {assignedOfficersForNearest.map(off => (
                  <div key={off.id} className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-amber-300/50 rounded-xl px-3 py-2.5 text-left transition-all shadow-xs hover:scale-[1.02] cursor-default">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] font-mono font-bold text-amber-300 shrink-0">#{off.id.padStart(3, '0')}</span>
                      <p className="text-xs font-bold text-white truncate">{off.name}</p>
                    </div>
                    <span className="text-[10px] text-white/80 block truncate mt-0.5 font-medium">{off.wilayah || 'Asisten Imam'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}



        {/* ========================================================================= */}
        {/* CARDS CONTAINER (Kiosk Mode & Administrasi Admin Card)                    */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          
          {/* ----------------------------------------------------------------------- */}
          {/* CARD 1: KIOSK PRESENSI & PENUGASAN (Touchscreen)                       */}
          {/* ----------------------------------------------------------------------- */}
          <div 
            onClick={handleKioskClick}
            className="group relative bg-[#f7f3eb] hover:bg-[#f2ece0] border-2 border-[#e6ded2] hover:border-[#7c191e] rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Top decorative accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#7c191e]/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />

            <div className="space-y-5 relative">
              {/* Badge & Icon */}
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#7c191e] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Touchpad className="w-8 h-8" />
                </div>
                <span className="px-3 py-1 bg-[#fce8e8] text-[#8b1e23] border border-[#f3c1c3] rounded-full text-xs font-bold uppercase tracking-wider">
                  Touchscreen Kiosk
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h2 className="text-2xl font-bold text-[#2b241e] font-serif group-hover:text-[#7c191e] transition-colors">
                  Kiosk Mode
                </h2>
                <p className="text-xs sm:text-sm text-[#665e55] leading-relaxed">
                  Layar khusus presensi mandiri asisten imam dan penempatan posisi liturgi saat misa berlangsung.
                </p>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-2.5 pt-2 border-t border-[#e0d6c7]">
                <div className="flex items-center gap-2.5 text-xs text-[#4a4239] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pilih Misa & Otorisasi Koorlap / Admin</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#4a4239] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Input 3 Digit No. Absen Petugas (Numpad)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#4a4239] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Konfirmasi Identitas & Foto Profil Resmi</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#4a4239] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Penempatan 8 Posisi Gereja + Alokasi Balai</span>
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="pt-6 mt-4">
              <button className="w-full py-3.5 px-6 bg-[#7c191e] group-hover:bg-[#681419] text-white text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 uppercase tracking-wider transition-all cursor-pointer">
                <span>Masuk ke Mode Kiosk</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* CARD 2: ADMINISTRASI (ADMIN BACKOFFICE)                                 */}
          {/* ----------------------------------------------------------------------- */}
          <div className="bg-white hover:bg-[#faf8f4] border-2 border-[#e6ded2] hover:border-[#7c191e] rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between relative overflow-hidden">
            {/* Top decorative accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1976d2]/5 rounded-bl-full pointer-events-none" />

            <div className="space-y-5 relative">
              {/* Badge & Icon */}
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#2b241e] text-white flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-8 h-8 text-amber-300" />
                </div>
                <span className="px-3 py-1 bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] rounded-full text-xs font-bold uppercase tracking-wider">
                  Admin Backoffice
                </span>
              </div>


                {/* Title & Description */}
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-bold text-[#2b241e] font-serif">
                    Administrasi (Admin)
                  </h2>
                  <p className="text-xs sm:text-sm text-[#665e55] leading-relaxed">
                    Pusat kontrol database 170 petugas, generator jadwal otomatis, impor pesan WA, dan laporan sakristi.
                  </p>
                </div>

                {/* Quick Menu Buttons inside Admin */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#e0d6c7]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdminClick('admin-servers');
                    }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#fbf9f5] hover:bg-[#f3ede2] border border-[#e6ded2] text-left transition-colors group/btn cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-[#7c191e] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#2b241e] group-hover/btn:text-[#7c191e]">
                        Database Management
                      </p>
                      <p className="text-[10px] text-[#7a7165]">Data 170 Petugas &amp; Wilayah</p>
                    </div>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdminClick('admin-chat');
                    }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#fbf9f5] hover:bg-[#f3ede2] border border-[#e6ded2] text-left transition-colors group/btn cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-[#1b5e20] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#2b241e] group-hover/btn:text-[#7c191e]">
                        WA Tukar Jadwal
                      </p>
                      <p className="text-[10px] text-[#7a7165]">Update Tukar Jadwal Harian</p>
                    </div>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdminClick('admin-schedule');
                    }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#fbf9f5] hover:bg-[#f3ede2] border border-[#e6ded2] text-left transition-colors group/btn cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-[#1976d2] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#2b241e] group-hover/btn:text-[#7c191e]">
                        Schedule Generator
                      </p>
                      <p className="text-[10px] text-[#7a7165]">Jadwal Bulanan &amp; Rotasi Adil</p>
                    </div>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdminClick('admin-reports');
                    }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#fbf9f5] hover:bg-[#f3ede2] border border-[#e6ded2] text-left transition-colors group/btn cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#2b241e] group-hover/btn:text-[#7c191e]">
                        Laporan Tugas &amp; Presensi
                      </p>
                      <p className="text-[10px] text-[#7a7165]">Posisi Per Misa &amp; Rekap Petugas</p>
                    </div>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdminClick('admin-logs');
                    }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#fbf9f5] hover:bg-[#f3ede2] border border-[#e6ded2] text-left transition-colors group/btn cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#2b241e] group-hover/btn:text-[#7c191e]">
                        Log Sistem &amp; Audit
                      </p>
                      <p className="text-[10px] text-[#7a7165]">Audit Trail &amp; Kiosk Check-in</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Action CTA Button */}
              <div className="pt-6 mt-4">
                <button 
                  onClick={() => handleAdminClick('admin-dashboard')}
                  className="w-full py-3.5 px-6 bg-[#2b241e] hover:bg-[#1a140e] text-white text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 uppercase tracking-wider transition-all cursor-pointer"
                >
                  <span>Buka Portal Administrasi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>




        {/* ========================================================================= */}
        {/* BOTTOM METRICS & SYSTEM STATUS                                            */}
        {/* ========================================================================= */}
        <div className="bg-[#f7f3eb] border border-[#e6ded2] rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs text-[#554d44]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-[#2b241e]">Status Sistem:</span>
            <span>Online & Sinkron ke Sakristi</span>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <span className="font-bold text-[#7c191e]">{officersCount}</span> Petugas Terdaftar
            </div>
            <div>
              <span className="font-bold text-[#2b241e]">Sesi Misa:</span> {activeMassTime}
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-[#1976d2]">Masa Bakti:</span> 2024 - 2027
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
