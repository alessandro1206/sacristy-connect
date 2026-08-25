import React from 'react';
import { Officer, ScheduleSlot, SystemLog } from '../types';
import { 
  Users, 
  CalendarDays, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  ArrowRight, 
  Clock, 
  TrendingUp, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface DashboardOverviewProps {
  officers: Officer[];
  schedule: ScheduleSlot[];
  logs: SystemLog[];
  onNavigate: (view: 'kiosk' | 'admin-chat' | 'admin-servers' | 'admin-logs' | 'admin-reports' | 'admin-schedule' | 'admin-dashboard' | 'schedules' | 'servers') => void;
  onOpenCodeExport?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  officers,
  schedule,
  logs,
  onNavigate
}) => {
  const activeCount = officers.filter(o => o.status === 'Aktif').length;
  const leaveCount = officers.filter(o => o.status === 'Cuti').length;
  const needsServerCount = schedule.filter(s => s.status === 'Needs Server').length;
  const swapCount = schedule.filter(s => s.status === 'Tukar Jadwal').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        
        {/* Welcome Header */}
        <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Sistem Manajemen Sakristi Paroki</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-primary font-headline">
              Dashboard Paroki Santo Yakobus
            </h1>
            <p className="text-sm text-on-surface-variant font-medium mt-1">
              Ringkasan operasional sakristi, ketersediaan misdinar/asisten imam, dan monitoring jadwal misa.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('admin-schedule')}
              className="flex items-center gap-2 bg-[#5B1414] hover:bg-[#450e0e] text-white px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-xs transition-all"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Schedule Generator</span>
            </button>
            <button
              onClick={() => onNavigate('admin-reports')}
              className="flex items-center gap-2 bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#5B1414] border border-[#D9CEBA] px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-xs transition-all"
            >
              <span>Laporan &amp; Presensi</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => onNavigate('servers')}
            className="bg-surface-container-lowest border border-outline-variant p-5 rounded-2xl shadow-xs hover:border-primary transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="text-xs font-bold uppercase tracking-wider">Asisten Imam &amp; Misdinar</span>
              <div className="p-2 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-primary font-headline">{activeCount}</span>
              <span className="text-xs text-emerald-700 font-semibold">Aktif ({leaveCount} Cuti)</span>
            </div>
            <span className="text-xs text-primary font-bold mt-2 flex items-center gap-1 group-hover:underline">
              <span>Kelola Petugas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div 
            onClick={() => onNavigate('schedules')}
            className="bg-surface-container-lowest border border-outline-variant p-5 rounded-2xl shadow-xs hover:border-primary transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="text-xs font-bold uppercase tracking-wider">Misa Bulan Ini</span>
              <div className="p-2 bg-secondary-container text-on-secondary-container rounded-xl group-hover:scale-110 transition-transform">
                <CalendarDays className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-primary font-headline">{schedule.length}</span>
              <span className="text-xs text-on-surface-variant font-semibold">Sesi Terjadwal</span>
            </div>
            <span className="text-xs text-primary font-bold mt-2 flex items-center gap-1 group-hover:underline">
              <span>Buka Kalender</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div 
            onClick={() => onNavigate('admin-chat')}
            className="bg-surface-container-lowest border border-outline-variant p-5 rounded-2xl shadow-xs hover:border-primary transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="text-xs font-bold uppercase tracking-wider">Tukar Jadwal</span>
              <div className="p-2 bg-amber-100 text-amber-900 rounded-xl group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-primary font-headline">{swapCount}</span>
              <span className="text-xs text-amber-800 font-semibold">Permintaan Terproses</span>
            </div>
            <span className="text-xs text-primary font-bold mt-2 flex items-center gap-1 group-hover:underline">
              <span>AI Message Importer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div 
            onClick={() => onNavigate('kiosk')}
            className="bg-surface-container-lowest border border-outline-variant p-5 rounded-2xl shadow-xs hover:border-primary transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="text-xs font-bold uppercase tracking-wider">Kiosk Presensi</span>
              <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-800 font-headline">Online</span>
              <span className="text-xs text-emerald-700 font-semibold">Keypad Aktif</span>
            </div>
            <span className="text-xs text-primary font-bold mt-2 flex items-center gap-1 group-hover:underline">
              <span>Layar Kiosk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Quick Launchpad */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* AI WhatsApp Converter Quick Banner */}
          <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 text-primary mb-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-bold font-headline">
                  Konversi Pesan WhatsApp Otomatis dengan AI
                </h3>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Salin pesan grup WhatsApp sakristi mengenai pertukaran tugas misa atau permohonan izin cuti. AI Gemini 3.7 akan secara instan mengenali nama petugas asli, petugas pengganti (substitute), tanggal misa, dan memperbarui kalender jadwal.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('admin-chat')}
                className="bg-[#5B1414] hover:bg-[#450e0e] text-white px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-xs transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Buka WA Tukar Jadwal</span>
              </button>

              <button
                onClick={() => onNavigate('admin-reports')}
                className="bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#5B1414] px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold border border-[#D9CEBA] transition-colors"
              >
                Lihat Laporan &amp; Rekapitulasi
              </button>
            </div>
          </div>

          {/* Recent Audit Activities */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col">
            <h3 className="text-base font-bold text-on-surface font-headline mb-3 flex items-center justify-between">
              <span>Aktivitas Terbaru</span>
              <span className="text-xs text-primary font-semibold cursor-pointer hover:underline" onClick={() => onNavigate('admin-logs')}>
                Lihat Semua
              </span>
            </h3>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px]">
              {logs.slice(0, 4).map(log => (
                <div key={log.id} className="p-2.5 bg-surface rounded-xl border border-outline-variant/60 text-xs">
                  <p className="font-semibold text-on-surface line-clamp-1">{log.description}</p>
                  <div className="flex justify-between items-center text-on-surface-variant mt-1 text-[11px]">
                    <span>{log.actor}</span>
                    <span>{log.timestamp.split(' ')[1] || log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
