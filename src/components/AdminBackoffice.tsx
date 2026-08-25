import React, { useState } from 'react';
import { Officer, ScheduleSlot, SystemLog } from '../types';
import { 
  RotateCw, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  FileText, 
  MessageSquare, 
  ArrowRightLeft,
  Sparkles,
  Send,
  Clock,
  History
} from 'lucide-react';
import { playAudioFeedback } from '../utils/sound';

interface AdminBackofficeProps {
  schedule: ScheduleSlot[];
  officers: Officer[];
  onUpdateSchedule: (updatedSlots: ScheduleSlot[]) => void;
  onAddLog: (log: Omit<SystemLog, 'id' | 'timestamp'>) => void;
  onOpenCodeExport: () => void;
  onOpenServerMgmt: () => void;
}

interface MessageItem {
  id: string;
  time: string;
  sender?: string;
  text: string;
  status: 'UPDATED' | 'PENDING' | 'PROCESSED';
}

interface TodayScheduleRow {
  id: string;
  jamMisa: string;
  lokasi: string;
  petugasOriginal: string;
  petugasPengganti: string | null;
  status: 'Terjadwal' | 'Swapped' | 'Updated';
}

export const AdminBackoffice: React.FC<AdminBackofficeProps> = ({
  schedule,
  officers,
  onUpdateSchedule,
  onAddLog
}) => {
  // Feed of WhatsApp messages matching screenshot
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'msg-1',
      time: '09:45 AM',
      text: 'Hartanto Chandra tidak bisa tugas misa 08:00, diganti Budi Utomo',
      status: 'UPDATED'
    },
    {
      id: 'msg-2',
      time: '10:12 AM',
      text: 'Silvia requesting swap with Andi for 17:00 Mass',
      status: 'UPDATED'
    }
  ]);

  const [inputMessage, setInputMessage] = useState<string>(
    'Hartanto Chandra tidak bisa tugas misa 08:00, diganti Budi Utomo'
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Detected change state for Live Preview
  const [detectedChange, setDetectedChange] = useState<{
    original: string;
    pengganti: string;
    jamMisa: string;
    action: string;
  }>({
    original: 'Budi Utomo',
    pengganti: 'Hartanto Chandra',
    jamMisa: '08:00',
    action: 'menggantikan'
  });

  // Table rows for "Jadwal Hari Ini"
  const [todayRows, setTodayRows] = useState<TodayScheduleRow[]>([
    {
      id: 't-1',
      jamMisa: '06:00',
      lokasi: 'Gereja Utama',
      petugasOriginal: 'Agus Setiawan',
      petugasPengganti: null,
      status: 'Terjadwal'
    },
    {
      id: 't-2',
      jamMisa: '08:00',
      lokasi: 'Gereja Utama',
      petugasOriginal: 'Budi Utomo',
      petugasPengganti: 'Hartanto Chandra',
      status: 'Swapped'
    },
    {
      id: 't-3',
      jamMisa: '17:00',
      lokasi: 'Kapel',
      petugasOriginal: 'Silvia Maria',
      petugasPengganti: 'Andi Kurnia',
      status: 'Swapped'
    }
  ]);

  const [importLogText, setImportLogText] = useState<string>(
    'Batch #102: Berhasil sinkronisasi 2 pesan WhatsApp grup ke jadwal harian.'
  );

  const handleProcessMessage = async () => {
    if (!inputMessage.trim()) return;
    setIsProcessing(true);

    try {
      // Call backend API if available, or smart fallback
      const response = await fetch('/api/parse-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage })
      }).catch(() => null);

      let original = 'Budi Utomo';
      let pengganti = 'Hartanto Chandra';
      let jam = '08:00';

      if (response && response.ok) {
        const resJson = await response.json();
        const data = resJson.data;
        if (data.originalServer) original = data.originalServer;
        if (data.substituteServer) pengganti = data.substituteServer;
        if (data.time) jam = data.time;
      } else {
        // Local intelligent regex parser
        const text = inputMessage;
        const timeMatch = text.match(/(\d{1,2}[:.]\d{2})/);
        if (timeMatch) jam = timeMatch[1].replace('.', ':');

        const names = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g) || [];
        if (names.length >= 2) {
          pengganti = names[0];
          original = names[1];
        } else if (names.length === 1) {
          pengganti = names[0];
        }
      }

      // Update Detected Change box
      setDetectedChange({
        original,
        pengganti,
        jamMisa: jam,
        action: 'menggantikan'
      });

      // Update Today's Schedule Table
      setTodayRows(prev => {
        const existingIndex = prev.findIndex(r => r.jamMisa.includes(jam) || jam.includes(r.jamMisa));
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            petugasPengganti: pengganti,
            status: 'Swapped'
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: 't-' + Date.now(),
              jamMisa: jam,
              lokasi: 'Gereja Utama',
              petugasOriginal: original,
              petugasPengganti: pengganti,
              status: 'Swapped'
            }
          ];
        }
      });

      // Add to messages list
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [
        {
          id: 'msg-' + Date.now(),
          time: timeStr,
          text: inputMessage.trim(),
          status: 'UPDATED'
        },
        ...prev
      ]);

      // Add to system log
      onAddLog({
        type: 'ai_import',
        description: `WhatsApp Importer: ${pengganti} menggantikan ${original} (Misa ${jam})`,
        actor: 'WhatsApp Importer'
      });

      setImportLogText(`Batch #${Math.floor(100 + Math.random() * 50)}: Terdeteksi perubahan jadwal Misa ${jam}. Database jadwal berhasil diperbarui.`);
      playAudioFeedback('success');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 bg-[#fbf9f5] overflow-y-auto p-6 md:p-8 selection:bg-primary/20">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* ========================================================================= */}
        {/* HEADER TITLE (WA Tukar Jadwal)                                           */}
        {/* ========================================================================= */}
        <div>
          <div className="flex items-center gap-2 text-[#5B1414] text-xs font-black uppercase tracking-wider mb-1">
            <MessageSquare className="w-4 h-4 text-[#5B1414]" />
            <span>Pusat Konversi &amp; Broadcast Pertukaran Jadwal</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#5B1414] font-headline tracking-tight">
            WA Tukar Jadwal
          </h2>
          <p className="text-xs md:text-sm text-[#665e55] mt-1 font-medium">
            Tempelkan percakapan WhatsApp grup asisten imam untuk memproses permohonan penukaran atau penggantian jadwal misa secara otomatis.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 2-COLUMN LAYOUT                                                          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ----------------------------------------------------------------------- */}
          {/* LEFT COLUMN: WHATSAPP MESSAGE DATA [LIVE FEED] (5 cols on lg)           */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#f7f3eb] border border-[#e6ded2] rounded-2xl p-5 shadow-xs space-y-4">
              
              {/* Box Title with Live Feed Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider uppercase text-[#4a4239]">
                  WHATSAPP MESSAGE DATA
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#1b5e20] text-white text-[10px] font-bold tracking-wider rounded uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                  LIVE FEED
                </span>
              </div>

              {/* Message Bubble Stream */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className="bg-white border border-[#e0d6c7] rounded-xl p-3.5 shadow-xs space-y-1.5 hover:border-[#7c191e]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#8f857a]">
                        {msg.time}
                      </span>
                      <span className="px-2 py-0.5 bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] rounded text-[10px] font-bold">
                        {msg.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#2b241e] font-medium leading-relaxed">
                      {msg.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Textarea for pasting new message */}
              <div className="space-y-2 pt-2">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Paste new messages here... e.g."
                  rows={3}
                  className="w-full p-3.5 bg-white border border-[#d6cbbe] rounded-xl text-xs text-[#2b241e] placeholder:text-[#9e9488] focus:outline-none focus:ring-2 focus:ring-[#7c191e]/40 focus:border-[#7c191e] transition-all resize-none leading-relaxed"
                />

                <button
                  onClick={handleProcessMessage}
                  disabled={isProcessing || !inputMessage.trim()}
                  className="w-full py-3 bg-[#7c191e] hover:bg-[#681419] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <RotateCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>{isProcessing ? 'Memproses Pesan...' : 'PROSES & UPDATE JADWAL'}</span>
                </button>
              </div>

            </div>

            {/* Import Log Card */}
            <div className="bg-[#f7f3eb] border border-[#e6ded2] rounded-xl p-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[#554d44] uppercase tracking-wider mb-1.5">
                <History className="w-3.5 h-3.5 text-[#7c191e]" />
                <span>IMPORT LOG</span>
              </div>
              <p className="text-xs text-[#665e55] font-mono leading-relaxed">
                {importLogText}
              </p>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: LIVE PREVIEW & JADWAL HARI INI (7 cols on lg)             */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Box 1: Live Preview with document icon */}
            <div className="bg-[#f7f3eb] border border-[#e6ded2] rounded-2xl p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#4a4239] uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-[#7c191e]" />
                  <span>Live Preview</span>
                </div>
              </div>

              {/* Detected Change Box (Exact match Stitch image 2) */}
              <div className="bg-white border border-[#e0d6c7] rounded-xl p-4 shadow-xs space-y-2 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-xs font-bold text-[#2b241e]">
                      Detected Change
                    </span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>

                <p className="text-xs md:text-sm text-[#3b342e] leading-relaxed pt-1">
                  <span className="font-semibold text-[#1a140e]">{detectedChange.pengganti}</span>{' '}
                  <span className="font-bold text-[#7c191e] underline decoration-[#7c191e]/40 underline-offset-4">
                    {detectedChange.action}
                  </span>{' '}
                  <span className="font-semibold text-[#1a140e]">{detectedChange.original}</span> di Misa{' '}
                  <span className="font-bold text-[#1a140e]">{detectedChange.jamMisa}</span>.
                </p>
              </div>
            </div>

            {/* Box 2: Jadwal Hari Ini (Table exact match Stitch image 2) */}
            <div className="bg-white border border-[#e6ded2] rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#7c191e]">
                <Calendar className="w-4 h-4 text-[#7c191e]" />
                <span className="font-serif text-base">Jadwal Hari Ini</span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-[#eee6da] rounded-xl">
                <table className="w-full text-left text-xs text-[#3b342e]">
                  <thead className="bg-[#f7f3eb] text-[#554d44] border-b border-[#eee6da] font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-4 py-2.5">JAM MISA</th>
                      <th className="px-4 py-2.5">LOKASI</th>
                      <th className="px-4 py-2.5">PETUGAS ORIGINAL</th>
                      <th className="px-4 py-2.5">PETUGAS PENGGANTI / UPDATE</th>
                      <th className="px-4 py-2.5 text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2ecdf]">
                    {todayRows.map((row) => (
                      <tr key={row.id} className="hover:bg-[#faf7f0] transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-[#1a140e]">
                          {row.jamMisa}
                        </td>
                        <td className="px-4 py-3 text-[#554d44]">
                          {row.lokasi}
                        </td>
                        <td className="px-4 py-3 font-medium text-[#2b241e]">
                          {row.petugasOriginal}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {row.petugasPengganti ? (
                            <span className="text-[#7c191e] font-bold">
                              {row.petugasPengganti}
                            </span>
                          ) : (
                            <span className="text-[#9e9488]">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {row.status === 'Swapped' ? (
                            <span className="inline-block px-2.5 py-0.5 bg-[#fce8e8] text-[#8b1e23] border border-[#f3c1c3] rounded text-[10px] font-bold uppercase">
                              Swapped
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] rounded text-[10px] font-bold uppercase">
                              Terjadwal
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
