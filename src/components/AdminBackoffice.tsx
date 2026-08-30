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

  // Generic and pre-filled template formats for WhatsApp Tukar Jadwal & Penggantian
  const PRESET_REAL_TUKAR = `Lapor Tukar Tugas

Mikael Hengky Pratama #105 tugas tgl 13 Sept di Kapel John Paul II jam 17:00
Tukar dgn pak Widyanto Setiawan Wijaya #092 tgl 13 Sept di Gereja jam 18:00`;

  const PRESET_REAL_REPLACE = `Lapor Penggantian Tugas :

Petugas : Raymond Hanjaya #067
Tugas tgl : 04 September 2026
Misa jam : 18:00 WIB
Lokasi : Kapel John Paul II

Digantikan oleh : Happy Gunawarman #168
Alasan : Keperluan dinas keluarga`;

  const PRESET_MENGGANTIKAN = `Lapor Penggantian Tugas :

Happy Gunawarman #168 menggantikan #067 Raymond Hanjaya tugas tgl 04 September 2026 jam 18:00 WIB di Kapel John Paul II`;

  const PRESET_TUKAR = `Lapor Tukar Tugas

Saya [Nama Petugas 1] #[No ID 1] tugas tgl [Tanggal] di [Lokasi 1] jam [Jam 1]
Tukar dgn pak [Nama Petugas 2] #[No ID 2] tgl [Tanggal] di [Lokasi 2] jam [Jam 2]`;

  const PRESET_DIGANTIKAN = `Lapor Penggantian Tugas :

[Nama Petugas Pengganti] #[No ID Pengganti] menggantikan [Nama Petugas Asli] #[No ID Asli]
Tugas tgl : [Tanggal]
Misa jam : [Jam Misa]
Lokasi : [Lokasi]`;

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

      // 1. Trigger Word Detection:
      // 'menggantikan' / 'mengantikan' / 'digantikan' / 'gantikan' / 'pengganti' -> One-Way Replacement
      // 'tukar' / 'bertukar' / 'saling tukar' / 'switch' -> Mutual Two-Way Switch
      const hasReplacementWord = /\b(?:menggantikan|mengantikan|digantikan|gantikan|pengganti|diganti\s+oleh|digantikan\s+oleh)\b/i.test(text);
      const hasMutualSwapWord = /\b(?:tukar\s+dgn|tukar\s+dengan|tukar\s+sama|bertukar|saling\s+tukar)\b/i.test(text);

      let swapType: 'TUKAR' | 'DIGANTIKAN' = 'DIGANTIKAN';
      if (hasReplacementWord && !hasMutualSwapWord) {
        swapType = 'DIGANTIKAN';
      } else if (hasMutualSwapWord) {
        swapType = 'TUKAR';
      } else if (/\btukar\b/i.test(text)) {
        swapType = 'TUKAR';
      } else {
        swapType = 'DIGANTIKAN';
      }

      // Helper function to find officer in text snippet
      const findOfficerInSnippet = (snippet: string): Officer | undefined => {
        if (!snippet) return undefined;
        // Priority 1: Match by Name first (e.g. "Hadi Santoso", "Antonius David Tjung")
        const sorted = [...officers].sort((a, b) => b.name.length - a.name.length);
        const nameFound = sorted.find(o => 
          (o.name.length >= 4 && snippet.toLowerCase().includes(o.name.toLowerCase())) ||
          (o.shortName && o.shortName.length >= 4 && snippet.toLowerCase().includes(o.shortName.toLowerCase()))
        );
        if (nameFound) return nameFound;

        // Priority 2: Match by #ID, no. ID, nomor ID
        const idMatches = snippet.match(/(?:#|no\.?\s*|nomor\s*)(\d{1,3})/gi) || [];
        for (const m of idMatches) {
          const num = parseInt(m.replace(/[^0-9]/g, ''), 10);
          if (num >= 1 && num <= 170) {
            const found = officers.find(o => parseInt(o.id, 10) === num);
            if (found) return found;
          }
        }

        // Priority 3: Standalone 1-170 number (excluding date/time digits)
        const stripped = snippet
          .replace(/\b202[4-9]\b/g, '')
          .replace(/(?:jam|pukul)?\s*([01]?\d|2[0-3])[:.]([0-5]\d)/gi, '')
          .replace(/(?:jam|pukul)\s*([01]\d|2[0-3])([0-5]\d)/gi, '')
          .replace(/(?:tgl|tanggal|hari)?\s*0?\d{1,2}\s*(?:jan|feb|mar|apr|mei|jun|jul|agus|agt|sep|sept|september|okt|nov|des)/gi, '');
        const nums = stripped.match(/\b(\d{1,3})\b/g) || [];
        for (const n of nums) {
          const val = parseInt(n, 10);
          if (val >= 1 && val <= 170) {
            const numFound = officers.find(o => parseInt(o.id, 10) === val);
            if (numFound) return numFound;
          }
        }

        return undefined;
      };

      // Helper to extract date, time, and location
      const extractDateTimeLoc = (snippet: string) => {
        const segClean = snippet.replace(/\b202[4-9]\b/g, '');

        // Time: e.g. 18:00, 18.00, jam 1800, pukul 0530
        let timeStr: string | null = null;
        const tMatch1 = segClean.match(/(?:jam|pukul)?\s*([01]?\d|2[0-3])[:.]([0-5]\d)/i);
        if (tMatch1) {
          timeStr = `${tMatch1[1].padStart(2, '0')}:${tMatch1[2]}`;
        } else {
          const tMatch2 = segClean.match(/(?:jam|pukul)\s*([01]\d|2[0-3])([0-5]\d)/i);
          if (tMatch2) {
            timeStr = `${tMatch2[1]}:${tMatch2[2]}`;
          }
        }

        // Date: e.g. 1 september, 4 september, tgl 04 Sep, 13 September
        let dayNum: number | null = null;
        const dMatch1 = segClean.match(/\b0?(\d{1,2})\s*(?:jan|feb|mar|apr|mei|jun|jul|agus|agt|sep|sept|september|okt|nov|des)\b/i);
        if (dMatch1) {
          const dVal = parseInt(dMatch1[1], 10);
          if (dVal >= 1 && dVal <= 31) dayNum = dVal;
        } else {
          const dMatch2 = segClean.match(/(?:tgl|tanggal|hari)\s*0?(\d{1,2})\b/i);
          if (dMatch2) {
            const dVal = parseInt(dMatch2[1], 10);
            if (dVal >= 1 && dVal <= 31) dayNum = dVal;
          }
        }

        // Location: Kapel John Paul II, Gereja Paroki Santo Yakobus, RS EH
        let locStr: string | null = null;
        if (/kjp|kapel|john paul/i.test(segClean)) {
          locStr = 'Kapel John Paul II';
        } else if (/gereja/i.test(segClean)) {
          locStr = 'Gereja Paroki Santo Yakobus';
        } else if (/rs|korsa|rumah sakit/i.test(segClean)) {
          locStr = 'Rumah Sakit EH';
        }

        return { dayNum, timeStr, locStr };
      };

      let officerOriginal: Officer | undefined;
      let officerReplacement: Officer | undefined;
      let dtOriginal = { dayNum: null as number | null, timeStr: null as string | null, locStr: null as string | null };
      let dtReplacement = { dayNum: null as number | null, timeStr: null as string | null, locStr: null as string | null };

      if (swapType === 'DIGANTIKAN') {
        // Pattern 1: Structured "Petugas : [A] ... Digantikan oleh : [B]"
        const petugasMatch = text.match(/petugas\s*:\s*(.+?)(?:\n|$)/i);
        const penggantiMatch = text.match(/(?:digantikan\s+oleh|pengganti|diganti\s+oleh)\s*:\s*(.+?)(?:\n|$)/i);

        if (petugasMatch && penggantiMatch) {
          officerOriginal = findOfficerInSnippet(petugasMatch[1]);
          officerReplacement = findOfficerInSnippet(penggantiMatch[1]);
          dtOriginal = extractDateTimeLoc(text);
          dtReplacement = dtOriginal;
        } else {
          // Pattern 2: "[Officer B] menggantikan [Officer A]"
          const menggantikanMatch = text.match(/(.+?)\s+\b(?:menggantikan|mengantikan|gantikan)\s+(.+)/i);
          // Pattern 3: "[Officer A] digantikan oleh [Officer B]"
          const digantikanMatch = text.match(/(.+?)\s+\b(?:digantikan\s+oleh|diganti\s+oleh|digantikan|diganti)\s+(.+)/i);

          if (menggantikanMatch) {
            officerReplacement = findOfficerInSnippet(menggantikanMatch[1]);
            officerOriginal = findOfficerInSnippet(menggantikanMatch[2]);
            dtOriginal = extractDateTimeLoc(menggantikanMatch[2]);
            dtReplacement = extractDateTimeLoc(menggantikanMatch[1]);
          } else if (digantikanMatch) {
            officerOriginal = findOfficerInSnippet(digantikanMatch[1]);
            officerReplacement = findOfficerInSnippet(digantikanMatch[2]);
            dtOriginal = extractDateTimeLoc(digantikanMatch[1]);
            dtReplacement = extractDateTimeLoc(digantikanMatch[2]);
          }
        }
      } else {
        // TUKAR: Mutual Two-Way Switch
        const cleanedText = text
          .replace(/^(?:lapor\s+)?tukar\s+(?:jadwal\s+)?(?:tugas)?\s*:?\s*/i, '')
          .trim();

        const splitMatch = cleanedText.match(/(?:\n|\b)(?:tukar\s+dgn|tukar\s+dengan|tukar\s+sama|tukar\s+ke|tukar\s+sama\s+pak|dgn\s+pak|dengan\s+pak|tukar|dgn|dengan)(?:\s*:|\s+)/i);

        if (splitMatch && splitMatch.index !== undefined) {
          const segA = cleanedText.slice(0, splitMatch.index).trim();
          const segB = cleanedText.slice(splitMatch.index + splitMatch[0].length).trim();
          officerOriginal = findOfficerInSnippet(segA);
          officerReplacement = findOfficerInSnippet(segB);
          dtOriginal = extractDateTimeLoc(segA);
          dtReplacement = extractDateTimeLoc(segB);
        }
      }

      // Global datetime fallback if segment datetime was empty
      const globalDt = extractDateTimeLoc(text);
      if (!dtOriginal.dayNum) dtOriginal.dayNum = globalDt.dayNum;
      if (!dtOriginal.timeStr) dtOriginal.timeStr = globalDt.timeStr;
      if (!dtOriginal.locStr) dtOriginal.locStr = globalDt.locStr;
      if (!dtReplacement.dayNum) dtReplacement.dayNum = dtOriginal.dayNum;
      if (!dtReplacement.timeStr) dtReplacement.timeStr = dtOriginal.timeStr;
      if (!dtReplacement.locStr) dtReplacement.locStr = dtOriginal.locStr;

      // Global fallback if one or both officers were not parsed
      if (!officerOriginal || !officerReplacement) {
        const allIds = (text.match(/(?:#|no\.?\s*|nomor\s*)?(\d{1,3})/gi) || [])
          .map(m => parseInt(m.replace(/[^0-9]/g, ''), 10))
          .filter(n => n >= 1 && n <= 170);

        const foundOfficers = allIds
          .map(n => officers.find(o => parseInt(o.id, 10) === n))
          .filter((o): o is Officer => Boolean(o));

        const uniqueOfficers = Array.from(new Set(foundOfficers));
        if (uniqueOfficers.length >= 2) {
          if (!officerOriginal) officerOriginal = uniqueOfficers[0];
          if (!officerReplacement) officerReplacement = uniqueOfficers[1];
        }
      }

      if (!officerOriginal || !officerReplacement) {
        alert('Mohon sebutkan nama atau nomor ID petugas yang digantikan dan petugas pengganti secara jelas dalam pesan WhatsApp.');
        setIsProcessing(false);
        return;
      }

      const idA3 = officerOriginal.id.padStart(3, '0');
      const idB3 = officerReplacement.id.padStart(3, '0');
      const nameA = `${officerOriginal.name} (#${idA3})`;
      const nameB = `${officerReplacement.name} (#${idB3})`;

      // Slot Finder with priority matching
      const findOfficerSlot = (
        off: Officer,
        dNum: number | null,
        tStr: string | null,
        lStr: string | null,
        excludeSlotId?: string
      ): ScheduleSlot | undefined => {
        const oid = off.id.padStart(3, '0');
        
        // 1. Direct match by officer in slot (assigned, substituted original, or note)
        let candidates = schedule.filter(s => 
          ((s.serverIds || []).some(sid => sid && sid.padStart(3, '0') === oid) ||
           (s.originalServerNames || []).some(name => name && name.toLowerCase().includes(off.name.toLowerCase())) ||
           (s.serverNotes || []).some(note => note && (note.includes(oid) || note.toLowerCase().includes(off.name.toLowerCase())))) &&
          (!excludeSlotId || s.id !== excludeSlotId)
        );

        if (dNum) {
          const dayMatches = candidates.filter(s => {
            const parts = s.date.split('-');
            return parts.length === 3 && parseInt(parts[2], 10) === dNum;
          });
          if (dayMatches.length > 0) candidates = dayMatches;
        }

        if (tStr) {
          const timeMatches = candidates.filter(s => s.massTime.replace(' WIB', '').includes(tStr));
          if (timeMatches.length > 0) candidates = timeMatches;
        }

        if (lStr) {
          const locMatches = candidates.filter(s => s.location.toLowerCase().includes(lStr.toLowerCase()));
          if (locMatches.length > 0) candidates = locMatches;
        }

        if (candidates.length > 0) return candidates[0];

        // 2. Fallback by session date/time/location if exact slot exists
        if (dNum) {
          let sessionCandidates = schedule.filter(s => {
            const parts = s.date.split('-');
            return parts.length === 3 && parseInt(parts[2], 10) === dNum && (!excludeSlotId || s.id !== excludeSlotId);
          });
          if (tStr) {
            const timeMatches = sessionCandidates.filter(s => s.massTime.replace(' WIB', '').includes(tStr));
            if (timeMatches.length > 0) sessionCandidates = timeMatches;
          }
          if (lStr) {
            const locMatches = sessionCandidates.filter(s => s.location.toLowerCase().includes(lStr.toLowerCase()));
            if (locMatches.length > 0) sessionCandidates = locMatches;
          }
          if (sessionCandidates.length > 0) return sessionCandidates[0];
        }

        return undefined;
      };

      const slotA = findOfficerSlot(officerOriginal, dtOriginal.dayNum, dtOriginal.timeStr, dtOriginal.locStr);
      const slotB = swapType === 'TUKAR' 
        ? findOfficerSlot(officerReplacement, dtReplacement.dayNum, dtReplacement.timeStr, dtReplacement.locStr, slotA?.id)
        : undefined;

      const effectiveTimeA = slotA ? slotA.massTime : (dtOriginal.timeStr ? `${dtOriginal.timeStr} WIB` : '18:00 WIB');
      const effectiveTimeB = slotB ? slotB.massTime : (dtReplacement.timeStr ? `${dtReplacement.timeStr} WIB` : effectiveTimeA);
      const effectiveLocA = slotA ? slotA.location : (dtOriginal.locStr || 'Kapel John Paul II');
      const effectiveLocB = slotB ? slotB.location : (dtReplacement.locStr || 'Gereja Paroki Santo Yakobus');
      const effectiveDateA = slotA ? slotA.displayDate : `${dtOriginal.dayNum || '01'} Sep 2026`;
      const effectiveDateB = slotB ? slotB.displayDate : `${dtReplacement.dayNum || '04'} Sep 2026`;

      const actionLabel = swapType === 'TUKAR' 
        ? 'Tukar Jadwal (Mutual Switch)' 
        : 'Menggantikan (One-Way Replacement)';

      const detailNotes = swapType === 'TUKAR' && slotB
        ? `TUKAR JADWAL (Mutual Switch):\n• ${nameA} bertukar tugas dari Sesi 1 (${effectiveDateA}, ${effectiveTimeA} @ ${effectiveLocA}) ke Sesi 2 (${effectiveDateB}, ${effectiveTimeB} @ ${effectiveLocB}).\n• ${nameB} bertukar tugas dari Sesi 2 (${effectiveDateB}, ${effectiveTimeB} @ ${effectiveLocB}) ke Sesi 1 (${effectiveDateA}, ${effectiveTimeA} @ ${effectiveLocA}).`
        : `PENGGANTIAN TUGAS (One-Way Replacement):\n• ${nameA} berhalangan hadir pada sesi (${effectiveDateA}, ${effectiveTimeA} @ ${effectiveLocA}).\n• ${nameB} menggantikan tugas ${nameA} secara penuh pada sesi misa tersebut.`;

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
      const logTimeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [
        {
          id: 'msg-' + Date.now(),
          time: logTimeStr,
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
                    onClick={() => setInputMessage(PRESET_MENGGANTIKAN)}
                    className="px-2.5 py-2 bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#5B1414] border border-[#D9CEBA] rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 text-left cursor-pointer shadow-2xs"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Contoh 2: #168 Menggantikan #067 (4 Sep)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMessage(PRESET_REAL_REPLACE)}
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-[10px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCw className="w-3 h-3 text-slate-500" />
                    <span>Format Form: Digantikan Oleh</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMessage(PRESET_TUKAR)}
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-[10px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3 h-3 text-slate-500" />
                    <span>Template Format Tukar Tugas</span>
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
