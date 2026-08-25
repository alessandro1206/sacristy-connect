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
  LayoutGrid
} from 'lucide-react';
import { playAudioFeedback } from '../utils/sound';

interface LandingPageViewProps {
  onSelectKiosk: () => void;
  onSelectAdmin: (view?: 'admin-dashboard' | 'admin-servers' | 'admin-chat' | 'admin-schedule' | 'admin-reports' | 'admin-logs') => void;
  officersCount: number;
  activeMassTime: string;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onSelectKiosk,
  onSelectAdmin,
  officersCount,
  activeMassTime
}) => {
  const handleKioskClick = () => {
    playAudioFeedback('tap');
    onSelectKiosk();
  };

  const handleAdminClick = (view: 'admin-dashboard' | 'admin-servers' | 'admin-chat' | 'admin-schedule' | 'admin-reports' | 'admin-logs' = 'admin-dashboard') => {
    playAudioFeedback('tap');
    onSelectAdmin(view);
  };

  return (
    <div className="flex-1 bg-[#fbf9f5] overflow-y-auto p-4 sm:p-6 md:p-10 flex flex-col justify-between selection:bg-primary/20">
      <div className="max-w-5xl mx-auto w-full space-y-8 my-auto">
        
        {/* ========================================================================= */}
        {/* BRAND HERO HEADER                                                         */}
        {/* ========================================================================= */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-3 bg-[#f3ede2] border border-[#e6ded2] px-4 py-2 rounded-full shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-0.5 border border-[#d6cbbe]">
              <img 
                src={CHURCH_LOGO} 
                alt="Paroki Santo Yakobus" 
                className="w-full h-full object-contain"
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
        </div>

        {/* ========================================================================= */}
        {/* 2 MAIN CARDS: KIOSK vs ADMINISTRASI (ADMIN)                              */}
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
                  <span>Pilih Jadwal Misa & Verifikasi No. Absen + Password Koorlap</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#4a4239] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Input 3 Digit No. Absen Petugas (001 - 170)</span>
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
              <button className="w-full py-3.5 px-6 bg-[#7c191e] group-hover:bg-[#681419] text-white text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 uppercase tracking-wider transition-all">
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
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#fbf9f5] hover:bg-[#f3ede2] border border-[#e6ded2] text-left transition-colors group/btn"
                >
                  <Users className="w-4 h-4 text-[#7c191e] shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-[#2b241e] group-hover/btn:text-[#7c191e]">
                      Database Management
                    </p>
                    <p className="text-[10px] text-[#7a7165]">Data 170 Petugas & Wilayah</p>
                  </div>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdminClick('admin-chat');
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#fbf9f5] hover:bg-[#f3ede2] border border-[#e6ded2] text-left transition-colors group/btn"
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
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#fbf9f5] hover:bg-[#f3ede2] border border-[#e6ded2] text-left transition-colors group/btn"
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
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#fbf9f5] hover:bg-[#f3ede2] border border-[#e6ded2] text-left transition-colors group/btn"
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
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#fbf9f5] hover:bg-[#f3ede2] border border-[#e6ded2] text-left transition-colors group/btn"
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
                className="w-full py-3.5 px-6 bg-[#2b241e] hover:bg-[#1a140e] text-white text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 uppercase tracking-wider transition-all"
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
