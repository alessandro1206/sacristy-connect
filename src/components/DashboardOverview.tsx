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
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-100/70 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        
        {/* Welcome Header */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Sistem Manajemen Sakristi Paroki</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-950 font-sans tracking-tight">
              Dashboard Paroki Santo Yakobus
            </h1>
            <p className="text-sm text-slate-600 font-medium mt-1">
              Ringkasan operasional sakristi, ketersediaan misdinar/asisten imam, dan monitoring jadwal misa.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('admin-schedule')}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              <CalendarDays className="w-4 h-4 text-amber-400" />
              <span>Kelola &amp; Edit Jadwal</span>
            </button>
            <button
              onClick={() => onNavigate('admin-reports')}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              <span>Laporan &amp; Presensi</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => onNavigate('servers')}
            className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:border-slate-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-center text-slate-600">
              <span className="text-xs font-bold uppercase tracking-wider">Asisten Imam &amp; Misdinar</span>
              <div className="p-2.5 bg-slate-100 text-slate-800 rounded-xl group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-950 font-sans">{activeCount}</span>
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Aktif ({leaveCount} Cuti)</span>
            </div>
            <span className="text-xs text-slate-800 font-bold mt-3 flex items-center gap-1 group-hover:text-amber-600">
              <span>Kelola Petugas (170 Data)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div 
            onClick={() => onNavigate('schedules')}
            className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:border-slate-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-center text-slate-600">
              <span className="text-xs font-bold uppercase tracking-wider">Misa Bulan Ini</span>
              <div className="p-2.5 bg-blue-50 text-blue-800 rounded-xl group-hover:scale-110 transition-transform">
                <CalendarDays className="w-5 h-5 text-blue-700" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-950 font-sans">{schedule.length}</span>
              <span className="text-xs text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded-md">34 Sesi Terverifikasi</span>
            </div>
            <span className="text-xs text-slate-800 font-bold mt-3 flex items-center gap-1 group-hover:text-amber-600">
              <span>Buka Kalender &amp; Koorlap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div 
            onClick={() => onNavigate('admin-chat')}
            className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:border-slate-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-center text-slate-600">
              <span className="text-xs font-bold uppercase tracking-wider">WA Tukar Jadwal</span>
              <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5 text-amber-700" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-950 font-sans">{swapCount}</span>
              <span className="text-xs text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">Permintaan Terproses</span>
            </div>
            <span className="text-xs text-slate-800 font-bold mt-3 flex items-center gap-1 group-hover:text-amber-600">
              <span>AI Message Importer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div 
            onClick={() => onNavigate('kiosk')}
            className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:border-slate-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-center text-slate-600">
              <span className="text-xs font-bold uppercase tracking-wider">Kiosk Presensi</span>
              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-700 font-sans">Online</span>
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Keypad Aktif</span>
            </div>
            <span className="text-xs text-slate-800 font-bold mt-3 flex items-center gap-1 group-hover:text-amber-600">
              <span>Buka Layar Kiosk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Quick Launchpad */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* AI WhatsApp Converter Quick Banner */}
          <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 text-slate-900 mb-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold font-headline text-slate-950">
                  Konversi Pesan WhatsApp Otomatis dengan AI
                </h3>
              </div>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Salin pesan grup WhatsApp sakristi mengenai pertukaran tugas misa atau permohonan izin cuti. AI Gemini 3.7 akan secara instan mengenali nama petugas asli, petugas pengganti (substitute), tanggal misa, dan memperbarui kalender jadwal.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('admin-chat')}
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Buka WA Tukar Jadwal</span>
              </button>

              <button
                onClick={() => onNavigate('admin-reports')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold border border-slate-200 transition-colors cursor-pointer"
              >
                Lihat Laporan &amp; Rekapitulasi
              </button>
            </div>
          </div>

          {/* Recent Audit Activities */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col">
            <h3 className="text-base font-black text-slate-950 font-sans mb-3 flex items-center justify-between">
              <span>Aktivitas Log Audit</span>
              <span className="text-xs text-amber-700 font-bold cursor-pointer hover:underline" onClick={() => onNavigate('admin-logs')}>
                Lihat Semua
              </span>
            </h3>

            <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[220px]">
              {logs.slice(0, 4).map(log => (
                <div key={log.id} className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/70 text-xs">
                  <p className="font-bold text-slate-900 line-clamp-1">{log.description}</p>
                  <div className="flex justify-between items-center text-slate-500 mt-1.5 text-[11px] font-medium">
                    <span className="bg-slate-200/80 px-2 py-0.5 rounded-md text-slate-800 font-bold">{log.actor}</span>
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
