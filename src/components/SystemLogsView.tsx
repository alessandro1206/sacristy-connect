import React, { useState, useMemo } from 'react';
import { SystemLog } from '../types';
import { 
  History, 
  CheckCircle2, 
  ArrowLeftRight, 
  UserMinus, 
  ShieldCheck, 
  Search, 
  Filter, 
  Clock, 
  Download,
  Trash2
} from 'lucide-react';
import { playAudioFeedback } from '../utils/sound';

interface SystemLogsViewProps {
  logs: SystemLog[];
  onClearLogs?: () => void;
}

export const SystemLogsView: React.FC<SystemLogsViewProps> = ({ logs }) => {
  const [filterType, setFilterType] = useState<'all' | 'attendance' | 'swap' | 'leave' | 'admin' | 'ai_import'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchType = filterType === 'all' || log.type === filterType;
      const matchSearch = 
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.timestamp.toLowerCase().includes(searchQuery.toLowerCase());

      return matchType && matchSearch;
    });
  }, [logs, filterType, searchQuery]);

  const handleExportLogs = () => {
    playAudioFeedback('tap');
    const headers = ['ID', 'Waktu', 'Tipe', 'Deskripsi Aktivitas', 'Aktor'];
    const rows = filteredLogs.map(l => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.type}"`,
      `"${l.description.replace(/"/g, '""')}"`,
      `"${l.actor}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `System_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 md:p-8 bg-[#FAF7F2] font-body selection:bg-[#5B1414]/20">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#D9CEBA] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#5B1414]">
              <History className="w-5 h-5" />
              <h2 className="text-xl md:text-2xl font-extrabold text-[#2C2420] font-headline">
                Log Sistem &amp; Audit Trail
              </h2>
            </div>
            <p className="text-xs text-[#6E5A4B] mt-1 font-medium">
              Riwayat aktivitas teknis: presensi mandiri kiosk, pertukaran jadwal WA, otorisasi Koorlap, dan sinkronisasi cuti.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#5B1414]/10 text-[#5B1414] font-extrabold px-3 py-1.5 rounded-full border border-[#5B1414]/20">
              {logs.length} Log Aktivitas
            </span>
            <button
              onClick={handleExportLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F3EDE2] hover:bg-[#E8DFC8] text-[#5B1414] text-xs font-bold rounded-xl border border-[#D9CEBA] transition-all shadow-xs"
              title="Ekspor Seluruh Log ke CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor</span>
            </button>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="bg-white p-4 rounded-2xl border border-[#D9CEBA] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7662]" />
            <input
              type="text"
              placeholder="Cari deskripsi log, nama aktor, atau waktu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9CEBA] bg-[#FAF7F2] text-xs font-medium text-[#2C2420] focus:border-[#5B1414] focus:bg-white outline-hidden"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { key: 'all', label: 'Semua' },
              { key: 'attendance', label: 'Presensi Kiosk' },
              { key: 'swap', label: 'Tukar Jadwal' },
              { key: 'admin', label: 'Aktivitas Admin' },
              { key: 'ai_import', label: 'Import WA' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  playAudioFeedback('tap');
                  setFilterType(tab.key as any);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  filterType === tab.key
                    ? 'bg-[#5B1414] text-white shadow-xs'
                    : 'bg-[#FAF7F2] text-[#6E5A4B] hover:bg-[#F3EDE2] border border-[#D9CEBA]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Logs list */}
        <div className="bg-white border border-[#D9CEBA] rounded-3xl overflow-hidden shadow-xs divide-y divide-[#E8DFC8]/70">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8C7662]">
              Tidak ada riwayat aktivitas yang sesuai dengan filter.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isAttendance = log.type === 'attendance';
              const isAI = log.type === 'ai_import' || log.type === 'swap';
              const isLeave = log.type === 'leave';

              return (
                <div key={log.id} className="p-4 md:p-5 flex items-start gap-4 hover:bg-[#FAF7F2] transition-colors">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    isAttendance 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : isAI 
                      ? 'bg-[#5B1414]/10 text-[#5B1414]' 
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    {isAttendance ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isAI ? (
                      <ArrowLeftRight className="w-5 h-5" />
                    ) : (
                      <UserMinus className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-xs md:text-sm font-bold text-[#2C2420] font-headline">
                        {log.description}
                      </h4>
                      <span className="text-[11px] text-[#8C7662] flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" /> {log.timestamp}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center gap-2.5 text-[11px] text-[#6E5A4B]">
                      <span>Aktor: <strong className="text-[#5B1414]">{log.actor}</strong></span>
                      <span>&bull;</span>
                      <span className="uppercase tracking-wider font-extrabold text-[9px] bg-[#F3EDE2] border border-[#D9CEBA] px-2 py-0.5 rounded text-[#5B1414]">
                        {log.type}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
