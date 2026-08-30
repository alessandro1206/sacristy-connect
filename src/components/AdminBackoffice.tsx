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

      // 1. Trigger Word: 'tukar' triggers mutual two-way switch with places and times
      const isMutualSwap = /tukar|switch|bertukar|saling|ganti\s+jadwal/i.test(text);
      const swapType: 'TUKAR' | 'DIGANTIKAN' = isMutualSwap ? 'TUKAR' : 'DIGANTIKAN';

      // 2. Clean text and split into segments for Officer A and Officer B
      const cleanedText = text
        .replace(/^(?:lapor\s+)?tukar\s+(?:jadwal\s+)?(?:tugas)?\s*:?\s*/i, '')
        .trim();

      const splitMatch = cleanedText.match(/(?:\n|\b)(?:tukar\s+dgn|tukar\s+dengan|tukar\s+sama|tukar\s+ke|tukar\s+sama\s+pak|dgn\s+pak|dengan\s+pak|tukar|dgn|dengan|digantikan\s+oleh|diganti\s+oleh|diganti)(?:\s*:|\s+)/i);
      
      let segA = cleanedText;
      let segB = "";
      if (splitMatch && splitMatch.index !== undefined) {
        segA = cleanedText.slice(0, splitMatch.index).trim();
        segB = cleanedText.slice(splitMatch.index + splitMatch[0].length).trim();
      } else {
        const lines = cleanedText.split('\n').map(l => l.trim()).filter(Boolean);
        segA = lines[0] || cleanedText;
        segB = lines.slice(1).join(' ') || "";
      }

      // Helper to parse officer, date, time, and location from a text segment
      const parseSegmentDetails = (seg: string) => {
        let matchedOfficer: Officer | undefined;

        // A. Priority 1: Match with #ID, no ID, nomor ID
        const idMatches = seg.match(/(?:#|no\.?\s*|nomor\s*)(\d{1,3})/gi) || [];
        for (const m of idMatches) {
          const num = parseInt(m.replace(/[^0-9]/g, ''), 10);
          if (num >= 1 && num <= 170) {
            matchedOfficer = officers.find(o => parseInt(o.id, 10) === num);
            if (matchedOfficer) break;
          }
        }

        // B. Priority 2: Match by full name or shortName
        if (!matchedOfficer) {
          const sorted = [...officers].sort((a, b) => b.name.length - a.name.length);
          matchedOfficer = sorted.find(o => 
            seg.toLowerCase().includes(o.name.toLowerCase()) ||
            (o.shortName && o.shortName.length > 3 && seg.toLowerCase().includes(o.shortName.toLowerCase()))
          );
        }

        // C. Priority 3: Standalone 1-170 numbers (excluding date/time digits)
        if (!matchedOfficer) {
          const stripped = seg
            .replace(/\d{1,2}[:.]\d{2}/g, '')
            .replace(/(?:tgl|tanggal|hari)\s*0?\d{1,2}/gi, '');
          const nums = stripped.match(/\b(\d{1,3})\b/g) || [];
          for (const n of nums) {
            const val = parseInt(n, 10);
            if (val >= 1 && val <= 170) {
              matchedOfficer = officers.find(o => parseInt(o.id, 10) === val);
              if (matchedOfficer) break;
            }
          }
        }

        // Extract Date: e.g. tgl 13 Sept, 13 September, 01 September
        const dateMatch = seg.match(/(?:tgl|tanggal|hari)?\s*0?(\d{1,2})\s*(?:sept|sep|september|agust|okt)?/i);
        let dayNum: number | null = null;
        if (dateMatch && (seg.toLowerCase().includes('tgl') || seg.toLowerCase().includes('tanggal') || /sep|sept|september|agust/i.test(seg))) {
          const dVal = parseInt(dateMatch[1], 10);
          if (dVal >= 1 && dVal <= 31) dayNum = dVal;
        }

        // Extract Time: e.g. 17:00, 18.00, 05:30
        const timeMatch = seg.match(/(\d{1,2}[:.]\d{2})/);
        const timeStr = timeMatch ? timeMatch[1].replace('.', ':') : null;

        // Extract Location: Kapel John Paul II, Gereja Paroki Santo Yakobus, RS EH
        let locStr: string | null = null;
        if (/kjp|kapel|john paul/i.test(seg)) {
          locStr = 'Kapel John Paul II';
        } else if (/gereja/i.test(seg)) {
          locStr = 'Gereja Paroki Santo Yakobus';
        } else if (/rs|korsa|rumah sakit/i.test(seg)) {
          locStr = 'Rumah Sakit EH';
        }

        return { officer: matchedOfficer, dayNum, timeStr, locStr };
      };

      let parsedA = parseSegmentDetails(segA);
      let parsedB = parseSegmentDetails(segB);

      let officerA = parsedA.officer;
      let officerB = parsedB.officer;

      // Global fallback if one of the officers was not parsed from segments
      if (!officerA || !officerB) {
        const allIds = (text.match(/(?:#|no\.?\s*|nomor\s*)?(\d{1,3})/gi) || [])
          .map(m => parseInt(m.replace(/[^0-9]/g, ''), 10))
          .filter(n => n >= 1 && n <= 170);

        const foundOfficers = allIds
          .map(n => officers.find(o => parseInt(o.id, 10) === n))
          .filter((o): o is Officer => Boolean(o));

        const uniqueOfficers = Array.from(new Set(foundOfficers));
        if (uniqueOfficers.length >= 2) {
          if (!officerA) officerA = uniqueOfficers[0];
          if (!officerB) officerB = uniqueOfficers[1];
        }
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

      // Fallback global date if neither segment had date
      if (!parsedA.dayNum && !parsedB.dayNum) {
        const globalDateMatch = text.match(/(?:tgl|tanggal|hari)?\s*0?(\d{1,2})\s*(?:sept|sep|september)?/i);
        if (globalDateMatch) {
          parsedA.dayNum = parseInt(globalDateMatch[1], 10);
          parsedB.dayNum = parsedA.dayNum;
        }
      }

      // Slot Finder with priority matching
      const findOfficerSlot = (
        off: Officer,
        dayNum: number | null,
        timeStr: string | null,
        locStr: string | null,
        excludeSlotId?: string
      ): ScheduleSlot | undefined => {
        const oid = off.id.padStart(3, '0');
        let candidates = schedule.filter(s => 
          (s.serverIds || []).some(sid => sid && sid.padStart(3, '0') === oid) &&
          (!excludeSlotId || s.id !== excludeSlotId)
        );

        if (candidates.length === 0) return undefined;

        if (dayNum) {
          const dayMatches = candidates.filter(s => {
            const parts = s.date.split('-');
            return parts.length === 3 && parseInt(parts[2], 10) === dayNum;
          });
          if (dayMatches.length > 0) candidates = dayMatches;
        }

        if (timeStr) {
          const timeMatches = candidates.filter(s => s.massTime.replace(' WIB', '').includes(timeStr));
          if (timeMatches.length > 0) candidates = timeMatches;
        }

        if (locStr) {
          const locMatches = candidates.filter(s => s.location.toLowerCase().includes(locStr.toLowerCase()));
          if (locMatches.length > 0) candidates = locMatches;
        }

        return candidates[0];
      };

      const slotA = findOfficerSlot(officerA, parsedA.dayNum, parsedA.timeStr, parsedA.locStr);
      const slotB = findOfficerSlot(officerB, parsedB.dayNum, parsedB.timeStr, parsedB.locStr, slotA?.id);

      const effectiveTimeA = slotA ? slotA.massTime : (parsedA.timeStr ? `${parsedA.timeStr} WIB` : '17:00 WIB');
      const effectiveTimeB = slotB ? slotB.massTime : (parsedB.timeStr ? `${parsedB.timeStr} WIB` : effectiveTimeA);
      const effectiveLocA = slotA ? slotA.location : (parsedA.locStr || 'Kapel John Paul II');
      const effectiveLocB = slotB ? slotB.location : (parsedB.locStr || 'Gereja Paroki Santo Yakobus');
      const effectiveDateA = slotA ? slotA.displayDate : `${parsedA.dayNum || 13} Sep 2026`;
      const effectiveDateB = slotB ? slotB.displayDate : `${parsedB.dayNum || 13} Sep 2026`;

      const actionLabel = swapType === 'TUKAR' ? 'Tukar Jadwal (Mutual Switch)' : 'Digantikan (One-Way Replacement)';

      const detailNotes = swapType === 'TUKAR' && slotB
        ? `TUKAR JADWAL (Mutual Switch):\n• ${nameA} bertukar tugas dari Sesi 1 (${effectiveDateA}, ${effectiveTimeA} @ ${effectiveLocA}) ke Sesi 2 (${effectiveDateB}, ${effectiveTimeB} @ ${effectiveLocB}).\n• ${nameB} bertukar tugas dari Sesi 2 (${effectiveDateB}, ${effectiveTimeB} @ ${effectiveLocB}) ke Sesi 1 (${effectiveDateA}, ${effectiveTimeA} @ ${effectiveLocA}).`
        : `${nameA} (${effectiveDateA}, ${effectiveTimeA} @ ${effectiveLocA}) digantikan oleh ${nameB}.`;

      // 7. Update Live Preview Box
      setDetectedChange({
        original: nameA,
        pengganti: nameB,
        tanggal: (swapType === 'TUKAR' && slotB && slotA?.date !== slotB?.date) 
          ? `${effectiveDateA} ⇄ ${effectiveDateB}` 
          : effectiveDateA,
        jamMisa: (swapType === 'TUKAR' && slotB) ? `${effectiveTimeA} ⇄ ${effectiveTimeB}` : effectiveTimeA,
        lokasi: (swapType === 'TUKAR' && slotB) ? `${effectiveLocA} ⇄ ${effectiveLocB}` : effectiveLocA,
        action: actionLabel,
        swapType,
        detailNotes
      });

      // 8. Apply Mutual Changes to Real Schedule State
      let modifiedSlotsCount = 0;
      if (schedule && schedule.length > 0) {
        const updatedSchedule = schedule.map(slot => {
          // Mutate Slot A: Replace Officer A with Officer B
          if (slotA && slot.id === slotA.id) {
            const idx = (slot.serverIds || []).findIndex(sid => sid && sid.padStart(3, '0') === idA3);
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
                ? `Tukar Jadwal: ${idA3} ${officerA!.name}` 
                : `Menggantikan: ${idA3} ${officerA!.name}`;

              // Transfer Koorlap status if officer A was Koorlap in this slot
              const kIdx = newKoorlapIds.findIndex(kid => kid.padStart(3, '0') === idA3);
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

          // Mutate Slot B: Replace Officer B with Officer A (for mutual swap)
          if (slotB && slot.id === slotB.id && swapType === 'TUKAR') {
            const idx = (slot.serverIds || []).findIndex(sid => sid && sid.padStart(3, '0') === idB3);
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
              newServerNotes[idx] = `Tukar Jadwal: ${idB3} ${officerB!.name}`;

              // Transfer Koorlap status if officer B was Koorlap in this slot
              const kIdx = newKoorlapIds.findIndex(kid => kid.padStart(3, '0') === idB3);
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

      // 9. Update Today's Schedule Table
      const newRows: TodayScheduleRow[] = [];
      if (slotA) {
        newRows.push({
          id: 't-a-' + Date.now(),
          jamMisa: `${effectiveDateA} (${effectiveTimeA})`,
          lokasi: effectiveLocA,
          petugasOriginal: nameA,
          petugasPengganti: nameB,
          status: 'Swapped'
        });
      }
      if (slotB && swapType === 'TUKAR') {
        newRows.push({
          id: 't-b-' + Date.now(),
          jamMisa: `${effectiveDateB} (${effectiveTimeB})`,
          lokasi: effectiveLocB,
          petugasOriginal: nameB,
          petugasPengganti: nameA,
          status: 'Swapped'
        });
      }

      setTodayRows(prev => [...newRows, ...prev]);

      // 10. Add to Live Feed & System Log
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
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
        description: `WA Tukar Jadwal [${actionLabel}]: ${nameA} (${effectiveLocA}) ⇄ ${nameB} (${effectiveLocB}) - ${modifiedSlotsCount} slot berhasil disinkronkan`,
        actor: 'WA AI Assistant'
      });

      setImportLogText(
        `✅ Berhasil memproses ${actionLabel}: ${nameA} (${effectiveLocA}, ${effectiveTimeA}) bertukar jadwal dengan ${nameB} (${effectiveLocB}, ${effectiveTimeB}). Database dan kalender telah diperbarui otomatis.`
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
