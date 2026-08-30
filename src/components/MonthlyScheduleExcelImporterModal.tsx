import React, { useState, useMemo } from 'react';
import { Officer, ScheduleSlot } from '../types';
import { playAudioFeedback } from '../utils/sound';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  X, 
  Save, 
  Sparkles, 
  Info,
  Calendar,
  Layers,
  Copy,
  Check
} from 'lucide-react';

// Dynamic browser-safe SheetJS loader
const getXLSX = async () => {
  try {
    const module = await import('xlsx');
    return module.default || module;
  } catch (e) {
    console.warn('XLSX module dynamic import fallback:', e);
    return null;
  }
};

interface MonthlyScheduleExcelImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  officers: Officer[];
  currentSchedule: ScheduleSlot[];
  onSaveSchedule: (newSchedule: ScheduleSlot[]) => void;
  onAddLog?: (action: string, actor: string) => void;
}

interface EditableScheduleRow {
  id: string;
  dateStr: string; // YYYY-MM-DD e.g. "2026-09-01"
  timeStr: string; // e.g. "05:30 WIB"
  locationStr: string; // e.g. "Gereja Paroki Santo Yakobus" or "Kapel John Paul II"
  koorlapInput: string; // e.g. "123, 143" or "#123 #143"
  serversInput: string; // e.g. "53, 88" or "#53, #88"
  notesInput?: string;
}

export const MonthlyScheduleExcelImporterModal: React.FC<MonthlyScheduleExcelImporterModalProps> = ({
  isOpen,
  onClose,
  officers,
  currentSchedule,
  onSaveSchedule,
  onAddLog
}) => {
  const [selectedMonthYear, setSelectedMonthYear] = useState<'2026-09' | '2026-10' | '2026-11' | '2026-12'>('2026-09');
  const [activeTab, setActiveTab] = useState<'grid' | 'paste'>('grid');
  const [pasteText, setPasteText] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Initialize rows from currentSchedule or empty template
  const [rows, setRows] = useState<EditableScheduleRow[]>(() => {
    if (currentSchedule && currentSchedule.length > 0) {
      return currentSchedule.map(s => ({
        id: s.id || `row-${Math.random()}`,
        dateStr: s.date,
        timeStr: s.massTime,
        locationStr: s.location,
        koorlapInput: (s.koorlapIds || []).map(k => String(parseInt(k, 10))).join(', '),
        serversInput: (s.serverIds || []).map(sid => String(parseInt(sid, 10))).join(', '),
        notesInput: s.serverNotes?.filter(Boolean).join(' | ') || ''
      }));
    }
    return [];
  });

  // Fast officer ID lookup map
  const officerMap = useMemo(() => {
    const map = new Map<number, Officer>();
    officers.forEach(o => {
      const num = parseInt(o.id, 10);
      if (!isNaN(num)) map.set(num, o);
    });
    return map;
  }, [officers]);

  // Helper to parse numbers from a string
  const parseNumbers = (input: string): number[] => {
    if (!input) return [];
    const matches = input.match(/\d+/g);
    if (!matches) return [];
    return matches.map(m => parseInt(m, 10)).filter(n => !isNaN(n));
  };

  // Helper to format Indonesian display date
  const getIndonesianDisplayDate = (dateStr: string): string => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthsIndo = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const dayName = daysIndo[d.getDay()] || 'Hari';
    const monthName = monthsIndo[month] || 'Bulan';
    return `${dayName}, ${String(day).padStart(2, '0')} ${monthName} ${year}`;
  };

  // 1. Generate Standard Monthly Blank Template (Semua sesi misa harian & mingguan sebulan penuh)
  const handleGenerateStandardTemplate = () => {
    playAudioFeedback('tap');
    const [yearStr, monthStr] = selectedMonthYear.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10); // 1-indexed

    const daysInMonth = new Date(year, month, 0).getDate();
    const newTemplateRows: EditableScheduleRow[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const d = new Date(year, month - 1, day);
      const dayOfWeek = d.getDay(); // 0: Minggu, 1: Senin, ..., 5: Jumat, 6: Sabtu

      if (dayOfWeek >= 1 && dayOfWeek <= 4) {
        // Senin s/d Kamis: Misa Pagi Gereja (05:30) & Misa Sore Kapel (18:00)
        newTemplateRows.push({
          id: `row-${dateStr}-0530`,
          dateStr,
          timeStr: '05:30 WIB',
          locationStr: 'Gereja Paroki Santo Yakobus',
          koorlapInput: '',
          serversInput: ''
        });
        newTemplateRows.push({
          id: `row-${dateStr}-1800`,
          dateStr,
          timeStr: '18:00 WIB',
          locationStr: 'Kapel John Paul II',
          koorlapInput: '',
          serversInput: ''
        });
      } else if (dayOfWeek === 5) {
        // Jumat: Misa Pagi Gereja (05:30), Misa Sore Kapel (18:00), Misa Jumat Pertama Gereja (19:00 jika minggu 1)
        newTemplateRows.push({
          id: `row-${dateStr}-0530`,
          dateStr,
          timeStr: '05:30 WIB',
          locationStr: 'Gereja Paroki Santo Yakobus',
          koorlapInput: '',
          serversInput: ''
        });
        newTemplateRows.push({
          id: `row-${dateStr}-1800`,
          dateStr,
          timeStr: '18:00 WIB',
          locationStr: 'Kapel John Paul II',
          koorlapInput: '',
          serversInput: ''
        });
        if (day <= 7) {
          // Jumat Pertama (Misa Malam 19:00 di Gereja)
          newTemplateRows.push({
            id: `row-${dateStr}-1900`,
            dateStr,
            timeStr: '19:00 WIB',
            locationStr: 'Gereja Paroki Santo Yakobus',
            koorlapInput: '',
            serversInput: ''
          });
        }
      } else if (dayOfWeek === 6) {
        // Sabtu: Misa Pagi Gereja (05:30), Misa Sore Kapel (17:30), Misa Sore Gereja (18:00)
        newTemplateRows.push({
          id: `row-${dateStr}-0530`,
          dateStr,
          timeStr: '05:30 WIB',
          locationStr: 'Gereja Paroki Santo Yakobus',
          koorlapInput: '',
          serversInput: ''
        });
        newTemplateRows.push({
          id: `row-${dateStr}-1730`,
          dateStr,
          timeStr: '17:30 WIB',
          locationStr: 'Kapel John Paul II',
          koorlapInput: '',
          serversInput: ''
        });
        newTemplateRows.push({
          id: `row-${dateStr}-1800`,
          dateStr,
          timeStr: '18:00 WIB',
          locationStr: 'Gereja Paroki Santo Yakobus',
          koorlapInput: '',
          serversInput: ''
        });
      } else if (dayOfWeek === 0) {
        // Minggu: 6 Sesi Misa
        newTemplateRows.push({
          id: `row-${dateStr}-0600-kjp`,
          dateStr,
          timeStr: '06:00 WIB',
          locationStr: 'Kapel John Paul II',
          koorlapInput: '',
          serversInput: ''
        });
        newTemplateRows.push({
          id: `row-${dateStr}-0800-kjp`,
          dateStr,
          timeStr: '08:00 WIB',
          locationStr: 'Kapel John Paul II',
          koorlapInput: '',
          serversInput: ''
        });
        newTemplateRows.push({
          id: `row-${dateStr}-0800-grj`,
          dateStr,
          timeStr: '08:00 WIB',
          locationStr: 'Gereja Paroki Santo Yakobus',
          koorlapInput: '',
          serversInput: ''
        });
        newTemplateRows.push({
          id: `row-${dateStr}-1030-grj`,
          dateStr,
          timeStr: '10:30 WIB',
          locationStr: 'Gereja Paroki Santo Yakobus',
          koorlapInput: '',
          serversInput: ''
        });
        newTemplateRows.push({
          id: `row-${dateStr}-1730-kjp`,
          dateStr,
          timeStr: '17:30 WIB',
          locationStr: 'Kapel John Paul II',
          koorlapInput: '',
          serversInput: ''
        });
        newTemplateRows.push({
          id: `row-${dateStr}-1800-grj`,
          dateStr,
          timeStr: '18:00 WIB',
          locationStr: 'Gereja Paroki Santo Yakobus',
          koorlapInput: '',
          serversInput: ''
        });
      }
    }

    setRows(newTemplateRows);
  };

  // 2. Download Template Excel (.xlsx / .csv fallback)
  const handleDownloadExcelTemplate = async () => {
    playAudioFeedback('tap');
    const dataForExcel = rows.map((r, idx) => ({
      'No': idx + 1,
      'Tanggal (YYYY-MM-DD)': r.dateStr,
      'Hari & Tanggal': getIndonesianDisplayDate(r.dateStr),
      'Jam Misa': r.timeStr,
      'Lokasi': r.locationStr,
      'No. Koorlap (ID)': r.koorlapInput,
      'No. Petugas Terjadwal (ID)': r.serversInput,
      'Keterangan / Catatan': r.notesInput || ''
    }));

    try {
      const XLSX = await getXLSX();
      if (XLSX) {
        const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Jadwal_Misa');
        XLSX.writeFile(workbook, `Template_Jadwal_Sakristi_${selectedMonthYear}.xlsx`);
        return;
      }
    } catch (e) {
      console.warn('XLSX export fallback to CSV:', e);
    }

    // Native CSV Export fallback
    const headers = ['No', 'Tanggal (YYYY-MM-DD)', 'Hari & Tanggal', 'Jam Misa', 'Lokasi', 'No. Koorlap (ID)', 'No. Petugas Terjadwal (ID)', 'Keterangan / Catatan'];
    const csvContent = [
      headers.join(','),
      ...dataForExcel.map(row => 
        Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Template_Jadwal_Sakristi_${selectedMonthYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. Upload File Excel (.xlsx / .xls / .csv)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playAudioFeedback('tap');
    const isCsv = file.name.endsWith('.csv') || file.type.includes('csv');

    if (isCsv) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (!text) return;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length <= 1) return;
        
        const imported: EditableScheduleRow[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 5) {
            imported.push({
              id: `row-csv-${i}-${Date.now()}`,
              dateStr: cols[1] || `${selectedMonthYear}-01`,
              timeStr: cols[3] || '05:30 WIB',
              locationStr: cols[4] || 'Gereja Paroki Santo Yakobus',
              koorlapInput: cols[5] || '',
              serversInput: cols[6] || '',
              notesInput: cols[7] || ''
            });
          }
        }
        if (imported.length > 0) {
          setRows(imported);
          playAudioFeedback('success');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
      return;
    }

    try {
      const XLSX = await getXLSX();
      if (XLSX) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const rawData: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

            const importedRows: EditableScheduleRow[] = rawData.map((item, idx) => {
              const dateVal = String(item['Tanggal (YYYY-MM-DD)'] || item['Tanggal'] || item['tanggal'] || item['Date'] || '').trim();
              const timeVal = String(item['Jam Misa'] || item['Jam'] || item['jam'] || item['Waktu'] || item['Time'] || '05:30 WIB').trim();
              const locVal = String(item['Lokasi'] || item['lokasi'] || item['Location'] || 'Gereja Paroki Santo Yakobus').trim();
              const koorlapVal = String(item['No. Koorlap (ID)'] || item['Koorlap'] || item['koorlap'] || '').trim();
              const serversVal = String(item['No. Petugas Terjadwal (ID)'] || item['No. Petugas'] || item['Petugas'] || item['petugas'] || '').trim();
              const notesVal = String(item['Keterangan / Catatan'] || item['Keterangan'] || item['Catatan'] || '').trim();

              let normLoc = 'Gereja Paroki Santo Yakobus';
              if (/kapel|kjp|john paul/i.test(locVal)) {
                normLoc = 'Kapel John Paul II';
              } else if (/rs|korsa|rumah sakit/i.test(locVal)) {
                normLoc = 'Rumah Sakit EH';
              }

              let normTime = timeVal;
              if (!normTime.includes('WIB')) {
                const tm = normTime.match(/([01]?\d|2[0-3])[:.]([0-5]\d)/);
                if (tm) normTime = `${tm[1].padStart(2, '0')}:${tm[2]} WIB`;
                else normTime = `${normTime} WIB`;
              }

              return {
                id: `row-${idx}-${Date.now()}`,
                dateStr: dateVal || `${selectedMonthYear}-01`,
                timeStr: normTime,
                locationStr: normLoc,
                koorlapInput: koorlapVal,
                serversInput: serversVal,
                notesInput: notesVal
              };
            });

            if (importedRows.length > 0) {
              setRows(importedRows);
              playAudioFeedback('success');
            } else {
              alert('File Excel tidak memiliki data baris yang valid.');
            }
          } catch (err) {
            console.error('Error parsing Excel:', err);
            alert('Gagal membaca file Excel.');
          }
        };
        reader.readAsBinaryString(file);
      }
    } catch (err) {
      console.error('Error loading XLSX loader:', err);
    }
    e.target.value = '';
  };

  // 4. Parse Multi-Line Paste Text
  const handleParsePasteText = () => {
    if (!pasteText.trim()) return;
    playAudioFeedback('tap');
    const lines = pasteText.split('\n').map(l => l.trim()).filter(Boolean);
    const parsedRows: EditableScheduleRow[] = [];

    lines.forEach((line, idx) => {
      // Split by tab (Excel copy) or semicolon or vertical bar
      const cols = line.includes('\t') ? line.split('\t') : (line.includes(';') ? line.split(';') : line.split('|'));
      if (cols.length >= 4) {
        const dateVal = cols[0].trim();
        const timeVal = cols[1].trim();
        const locVal = cols[2].trim();
        const serversVal = cols[3].trim();
        const koorlapVal = cols[4] ? cols[4].trim() : '';

        parsedRows.push({
          id: `paste-${idx}-${Date.now()}`,
          dateStr: dateVal.includes('-') ? dateVal : `${selectedMonthYear}-${dateVal.padStart(2, '0')}`,
          timeStr: timeVal.includes('WIB') ? timeVal : `${timeVal} WIB`,
          locationStr: /kapel|kjp/i.test(locVal) ? 'Kapel John Paul II' : (/rs|korsa/i.test(locVal) ? 'Rumah Sakit EH' : 'Gereja Paroki Santo Yakobus'),
          koorlapInput: koorlapVal,
          serversInput: serversVal
        });
      }
    });

    if (parsedRows.length > 0) {
      setRows(parsedRows);
      setActiveTab('grid');
      playAudioFeedback('success');
    } else {
      alert('Teks tidak dapat diproses. Pastikan format tabel dipisahkan oleh Tab atau Titik Koma.');
    }
  };

  // Row operations
  const handleAddRow = () => {
    playAudioFeedback('tap');
    const lastRow = rows[rows.length - 1];
    setRows(prev => [
      ...prev,
      {
        id: `row-new-${Date.now()}`,
        dateStr: lastRow ? lastRow.dateStr : `${selectedMonthYear}-01`,
        timeStr: '05:30 WIB',
        locationStr: 'Gereja Paroki Santo Yakobus',
        koorlapInput: '',
        serversInput: '',
        notesInput: ''
      }
    ]);
  };

  const handleDeleteRow = (id: string) => {
    playAudioFeedback('tap');
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const handleUpdateRowField = (id: string, field: keyof EditableScheduleRow, val: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
  };

  // Convert Grid Rows into Complete Official ScheduleSlot[]
  const handleSaveAndApplySchedule = () => {
    setIsSaving(true);
    playAudioFeedback('tap');

    try {
      const finalSchedule: ScheduleSlot[] = rows.map((r, idx) => {
        const serverNums = parseNumbers(r.serversInput);
        const koorlapNums = parseNumbers(r.koorlapInput);

        const serverIds = serverNums.map(n => String(n).padStart(3, '0'));
        const serverNames = serverNums.map(n => {
          const off = officerMap.get(n);
          return off ? off.name : `Petugas #${String(n).padStart(3, '0')}`;
        });

        const koorlapIds = koorlapNums.map(n => String(n).padStart(3, '0'));

        const serverRoles = serverNums.map(n => {
          if (koorlapNums.includes(n)) return 'Koorlap Misa';
          return 'Asisten Imam';
        });

        const displayDate = getIndonesianDisplayDate(r.dateStr);

        return {
          id: `sch-month-${String(idx + 1).padStart(3, '0')}`,
          date: r.dateStr,
          displayDate,
          massTime: r.timeStr,
          location: r.locationStr,
          capacity: Math.max(serverNums.length, 1),
          serverIds,
          serverNames,
          koorlapIds,
          serverRoles,
          originalServerNames: [...serverNames],
          isSubstituted: new Array(serverIds.length).fill(false),
          serverNotes: r.notesInput ? [r.notesInput] : new Array(serverIds.length).fill(null),
          status: 'Confirmed' as const
        };
      });

      onSaveSchedule(finalSchedule);
      if (onAddLog) {
        onAddLog(`Import & Update Jadwal Bulanan Excel: Berhasil menerapkan ${finalSchedule.length} sesi misa untuk bulan ${selectedMonthYear}`, 'Admin Sakristi');
      }

      setIsSaving(false);
      setSaveSuccessNotice(`✅ Berhasil Menerapkan ${finalSchedule.length} Sesi Misa ke Seluruh Sistem!`);
      playAudioFeedback('success');

      setTimeout(() => {
        setSaveSuccessNotice(null);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error applying schedule:', err);
      setIsSaving(false);
      alert('Terjadi kesalahan saat memproses jadwal. Periksa kembali format baris.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 animate-in fade-in">
      <div className="bg-white border border-[#e6ded2] rounded-3xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="bg-[#5B1414] text-white px-6 py-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileSpreadsheet className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-extrabold tracking-tight font-headline flex items-center gap-2">
                <span>Spreadsheet &amp; Import Jadwal Bulanan</span>
                <span className="bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs px-2 py-0.5 rounded-full font-sans font-bold">
                  Ketelitian 100%
                </span>
              </h2>
              <p className="text-xs text-white/80">
                Isi nomor petugas langsung di tabel Excel ini atau upload file .xlsx Anda. Sistem otomatis mencocokkan nama resmi 170 petugas.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* TOOLBAR CONTROLS */}
        <div className="bg-[#fbf9f5] border-b border-[#e6ded2] p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-white border border-[#d8cfc4] rounded-xl px-3 py-1.5 shadow-2xs">
              <Calendar className="w-4 h-4 text-[#5B1414]" />
              <span className="text-xs font-bold text-[#5B1414]">Target Bulan:</span>
              <select
                value={selectedMonthYear}
                onChange={(e) => setSelectedMonthYear(e.target.value as any)}
                className="text-xs font-bold text-[#332e27] bg-transparent focus:outline-hidden cursor-pointer"
              >
                <option value="2026-09">September 2026</option>
                <option value="2026-10">Oktober 2026</option>
                <option value="2026-11">November 2026</option>
                <option value="2026-12">Desember 2026</option>
              </select>
            </div>

            <button
              onClick={handleGenerateStandardTemplate}
              className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Otomatis membuat baris misa harian & mingguan untuk bulan ini"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Generate Baris Misa Baku Sebulan</span>
            </button>

            <button
              onClick={handleAddRow}
              className="px-3.5 py-1.5 bg-white hover:bg-[#f5efe6] border border-[#d8cfc4] text-[#4a433b] text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>+ Tambah Baris Manual</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Download Template */}
            <button
              onClick={handleDownloadExcelTemplate}
              className="px-3.5 py-1.5 bg-white hover:bg-[#f5efe6] border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download Template Excel (.xlsx)</span>
            </button>

            {/* Upload Excel */}
            <label className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-white" />
              <span>Upload File Excel (.xlsx)</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* NOTIFICATION BANNER */}
        {saveSuccessNotice && (
          <div className="bg-emerald-500 text-white px-6 py-2.5 text-sm font-bold flex items-center gap-2 justify-center shrink-0 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>{saveSuccessNotice}</span>
          </div>
        )}

        {/* TAB BUTTONS */}
        <div className="flex items-center gap-1 bg-[#eee6da] px-6 pt-2 border-b border-[#e0d6c8] shrink-0">
          <button
            onClick={() => setActiveTab('grid')}
            className={`px-5 py-2 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'grid'
                ? 'bg-white text-[#5B1414] shadow-xs border-t-2 border-[#5B1414]'
                : 'text-[#665e55] hover:text-[#332e27]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tabel Spreadsheet Interaktif ({rows.length} Baris Misa)</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`px-5 py-2 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'paste'
                ? 'bg-white text-[#5B1414] shadow-xs border-t-2 border-[#5B1414]'
                : 'text-[#665e55] hover:text-[#332e27]'
            }`}
          >
            <Copy className="w-4 h-4" />
            <span>Paste dari Clipboard / WA / Excel Text</span>
          </button>
        </div>

        {/* MAIN BODY AREA */}
        <div className="flex-1 bg-white overflow-hidden flex flex-col p-4 md:p-6">
          
          {/* TAB 1: INTERACTIVE EXCEL GRID */}
          {activeTab === 'grid' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-auto border border-[#e6ded2] rounded-2xl shadow-inner bg-[#fdfbf9]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f2ece1] text-[#5B1414] sticky top-0 z-10 font-bold uppercase tracking-wider border-b border-[#d8cfc4]">
                    <tr>
                      <th className="p-3 w-12 text-center">No</th>
                      <th className="p-3 w-36">Tanggal (YYYY-MM-DD)</th>
                      <th className="p-3 w-32">Jam Misa</th>
                      <th className="p-3 w-48">Lokasi Misa</th>
                      <th className="p-3 w-40">No. Koorlap (ID)</th>
                      <th className="p-3">No. Petugas Terjadwal (ID) &amp; Live Badges</th>
                      <th className="p-3 w-16 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee6da]">
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-[#8c827a]">
                          <FileSpreadsheet className="w-12 h-12 text-[#c8bfb4] mx-auto mb-3" />
                          <p className="font-bold text-sm text-[#5B1414]">Belum Ada Baris Jadwal</p>
                          <p className="text-xs text-[#8c827a] mt-1 max-w-md mx-auto">
                            Klik <b>"Generate Baris Misa Baku Sebulan"</b> untuk membuat template otomatis, atau <b>"Upload File Excel"</b> jika sudah memiliki file.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      rows.map((row, idx) => {
                        const serverNums = parseNumbers(row.serversInput);
                        const koorlapNums = parseNumbers(row.koorlapInput);

                        return (
                          <tr key={row.id} className="hover:bg-amber-50/40 transition-colors">
                            {/* No */}
                            <td className="p-2.5 text-center font-bold text-[#8c827a]">
                              {idx + 1}
                            </td>

                            {/* Tanggal */}
                            <td className="p-2.5">
                              <input
                                type="date"
                                value={row.dateStr}
                                onChange={(e) => handleUpdateRowField(row.id, 'dateStr', e.target.value)}
                                className="w-full bg-white border border-[#d8cfc4] rounded-lg px-2 py-1.5 text-xs font-semibold focus:outline-hidden focus:border-[#5B1414]"
                              />
                            </td>

                            {/* Jam Misa */}
                            <td className="p-2.5">
                              <select
                                value={row.timeStr}
                                onChange={(e) => handleUpdateRowField(row.id, 'timeStr', e.target.value)}
                                className="w-full bg-white border border-[#d8cfc4] rounded-lg px-2 py-1.5 text-xs font-semibold focus:outline-hidden focus:border-[#5B1414] cursor-pointer"
                              >
                                <option value="05:30 WIB">05:30 WIB</option>
                                <option value="06:00 WIB">06:00 WIB</option>
                                <option value="08:00 WIB">08:00 WIB</option>
                                <option value="10:30 WIB">10:30 WIB</option>
                                <option value="17:30 WIB">17:30 WIB</option>
                                <option value="18:00 WIB">18:00 WIB</option>
                                <option value="19:00 WIB">19:00 WIB</option>
                              </select>
                            </td>

                            {/* Lokasi */}
                            <td className="p-2.5">
                              <select
                                value={row.locationStr}
                                onChange={(e) => handleUpdateRowField(row.id, 'locationStr', e.target.value)}
                                className="w-full bg-white border border-[#d8cfc4] rounded-lg px-2 py-1.5 text-xs font-semibold focus:outline-hidden focus:border-[#5B1414] cursor-pointer"
                              >
                                <option value="Gereja Paroki Santo Yakobus">Gereja Paroki Santo Yakobus</option>
                                <option value="Kapel John Paul II">Kapel John Paul II</option>
                                <option value="Rumah Sakit EH">Rumah Sakit EH</option>
                              </select>
                            </td>

                            {/* Koorlap */}
                            <td className="p-2.5">
                              <input
                                type="text"
                                placeholder="Contoh: 123, 143"
                                value={row.koorlapInput}
                                onChange={(e) => handleUpdateRowField(row.id, 'koorlapInput', e.target.value)}
                                className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-amber-900 focus:outline-hidden focus:border-amber-600 placeholder:text-amber-300"
                              />
                            </td>

                            {/* Petugas & Live Chips */}
                            <td className="p-2.5">
                              <div className="space-y-1.5">
                                <input
                                  type="text"
                                  placeholder="Ketik Nomor ID (contoh: 53, 88 atau #53, #88)"
                                  value={row.serversInput}
                                  onChange={(e) => handleUpdateRowField(row.id, 'serversInput', e.target.value)}
                                  className="w-full bg-white border border-[#d8cfc4] rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-[#5B1414] focus:outline-hidden focus:border-[#5B1414] placeholder:text-[#b0a79d]"
                                />

                                {/* Live Badge Preview */}
                                {serverNums.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1">
                                    {serverNums.map((num) => {
                                      const off = officerMap.get(num);
                                      const isKoor = koorlapNums.includes(num);

                                      if (!off) {
                                        return (
                                          <span key={num} className="inline-flex items-center gap-1 bg-red-100 border border-red-300 text-red-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                            <AlertTriangle className="w-3 h-3 text-red-600" />
                                            #{String(num).padStart(3, '0')} (Tidak Ada)
                                          </span>
                                        );
                                      }

                                      return (
                                        <span
                                          key={num}
                                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                            isKoor
                                              ? 'bg-amber-100 border border-amber-300 text-amber-900'
                                              : 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                                          }`}
                                        >
                                          <span className="font-mono">#{off.id}</span>
                                          <span>{off.shortName || off.name}</span>
                                          {isKoor && <span className="text-[9px] text-amber-700">(Koorlap)</span>}
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Delete Row */}
                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => handleDeleteRow(row.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Baris Ini"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: PASTE TEXT CLIPBOARD */}
          {activeTab === 'paste' && (
            <div className="flex-1 flex flex-col space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Format Paste Cepat (Copy dari Excel / WA / Notepad):</p>
                  <p className="mt-1">
                    Susun baris dipisahkan Tab atau Titik Koma ( ; ) dengan urutan: <br />
                    <code>Tanggal [Tab] Jam [Tab] Lokasi [Tab] No. Petugas [Tab] No. Koorlap</code>
                  </p>
                  <p className="mt-1 font-mono text-[11px] bg-white/70 p-2 rounded-md border border-amber-300/40">
                    2026-09-01	05:30	Gereja	53, 88	<br />
                    2026-09-01	18:00	Kapel	84	<br />
                    2026-09-04	18:00	Kapel	63, 56, 59, 168	63
                  </p>
                </div>
              </div>

              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste data teks jadwal dari Excel / WA di sini..."
                rows={12}
                className="flex-1 w-full bg-[#fdfbf9] border border-[#d8cfc4] rounded-2xl p-4 font-mono text-xs focus:outline-hidden focus:border-[#5B1414] resize-none"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleParsePasteText}
                  className="px-6 py-2.5 bg-[#5B1414] hover:bg-[#450e0e] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Proses &amp; Masukkan ke Spreadsheet</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-[#fbf9f5] border-t border-[#e6ded2] px-6 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#665e55]">
            Total: <span className="font-bold text-[#5B1414]">{rows.length} Sesi Misa Terjadwal</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-white hover:bg-[#f5efe6] border border-[#d8cfc4] text-[#4a433b] text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              Batal
            </button>

            <button
              onClick={handleSaveAndApplySchedule}
              disabled={isSaving || rows.length === 0}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan & Terapkan Jadwal (1-Klik Live)'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
