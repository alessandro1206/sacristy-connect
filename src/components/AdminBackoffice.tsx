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
  // Feed of WhatsApp messages matching real parish officers
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'msg-1',
      time: '09:45 AM',
      text: 'Hartanto Chandra tidak bisa tugas misa 08:00, diganti Venantius Sumarmo',
      status: 'UPDATED'
    },
    {
      id: 'msg-2',
      time: '10:12 AM',
      text: 'Gatot Chrishariyono bertukar jadwal dengan Raymundus Raimun Aso untuk Misa 18:00',
      status: 'UPDATED'
    }
  ]);

  // Generic and pre-filled template formats for WhatsApp Tukar Jadwal
  const PRESET_REAL_TUKAR = `Lapor Tukar Tugas

Mikael Hengky Pratama #105 tugas tgl 13 Sept di Kapel John Paul II jam 17:00
Tukar dgn pak Widyanto Setiawan Wijaya #092 tgl 13 Sept di Gereja jam 18:00`;

  const PRESET_REAL_REPLACE = `Lapor tukar jadwal tugas :

Petugas : Hadi Santoso #029
Tugas tgl : 01 September 2026
Misa jam : 18:00 WIB
Lokasi : Kapel John Paul II

Digantikan oleh : Soehadi #084
Alasan : Keperluan dinas keluarga`;

  const PRESET_TUKAR = `Lapor Tukar Tugas

Saya [Nama Petugas 1] #[No ID 1] tugas tgl [Tanggal] di [Lokasi 1] jam [Jam 1]
Tukar dgn pak [Nama Petugas 2] #[No ID 2] tgl [Tanggal] di [Lokasi 2] jam [Jam 2]`;

  const PRESET_DIGANTIKAN = `Lapor tukar jadwal tugas :

Petugas : [Nama Petugas 1] #[No ID 1]
Tugas tgl : [Tanggal]
Misa jam : [Jam Misa]
Lokasi : [Lokasi]

Digantikan oleh : [Nama Petugas 2] #[No ID 2]
Alasan : Keperluan keluarga`;

  const [inputMessage, setInputMessage] = useState<string>(PRESET_REAL_TUKAR);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Detected change state for Live Preview
  const [detectedChange, setDetectedChange] = useState<{
    original: string;
    pengganti: string;
    tanggal: string;
    jamMisa: string;
    lokasi: string;
    action: string;
    swapType: 'TUKAR' | 'DIGANTIKAN';
    detailNotes: string;
  }>({
    original: 'Mikael Hengky Pratama (#105)',
    pengganti: 'Widyanto Setiawan Wijaya (#092)',
    tanggal: '13 Sep 2026',
    jamMisa: '17:00 ⇄ 18:00 WIB',
    lokasi: 'Kapel John Paul II ⇄ Gereja Utama',
    action: 'Tukar Jadwal (Mutual Switch)',
    swapType: 'TUKAR',
    detailNotes: 'Bpk. Hengky (#105) bertukar jadwal dari Kapel John Paul II (17:00) dengan Bpk. Widyanto (#092) di Gereja Utama (18:00).'
  });

  const [todayRows, setTodayRows] = useState<TodayScheduleRow[]>([
    {
      id: 't-1a',
      jamMisa: '13 Sep 17:00 WIB',
      lokasi: 'Kapel John Paul II',
      petugasOriginal: 'Mikael Hengky Pratama (#105)',
      petugasPengganti: 'Widyanto Setiawan Wijaya (#092)',
      status: 'Swapped'
    },
    {
      id: 't-1b',
      jamMisa: '13 Sep 18:00 WIB',
      lokasi: 'Gereja Utama',
      petugasOriginal: 'Widyanto Setiawan Wijaya (#092)',
      petugasPengganti: 'Mikael Hengky Pratama (#105)',
      status: 'Swapped'
    },
    {
      id: 't-2',
      jamMisa: '01 Sep 18:00 WIB',
      lokasi: 'Kapel John Paul II',
      petugasOriginal: 'Hadi Santoso (#029)',
      petugasPengganti: 'Soehadi (#084)',
      status: 'Updated'
    }
  ]);

  const [importLogText, setImportLogText] = useState<string>(
    'Siap memproses pesan tukar tugas grup WhatsApp.'
  );

  const handleProcessMessage = async () => {
    if (!inputMessage.trim()) return;
    setIsProcessing(true);

    try {
      const text = inputMessage;

      // 1. Detect Swap Type: 'TUKAR' (Mutual Switch) vs 'DIGANTIKAN' (One-Way Replacement)
      const isMutualSwap = /tukar\s+dgn|tukar\s+dengan|bertukar|saling\s+tukar/i.test(text);
      const swapType: 'TUKAR' | 'DIGANTIKAN' = isMutualSwap ? 'TUKAR' : 'DIGANTIKAN';

      // 2. Extract Officer IDs (#105, #092, #103, no 105, nomor 105, etc.)
      const idMatches = text.match(/(?:#|no\.?\s*|nomor\s*)(\d{1,3})/gi) || [];
      const extractedIds: string[] = [];
      idMatches.forEach(m => {
        const num = m.replace(/[^0-9]/g, '');
        if (num) extractedIds.push(num.padStart(3, '0'));
      });

      let officerA: Officer | undefined;
      let officerB: Officer | undefined;

      if (extractedIds.length >= 2) {
        officerA = officers.find(o => parseInt(o.id, 10) === parseInt(extractedIds[0], 10));
        officerB = officers.find(o => parseInt(o.id, 10) === parseInt(extractedIds[1], 10));
      } else if (extractedIds.length === 1) {
        officerA = officers.find(o => parseInt(o.id, 10) === parseInt(extractedIds[0], 10));
      }

      // Name search fallback if one or both officers not identified via ID
      const sortedOfficers = [...officers].sort((a, b) => b.name.length - a.name.length);
      if (!officerA) {
        officerA = sortedOfficers.find(o => 
          text.toLowerCase().includes(o.name.toLowerCase()) || 
          (o.shortName && o.shortName.length > 3 && text.toLowerCase().includes(o.shortName.toLowerCase()))
        );
      }
      if (!officerB) {
        officerB = sortedOfficers.find(o => 
          o.id !== officerA?.id && (
            text.toLowerCase().includes(o.name.toLowerCase()) || 
            (o.shortName && o.shortName.length > 3 && text.toLowerCase().includes(o.shortName.toLowerCase()))
          )
        );
      }

      if (!officerA || !officerB) {
        alert('Mohon sebutkan dua nomor ID petugas (misal #105 dan #092) atau nama petugas yang jelas dalam pesan.');
        setIsProcessing(false);
        return;
      }

      const idA3 = officerA.id.padStart(3, '0');
      const idB3 = officerB.id.padStart(3, '0');
      const nameA = `${officerA.name} (#${idA3})`;
      const nameB = `${officerB.name} (#${idB3})`;

      // 3. Extract Date (tgl 13 Sept, 01 September, etc.)
      const dateNumMatch = text.match(/(?:tgl|tanggal|hari)?\s*0?(\d{1,2})\s*(?:sept|sep|september|agust|okt)?/i);
      const parsedDayNum = dateNumMatch ? parseInt(dateNumMatch[1], 10) : null;
      const parsedDate = parsedDayNum ? `${parsedDayNum} Sep 2026` : '13 Sep 2026';

      // 4. Extract Location (KJP, Kapel, Gereja, RS)
      let lokasiA = 'Gereja Utama';
      if (/kjp|kapel|john paul/i.test(text)) lokasiA = 'Kapel John Paul II';
      else if (/gereja/i.test(text)) lokasiA = 'Gereja Utama';
      else if (/rs|korsa|rumah sakit/i.test(text)) lokasiA = 'Rumah Sakit EH';

      let lokasiB = lokasiA;
      if (/di Gereja|Gereja Utama/i.test(text)) lokasiB = 'Gereja Utama';
      else if (/di KJP|di Kapel|Kapel John Paul II/i.test(text)) lokasiB = 'Kapel John Paul II';
      else if (/di RS|di Rumah Sakit/i.test(text)) lokasiB = 'Rumah Sakit EH';

      // 5. Extract Times (17.00, 18.00, 06:00, etc.)
      const timeMatches = text.match(/(\d{1,2}[:.]\d{2})/g) || [];
      const timeA = timeMatches[0] ? timeMatches[0].replace('.', ':') : '';
      const timeB = timeMatches[1] ? timeMatches[1].replace('.', ':') : timeA;

      const actionLabel = swapType === 'TUKAR' ? 'Tukar Jadwal (Mutual Switch)' : 'Digantikan (One-Way Replacement)';

      // Helper functions for matching slots
      const hasOfficerInSlot = (slot: ScheduleSlot, targetId: string) => {
        return (slot.serverIds || []).some(sid => sid && parseInt(sid, 10) === parseInt(targetId, 10));
      };

      const slotMatchesDate = (slot: ScheduleSlot, dayNum: number | null) => {
        if (!dayNum) return true;
        const parts = slot.date.split('-');
        if (parts.length === 3) {
          return parseInt(parts[2], 10) === dayNum;
        }
        return slot.displayDate.includes(String(dayNum));
      };

      const slotMatchesTime = (slot: ScheduleSlot, timeStr: string) => {
        if (!timeStr) return true;
        return slot.massTime.replace(' WIB', '').trim().includes(timeStr);
      };

      // 6. Find target schedule slots to modify
      let slotA = schedule.find(s => hasOfficerInSlot(s, idA3) && slotMatchesDate(s, parsedDayNum) && (timeA ? slotMatchesTime(s, timeA) : true));
      if (!slotA) {
        slotA = schedule.find(s => hasOfficerInSlot(s, idA3) && slotMatchesDate(s, parsedDayNum));
      }
      if (!slotA) {
        slotA = schedule.find(s => hasOfficerInSlot(s, idA3));
      }

      let slotB: ScheduleSlot | undefined;
      slotB = schedule.find(s => hasOfficerInSlot(s, idB3) && slotMatchesDate(s, parsedDayNum) && (timeB ? slotMatchesTime(s, timeB) : true) && s.id !== slotA?.id);
      if (!slotB) {
        slotB = schedule.find(s => hasOfficerInSlot(s, idB3) && s.id !== slotA?.id);
      }

      const effectiveTimeA = slotA ? slotA.massTime : (timeA ? `${timeA} WIB` : '17:00 WIB');
      const effectiveTimeB = slotB ? slotB.massTime : (timeB ? `${timeB} WIB` : effectiveTimeA);
      const effectiveLocA = slotA ? slotA.location : lokasiA;
      const effectiveLocB = slotB ? slotB.location : lokasiB;

      const detailNotes = swapType === 'TUKAR'
        ? `${nameA} (${effectiveLocA}, ${effectiveTimeA}) bertukar jadwal dengan ${nameB} (${effectiveLocB}, ${effectiveTimeB}).`
        : `${nameA} (${effectiveLocA}, ${effectiveTimeA}) berhalangan, digantikan oleh ${nameB}.`;

      // 7. Update Live Preview Box
      setDetectedChange({
        original: nameA,
        pengganti: nameB,
        tanggal: slotA ? slotA.displayDate : parsedDate,
        jamMisa: (swapType === 'TUKAR' || slotB) ? `${effectiveTimeA} ⇄ ${effectiveTimeB}` : effectiveTimeA,
        lokasi: (swapType === 'TUKAR' || slotB) ? `${effectiveLocA} ⇄ ${effectiveLocB}` : effectiveLocA,
        action: actionLabel,
        swapType,
        detailNotes
      });

      // 8. Apply Changes to Real Schedule State
      let modifiedSlotsCount = 0;
      if (schedule && schedule.length > 0) {
        const updatedSchedule = schedule.map(slot => {
          // Mutate Slot A: Replace Officer A with Officer B
          if (slotA && slot.id === slotA.id) {
            const idx = (slot.serverIds || []).findIndex(sid => sid && parseInt(sid, 10) === parseInt(idA3, 10));
            if (idx !== -1) {
              modifiedSlotsCount++;
              const newServerIds = [...slot.serverIds];
              const newServerNames = [...slot.serverNames];
              const newIsSubstituted = [...(slot.isSubstituted || new Array(newServerIds.length).fill(false))];
              const newOriginalNames = [...(slot.originalServerNames || [...slot.serverNames])];
              const newServerNotes = [...(slot.serverNotes || new Array(newServerIds.length).fill(null))];
              const newKoorlapIds = [...(slot.koorlapIds || [])];

              newServerIds[idx] = idB3;
              newServerNames[idx] = officerB!.name;
              newIsSubstituted[idx] = true;
              newOriginalNames[idx] = officerA!.name;
              newServerNotes[idx] = swapType === 'TUKAR' 
                ? `(Tukar: #${idA3})` 
                : `(Sub: #${idB3})`;

              // Transfer Koorlap status if officer A was Koorlap in this slot
              const kIdx = newKoorlapIds.findIndex(kid => parseInt(kid, 10) === parseInt(idA3, 10));
              if (kIdx !== -1) {
                newKoorlapIds[kIdx] = idB3;
              }

              return {
                ...slot,
                serverIds: newServerIds,
                serverNames: newServerNames,
                koorlapIds: newKoorlapIds,
                isSubstituted: newIsSubstituted,
                originalServerNames: newOriginalNames,
                serverNotes: newServerNotes,
                status: 'Tukar Jadwal' as const
              };
            }
          }

          // Mutate Slot B: Replace Officer B with Officer A (for both Tukar & Ganti Jadwal if slotB exists)
          if (slotB && slot.id === slotB.id) {
            const idx = (slot.serverIds || []).findIndex(sid => sid && parseInt(sid, 10) === parseInt(idB3, 10));
            if (idx !== -1) {
              modifiedSlotsCount++;
              const newServerIds = [...slot.serverIds];
              const newServerNames = [...slot.serverNames];
              const newIsSubstituted = [...(slot.isSubstituted || new Array(newServerIds.length).fill(false))];
              const newOriginalNames = [...(slot.originalServerNames || [...slot.serverNames])];
              const newServerNotes = [...(slot.serverNotes || new Array(newServerIds.length).fill(null))];
              const newKoorlapIds = [...(slot.koorlapIds || [])];

              newServerIds[idx] = idA3;
              newServerNames[idx] = officerA!.name;
              newIsSubstituted[idx] = true;
              newOriginalNames[idx] = officerB!.name;
              newServerNotes[idx] = swapType === 'TUKAR' ? `(Tukar: #${idB3})` : `(Sub: #${idA3})`;

              // Transfer Koorlap status if officer B was Koorlap in this slot
              const kIdx = newKoorlapIds.findIndex(kid => parseInt(kid, 10) === parseInt(idB3, 10));
              if (kIdx !== -1) {
                newKoorlapIds[kIdx] = idA3;
              }

              return {
                ...slot,
                serverIds: newServerIds,
                serverNames: newServerNames,
                koorlapIds: newKoorlapIds,
                isSubstituted: newIsSubstituted,
                originalServerNames: newOriginalNames,
                serverNotes: newServerNotes,
                status: 'Tukar Jadwal' as const
              };
            }
          }

          return slot;
        });

        onUpdateSchedule(updatedSchedule);
      }

      // 9. Update Today's Schedule Table (Add both changes if 2 slots were updated)
      const newRows: TodayScheduleRow[] = [
        {
          id: 't-' + Date.now(),
          jamMisa: `${slotA ? slotA.displayDate.split(',')[1] || parsedDate : parsedDate} ${effectiveTimeA}`,
          lokasi: effectiveLocA,
          petugasOriginal: nameA,
          petugasPengganti: nameB,
          status: swapType === 'TUKAR' ? 'Swapped' : 'Updated'
        }
      ];

      if (slotB) {
        newRows.push({
          id: 't-b-' + Date.now(),
          jamMisa: `${slotB ? slotB.displayDate.split(',')[1] || parsedDate : parsedDate} ${effectiveTimeB}`,
          lokasi: effectiveLocB,
          petugasOriginal: nameB,
          petugasPengganti: nameA,
          status: swapType === 'TUKAR' ? 'Swapped' : 'Updated'
        });
      }

      setTodayRows(prev => [...newRows, ...prev]);

      // 10. Add to Live Feed & System Log
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

      onAddLog({
        type: 'swap',
        description: `WA Tukar Jadwal [${actionLabel}]: ${nameA} ⇄ ${nameB} (${effectiveTimeA}) - ${modifiedSlotsCount} slot diperbarui`,
        actor: 'WA Swap Converter'
      });

      setImportLogText(
        `Berhasil memperbarui ${modifiedSlotsCount} sesi jadwal misa: [${actionLabel}] ${nameA} dan ${nameB}. Seluruh kalender sakristi telah disinkronkan.`
      );
      playAudioFeedback('success');
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat memproses tukar jadwal.');
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

              {/* Quick Preset Format Buttons */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-[#5B1414] uppercase tracking-wider block">
                  Contoh Format WA Resmi Paroki (Klik untuk Isi Langsung):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInputMessage(PRESET_REAL_TUKAR)}
                    className="px-2.5 py-2 bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#5B1414] border border-[#D9CEBA] rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 text-left cursor-pointer shadow-2xs"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-[#7c191e] shrink-0" />
                    <span>Contoh 1: Tukar #105 ⇄ #092 (13 Sep)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMessage(PRESET_REAL_REPLACE)}
                    className="px-2.5 py-2 bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#5B1414] border border-[#D9CEBA] rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 text-left cursor-pointer shadow-2xs"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Contoh 2: Digantikan #029 ➔ #084 (1 Sep)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMessage(PRESET_TUKAR)}
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-[10px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3 h-3 text-slate-500" />
                    <span>Template Format Tukar Tugas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMessage(PRESET_DIGANTIKAN)}
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-[10px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCw className="w-3 h-3 text-slate-500" />
                    <span>Template Format Penggantian</span>
                  </button>
                </div>
              </div>

              {/* Textarea for pasting new message */}
              <div className="space-y-2 pt-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Tempelkan pesan WA grup tukar tugas di sini..."
                  rows={6}
                  className="w-full p-3.5 bg-white border border-[#d6cbbe] rounded-xl text-xs text-[#2b241e] placeholder:text-[#9e9488] focus:outline-none focus:ring-2 focus:ring-[#7c191e]/40 focus:border-[#7c191e] transition-all resize-none leading-relaxed font-mono"
                />

                <button
                  onClick={handleProcessMessage}
                  disabled={isProcessing || !inputMessage.trim()}
                  className="w-full py-3 bg-[#7c191e] hover:bg-[#681419] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
                >
                  <RotateCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>{isProcessing ? 'Memproses Pesan...' : 'PROSES & UPDATE JADWAL SAKRISTI'}</span>
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

              {/* Detected Change Box */}
              <div className="bg-white border border-[#e0d6c7] rounded-xl p-4 shadow-xs space-y-2.5 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-xs font-bold text-[#2b241e]">
                      Terdeteksi Perubahan WA:
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    detectedChange.swapType === 'TUKAR'
                      ? 'bg-purple-100 text-purple-900 border border-purple-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {detectedChange.action}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[#3b342e]">
                  <span className="font-bold text-[#5B1414]">{detectedChange.original}</span>
                  <span className="text-[#8C7662]">↔</span>
                  <span className="font-bold text-emerald-800">{detectedChange.pengganti}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="px-2.5 py-1 bg-[#FAF7F2] border border-[#D9CEBA] rounded-lg text-xs font-bold text-[#5B1414] flex items-center gap-1">
                    📅 Tanggal: {detectedChange.tanggal}
                  </span>
                  <span className="px-2.5 py-1 bg-[#FAF7F2] border border-[#D9CEBA] rounded-lg text-xs font-bold text-[#2C2420] flex items-center gap-1">
                    📍 Lokasi: {detectedChange.lokasi}
                  </span>
                  <span className="px-2.5 py-1 bg-[#FAF7F2] border border-[#D9CEBA] rounded-lg text-xs font-bold text-[#6E5A4B] font-mono flex items-center gap-1">
                    ⏰ Jam: {detectedChange.jamMisa}
                  </span>
                </div>

                <p className="text-xs text-[#6E5A4B] bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFC8] italic">
                  💡 {detectedChange.detailNotes}
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
