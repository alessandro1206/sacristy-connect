import React, { useState, useMemo, useEffect } from 'react';
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
  History,
  Copy,
  Undo2,
  Search,
  Users,
  Check,
  CalendarRange
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

export interface SwapRecapRow {
  id: string;
  slotId: string;
  slotIndex: number;
  dateStr: string;
  displayDate: string;
  massTime: string;
  location: string;
  originalOfficerId: string;
  originalOfficerName: string;
  currentOfficerId: string;
  currentOfficerName: string;
  changeType: 'TUKAR' | 'PENGGANTIAN';
  note: string;
  status: string;
}

export const AdminBackoffice: React.FC<AdminBackofficeProps> = ({
  schedule,
  officers,
  onUpdateSchedule,
  onAddLog
}) => {
  // Keys for persistent WA state
  const WA_STORAGE = {
    MESSAGES: 'sacristy_wa_messages_v7',
    INPUT: 'sacristy_wa_input_v7',
    DETECTED: 'sacristy_wa_detected_v7',
    LOG: 'sacristy_wa_log_v7'
  };

  // Feed of WhatsApp messages matching real parish officers (persisted)
  const [messages, setMessages] = useState<MessageItem[]>(() => {
    try {
      const saved = localStorage.getItem(WA_STORAGE.MESSAGES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
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
    ];
  });

  // Generic and pre-filled template formats for WhatsApp Tukar Jadwal & Penggantian
  const PRESET_REAL_TUKAR = `Lapor Tukar Tugas

Mikael Hengky Pratama #105 tugas tgl 13 Sept di Kapel John Paul II jam 17:00
Tukar dgn pak Widyanto Setiawan Wijaya #092 tgl 13 Sept di Gereja jam 18:00`;

  const PRESET_REAL_REPLACE = `Lapor Penggantian Tugas :

Petugas : Antonius Benny Sukamto #063
Tugas tgl : 04 September 2026
Misa jam : 18:00 WIB
Lokasi : Kapel John Paul II

Digantikan oleh : Happy Gunawarman #168
Alasan : Keperluan dinas keluarga`;

  const PRESET_MENGGANTIKAN = `Lapor Penggantian Tugas :

Happy Gunawarman #168 menggantikan #056 Antonius David Tjung tugas tgl 04 September 2026 jam 18:00 WIB di Kapel John Paul II`;

  const PRESET_TUKAR = `Lapor Tukar Tugas

Saya [Nama Petugas 1] #[No ID 1] tugas tgl [Tanggal] di [Lokasi 1] jam [Jam 1]
Tukar dgn pak [Nama Petugas 2] #[No ID 2] tgl [Tanggal] di [Lokasi 2] jam [Jam 2]`;

  const PRESET_DIGANTIKAN = `Lapor Penggantian Tugas :

[Nama Petugas Pengganti] #[No ID Pengganti] menggantikan [Nama Petugas Asli] #[No ID Asli]
Tugas tgl : [Tanggal]
Misa jam : [Jam Misa]
Lokasi : [Lokasi]`;

  const [inputMessage, setInputMessage] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(WA_STORAGE.INPUT);
      if (saved) return saved;
    } catch {}
    return PRESET_REAL_TUKAR;
  });

  const [parseError, setParseError] = useState<{ title: string; reason: string; fixHint: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Filter & Search states for Rekap Pertukaran & Pergantian
  const [recapFilter, setRecapFilter] = useState<'all' | 'tukar' | 'penggantian'>('all');
  const [recapSearch, setRecapSearch] = useState<string>('');
  const [isCopiedRecap, setIsCopiedRecap] = useState<boolean>(false);

  // Detected change state for Live Preview (persisted)
  const [detectedChange, setDetectedChange] = useState<{
    original: string;
    pengganti: string;
    tanggal: string;
    jamMisa: string;
    lokasi: string;
    action: string;
    swapType: 'TUKAR' | 'DIGANTIKAN';
    detailNotes: string;
  }>(() => {
    try {
      const saved = localStorage.getItem(WA_STORAGE.DETECTED);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      original: 'Mikael Hengky Pratama (#105)',
      pengganti: 'Widyanto Setiawan Wijaya (#092)',
      tanggal: '13 Sep 2026',
      jamMisa: '17:00 ⇄ 18:00 WIB',
      lokasi: 'Kapel John Paul II ⇄ Gereja Utama',
      action: 'Tukar Jadwal (Mutual Switch)',
      swapType: 'TUKAR',
      detailNotes: 'Saling Bertukar Jadwal:\n• #105 Mikael Hengky Pratama mengambil jadwal 13 Sep 2026 18:00 WIB (Gereja Paroki Santo Yakobus)\n• #092 Widyanto Setiawan Wijaya mengambil jadwal 13 Sep 2026 17:00 WIB (Kapel John Paul II)'
    };
  });

  const [importLogText, setImportLogText] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(WA_STORAGE.LOG);
      if (saved) return saved;
    } catch {}
    return 'Siap memproses pesan tukar tugas grup WhatsApp.';
  });

  // Save to localStorage whenever states change
  useEffect(() => {
    try {
      localStorage.setItem(WA_STORAGE.MESSAGES, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(WA_STORAGE.INPUT, inputMessage);
    } catch {}
  }, [inputMessage]);

  useEffect(() => {
    try {
      localStorage.setItem(WA_STORAGE.DETECTED, JSON.stringify(detectedChange));
    } catch {}
  }, [detectedChange]);

  useEffect(() => {
    try {
      localStorage.setItem(WA_STORAGE.LOG, importLogText);
    } catch {}
  }, [importLogText]);

  // Dynamically compute all swapped & replaced slots across the schedule
  const swapRecapList: SwapRecapRow[] = useMemo(() => {
    const list: SwapRecapRow[] = [];
    (schedule || []).forEach(slot => {
      if (slot.isSubstituted && slot.isSubstituted.some(Boolean)) {
        slot.isSubstituted.forEach((sub, idx) => {
          if (sub) {
            const origName = slot.originalServerNames?.[idx] || 'Petugas Asli';
            const currName = slot.serverNames[idx] || 'Petugas Pengganti';
            const currId = slot.serverIds[idx] ? slot.serverIds[idx].padStart(3, '0') : '';
            const note = slot.serverNotes?.[idx] || '';

            let origId = '';
            const origIdMatch = note.match(/#(\d{1,3})|:\s*(\d{1,3})/);
            if (origIdMatch) {
              origId = (origIdMatch[1] || origIdMatch[2]).padStart(3, '0');
            } else {
              const matchedOff = officers.find(o => o.name.toLowerCase() === origName.toLowerCase());
              if (matchedOff) origId = matchedOff.id.padStart(3, '0');
            }

            const isMutualSwap = note.toLowerCase().includes('tukar');
            list.push({
              id: `${slot.id}-${idx}`,
              slotId: slot.id,
              slotIndex: idx,
              dateStr: slot.date,
              displayDate: slot.displayDate,
              massTime: slot.massTime,
              location: slot.location,
              originalOfficerId: origId,
              originalOfficerName: origName,
              currentOfficerId: currId,
              currentOfficerName: currName,
              changeType: isMutualSwap ? 'TUKAR' : 'PENGGANTIAN',
              note: note || (isMutualSwap ? 'Tukar Jadwal' : 'Penggantian Tugas'),
              status: slot.status
            });
          }
        });
      }
    });

    return list.sort((a, b) => {
      const cmp = a.dateStr.localeCompare(b.dateStr);
      if (cmp !== 0) return cmp;
      return a.massTime.localeCompare(b.massTime);
    });
  }, [schedule, officers]);

  // Filtered recap list for table
  const filteredRecapList = useMemo(() => {
    return swapRecapList.filter(row => {
      if (recapFilter === 'tukar' && row.changeType !== 'TUKAR') return false;
      if (recapFilter === 'penggantian' && row.changeType !== 'PENGGANTIAN') return false;
      if (recapSearch.trim()) {
        const q = recapSearch.toLowerCase();
        const matchName = row.currentOfficerName.toLowerCase().includes(q) || 
                          row.originalOfficerName.toLowerCase().includes(q) ||
                          row.currentOfficerId.includes(q) ||
                          row.originalOfficerId.includes(q) ||
                          row.displayDate.toLowerCase().includes(q) ||
                          row.location.toLowerCase().includes(q) ||
                          row.note.toLowerCase().includes(q);
        if (!matchName) return false;
      }
      return true;
    });
  }, [swapRecapList, recapFilter, recapSearch]);

  // Revert / Reset an individual swap or replacement back to the original officer
  const handleRevertSwap = (item: SwapRecapRow) => {
    if (!window.confirm(`Kembalikan petugas asli (${item.originalOfficerName}) ke jadwal ${item.displayDate} ${item.massTime}?`)) {
      return;
    }

    const updatedSchedule = schedule.map(slot => {
      if (slot.id === item.slotId) {
        const newServerNames = [...slot.serverNames];
        const newServerIds = [...slot.serverIds];
        const newIsSubstituted = [...(slot.isSubstituted || [])];
        const newServerNotes = [...(slot.serverNotes || [])];

        newServerNames[item.slotIndex] = item.originalOfficerName;
        if (item.originalOfficerId) {
          newServerIds[item.slotIndex] = item.originalOfficerId;
        }
        newIsSubstituted[item.slotIndex] = false;
        newServerNotes[item.slotIndex] = '';

        const anySubLeft = newIsSubstituted.some(Boolean);
        return {
          ...slot,
          serverNames: newServerNames,
          serverIds: newServerIds,
          isSubstituted: newIsSubstituted,
          serverNotes: newServerNotes,
          status: anySubLeft ? ('Tukar Jadwal' as const) : ('Scheduled' as const)
        };
      }
      return slot;
    });

    onUpdateSchedule(updatedSchedule);
    playAudioFeedback('success');
    if (onAddLog) {
      onAddLog({
        type: 'swap',
        description: `Batal Perubahan: Mengembalikan ${item.originalOfficerName} ke jadwal ${item.displayDate} ${item.massTime} (${item.location})`,
        actor: 'Admin Sakristi'
      });
    }
  };

  // Copy full recap to clipboard for WhatsApp broadcasting
  const handleCopyRecapWhatsApp = () => {
    if (swapRecapList.length === 0) {
      alert('Belum ada data pertukaran atau penggantian tugas untuk disalin.');
      return;
    }

    let textOut = `*REKAP PERTUKARAN & PENGGANTIAN JADWAL TUGAS*\n*PAROKI SANTO YAKOBUS - SEPTEMBER 2026*\n\n`;
    swapRecapList.forEach((item, idx) => {
      textOut += `${idx + 1}. *${item.displayDate} (${item.massTime})* @ ${item.location}\n`;
      textOut += `   • Jenis: ${item.changeType === 'TUKAR' ? 'Tukar Jadwal (Mutual)' : 'Penggantian Tugas'}\n`;
      textOut += `   • Petugas Asli: ${item.originalOfficerName} ${item.originalOfficerId ? `(#${item.originalOfficerId})` : ''}\n`;
      textOut += `   • Petugas Saat Ini: *${item.currentOfficerName} (#${item.currentOfficerId})*\n`;
      if (item.note) textOut += `   • Keterangan: ${item.note}\n`;
      textOut += `\n`;
    });
    textOut += `_Update otomatis oleh SacristyConnect_`;

    navigator.clipboard.writeText(textOut).then(() => {
      setIsCopiedRecap(true);
      playAudioFeedback('success');
      setTimeout(() => setIsCopiedRecap(false), 3000);
    }).catch(() => {
      alert('Gagal menyalin ke clipboard.');
    });
  };

  const handleProcessMessage = async () => {
    if (!inputMessage.trim()) return;
    setIsProcessing(true);

    try {
      const text = inputMessage;
      setParseError(null);

      // =========================================================================
      // STEP 1: DETECT KEYWORD & INTENT
      // =========================================================================
      const isFormReplace = /petugas\s*:\s*.*digantikan\s*oleh/is.test(text);
      const isMenggantikan = /\bmenggantikan\b|\bmengantikan\b|\bmengganti\b|\bgantikan\b|\bganti\b/i.test(text);
      const isDigantikan = /\bdigantikan\b|\bdiganti\b|\bdigantikan\s+oleh\b|\bdiganti\s+oleh\b/i.test(text);
      const isMutualTukar = /\btukar\s+jadwal\b|\btukar\s+tugas\b|\btukar\b|\bbertukar\b|\bsaling\s+tukar\b|\bswitch\b/i.test(text);

      let mode: 'TUKAR_JADWAL' | 'MENGGANTIKAN' | 'DIGANTIKAN' = 'TUKAR_JADWAL';
      if (isFormReplace || isDigantikan) {
        mode = 'DIGANTIKAN';
      } else if (isMenggantikan) {
        mode = 'MENGGANTIKAN';
      } else if (isMutualTukar) {
        mode = 'TUKAR_JADWAL';
      } else {
        mode = 'TUKAR_JADWAL';
      }

      // =========================================================================
      // STEP 2: EXTRACT OFFICER IDs (via # or Fallback to Names)
      // =========================================================================
      const hashIdMatches = text.match(/#(\d{1,3})/gi) || [];
      let rawNums = hashIdMatches.map(m => parseInt(m.replace(/[^0-9]/g, ''), 10));

      // Fallback: search for no. ID, nomor ID, or standalone numbers if # was omitted
      if (rawNums.length < 2) {
        const fallbackMatches = text.match(/(?:#|no\.?\s*|nomor\s*)(\d{1,3})/gi) || [];
        rawNums = fallbackMatches.map(m => parseInt(m.replace(/[^0-9]/g, ''), 10));
      }

      // If still < 2 numbers, scan text for known officer names
      if (rawNums.length < 2) {
        officers.forEach(off => {
          if (rawNums.length >= 2) return;
          const offIdNum = parseInt(off.id, 10);
          if (rawNums.includes(offIdNum)) return;

          if (off.name && off.name.length > 5 && text.toLowerCase().includes(off.name.toLowerCase())) {
            rawNums.push(offIdNum);
          } else if (off.shortName && off.shortName.length > 5 && text.toLowerCase().includes(off.shortName.toLowerCase())) {
            rawNums.push(offIdNum);
          }
        });
      }

      // Filter out invalid numbers
      rawNums = rawNums.filter(n => n >= 1 && n <= 170);
      rawNums = Array.from(new Set(rawNums));

      if (rawNums.length < 2) {
        const err = {
          title: 'Nomor ID (#) Tidak Lengkap',
          reason: 'Sistem memerlukan minimal 2 nomor petugas yang diawali tanda # (misal: #105 dan #092).',
          fixHint: 'Pastikan pesan memuat nomor petugas dengan tanda pagar, contoh: tukar jadwal #105 ... dengan #092 ...'
        };
        setParseError(err);
        playAudioFeedback('warning');
        if (onAddLog) {
          onAddLog({
            type: 'swap',
            description: `Gagal Proses WA: ${err.title} - ${err.reason}`,
            actor: 'WA Importer (Admin)'
          });
        }
        setIsProcessing(false);
        return;
      }

      const firstNum = rawNums[0];
      const secondNum = rawNums[1];

      const officerFirst = officers.find(o => parseInt(o.id, 10) === firstNum);
      const officerSecond = officers.find(o => parseInt(o.id, 10) === secondNum);

      if (!officerFirst || !officerSecond) {
        const missing = !officerFirst && !officerSecond ? `ID #${firstNum} dan #${secondNum}` : (!officerFirst ? `ID #${firstNum}` : `ID #${secondNum}`);
        const err = {
          title: 'Petugas Tidak Terdaftar',
          reason: `${missing} tidak ditemukan di database 170 petugas Paroki Santo Yakobus.`,
          fixHint: 'Gunakan nomor petugas yang valid antara #001 s/d #170.'
        };
        setParseError(err);
        playAudioFeedback('warning');
        if (onAddLog) {
          onAddLog({
            type: 'swap',
            description: `Gagal Proses WA: ${err.title} - ${err.reason}`,
            actor: 'WA Importer (Admin)'
          });
        }
        setIsProcessing(false);
        return;
      }

      const id1_3 = officerFirst.id.padStart(3, '0');
      const id2_3 = officerSecond.id.padStart(3, '0');
      const name1 = `${officerFirst.name} (#${id1_3})`;
      const name2 = `${officerSecond.name} (#${id2_3})`;

      // =========================================================================
      // STEP 3: EXTRACT DATES, TIMES, & LOCATIONS
      // =========================================================================
      const segClean = text.replace(/\b202[4-9]\b/g, '');

      // Times: e.g. 18:00, 18.00, jam 1800, pukul 0530
      const allTimes: string[] = [];
      const tMatches = Array.from(segClean.matchAll(/(?:jam|pukul)?\s*([01]?\d|2[0-3])[:.]([0-5]\d)/gi));
      tMatches.forEach(m => allTimes.push(`${m[1].padStart(2, '0')}:${m[2]}`));

      // Days: e.g. "13 Sept", "tgl 4", "04 September", "13/9"
      const allDays: number[] = [];
      const dMatches1 = Array.from(segClean.matchAll(/\b0?(\d{1,2})\s*(?:jan|feb|mar|apr|mei|jun|jul|agus|agt|sep|sept|september|okt|nov|des)/gi));
      dMatches1.forEach(m => {
        const v = parseInt(m[1], 10);
        if (v >= 1 && v <= 31 && !allDays.includes(v)) allDays.push(v);
      });
      const dMatches2 = Array.from(segClean.matchAll(/(?:tgl|tanggal|hari)\s*0?(\d{1,2})\b/gi));
      dMatches2.forEach(m => {
        const v = parseInt(m[1], 10);
        if (v >= 1 && v <= 31 && !allDays.includes(v)) allDays.push(v);
      });
      const dMatches3 = Array.from(segClean.matchAll(/\b0?(\d{1,2})[\/\-]0?(\d{1,2})\b/gi));
      dMatches3.forEach(m => {
        const v = parseInt(m[1], 10);
        if (v >= 1 && v <= 31 && !allDays.includes(v)) allDays.push(v);
      });

      // Helper to find slots where an officer is assigned
      const getOfficerAssignedSlots = (targetOff: Officer, dayLimit?: number | null) => {
        const oid = targetOff.id.padStart(3, '0');
        const unp = String(parseInt(targetOff.id, 10));
        return schedule.filter(s => {
          const isAssigned = (s.serverIds || []).some(sid => sid && (sid.padStart(3, '0') === oid || sid === unp)) ||
                             (s.serverNotes || []).some(n => n && (n.includes(oid) || n.includes(unp)));
          if (!isAssigned) return false;
          if (dayLimit !== undefined && dayLimit !== null) {
            const parts = s.date.split('-');
            if (parts.length === 3 && parseInt(parts[2], 10) !== dayLimit) return false;
          }
          return true;
        });
      };

      // =========================================================================
      // STEP 4: EXECUTION - MUTUAL SWAP OR ONE-WAY REPLACEMENT
      // =========================================================================
      let modifiedSlotsCount = 0;

      if (mode === 'TUKAR_JADWAL') {
        // Find slot for officerFirst
        const day1 = allDays[0] || null;
        const day2 = allDays.length > 1 ? allDays[1] : day1;

        let slots1 = getOfficerAssignedSlots(officerFirst, day1);
        if (slots1.length === 0 && day2 !== null && allDays.length > 1) {
          slots1 = getOfficerAssignedSlots(officerFirst, day2);
        }
        if (slots1.length === 0) {
          slots1 = getOfficerAssignedSlots(officerFirst, null);
        }

        let slots2 = getOfficerAssignedSlots(officerSecond, day2);
        if (slots2.length === 0 && day1 !== null && allDays.length > 1) {
          slots2 = getOfficerAssignedSlots(officerSecond, day1);
        }
        if (slots2.length === 0) {
          slots2 = getOfficerAssignedSlots(officerSecond, null);
        }

        if (slots1.length === 0) {
          const err = {
            title: `Petugas #${id1_3} Tidak Memiliki Jadwal Tugas`,
            reason: `Petugas #${id1_3} (${officerFirst.name}) tidak terdaftar dalam jadwal misa yang disebutkan.`,
            fixHint: `Pastikan nomor ID #${id1_3} memiliki jadwal tugas di bulan September 2026.`
          };
          setParseError(err);
          playAudioFeedback('warning');
          if (onAddLog) onAddLog({ type: 'swap', description: `Gagal Tukar: ${err.title}`, actor: 'WA Importer (Admin)' });
          setIsProcessing(false);
          return;
        }

        if (slots2.length === 0) {
          const err = {
            title: `Petugas #${id2_3} Tidak Memiliki Jadwal Tugas`,
            reason: `Petugas #${id2_3} (${officerSecond.name}) tidak terdaftar dalam jadwal misa yang disebutkan.`,
            fixHint: `Pastikan nomor ID #${id2_3} memiliki jadwal tugas di bulan September 2026.`
          };
          setParseError(err);
          playAudioFeedback('warning');
          if (onAddLog) onAddLog({ type: 'swap', description: `Gagal Tukar: ${err.title}`, actor: 'WA Importer (Admin)' });
          setIsProcessing(false);
          return;
        }

        // Refine with times if available
        let slot1 = slots1[0];
        if (allTimes.length > 0) {
          const matchT = slots1.find(s => allTimes.some(t => s.massTime.includes(t)));
          if (matchT) slot1 = matchT;
        }

        let slot2 = slots2.find(s => s.id !== slot1.id) || slots2[0];
        if (allTimes.length > 0) {
          const matchT = slots2.find(s => s.id !== slot1.id && allTimes.some(t => s.massTime.includes(t)));
          if (matchT) slot2 = matchT;
        }

        if (slot1.id === slot2.id) {
          const err = {
            title: 'Kedua Petugas di Sesi yang Sama',
            reason: `Petugas #${id1_3} dan #${id2_3} sudah sama-sama bertugas di sesi ${slot1.displayDate} ${slot1.massTime}.`,
            fixHint: 'Tukar jadwal hanya dapat dilakukan antar sesi misa yang berbeda.'
          };
          setParseError(err);
          playAudioFeedback('warning');
          setIsProcessing(false);
          return;
        }

        // EXECUTE MUTUAL SWAP
        const updatedSchedule = schedule.map(slot => {
          if (slot.id === slot1.id) {
            let targetIdx = (slot.serverIds || []).findIndex(sid => sid && (sid.padStart(3, '0') === id1_3 || sid === String(firstNum)));
            if (targetIdx === -1) {
              targetIdx = (slot.serverNotes || []).findIndex(n => n && (n.includes(id1_3) || n.includes(String(firstNum))));
            }
            if (targetIdx === -1) targetIdx = 0;
            modifiedSlotsCount++;

            const newServerIds = [...slot.serverIds];
            const newServerNames = [...slot.serverNames];
            const newIsSubstituted = [...(slot.isSubstituted || new Array(newServerIds.length).fill(false))];
            const newOriginalNames = [...(slot.originalServerNames || [...slot.serverNames])];
            const newServerNotes = [...(slot.serverNotes || new Array(newServerIds.length).fill(''))];
            const newKoorlapIds = [...(slot.koorlapIds || [])];

            newServerIds[targetIdx] = id2_3;
            newServerNames[targetIdx] = officerSecond.name;
            newIsSubstituted[targetIdx] = true;
            newOriginalNames[targetIdx] = officerFirst.name;
            newServerNotes[targetIdx] = `Tukar Jadwal: #${id1_3} ${officerFirst.name} ⇄ #${id2_3} ${officerSecond.name}`;

            const kIdx = newKoorlapIds.findIndex(kid => kid && (kid.padStart(3, '0') === id1_3 || kid === String(firstNum)));
            if (kIdx !== -1) newKoorlapIds[kIdx] = id2_3;

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

          if (slot.id === slot2.id) {
            let targetIdx = (slot.serverIds || []).findIndex(sid => sid && (sid.padStart(3, '0') === id2_3 || sid === String(secondNum)));
            if (targetIdx === -1) {
              targetIdx = (slot.serverNotes || []).findIndex(n => n && (n.includes(id2_3) || n.includes(String(secondNum))));
            }
            if (targetIdx === -1) targetIdx = 0;
            modifiedSlotsCount++;

            const newServerIds = [...slot.serverIds];
            const newServerNames = [...slot.serverNames];
            const newIsSubstituted = [...(slot.isSubstituted || new Array(newServerIds.length).fill(false))];
            const newOriginalNames = [...(slot.originalServerNames || [...slot.serverNames])];
            const newServerNotes = [...(slot.serverNotes || new Array(newServerIds.length).fill(''))];
            const newKoorlapIds = [...(slot.koorlapIds || [])];

            newServerIds[targetIdx] = id1_3;
            newServerNames[targetIdx] = officerFirst.name;
            newIsSubstituted[targetIdx] = true;
            newOriginalNames[targetIdx] = officerSecond.name;
            newServerNotes[targetIdx] = `Tukar Jadwal: #${id2_3} ${officerSecond.name} ⇄ #${id1_3} ${officerFirst.name}`;

            const kIdx = newKoorlapIds.findIndex(kid => kid && (kid.padStart(3, '0') === id2_3 || kid === String(secondNum)));
            if (kIdx !== -1) newKoorlapIds[kIdx] = id1_3;

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

          return slot;
        });

        onUpdateSchedule(updatedSchedule);

        const swapDesc = `Tukar Jadwal: #${id1_3} ${officerFirst.name} (${slot1.displayDate} ${slot1.massTime}) ⇄ #${id2_3} ${officerSecond.name} (${slot2.displayDate} ${slot2.massTime})`;
        setDetectedChange({
          original: `${officerFirst.name} (#${id1_3})`,
          pengganti: `${officerSecond.name} (#${id2_3})`,
          tanggal: slot1.date === slot2.date ? slot1.displayDate : `${slot1.displayDate} ⇄ ${slot2.displayDate}`,
          jamMisa: `${slot1.massTime} ⇄ ${slot2.massTime}`,
          lokasi: `${slot1.location} ⇄ ${slot2.location}`,
          action: 'Tukar Jadwal (Mutual Switch)',
          swapType: 'TUKAR',
          detailNotes: `Saling Bertukar Jadwal:\n• #${id1_3} ${officerFirst.name} kini bertugas pada ${slot2.displayDate} ${slot2.massTime} (${slot2.location})\n• #${id2_3} ${officerSecond.name} kini bertugas pada ${slot1.displayDate} ${slot1.massTime} (${slot1.location})`
        });

        if (onAddLog) {
          onAddLog({
            type: 'swap',
            description: swapDesc,
            actor: 'WA Importer (Admin)'
          });
        }

      } else {
        // ONE-WAY REPLACEMENT: One officer is original (digantikan), one is pengganti (menggantikan)
        let origOfficer: Officer;
        let replOfficer: Officer;

        if (mode === 'MENGGANTIKAN') {
          replOfficer = officerFirst;
          origOfficer = officerSecond;
        } else {
          origOfficer = officerFirst;
          replOfficer = officerSecond;
        }

        // Reality Check against schedule:
        // Does origOfficer actually hold a slot on the specified date?
        const day = allDays[0] || null;
        let origSlots = getOfficerAssignedSlots(origOfficer, day);
        let replSlots = getOfficerAssignedSlots(replOfficer, day);

        // If origOfficer has NO slots on that day, but replOfficer DOES have a slot on that day,
        // then the user wrote the names in inverted order! Automatically flip to the correct one!
        if (origSlots.length === 0 && replSlots.length > 0) {
          const temp = origOfficer;
          origOfficer = replOfficer;
          replOfficer = temp;
          origSlots = replSlots;
        }

        if (origSlots.length === 0) {
          // Fallback to entire month
          origSlots = getOfficerAssignedSlots(origOfficer, null);
        }

        if (origSlots.length === 0) {
          const err = {
            title: `Petugas #${origOfficer.id.padStart(3, '0')} Tidak Memiliki Jadwal`,
            reason: `Petugas #${origOfficer.id.padStart(3, '0')} (${origOfficer.name}) yang akan digantikan tidak terdaftar dalam jadwal tugas misa mana pun.`,
            fixHint: `Periksa kembali nomor ID petugas yang akan digantikan.`
          };
          setParseError(err);
          playAudioFeedback('warning');
          if (onAddLog) onAddLog({ type: 'swap', description: `Gagal Ganti: ${err.title}`, actor: 'WA Importer (Admin)' });
          setIsProcessing(false);
          return;
        }

        let targetSlot = origSlots[0];
        if (allTimes.length > 0) {
          const matchT = origSlots.find(s => allTimes.some(t => s.massTime.includes(t)));
          if (matchT) targetSlot = matchT;
        }

        const origId_3 = origOfficer.id.padStart(3, '0');
        const replId_3 = replOfficer.id.padStart(3, '0');

        // EXECUTE REPLACEMENT
        const updatedSchedule = schedule.map(slot => {
          if (slot.id === targetSlot.id) {
            let targetIdx = (slot.serverIds || []).findIndex(sid => sid && (sid.padStart(3, '0') === origId_3 || sid === String(parseInt(origOfficer.id, 10))));
            if (targetIdx === -1) {
              targetIdx = (slot.serverNotes || []).findIndex(n => n && (n.includes(origId_3) || n.includes(String(parseInt(origOfficer.id, 10)))));
            }
            if (targetIdx === -1) targetIdx = 0;
            modifiedSlotsCount++;

            const newServerIds = [...slot.serverIds];
            const newServerNames = [...slot.serverNames];
            const newIsSubstituted = [...(slot.isSubstituted || new Array(newServerIds.length).fill(false))];
            const newOriginalNames = [...(slot.originalServerNames || [...slot.serverNames])];
            const newServerNotes = [...(slot.serverNotes || new Array(newServerIds.length).fill(''))];
            const newKoorlapIds = [...(slot.koorlapIds || [])];

            newServerIds[targetIdx] = replId_3;
            newServerNames[targetIdx] = replOfficer.name;
            newIsSubstituted[targetIdx] = true;
            newOriginalNames[targetIdx] = origOfficer.name;
            newServerNotes[targetIdx] = `Menggantikan: #${origId_3} ${origOfficer.name}`;

            const kIdx = newKoorlapIds.findIndex(kid => kid && (kid.padStart(3, '0') === origId_3 || kid === String(parseInt(origOfficer.id, 10))));
            if (kIdx !== -1) newKoorlapIds[kIdx] = replId_3;

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
          return slot;
        });

        onUpdateSchedule(updatedSchedule);

        const repDesc = `Penggantian Tugas: #${replId_3} ${replOfficer.name} menggantikan #${origId_3} ${origOfficer.name} pada ${targetSlot.displayDate} ${targetSlot.massTime} (${targetSlot.location})`;
        setDetectedChange({
          original: `${origOfficer.name} (#${origId_3})`,
          pengganti: `${replOfficer.name} (#${replId_3})`,
          tanggal: targetSlot.displayDate,
          jamMisa: targetSlot.massTime,
          lokasi: targetSlot.location,
          action: 'Penggantian Tugas (One-Way Replacement)',
          swapType: 'DIGANTIKAN',
          detailNotes: `PENGGANTIAN TUGAS:\n• #${replId_3} ${replOfficer.name} menggantikan #${origId_3} ${origOfficer.name} pada ${targetSlot.displayDate} jam ${targetSlot.massTime} (${targetSlot.location}).\n• Data kehadiran dan otorisasi sesi dialihkan ke petugas pengganti.`
        });

        if (onAddLog) {
          onAddLog({
            type: 'swap',
            description: repDesc,
            actor: 'WA Importer (Admin)'
          });
        }
      }

      // Add to Live Feed Message Bubble
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

      setImportLogText(
        `✅ Berhasil memproses [${detectedChange.action}]. Sebanyak ${modifiedSlotsCount} sesi jadwal misa telah disinkronkan secara otomatis.`
      );
      playAudioFeedback('success');
    } catch (err) {
      console.error('Error processing WA message:', err);
      const errObj = {
        title: 'Gagal Memproses Permintaan',
        reason: (err as Error)?.message || 'Terjadi kendala saat memproses permohonan jadwal.',
        fixHint: 'Pastikan format penulisan memuat nomor petugas dengan tanda # (misal: #105 dan #092) dan tanggal misa yang valid.'
      };
      setParseError(errObj);
      playAudioFeedback('warning');
      if (onAddLog) {
        onAddLog({
          type: 'swap',
          description: `Gagal Proses WA: ${errObj.title} - ${errObj.reason}`,
          actor: 'WA Importer (Admin)'
        });
      }
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
                    onClick={() => { setInputMessage(PRESET_REAL_TUKAR); setParseError(null); }}
                    className="px-2.5 py-2 bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#5B1414] border border-[#D9CEBA] rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 text-left cursor-pointer shadow-2xs"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-[#7c191e] shrink-0" />
                    <span>Contoh 1: Tukar #105 ⇄ #092 (13 Sep)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setInputMessage(PRESET_MENGGANTIKAN); setParseError(null); }}
                    className="px-2.5 py-2 bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#5B1414] border border-[#D9CEBA] rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 text-left cursor-pointer shadow-2xs"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Contoh 2: #168 Menggantikan #067 (4 Sep)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setInputMessage(PRESET_REAL_REPLACE); setParseError(null); }}
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-[10px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCw className="w-3 h-3 text-slate-500" />
                    <span>Format Form: Digantikan Oleh</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setInputMessage(PRESET_TUKAR); setParseError(null); }}
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
                  onChange={(e) => { setInputMessage(e.target.value); if (parseError) setParseError(null); }}
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

                {parseError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl space-y-1.5 animate-fadeIn">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 uppercase tracking-wide">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{parseError.title}</span>
                    </div>
                    <p className="text-xs text-rose-950 leading-relaxed font-medium">
                      ❌ {parseError.reason}
                    </p>
                    <p className="text-[11px] text-rose-800 bg-rose-100/70 p-2 rounded-lg leading-relaxed font-medium">
                      💡 <strong>Solusi:</strong> {parseError.fixHint}
                    </p>
                  </div>
                )}
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

            {/* Box 2: Rekap Pertukaran & Pergantian Tugas (Replaces Jadwal Hari Ini) */}
            <div className="bg-white border border-[#e6ded2] rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#7c191e]">
                  <ArrowRightLeft className="w-4 h-4 text-[#7c191e]" />
                  <span className="font-serif text-base">Rekap Pertukaran &amp; Pergantian Tugas</span>
                  <span className="ml-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF7F2] text-[#5B1414] border border-[#D9CEBA]">
                    {swapRecapList.length} Perubahan
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyRecapWhatsApp}
                    className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#5B1414] border border-[#D9CEBA] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {isCopiedRecap ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopiedRecap ? 'Tersalin ke Clipboard!' : 'Salin Rekap ke WhatsApp'}</span>
                  </button>
                </div>
              </div>

              {/* Filter tabs & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[
                    { key: 'all', label: `Semua (${swapRecapList.length})` },
                    { key: 'tukar', label: `Tukar Jadwal (${swapRecapList.filter(r => r.changeType === 'TUKAR').length})` },
                    { key: 'penggantian', label: `Penggantian (${swapRecapList.filter(r => r.changeType === 'PENGGANTIAN').length})` }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setRecapFilter(tab.key as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        recapFilter === tab.key
                          ? 'bg-[#5B1414] text-white shadow-xs'
                          : 'bg-[#FAF7F2] text-[#6E5A4B] hover:bg-[#F3EDE2] border border-[#D9CEBA]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#8C7662] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={recapSearch}
                    onChange={e => setRecapSearch(e.target.value)}
                    placeholder="Cari nama, ID, tgl..."
                    className="pl-8 pr-3 py-1.5 bg-[#FAF7F2] border border-[#D9CEBA] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#5B1414] outline-none w-full sm:w-64"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-[#eee6da] rounded-xl">
                <table className="w-full text-left text-xs text-[#3b342e]">
                  <thead className="bg-[#f7f3eb] text-[#554d44] border-b border-[#eee6da] font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-4 py-2.5">TANGGAL &amp; JAM MISA</th>
                      <th className="px-4 py-2.5">LOKASI</th>
                      <th className="px-4 py-2.5 text-center">TIPE</th>
                      <th className="px-4 py-2.5">PETUGAS ASLI</th>
                      <th className="px-4 py-2.5">PETUGAS PENGGANTI</th>
                      <th className="px-4 py-2.5">KETERANGAN</th>
                      <th className="px-4 py-2.5 text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2ecdf]">
                    {filteredRecapList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-[#8C7662]">
                          <div className="max-w-xs mx-auto space-y-1">
                            <p className="font-bold text-sm text-[#5B1414]">Belum Ada Perubahan</p>
                            <p className="text-xs">
                              {recapSearch ? 'Tidak ada data perubahan yang sesuai dengan pencarian.' : 'Belum ada pertukaran atau penggantian tugas. Tempel pesan WA di atas untuk mulai memproses.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredRecapList.map((row) => (
                        <tr key={row.id} className="hover:bg-[#faf7f0] transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-[#1a140e]">
                            <span className="block text-[#2C2420] font-sans font-extrabold">{row.displayDate.split(',')[0]}, {row.displayDate.split(',')[1]}</span>
                            <span className="text-[11px] text-[#7c191e]">⏰ {row.massTime}</span>
                          </td>
                          <td className="px-4 py-3 text-[#554d44]">
                            <span className="font-semibold">{row.location}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              row.changeType === 'TUKAR'
                                ? 'bg-purple-50 text-purple-900 border-purple-200'
                                : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                            }`}>
                              {row.changeType === 'TUKAR' ? '⇄ Tukar' : '➔ Ganti'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-[#6E5A4B]">
                            <span className="line-through decoration-[#7c191e]/50 opacity-80 block">{row.originalOfficerName}</span>
                            {row.originalOfficerId && (
                              <span className="font-mono text-[10px] text-[#8C7662]">No. #{row.originalOfficerId}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-bold text-emerald-800">
                            <span className="block">{row.currentOfficerName}</span>
                            <span className="font-mono text-[10px] text-emerald-600">No. #{row.currentOfficerId}</span>
                          </td>
                          <td className="px-4 py-3 text-[#6E5A4B] text-[11px]">
                            {row.note}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRevertSwap(row)}
                              title="Batalkan perubahan dan kembalikan ke petugas asli"
                              className="px-2.5 py-1 bg-white hover:bg-red-50 text-red-700 border border-red-200 hover:border-red-400 rounded-lg text-[10px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <Undo2 className="w-3 h-3" />
                              <span>Reset</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
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
