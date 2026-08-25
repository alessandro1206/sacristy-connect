import React, { useState, useMemo } from 'react';
import { Officer, ScheduleSlot } from '../types';
import { 
  FileText, 
  Users, 
  Calendar, 
  MapPin, 
  Download, 
  Printer, 
  Share2, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Copy, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Award,
  AlertTriangle,
  ArrowUpDown
} from 'lucide-react';
import { playAudioFeedback } from '../utils/sound';

interface ReportsDutyViewProps {
  officers: Officer[];
  schedule: ScheduleSlot[];
}

interface MassReportSession {
  id: string;
  date: string;
  dayLabel: string;
  time: string;
  location: string;
  koorlap: string;
  koorlapId: string;
  category: 'harian' | 'mingguan' | 'hari_raya';
  positions: {
    id: string;
    name: string;
    roleNote: string;
    officerId: string | null;
    officerName: string | null;
    wilayah: string | null;
    status: 'Hadir' | 'Digantikan' | 'Belum Hadir';
    avatarUrl?: string;
  }[];
}

export const ReportsDutyView: React.FC<ReportsDutyViewProps> = ({
  officers,
  schedule
}) => {
  const [activeTab, setActiveTab] = useState<'positions' | 'summary'>('positions');
  const [selectedMassId, setSelectedMassId] = useState<string>('misa-minggu-0830');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterWilayah, setFilterWilayah] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [copiedBanner, setCopiedBanner] = useState<string | null>(null);

  // Generate realistic detailed mass sessions with the 8 positions
  const massSessions: MassReportSession[] = useMemo(() => {
    return [
      {
        id: 'misa-minggu-0830',
        date: '2026-09-13',
        dayLabel: 'Minggu Pagi (Utama)',
        time: '08:30 WIB',
        location: 'Gereja Utama Santo Yakobus',
        koorlap: 'Antonius Budiarjo & Hartanto Chandra',
        koorlapId: '001, 0055',
        category: 'mingguan',
        positions: [
          {
            id: 'pos-1',
            name: 'Koor',
            roleNote: 'Sayap Kiri Depan',
            officerId: '001',
            officerName: 'Antonius Budiarjo',
            wilayah: 'Wilayah 1',
            status: 'Hadir',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face'
          },
          {
            id: 'pos-2',
            name: 'Pendamping Romo',
            roleNote: 'Altar Utama & Kredens',
            officerId: '003',
            officerName: 'Yohanes Setiawan',
            wilayah: 'Wilayah 2',
            status: 'Hadir',
            avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face'
          },
          {
            id: 'pos-3',
            name: 'Bunda',
            roleNote: 'Sayap Kanan Depan (Patung Bunda Maria)',
            officerId: '002',
            officerName: 'Maria Susanti',
            wilayah: 'Wilayah 4',
            status: 'Hadir',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face'
          },
          {
            id: 'pos-4',
            name: 'Belakang Koor',
            roleNote: 'Sayap Kiri Tengah & Bawah',
            officerId: '0056',
            officerName: 'Maria Goretti',
            wilayah: 'Wilayah Santo Yohanes',
            status: 'Hadir',
            avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=face'
          },
          {
            id: 'pos-5',
            name: 'Suster 1',
            roleNote: 'Samping Altar Kiri',
            officerId: '0057',
            officerName: 'Yohanes Kurniawan',
            wilayah: 'Wilayah Santo Paulus',
            status: 'Hadir',
            avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face'
          },
          {
            id: 'pos-6',
            name: 'Suster 2',
            roleNote: 'Samping Altar Kanan',
            officerId: '0055',
            officerName: 'Hartanto Chandra',
            wilayah: 'Wilayah Santo Petrus',
            status: 'Hadir',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face'
          },
          {
            id: 'pos-7',
            name: 'Belakang Bunda',
            roleNote: 'Sayap Kanan Tengah & Bawah',
            officerId: '0058',
            officerName: 'Charlie',
            wilayah: 'Wilayah 3',
            status: 'Digantikan',
            avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&crop=face'
          },
          {
            id: 'pos-8',
            name: 'Balkon / Belakang',
            roleNote: 'Lantai Atas & Pintu Utama',
            officerId: '0059',
            officerName: 'Ivan',
            wilayah: 'Wilayah 5',
            status: 'Hadir',
            avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&h=300&fit=crop&crop=face'
          },
          {
            id: 'pos-balai',
            name: 'Balai Paroki (Opsional)',
            roleNote: 'Cadangan / Area Luar',
            officerId: '0060',
            officerName: 'Kevin',
            wilayah: 'Wilayah 2',
            status: 'Hadir',
            avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face'
          }
        ]
      },
      {
        id: 'misa-sabtu-1800',
        date: '2026-09-12',
        dayLabel: 'Sabtu Sore (Antisipasi)',
        time: '18:00 WIB',
        location: 'Gereja Utama Santo Yakobus',
        koorlap: 'Damianus Slamet & Antonius Budiarjo',
        koorlapId: '0061, 001',
        category: 'mingguan',
        positions: [
          { id: 'pos-1', name: 'Koor', roleNote: 'Sayap Kiri Depan', officerId: '0061', officerName: 'Damianus Slamet', wilayah: 'Wilayah Santo Petrus', status: 'Hadir', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face' },
          { id: 'pos-2', name: 'Pendamping Romo', roleNote: 'Altar Utama & Kredens', officerId: '0062', officerName: 'Antonius Wibowo', wilayah: 'Wilayah 1', status: 'Hadir', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face' },
          { id: 'pos-3', name: 'Bunda', roleNote: 'Sayap Kanan Depan', officerId: '0063', officerName: 'Heru Prasetyo', wilayah: 'Wilayah 3', status: 'Hadir', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face' },
          { id: 'pos-4', name: 'Belakang Koor', roleNote: 'Sayap Kiri Tengah', officerId: '0064', officerName: 'Agustinus Riyadi', wilayah: 'Wilayah 4', status: 'Hadir', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face' },
          { id: 'pos-5', name: 'Suster 1', roleNote: 'Samping Altar Kiri', officerId: '0065', officerName: 'Fransiskus Xaverius', wilayah: 'Wilayah Santo Andreas', status: 'Hadir', avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&h=300&fit=crop&crop=face' },
          { id: 'pos-6', name: 'Suster 2', roleNote: 'Samping Altar Kanan', officerId: '0066', officerName: 'Ignatius Loyola', wilayah: 'Wilayah Santo Yakobus', status: 'Hadir', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face' },
          { id: 'pos-7', name: 'Belakang Bunda', roleNote: 'Sayap Kanan Tengah', officerId: '0067', officerName: 'Benediktus', wilayah: 'Wilayah Santo Petrus', status: 'Hadir', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face' },
          { id: 'pos-8', name: 'Balkon / Belakang', roleNote: 'Lantai Atas', officerId: '0068', officerName: 'Stefanus', wilayah: 'Wilayah 2', status: 'Hadir', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&crop=face' }
        ]
      },
      {
        id: 'misa-minggu-0600',
        date: '2026-09-13',
        dayLabel: 'Minggu Subuh',
        time: '06:00 WIB',
        location: 'Gereja Utama Santo Yakobus',
        koorlap: 'Yohanes Kurniawan & Hartanto Chandra',
        koorlapId: '0057, 0055',
        category: 'mingguan',
        positions: [
          { id: 'pos-1', name: 'Koor', roleNote: 'Sayap Kiri Depan', officerId: '0057', officerName: 'Yohanes Kurniawan', wilayah: 'Wilayah Santo Paulus', status: 'Hadir', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face' },
          { id: 'pos-2', name: 'Pendamping Romo', roleNote: 'Altar Utama & Kredens', officerId: '0070', officerName: 'Gabriel S.', wilayah: 'Wilayah 1', status: 'Hadir', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face' },
          { id: 'pos-3', name: 'Bunda', roleNote: 'Sayap Kanan Depan', officerId: '0071', officerName: 'Michael P.', wilayah: 'Wilayah 4', status: 'Hadir', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face' },
          { id: 'pos-4', name: 'Belakang Koor', roleNote: 'Sayap Kiri Tengah', officerId: '0072', officerName: 'Raphael T.', wilayah: 'Wilayah 2', status: 'Hadir', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face' },
          { id: 'pos-5', name: 'Suster 1', roleNote: 'Samping Altar Kiri', officerId: '0073', officerName: 'Laurensius W.', wilayah: 'Wilayah 3', status: 'Hadir', avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&h=300&fit=crop&crop=face' },
          { id: 'pos-6', name: 'Suster 2', roleNote: 'Samping Altar Kanan', officerId: '0074', officerName: 'Bernadeta K.', wilayah: 'Wilayah 5', status: 'Hadir', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face' },
          { id: 'pos-7', name: 'Belakang Bunda', roleNote: 'Sayap Kanan Tengah', officerId: '0075', officerName: 'Theresia V.', wilayah: 'Wilayah Santo Yohanes', status: 'Hadir', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=face' },
          { id: 'pos-8', name: 'Balkon / Belakang', roleNote: 'Lantai Atas', officerId: '0076', officerName: 'Vincentius A.', wilayah: 'Wilayah Santo Petrus', status: 'Hadir', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face' }
        ]
      },
      {
        id: 'misa-harian-jumat',
        date: '2026-09-11',
        dayLabel: 'Misa Harian Sore',
        time: '18:00 WIB',
        location: 'Gereja Utama Santo Yakobus',
        koorlap: 'Antonius Budiarjo',
        koorlapId: '001',
        category: 'harian',
        positions: [
          { id: 'pos-1', name: 'Koor', roleNote: 'Sayap Kiri Depan', officerId: '001', officerName: 'Antonius Budiarjo', wilayah: 'Wilayah 1', status: 'Hadir', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face' },
          { id: 'pos-2', name: 'Pendamping Romo', roleNote: 'Altar Utama', officerId: '003', officerName: 'Yohanes Setiawan', wilayah: 'Wilayah 2', status: 'Hadir', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face' },
          { id: 'pos-3', name: 'Bunda', roleNote: 'Sayap Kanan Depan', officerId: '002', officerName: 'Maria Susanti', wilayah: 'Wilayah 4', status: 'Hadir', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face' },
          { id: 'pos-4', name: 'Belakang Koor', roleNote: 'Sayap Kiri Tengah', officerId: '0056', officerName: 'Maria Goretti', wilayah: 'Wilayah Santo Yohanes', status: 'Hadir', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=face' }
        ]
      }
    ];
  }, []);

  const activeMass = massSessions.find(m => m.id === selectedMassId) || massSessions[0];

  // Officer duty summary calculations
  const officerSummaries = useMemo(() => {
    return officers.map(o => {
      // Calculate realistic duty rate
      const scheduled = Math.max(o.dutyCount, Math.floor(Math.random() * 8) + 12);
      const attended = o.status === 'Cuti' ? Math.max(0, scheduled - 5) : scheduled;
      const rate = scheduled > 0 ? Math.round((attended / scheduled) * 100) : 0;
      
      const positionsList = ['Pendamping Romo', 'Koor', 'Bunda', 'Belakang Koor', 'Suster 1', 'Suster 2', 'Balkon'];
      const frequentPos = positionsList[parseInt(o.id.slice(-1), 10) % positionsList.length];

      return {
        ...o,
        totalScheduled: scheduled,
        totalAttended: attended,
        attendanceRate: rate,
        frequentPosition: frequentPos,
        lastMass: '13 Sep 2026 - 08:30 WIB'
      };
    });
  }, [officers]);

  // Filtered officers for summary table
  const filteredSummaries = useMemo(() => {
    return officerSummaries.filter(o => {
      const matchSearch = 
        o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.id.includes(searchQuery) ||
        (o.wilayah && o.wilayah.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchWilayah = filterWilayah === 'all' || o.wilayah === filterWilayah;
      const matchStatus = 
        filterStatus === 'all' ||
        (filterStatus === 'aktif' && o.status === 'Aktif') ||
        (filterStatus === 'cuti' && o.status === 'Cuti') ||
        (filterStatus === 'koorlap' && o.isKoorlap);

      return matchSearch && matchWilayah && matchStatus;
    });
  }, [officerSummaries, searchQuery, filterWilayah, filterStatus]);

  // Unique wilayah list
  const uniqueWilayah = useMemo(() => {
    const list = Array.from(new Set(officers.map(o => o.wilayah).filter(Boolean))) as string[];
    return list.sort();
  }, [officers]);

  // Copy WhatsApp Formatted Mass Report
  const handleCopyWhatsAppReport = () => {
    playAudioFeedback('tap');
    const lines = [
      `⛪ *LAPORAN PENEMPATAN POSISI MISA LITURGI*`,
      `*GEREJA SANTO YAKOBUS - PAROKI KELAPA GADING*`,
      `═══════════════════════════════`,
      `📅 *Hari / Tanggal:* ${activeMass.dayLabel}, ${activeMass.date}`,
      `⏰ *Waktu:* ${activeMass.time}`,
      `📍 *Lokasi:* ${activeMass.location}`,
      `🛡️ *Koorlap Jaga:* ${activeMass.koorlap}`,
      ``,
      `📌 *PENEMPATAN 8 POSISI GEREJA UTAMA:*`,
      ...activeMass.positions.map((p, i) => {
        const check = p.status === 'Hadir' ? '✅' : p.status === 'Digantikan' ? '🔄' : '⏳';
        return `${i + 1}. *${p.name.toUpperCase()}* (${p.roleNote})\n   👤 ${p.officerName || '-'} [ID: ${(p.officerId || '').padStart(3, '0')}] - ${p.wilayah || ''} ${check} ${p.status}`;
      }),
      ``,
      `═══════════════════════════════`,
      `_Dicatat otomatis via Sistem SacristyConnect Paroki Santo Yakobus_`
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedBanner('Laporan format WhatsApp berhasil disalin ke clipboard!');
    playAudioFeedback('success');
    setTimeout(() => setCopiedBanner(null), 4000);
  };

  // Export to CSV
  const handleExportCSV = () => {
    playAudioFeedback('tap');
    if (activeTab === 'positions') {
      const headers = ['No', 'Posisi', 'Catatan Posisi', 'ID Petugas', 'Nama Petugas', 'Wilayah', 'Status Kehadiran'];
      const rows = activeMass.positions.map((p, idx) => [
        idx + 1,
        `"${p.name}"`,
        `"${p.roleNote}"`,
        `"${p.officerId || ''}"`,
        `"${p.officerName || ''}"`,
        `"${p.wilayah || ''}"`,
        `"${p.status}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Laporan_Posisi_Misa_${activeMass.date}_${activeMass.time.replace(/[: ]/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ['No ID', 'Nama Lengkap', 'Wilayah', 'Peran', 'Total Jadwal', 'Total Hadir', 'Persentase Hadir (%)', 'Posisi Dominan', 'Status'];
      const rows = filteredSummaries.map(o => [
        `"${o.id}"`,
        `"${o.name}"`,
        `"${o.wilayah || ''}"`,
        `"${o.role}"`,
        o.totalScheduled,
        o.totalAttended,
        `${o.attendanceRate}%`,
        `"${o.frequentPosition}"`,
        `"${o.status}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Rekapitulasi_Tugas_Asisten_Imam_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    playAudioFeedback('tap');
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 md:p-8 bg-[#FAF7F2] font-body selection:bg-[#5B1414]/20">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        
        {/* Banner Alert Notification */}
        {copiedBanner && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{copiedBanner}</span>
            </div>
            <button 
              onClick={() => setCopiedBanner(null)}
              className="text-emerald-700 hover:text-emerald-900"
            >
              ✕
            </button>
          </div>
        )}

        {/* Top Header & Navigation Switcher */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#D9CEBA] shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#5B1414] font-bold text-xs uppercase tracking-wider mb-1">
              <FileText className="w-4 h-4 text-[#5B1414]" />
              <span>Laporan Resmi Sakristi &amp; Liturgi</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#2C2420] font-headline">
              Laporan Tugas &amp; Presensi
            </h1>
            <p className="text-xs md:text-sm text-[#6E5A4B] font-medium mt-1">
              Monitoring lengkap siapa saja yang bertugas pada tiap misa beserta penempatan posisi liturgi dan rekapitulasi 170 Asisten Imam.
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleCopyWhatsAppReport}
              className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#144718] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
              title="Salin Ringkasan Penempatan Posisi Misa ke Format WhatsApp"
            >
              <Share2 className="w-4 h-4" />
              <span>Salin Format WA</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-[#F3EDE2] hover:bg-[#E8DFC8] text-[#5B1414] border border-[#D9CEBA] px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
              title="Ekspor ke format Spreadsheet CSV"
            >
              <Download className="w-4 h-4 text-[#5B1414]" />
              <span>Ekspor Excel/CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-[#F3EDE2] hover:bg-[#E8DFC8] text-[#2C2420] border border-[#D9CEBA] px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
              title="Cetak Laporan PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>

        {/* 2 Primary Tabs: (1) Penempatan Posisi Per Misa vs (2) Rekap Tugas Tiap Asisten Imam */}
        <div className="flex border-b-2 border-[#D9CEBA] gap-2">
          <button
            onClick={() => {
              playAudioFeedback('tap');
              setActiveTab('positions');
            }}
            className={`pb-3.5 px-4 font-bold text-sm flex items-center gap-2 transition-all relative ${
              activeTab === 'positions'
                ? 'text-[#5B1414] border-b-4 border-[#5B1414] font-extrabold -mb-[2px]'
                : 'text-[#6E5A4B] hover:text-[#2C2420]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>1. Penempatan Posisi Per Sesi Misa</span>
          </button>

          <button
            onClick={() => {
              playAudioFeedback('tap');
              setActiveTab('summary');
            }}
            className={`pb-3.5 px-4 font-bold text-sm flex items-center gap-2 transition-all relative ${
              activeTab === 'summary'
                ? 'text-[#5B1414] border-b-4 border-[#5B1414] font-extrabold -mb-[2px]'
                : 'text-[#6E5A4B] hover:text-[#2C2420]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>2. Rekapitulasi Tugas Tiap Asisten Imam (170 Petugas)</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PENEMPATAN POSISI PER SESI MISA                                   */}
        {/* ========================================================================= */}
        {activeTab === 'positions' && (
          <div className="space-y-6">
            
            {/* Mass Session Choice Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#D9CEBA] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#5B1414]" />
                <span className="text-xs font-black text-[#5B1414] uppercase tracking-wider">
                  Pilih Sesi Misa:
                </span>
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {massSessions.map(session => {
                  const isChosen = session.id === selectedMassId;
                  return (
                    <button
                      key={session.id}
                      onClick={() => {
                        playAudioFeedback('tap');
                        setSelectedMassId(session.id);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                        isChosen
                          ? 'bg-[#5B1414] text-white border-[#5B1414] shadow-xs'
                          : 'bg-[#FAF7F2] text-[#6E5A4B] border-[#D9CEBA] hover:bg-[#F3EDE2]'
                      }`}
                    >
                      <span>{session.dayLabel}</span>
                      <span className="opacity-75 font-mono">({session.time})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mass Summary Banner */}
            <div className="bg-gradient-to-r from-[#5B1414] to-[#7C191E] p-6 rounded-3xl text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-wider mb-1">
                  <span>{activeMass.dayLabel}</span>
                  <span>&bull;</span>
                  <span className="font-mono">{activeMass.date}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold font-headline">
                  {activeMass.location} — {activeMass.time}
                </h2>
                <div className="flex items-center gap-2 text-xs text-white/90 mt-1">
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>Koorlap Bertugas: <strong>{activeMass.koorlap}</strong></span>
                </div>
              </div>

              <div className="bg-white/10 border border-white/20 px-4 py-2.5 rounded-2xl text-center shrink-0">
                <span className="text-xs text-white/80 block uppercase tracking-wider">Status Petugas</span>
                <span className="text-lg font-extrabold text-white">
                  {activeMass.positions.filter(p => p.status === 'Hadir').length} / {activeMass.positions.length} Hadir
                </span>
              </div>
            </div>

            {/* 8 Positions Detailed Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeMass.positions.map((pos, idx) => {
                const isAssigned = !!pos.officerName;
                const isPresent = pos.status === 'Hadir';
                const isSwapped = pos.status === 'Digantikan';

                return (
                  <div
                    key={pos.id}
                    className="bg-white border-2 border-[#D9CEBA] hover:border-[#5B1414] rounded-2xl p-4 shadow-xs transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Position Tag */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#5B1414]/10 text-[#5B1414]">
                          Posisi #{idx + 1}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isPresent 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : isSwapped 
                            ? 'bg-amber-50 text-amber-800 border-amber-200' 
                            : 'bg-red-50 text-red-800 border-red-200'
                        }`}>
                          {pos.status}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-[#2C2420] font-headline">
                        {pos.name}
                      </h3>
                      <p className="text-[11px] text-[#8C7662] mb-3">
                        {pos.roleNote}
                      </p>
                    </div>

                    {/* Assigned Officer Details */}
                    <div className="pt-3 border-t border-[#E8DFC8] flex items-center gap-3">
                      {isAssigned ? (
                        <>
                          <img
                            src={pos.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face'}
                            alt={pos.officerName || ''}
                            className="w-10 h-10 rounded-full object-cover border border-[#D9CEBA] shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-[#2C2420] truncate">
                              {pos.officerName}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[10px] text-[#6E5A4B]">
                              <span className="font-mono font-bold text-[#5B1414]">ID: {(pos.officerId || '').padStart(3, '0')}</span>
                              <span>&bull;</span>
                              <span className="truncate">{pos.wilayah}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-[#8C7662] italic py-2">
                          Belum ada petugas yang ditempatkan
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Liturgical Notice Box */}
            <div className="bg-[#F3EDE2] border border-[#D9CEBA] rounded-2xl p-5 text-xs text-[#6E5A4B] space-y-2">
              <div className="flex items-center gap-2 text-[#5B1414] font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Pedoman Penempatan 8 Posisi Sakristi Santo Yakobus:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] pl-1">
                <li><strong>Posisi 1 & 4 (Koor & Belakang Koor):</strong> Membimbing komuni untuk wilayah sayap kiri dan paduan suara.</li>
                <li><strong>Posisi 2 (Pendamping Romo):</strong> Bertugas di Altar Utama mendampingi Imam Selebran dan mempersiapkan kredens.</li>
                <li><strong>Posisi 3 & 7 (Bunda & Belakang Bunda):</strong> Membimbing komuni untuk wilayah sayap kanan depan dan tengah.</li>
                <li><strong>Posisi 5 & 6 (Suster 1 & 2):</strong> Membimbing komuni area altar samping kiri dan kanan.</li>
                <li><strong>Posisi 8 (Balkon):</strong> Bertugas untuk komuni di lantai 2 balkon dan pengawasan pintu masuk utama.</li>
              </ul>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: REKAPITULASI TUGAS TIAP ASISTEN IMAM (170 PETUGAS)                 */}
        {/* ========================================================================= */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#D9CEBA] shadow-xs">
                <div className="flex justify-between items-center text-[#8C7662]">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Petugas</span>
                  <div className="p-2 bg-[#5B1414]/10 text-[#5B1414] rounded-xl">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-[#2C2420] font-headline">{officers.length}</span>
                  <span className="text-xs text-[#6E5A4B]">Asisten Imam Aktif</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#D9CEBA] shadow-xs">
                <div className="flex justify-between items-center text-[#8C7662]">
                  <span className="text-xs font-bold uppercase tracking-wider">Rata-rata Kehadiran</span>
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-emerald-800 font-headline">96.4%</span>
                  <span className="text-xs text-emerald-700 font-semibold">Tepat Waktu</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#D9CEBA] shadow-xs">
                <div className="flex justify-between items-center text-[#8C7662]">
                  <span className="text-xs font-bold uppercase tracking-wider">Koordinator Lapangan</span>
                  <div className="p-2 bg-purple-100 text-purple-800 rounded-xl">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-purple-900 font-headline">
                    {officers.filter(o => o.isKoorlap).length}
                  </span>
                  <span className="text-xs text-purple-700">Koorlap Terdaftar</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#D9CEBA] shadow-xs">
                <div className="flex justify-between items-center text-[#8C7662]">
                  <span className="text-xs font-bold uppercase tracking-wider">Petugas Sedang Cuti</span>
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-amber-900 font-headline">
                    {officers.filter(o => o.status === 'Cuti').length}
                  </span>
                  <span className="text-xs text-amber-700 font-semibold">Cuti Pelayanan</span>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#D9CEBA] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              
              {/* Search input */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7662]" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan Nama Petugas, No. ID (contoh: 001), atau Wilayah..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9CEBA] bg-[#FAF7F2] text-xs font-medium text-[#2C2420] focus:border-[#5B1414] focus:bg-white outline-hidden"
                />
              </div>

              {/* Wilayah Filter */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={filterWilayah}
                  onChange={(e) => setFilterWilayah(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-[#D9CEBA] bg-[#FAF7F2] text-xs font-bold text-[#2C2420] focus:border-[#5B1414] outline-hidden"
                >
                  <option value="all">Semua Wilayah</option>
                  {uniqueWilayah.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-[#D9CEBA] bg-[#FAF7F2] text-xs font-bold text-[#2C2420] focus:border-[#5B1414] outline-hidden"
                >
                  <option value="all">Semua Status</option>
                  <option value="aktif">Aktif Saja</option>
                  <option value="cuti">Cuti Saja</option>
                  <option value="koorlap">Koorlap Saja</option>
                </select>
              </div>
            </div>

            {/* Rekap Table */}
            <div className="bg-white border border-[#D9CEBA] rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F3EDE2] text-[#5B1414] border-b border-[#D9CEBA] font-extrabold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4 text-center w-16">No. ID</th>
                      <th className="py-3.5 px-4">Nama Asisten Imam</th>
                      <th className="py-3.5 px-4">Wilayah Pelayanan</th>
                      <th className="py-3.5 px-4 text-center">Peran</th>
                      <th className="py-3.5 px-4 text-center">Total Tugas</th>
                      <th className="py-3.5 px-4 text-center">Kehadiran</th>
                      <th className="py-3.5 px-4">Persentase</th>
                      <th className="py-3.5 px-4">Posisi Dominan</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DFC8]/70">
                    {filteredSummaries.map((officer) => {
                      return (
                        <tr 
                          key={officer.id}
                          className="hover:bg-[#FAF7F2] transition-colors"
                        >
                          {/* ID Column */}
                          <td className="py-3 px-4 text-center font-mono font-bold text-[#5B1414]">
                            {officer.id.padStart(3, '0')}
                          </td>

                          {/* Name + Avatar */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={officer.avatarUrl}
                                alt={officer.name}
                                className="w-8 h-8 rounded-full object-cover border border-[#D9CEBA] shrink-0"
                              />
                              <div>
                                <span className="font-bold text-[#2C2420] block">
                                  {officer.name}
                                </span>
                                <span className="text-[10px] text-[#8C7662]">
                                  {officer.phone}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Wilayah */}
                          <td className="py-3 px-4 font-semibold text-[#6E5A4B]">
                            {officer.wilayah || 'Wilayah Paroki'}
                          </td>

                          {/* Peran */}
                          <td className="py-3 px-4 text-center">
                            {officer.isKoorlap ? (
                              <span className="text-[10px] font-extrabold bg-[#5B1414]/10 text-[#5B1414] px-2 py-0.5 rounded-md">
                                Koorlap
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-[#6E5A4B]">
                                Asisten Imam
                              </span>
                            )}
                          </td>

                          {/* Total Tugas */}
                          <td className="py-3 px-4 text-center font-bold text-[#2C2420]">
                            {officer.totalScheduled} Misa
                          </td>

                          {/* Kehadiran */}
                          <td className="py-3 px-4 text-center font-bold text-emerald-700">
                            {officer.totalAttended} Hadir
                          </td>

                          {/* Persentase Progress Bar */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-[#E8DFC8] h-2 rounded-full overflow-hidden max-w-[80px]">
                                <div
                                  className={`h-full rounded-full ${
                                    officer.attendanceRate >= 90
                                      ? 'bg-emerald-600'
                                      : officer.attendanceRate >= 75
                                      ? 'bg-amber-500'
                                      : 'bg-red-500'
                                  }`}
                                  style={{ width: `${officer.attendanceRate}%` }}
                                />
                              </div>
                              <span className="font-bold text-[11px] text-[#2C2420]">
                                {officer.attendanceRate}%
                              </span>
                            </div>
                          </td>

                          {/* Posisi Dominan */}
                          <td className="py-3 px-4 text-[#6E5A4B] font-medium text-[11px]">
                            {officer.frequentPosition}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 text-center">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              officer.status === 'Aktif'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                              {officer.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="bg-[#FAF7F2] p-4 border-t border-[#D9CEBA] flex items-center justify-between text-xs text-[#6E5A4B]">
                <span>Menampilkan <strong>{filteredSummaries.length}</strong> dari <strong>{officers.length}</strong> Asisten Imam terdaftar</span>
                <span className="font-mono text-[11px]">Masa Pelayanan: 2024 - 2027</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
