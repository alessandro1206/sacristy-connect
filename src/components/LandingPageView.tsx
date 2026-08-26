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

  const slotKoorlapSet = new Set((currentSlot?.koorlapIds || []).map(id => id.padStart(3, '0')));
  const nearestKoorlaps = assignedOfficersForNearest.filter(o => slotKoorlapSet.has(o.id.padStart(3, '0')));
  const nearestKoorlapNames = nearestKoorlaps.length > 0 
    ? nearestKoorlaps.map(o => o.name).join(' & ') 
    : (currentSlot?.koorlapIds && currentSlot.koorlapIds.length > 0
        ? currentSlot.koorlapIds.map(id => officers.find(o => o.id === id || o.id.padStart(3, '0') === id.padStart(3, '0'))?.name || `Petugas ${id}`).join(' & ')
        : 'Koorlap Jaga');

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-4 sm:p-6 md:p-10 flex flex-col justify-between selection:bg-amber-500/20">
      <div className="max-w-6xl mx-auto w-full space-y-8 my-auto">
        
        {/* ========================================================================= */}
        {/* BRAND HERO HEADER                                                         */}
        {/* ========================================================================= */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-3 bg-white border border-slate-200/90 px-4 py-2 rounded-full shadow-2xs">
            <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center p-0.5 overflow-hidden">
              <img 
                src={CHURCH_LOGO} 
                alt="Paroki Santo Yakobus" 
                className="w-full h-full object-cover rounded-full bg-white"
              />
            </div>
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Paroki Santo Yakobus &bull; Sakristi &amp; Liturgi
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 font-headline tracking-tight">
            Sacristy<span className="text-amber-500">Connect</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto font-medium">
            Sistem Informasi Terpadu Presensi Kiosk, Manajemen 170 Asisten Imam, &amp; Penjadwalan Sakristi
          </p>

          {/* Profil Saya & Jadwal Tugas CTA */}
          {onOpenProfile && (
            <div className="pt-1">
              <button
                onClick={() => {
                  playAudioFeedback('tap');
                  onOpenProfile();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-black rounded-2xl shadow-md transition-all cursor-pointer hover:scale-[1.02]"
              >
                <UserCheck className="w-4 h-4" />
                <span>Lihat Profil &amp; Tanggal Tugas Saya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* HERO CARD: MISA TERDEKAT & DAFTAR PETUGAS JAGA                             */}
        {/* ========================================================================= */}
        {currentSlot && (
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header / Date & Time */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800 relative z-10">

              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-400 text-slate-950 rounded-full text-xs font-black uppercase tracking-wider mb-2 shadow-xs">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Sesi Misa Terdekat</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-headline tracking-tight text-white drop-shadow-xs">
                  {currentSlot.displayDate} — {currentSlot.massTime}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5 mt-1 font-medium">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{currentSlot.location}</span>
                </p>
              </div>

              <button
                onClick={handleKioskClick}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Touchpad className="w-4 h-4 text-slate-950" />
                <span>Buka Presensi Kiosk Sesi Ini</span>
              </button>
            </div>

            {/* Who Will Be The Tugas (Daftar Petugas Jaga) */}
            <div className="pt-6 space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-wider font-black text-amber-400 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Petugas Terjadwal ({assignedOfficersForNearest.length} Asisten Imam)</span>
                </h3>
                <span className="text-[11px] text-slate-300 font-medium">
                  Koorlap Jaga: <strong className="text-amber-300 font-bold">{nearestKoorlapNames}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {assignedOfficersForNearest.map(off => {
                  const isKoorlap = slotKoorlapSet.has(off.id.padStart(3, '0'));
                  return (
                    <div 
                      key={off.id} 
                      className={`border rounded-2xl px-3 py-2.5 text-left transition-all shadow-xs ${
                        isKoorlap 
                          ? 'bg-amber-400/15 border-amber-400/50 text-amber-100' 
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`text-[10px] font-mono font-black shrink-0 ${isKoorlap ? 'text-amber-400' : 'text-slate-400'}`}>
                          #{off.id.padStart(3, '0')}
                        </span>
                        <p className="text-xs font-bold truncate">{off.name}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate mt-0.5 font-medium">
                        {isKoorlap ? '👑 Koorlap Sesi' : (off.wilayah || 'Asisten Imam')}
                      </span>
                    </div>
                  );
                })}
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
            className="group relative bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-slate-400 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="space-y-5 relative">
              {/* Badge & Icon */}
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Touchpad className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider">
                  Touchscreen Kiosk
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h2 className="text-2xl font-black text-slate-950 font-headline group-hover:text-amber-600 transition-colors">
                  Kiosk Mode
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Layar terminal presensi mandiri asisten imam dan penataan pembagian posisi liturgi saat misa berlangsung.
                </p>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pilih Sesi Misa Aktif &amp; Kunci Sesi</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Input 3-Digit Nomor ID Petugas (Numpad)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Konfirmasi Foto &amp; Identitas Terverifikasi</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Penempatan 8 Posisi Gereja &amp; Alokasi Balai</span>
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="pt-6 mt-4">
              <button className="w-full py-3.5 px-6 bg-slate-900 group-hover:bg-slate-800 text-white text-sm font-black rounded-2xl shadow-md flex items-center justify-center gap-2 uppercase tracking-wider transition-all cursor-pointer">
                <span>Buka Mode Kiosk</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-amber-400" />
              </button>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* CARD 2: ADMINISTRASI (ADMIN BACKOFFICE)                                 */}
          {/* ----------------------------------------------------------------------- */}
          <div className="group relative bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-slate-400 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden">
            <div className="space-y-5 relative">
              {/* Badge & Icon */}
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-full text-xs font-bold uppercase tracking-wider">
                  Admin Backoffice
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h2 className="text-2xl font-black text-slate-950 font-headline">
                  Administrasi (Admin)
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Pusat kontrol database 170 petugas, generator jadwal otomatis, impor pesan WA, dan rekapitulasi presensi.
                </p>
              </div>

              {/* Quick Menu Buttons inside Admin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdminClick('admin-servers');
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-colors group/btn cursor-pointer"
                >
                  <Users className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-slate-900 group-hover/btn:text-blue-600">
                      Database 170 Petugas
                    </p>
                    <p className="text-[10px] text-slate-500">Data Petugas &amp; Wilayah</p>
                  </div>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdminClick('admin-chat');
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-colors group/btn cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-slate-900 group-hover/btn:text-emerald-600">
                      WA Tukar Jadwal
                    </p>
                    <p className="text-[10px] text-slate-500">Update Tukar Jadwal Harian</p>
                  </div>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdminClick('admin-schedule');
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-colors group/btn cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-slate-900 group-hover/btn:text-indigo-600">
                      Schedule Generator
                    </p>
                    <p className="text-[10px] text-slate-500">Jadwal Bulanan &amp; Rotasi</p>
                  </div>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdminClick('admin-reports');
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-colors group/btn cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-slate-900 group-hover/btn:text-rose-600">
                      Laporan &amp; Presensi
                    </p>
                    <p className="text-[10px] text-slate-500">Posisi Misa &amp; Rekap Kehadiran</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="pt-6 mt-4">
              <button 
                onClick={() => handleAdminClick('admin-dashboard')}
                className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white text-sm font-black rounded-2xl shadow-md flex items-center justify-center gap-2 uppercase tracking-wider transition-all cursor-pointer"
              >
                <span>Buka Portal Administrasi</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* BOTTOM METRICS & SYSTEM STATUS                                            */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-900">Status Sistem:</span>
            <span>Online &amp; Sinkron ke Sakristi</span>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <span className="font-black text-slate-900">{officersCount}</span> Petugas Terdaftar
            </div>
            <div>
              <span className="font-black text-slate-900">Sesi Misa:</span> {activeMassTime}
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-amber-600">Masa Bakti:</span> 2024 - 2027
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
