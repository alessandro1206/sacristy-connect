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

  const [inputMessage, setInputMessage] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(WA_STORAGE.INPUT);
      if (saved) return saved;
    } catch {}
    return PRESET_REAL_TUKAR;
  });

  const [parseError, setParseError] = useState<{ title: string; reason: string; fixHint: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

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
      detailNotes: 'Bpk. Hengky (#105) bertukar jadwal dari Kapel John Paul II (17:00) dengan Bpk. Widyanto (#092) di Gereja Utama (18:00).'
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

  // Dynamically compute the swapped/substituted rows from the active real schedule
  const todayRows: TodayScheduleRow[] = useMemo(() => {
    const list: TodayScheduleRow[] = [];
    (schedule || []).forEach(slot => {
      if (slot.isSubstituted && slot.isSubstituted.some(Boolean)) {
        slot.isSubstituted.forEach((sub, idx) => {
          if (sub) {
            const origName = slot.originalServerNames?.[idx] || 'Petugas Asli';
            const currName = slot.serverNames[idx] || 'Petugas Pengganti';
            const currId = slot.serverIds[idx] ? `(#${slot.serverIds[idx].padStart(3, '0')})` : '';
            list.push({
              id: `${slot.id}-${idx}`,
              jamMisa: `${slot.displayDate.split(',')[1]?.trim() || slot.displayDate} (${slot.massTime})`,
              lokasi: slot.location,
              petugasOriginal: origName,
              petugasPengganti: `${currName} ${currId}`,
              status: 'Swapped'
            });
          }
        });
      }
    });

    // If no swapped slots exist yet, show initial upcoming slots
    if (list.length === 0) {
      (schedule || []).slice(0, 3).forEach(slot => {
        list.push({
          id: slot.id,
          jamMisa: `${slot.displayDate.split(',')[1]?.trim() || slot.displayDate} (${slot.massTime})`,
          lokasi: slot.location,
          petugasOriginal: slot.serverNames[0] ? `${slot.serverNames[0]} (#${(slot.serverIds[0] || '').padStart(3, '0')})` : 'Belum Terisi',
          petugasPengganti: null,
          status: 'Terjadwal'
        });
      });
    }
    return list;
  }, [schedule]);

  const handleProcessMessage = async () => {
    if (!inputMessage.trim()) return;
    setIsProcessing(true);

    try {
      const text = inputMessage;
      setParseError(null);

      // =========================================================================
      // STEP 1: DETECT KEYWORD ("tukar jadwal", "menggantikan", "digantikan")
      // =========================================================================
      let mode: 'TUKAR_JADWAL' | 'MENGGANTIKAN' | 'DIGANTIKAN' = 'TUKAR_JADWAL';
      if (/\bmenggantikan\b|\bmengantikan\b/i.test(text)) {
        mode = 'MENGGANTIKAN';
      } else if (/\bdigantikan\b|\bdiganti\b/i.test(text)) {
        mode = 'DIGANTIKAN';
      } else if (/\btukar\s+jadwal\b|\btukar\b|\bbertukar\b|\bsaling\s+tukar\b|\bswitch\b/i.test(text)) {
        mode = 'TUKAR_JADWAL';
      } else {
        mode = 'TUKAR_JADWAL';
      }

      // =========================================================================
      // STEP 2: FIND THE NUMBERS WHICH BEGIN WITH #
      // =========================================================================
      const hashIdMatches = text.match(/#(\d{1,3})/gi) || [];
      let rawNums = hashIdMatches.map(m => parseInt(m.replace(/[^0-9]/g, ''), 10));

      // Fallback: search for no. ID, nomor ID, or standalone numbers if # was omitted
      if (rawNums.length < 2) {
        const fallbackMatches = text.match(/(?:#|no\.?\s*|nomor\s*)(\d{1,3})/gi) || [];
        rawNums = fallbackMatches.map(m => parseInt(m.replace(/[^0-9]/g, ''), 10));
      }
      if (rawNums.length < 2) {
        const stripped = text
          .replace(/\b202[4-9]\b/g, '')
          .replace(/(?:jam|pukul)?\s*([01]?\d|2[0-3])[:.]([0-5]\d)/gi, '')
          .replace(/(?:jam|pukul)\s*([01]\d|2[0-3])([0-5]\d)/gi, '')
          .replace(/(?:tgl|tanggal|hari)?\s*0?\d{1,2}\s*(?:jan|feb|mar|apr|mei|jun|jul|agus|agt|sep|sept|september|okt|nov|des)/gi, '');
        const standalones = (stripped.match(/\b(\d{1,3})\b/g) || []).map(n => parseInt(n, 10)).filter(n => n >= 1 && n <= 170);
        rawNums = Array.from(new Set([...rawNums, ...standalones]));
      }

      if (rawNums.length < 2) {
        setParseError({
          title: 'Nomor ID (#) Tidak Lengkap',
          reason: 'Sistem memerlukan minimal 2 nomor petugas yang diawali tanda # (misal: #24 dan #56).',
          fixHint: 'Pastikan pesan memuat nomor petugas dengan tanda pagar, contoh: tukar jadwal #24 ... dengan #56 ...'
        });
        playAudioFeedback('warning');
        setIsProcessing(false);
        return;
      }

      const firstNum = rawNums[0];
      const secondNum = rawNums[1];

      const officerFirst = officers.find(o => parseInt(o.id, 10) === firstNum);
      const officerSecond = officers.find(o => parseInt(o.id, 10) === secondNum);

      if (!officerFirst || !officerSecond) {
        const missing = !officerFirst && !officerSecond ? `ID #${firstNum} dan #${secondNum}` : (!officerFirst ? `ID #${firstNum}` : `ID #${secondNum}`);
        setParseError({
          title: 'Petugas Tidak Terdaftar',
          reason: `${missing} tidak ditemukan di database 170 petugas Paroki Santo Yakobus.`,
          fixHint: 'Gunakan nomor petugas yang valid antara #001 s/d #170.'
        });
        playAudioFeedback('warning');
        setIsProcessing(false);
        return;
      }

      const id1_3 = officerFirst.id.padStart(3, '0');
      const id2_3 = officerSecond.id.padStart(3, '0');
      const name1 = `${officerFirst.name} (#${id1_3})`;
      const name2 = `${officerSecond.name} (#${id2_3})`;

      // =========================================================================
      // STEP 3: CHECK THE DATE WRITTEN WITH THE CURRENT SCHEDULE
      // =========================================================================
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

      // Extract details for segment A and segment B if mutual swap
      let dtFirst = { dayNum: null as number | null, timeStr: null as string | null, locStr: null as string | null };
      let dtSecond = { dayNum: null as number | null, timeStr: null as string | null, locStr: null as string | null };

      if (mode === 'TUKAR_JADWAL') {
        const splitMatch = text.match(/(?:\n|\b)(?:tukar\s+dgn|tukar\s+dengan|tukar\s+sama|tukar\s+ke|tukar\s+sama\s+pak|dgn\s+pak|dengan\s+pak|tukar|dgn|dengan)(?:\s*:|\s+)/i);
        if (splitMatch && splitMatch.index !== undefined) {
          const seg1 = text.slice(0, splitMatch.index).trim();
          const seg2 = text.slice(splitMatch.index + splitMatch[0].length).trim();
          dtFirst = extractDateTimeLoc(seg1);
          dtSecond = extractDateTimeLoc(seg2);
        } else {
          dtFirst = extractDateTimeLoc(text);
          dtSecond = dtFirst;
        }
      } else {
        const dtAll = extractDateTimeLoc(text);
        dtFirst = dtAll;
        dtSecond = dtAll;
      }

      // Strict Slot Finder: Searches ONLY where targetOfficer is assigned
      const findOfficerDutySlot = (
        targetOfficer: Officer,
        dNum: number | null,
        tStr: string | null,
        lStr: string | null,
        excludeSlotId?: string
      ): { slot: ScheduleSlot | null; error?: { title: string; reason: string; fixHint: string } } => {
        const oid = targetOfficer.id.padStart(3, '0');
        const unpadded = String(parseInt(targetOfficer.id, 10));
        
        // Find all slots where targetOfficer is assigned
        let candidates = schedule.filter(s => 
          ((s.serverIds || []).some(sid => sid && (sid.padStart(3, '0') === oid || sid === unpadded)) ||
           (s.serverNotes || []).some(note => note && (note.includes(oid) || note.includes(unpadded)))) &&
          (!excludeSlotId || s.id !== excludeSlotId)
        );

        if (candidates.length === 0) {
          return {
            slot: null,
            error: {
              title: `Petugas #${oid} Tidak Memiliki Jadwal Tugas`,
              reason: `Petugas #${oid} (${targetOfficer.name}) tidak terdaftar dalam jadwal tugas misa mana pun di bulan September 2026.`,
              fixHint: `Periksa kembali nomor ID petugas (apakah benar #${oid} ${targetOfficer.name} atau nomor petugas lain).`
            }
          };
        }

        if (dNum) {
          const dayMatches = candidates.filter(s => {
            const parts = s.date.split('-');
            return parts.length === 3 && parseInt(parts[2], 10) === dNum;
          });
          if (dayMatches.length === 0) {
            // Find who is actually scheduled on dNum to provide helpful guidance
            const slotOnDay = schedule.find(s => {
              const parts = s.date.split('-');
              return parts.length === 3 && parseInt(parts[2], 10) === dNum && (!tStr || s.massTime.includes(tStr));
            });
            const scheduledList = slotOnDay && slotOnDay.serverIds && slotOnDay.serverNames
              ? slotOnDay.serverIds.map((sid, idx) => `#${sid} ${slotOnDay.serverNames[idx] || ''}`).join(', ')
              : 'Tidak ada data';
            return {
              slot: null,
              error: {
                title: `Petugas #${oid} Tidak Terjadwal pada Tanggal ${dNum} Sep`,
                reason: `Petugas #${oid} (${targetOfficer.name}) TIDAK terdaftar bertugas pada tanggal ${dNum} September 2026. Petugas yang bertugas pada sesi tersebut adalah: ${scheduledList}.`,
                fixHint: `Periksa kembali nomor ID petugas yang dimasukkan (misal jika ingin mengganti/menukar petugas ${scheduledList}, gunakan nomor ID petugas tersebut).`
              }
            };
          }
          candidates = dayMatches;
        }

        if (tStr) {
          const timeMatches = candidates.filter(s => s.massTime.replace(' WIB', '').includes(tStr));
          if (timeMatches.length > 0) candidates = timeMatches;
        }

        if (lStr) {
          const locMatches = candidates.filter(s => s.location.toLowerCase().includes(lStr.toLowerCase()));
          if (locMatches.length > 0) candidates = locMatches;
        }

        if (candidates.length > 0) {
          return { slot: candidates[0] };
        }

        return {
          slot: null,
          error: {
            title: `Sesi Misa Petugas #${oid} Tidak Cocok`,
            reason: `Tidak ditemukan sesi misa yang cocok untuk Petugas #${oid} (${targetOfficer.name}) pada jam/lokasi yang dicantumkan.`,
            fixHint: `Pastikan tanggal, jam misa, dan lokasi sesuai dengan jadwal tugas Petugas #${oid}.`
          }
        };
      };

      // =========================================================================
      // STEP 4: CONDITIONAL EXECUTION (STRICTLY BY NUMBER ID)
      // =========================================================================
      let modifiedSlotsCount = 0;

      if (mode === 'TUKAR_JADWAL') {
        // -----------------------------------------------------------------------
        // RULE 4A: if "tukar jadwal" do swapped the schedule
        // -----------------------------------------------------------------------
        const res1 = findOfficerDutySlot(officerFirst, dtFirst.dayNum, dtFirst.timeStr, dtFirst.locStr);
        if (!res1.slot) {
          setParseError(res1.error || {
            title: `Petugas #${id1_3} Tidak Terjadwal`,
            reason: `Petugas #${id1_3} (${officerFirst.name}) tidak terdaftar pada sesi misa tersebut.`,
            fixHint: 'Periksa kembali nomor petugas dan tanggal misa.'
          });
          playAudioFeedback('warning');
          setIsProcessing(false);
          return;
        }
        const slot1 = res1.slot;

        const res2 = findOfficerDutySlot(officerSecond, dtSecond.dayNum, dtSecond.timeStr, dtSecond.locStr, slot1.id);
        if (!res2.slot) {
          setParseError(res2.error || {
            title: `Petugas #${id2_3} Tidak Terjadwal`,
            reason: `Petugas #${id2_3} (${officerSecond.name}) tidak terdaftar pada sesi misa tersebut.`,
            fixHint: 'Periksa kembali nomor petugas dan tanggal misa.'
          });
          playAudioFeedback('warning');
          setIsProcessing(false);
          return;
        }
        const slot2 = res2.slot;

        const effTime1 = slot1.massTime;
        const effTime2 = slot2.massTime;
        const effLoc1 = slot1.location;
        const effLoc2 = slot2.location;
        const effDate1 = slot1.displayDate;
        const effDate2 = slot2.displayDate;

        const updatedSchedule = schedule.map(slot => {
          // In Slot 1: Replace First #number with Second #number
          if (slot.id === slot1.id) {
            let targetIdx = (slot.serverIds || []).findIndex(sid => sid && sid.padStart(3, '0') === id1_3);
            if (targetIdx === -1) {
              targetIdx = (slot.serverNotes || []).findIndex(note => note && (note.includes(id1_3) || note.includes(String(firstNum))));
            }
            if (targetIdx === -1) targetIdx = 0;
            modifiedSlotsCount++;

            const newServerIds = [...slot.serverIds];
            const newServerNames = [...slot.serverNames];
            const newIsSubstituted = [...(slot.isSubstituted || new Array(newServerIds.length).fill(false))];
            const newOriginalNames = [...(slot.originalServerNames || [...slot.serverNames])];
            const newServerNotes = [...(slot.serverNotes || new Array(newServerIds.length).fill(null))];
            const newKoorlapIds = [...(slot.koorlapIds || [])];

            newServerIds[targetIdx] = id2_3;
            newServerNames[targetIdx] = officerSecond.name;
            newIsSubstituted[targetIdx] = true;
            newOriginalNames[targetIdx] = officerFirst.name;
            newServerNotes[targetIdx] = `Tukar Jadwal: #${id1_3} ${officerFirst.name}`;

            const kIdx = newKoorlapIds.findIndex(kid => kid.padStart(3, '0') === id1_3);
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

          // In Slot 2: Replace Second #number with First #number
          if (slot.id === slot2.id) {
            let targetIdx = (slot.serverIds || []).findIndex(sid => sid && sid.padStart(3, '0') === id2_3);
            if (targetIdx === -1) {
              targetIdx = (slot.serverNotes || []).findIndex(note => note && (note.includes(id2_3) || note.includes(String(secondNum))));
            }
            if (targetIdx === -1) targetIdx = 0;
            modifiedSlotsCount++;

            const newServerIds = [...slot.serverIds];
            const newServerNames = [...slot.serverNames];
            const newIsSubstituted = [...(slot.isSubstituted || new Array(newServerIds.length).fill(false))];
            const newOriginalNames = [...(slot.originalServerNames || [...slot.serverNames])];
            const newServerNotes = [...(slot.serverNotes || new Array(newServerIds.length).fill(null))];
            const newKoorlapIds = [...(slot.koorlapIds || [])];

            newServerIds[targetIdx] = id1_3;
            newServerNames[targetIdx] = officerFirst.name;
            newIsSubstituted[targetIdx] = true;
            newOriginalNames[targetIdx] = officerSecond.name;
            newServerNotes[targetIdx] = `Tukar Jadwal: #${id2_3} ${officerSecond.name}`;

            const kIdx = newKoorlapIds.findIndex(kid => kid.padStart(3, '0') === id2_3);
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

        setDetectedChange({
          original: name1,
          pengganti: name2,
          tanggal: slot1.date !== slot2.date ? `${effDate1} ⇄ ${effDate2}` : effDate1,
          jamMisa: `${effTime1} ⇄ ${effTime2}`,
          lokasi: `${effLoc1} ⇄ ${effLoc2}`,
          action: 'Tukar Jadwal (Mutual Switch)',
          swapType: 'TUKAR',
          detailNotes: `TUKAR JADWAL:\n• ${name1} bertukar jadwal dari (${effDate1}, ${effTime1} @ ${effLoc1}) ke (${effDate2}, ${effTime2} @ ${effLoc2}).\n• ${name2} bertukar jadwal dari (${effDate2}, ${effTime2} @ ${effLoc2}) ke (${effDate1}, ${effTime1} @ ${effLoc1}).`
        });

      } else if (mode === 'MENGGANTIKAN') {
        // -----------------------------------------------------------------------
        // RULE 4B: if "menggantikan" do erase the date from second #number and add to the first #number
        // -----------------------------------------------------------------------
        const res = findOfficerDutySlot(officerSecond, dtSecond.dayNum, dtSecond.timeStr, dtSecond.locStr);
        if (!res.slot) {
          setParseError(res.error || {
            title: `Petugas #${id2_3} Tidak Terjadwal`,
            reason: `Petugas #${id2_3} (${officerSecond.name}) yang ingin digantikan tidak memiliki jadwal tugas pada tanggal tersebut.`,
            fixHint: 'Periksa kembali nomor ID petugas yang digantikan dan tanggal tugasnya.'
          });
          playAudioFeedback('warning');
          setIsProcessing(false);
          return;
        }
        const targetSlot = res.slot;

        const effTime = targetSlot.massTime;
        const effLoc = targetSlot.location;
        const effDate = targetSlot.displayDate;

        const updatedSchedule = schedule.map(slot => {
          if (slot.id === targetSlot.id) {
            // Erase second #number and add first #number strictly by ID
            let targetIdx = (slot.serverIds || []).findIndex(sid => sid && sid.padStart(3, '0') === id2_3);
            if (targetIdx === -1) {
              targetIdx = (slot.serverNotes || []).findIndex(note => note && (note.includes(id2_3) || note.includes(String(secondNum))));
            }
            if (targetIdx === -1) targetIdx = 0;
            modifiedSlotsCount++;

            const newServerIds = [...slot.serverIds];
            const newServerNames = [...slot.serverNames];
            const newIsSubstituted = [...(slot.isSubstituted || new Array(newServerIds.length).fill(false))];
            const newOriginalNames = [...(slot.originalServerNames || [...slot.serverNames])];
            const newServerNotes = [...(slot.serverNotes || new Array(newServerIds.length).fill(null))];
            const newKoorlapIds = [...(slot.koorlapIds || [])];

            newServerIds[targetIdx] = id1_3;
            newServerNames[targetIdx] = officerFirst.name;
            newIsSubstituted[targetIdx] = true;
            newOriginalNames[targetIdx] = officerSecond.name;
            newServerNotes[targetIdx] = `Menggantikan: #${id2_3} ${officerSecond.name}`;

            const kIdx = newKoorlapIds.findIndex(kid => kid.padStart(3, '0') === id2_3);
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

        setDetectedChange({
          original: name2,
          pengganti: name1,
          tanggal: effDate,
          jamMisa: effTime,
          lokasi: effLoc,
          action: 'Menggantikan (One-Way Replacement)',
          swapType: 'DIGANTIKAN',
          detailNotes: `MENGGANTIKAN TUGAS:\n• ${name1} menggantikan tugas ${name2} pada sesi (${effDate}, ${effTime} @ ${effLoc}).\n• Petugas #${id2_3} dihapus dari sesi tersebut dan digantikan oleh #${id1_3}.`
        });

      } else if (mode === 'DIGANTIKAN') {
        // -----------------------------------------------------------------------
        // RULE 4C: if "digantikan" do erase the date from first #number and add to the second #number
        // -----------------------------------------------------------------------
        const res = findOfficerDutySlot(officerFirst, dtFirst.dayNum, dtFirst.timeStr, dtFirst.locStr);
        if (!res.slot) {
          setParseError(res.error || {
            title: `Petugas #${id1_3} Tidak Terjadwal`,
            reason: `Petugas #${id1_3} (${officerFirst.name}) yang ingin digantikan tidak memiliki jadwal tugas pada tanggal tersebut.`,
            fixHint: 'Periksa kembali nomor ID petugas yang digantikan dan tanggal tugasnya.'
          });
          playAudioFeedback('warning');
          setIsProcessing(false);
          return;
        }
        const targetSlot = res.slot;

        const effTime = targetSlot.massTime;
        const effLoc = targetSlot.location;
        const effDate = targetSlot.displayDate;

        const updatedSchedule = schedule.map(slot => {
          if (slot.id === targetSlot.id) {
            // Erase first #number and add second #number strictly by ID
            let targetIdx = (slot.serverIds || []).findIndex(sid => sid && sid.padStart(3, '0') === id1_3);
            if (targetIdx === -1) {
              targetIdx = (slot.serverNotes || []).findIndex(note => note && (note.includes(id1_3) || note.includes(String(firstNum))));
            }
            if (targetIdx === -1) targetIdx = 0;
            modifiedSlotsCount++;

            const newServerIds = [...slot.serverIds];
            const newServerNames = [...slot.serverNames];
            const newIsSubstituted = [...(slot.isSubstituted || new Array(newServerIds.length).fill(false))];
            const newOriginalNames = [...(slot.originalServerNames || [...slot.serverNames])];
            const newServerNotes = [...(slot.serverNotes || new Array(newServerIds.length).fill(null))];
            const newKoorlapIds = [...(slot.koorlapIds || [])];

            newServerIds[targetIdx] = id2_3;
            newServerNames[targetIdx] = officerSecond.name;
            newIsSubstituted[targetIdx] = true;
            newOriginalNames[targetIdx] = officerFirst.name;
            newServerNotes[targetIdx] = `Digantikan: #${id2_3} ${officerSecond.name}`;

            const kIdx = newKoorlapIds.findIndex(kid => kid.padStart(3, '0') === id1_3);
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
          return slot;
        });

        onUpdateSchedule(updatedSchedule);

        setDetectedChange({
          original: name1,
          pengganti: name2,
          tanggal: effDate,
          jamMisa: effTime,
          lokasi: effLoc,
          action: 'Digantikan (One-Way Replacement)',
          swapType: 'DIGANTIKAN',
          detailNotes: `DIGANTIKAN:\n• ${name1} pada sesi (${effDate}, ${effTime} @ ${effLoc}) digantikan oleh ${name2}.\n• Petugas #${id1_3} dihapus dari sesi tersebut dan digantikan oleh #${id2_3}.`
        });
      }

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

      const modeLabel = mode === 'TUKAR_JADWAL' 
        ? 'Tukar Jadwal (Mutual Switch)' 
        : (mode === 'MENGGANTIKAN' ? 'Menggantikan (One-Way Replacement)' : 'Digantikan (One-Way Replacement)');

      onAddLog({
        type: 'swap',
        description: `WA ${modeLabel}: ${name1} ⇄ ${name2} - ${modifiedSlotsCount} slot berhasil disinkronkan`,
        actor: 'WA AI Assistant'
      });

      setImportLogText(
        `✅ Berhasil memproses [${modeLabel}]: ${name1} dan ${name2}. Sebanyak ${modifiedSlotsCount} sesi jadwal misa telah disinkronkan secara otomatis.`
      );
      playAudioFeedback('success');
    } catch (err) {
      console.error('Error processing WA message:', err);
      setParseError({
        title: 'Gagal Memproses Permintaan',
        reason: (err as Error)?.message || 'Terjadi kendala saat memproses permohonan jadwal.',
        fixHint: 'Pastikan format penulisan memuat nomor petugas dengan tanda # (misal: #29 dan #56) dan tanggal misa yang valid.'
      });
      playAudioFeedback('warning');
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
