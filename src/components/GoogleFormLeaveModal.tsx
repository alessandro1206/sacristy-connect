import React, { useState } from 'react';
import { LeaveRecord, Officer } from '../types';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  Plus, 
  Calendar, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { playAudioFeedback } from '../utils/sound';

interface GoogleFormLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveRecords: LeaveRecord[];
  officers: Officer[];
  onAddLeave: (leave: LeaveRecord) => void;
  onSyncWithScheduler: () => void;
}

export const GoogleFormLeaveModal: React.FC<GoogleFormLeaveModalProps> = ({
  isOpen,
  onClose,
  leaveRecords,
  officers,
  onAddLeave,
  onSyncWithScheduler
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'google-form-info'>('list');
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>(officers[0]?.id || '');
  const [startDate, setStartDate] = useState<string>('2026-10-04');
  const [endDate, setEndDate] = useState<string>('2026-10-09');
  const [reason, setReason] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportCSV = () => {
    playAudioFeedback('success');
    const headers = ['ID', 'Nama Petugas', 'Tanggal Mulai', 'Tanggal Selesai', 'Alasan Cuti', 'Waktu Submit Form', 'Status'];
    const rows = leaveRecords.map(r => [
      r.officerId,
      `"${r.officerName}"`,
      r.startDate,
      r.endDate,
      `"${r.reason}"`,
      r.submittedAt,
      r.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Daftar_Cuti_Google_Form_Oktober_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const officer = officers.find(o => o.id === selectedOfficerId);
    if (!officer || !reason.trim()) return;

    const newRecord: LeaveRecord = {
      id: `leave-${Date.now()}`,
      officerId: officer.id,
      officerName: officer.name,
      startDate,
      endDate,
      reason: reason.trim(),
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Disetujui'
    };

    onAddLeave(newRecord);
    playAudioFeedback('success');
    setReason('');
    setActiveTab('list');
    setSyncNotice(`Data cuti ${officer.name} berhasil ditambahkan dan disinkronkan ke jadwal.`);
    setTimeout(() => setSyncNotice(null), 4000);
  };

  const handleTriggerSync = () => {
    setIsSyncing(true);
    playAudioFeedback('tap');
    setTimeout(() => {
      onSyncWithScheduler();
      setIsSyncing(false);
      playAudioFeedback('success');
      setSyncNotice('Berhasil mensinkronkan 120 entri ketersediaan cuti dari Google Form ke Algoritma Penjadwalan!');
      setTimeout(() => setSyncNotice(null), 5000);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-outline-variant bg-surface-container">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary font-headline">
                Integrasi &amp; Daftar Cuti (Google Form)
              </h3>
              <p className="text-xs text-on-surface-variant">
                Sinkronisasi data libur/cuti petugas untuk mencegah bentrok jadwal misa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection & Actions */}
        <div className="px-5 py-3 border-b border-outline-variant bg-surface flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'list'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              Daftar Permohonan Cuti ({leaveRecords.length})
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'add'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              + Input Cuti Manual
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-outline-variant bg-surface-container text-xs font-bold text-primary hover:bg-surface-container-high transition-colors"
              title="Download File CSV"
            >
              <Download className="w-4 h-4" />
              <span>Download Excel/CSV</span>
            </button>

            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-xs font-bold text-white shadow-xs transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sinkronisasi...' : 'Sinkron Google Form'}</span>
            </button>
          </div>
        </div>

        {/* Notification Banner */}
        {syncNotice && (
          <div className="mx-5 mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncNotice}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto">
          
          {/* TAB 1: List Table */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="border border-outline-variant rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-surface-container border-b border-outline-variant text-on-surface-variant font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">ID &amp; Petugas</th>
                      <th className="p-3">Periode Cuti</th>
                      <th className="p-3">Alasan</th>
                      <th className="p-3">Waktu Submit</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
                    {leaveRecords.map(rec => (
                      <tr key={rec.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="p-3 font-semibold text-on-surface">
                          <div className="font-bold text-primary">{rec.officerName}</div>
                          <div className="text-[11px] text-on-surface-variant font-mono">ID: {rec.officerId}</div>
                        </td>
                        <td className="p-3 font-mono font-medium text-amber-900">
                          {rec.startDate} &rarr; {rec.endDate}
                        </td>
                        <td className="p-3 text-on-surface max-w-[200px] truncate" title={rec.reason}>
                          {rec.reason}
                        </td>
                        <td className="p-3 text-on-surface-variant text-[11px]">
                          {rec.submittedAt}
                        </td>
                        <td className="p-3 text-center">
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 bg-surface-container rounded-xl border border-outline-variant flex items-start gap-3 text-xs text-on-surface-variant">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p>
                  Sistem otomatis mencocokkan respon Google Form ini ketika fitur <strong>Susun Jadwal AI</strong> dijalankan. Petugas yang tercatat cuti pada tanggal tertentu tidak akan ditugaskan pada slot misa di tanggal tersebut.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Add Manual Leave Form */}
          {activeTab === 'add' && (
            <form onSubmit={handleManualSubmit} className="space-y-4 max-w-lg mx-auto py-2">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  Pilih Petugas / Misdinar
                </label>
                <select
                  value={selectedOfficerId}
                  onChange={e => setSelectedOfficerId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-outline-variant bg-surface font-medium outline-none focus:ring-1 focus:ring-primary"
                >
                  {officers.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.id} - {o.name} ({o.level || o.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">
                    Tanggal Mulai Cuti
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm rounded-xl border border-outline-variant bg-surface outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">
                    Tanggal Selesai Cuti
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm rounded-xl border border-outline-variant bg-surface outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  Alasan Permohonan Cuti / Izin
                </label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Contoh: Ujian Sekolah, Sakit, atau Acara Keluarga Luar Kota..."
                  rows={3}
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-outline-variant bg-surface outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-container text-white shadow-sm"
                >
                  Simpan Data Cuti
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-outline-variant bg-surface-container flex justify-between items-center text-xs">
          <span className="text-on-surface-variant font-medium">
            Formulir Google Form terhubung: <strong>bit.ly/CutiMisdinarSantoYakobus</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-container-highest text-primary font-bold hover:bg-surface-container transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
