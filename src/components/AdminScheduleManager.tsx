import React, { useState, useMemo } from 'react';
import { Officer, ScheduleSlot, SystemLog } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Copy, 
  ShieldCheck, 
  UserCheck, 
  X, 
  Save, 
  ArrowUpDown,
  Check,
  ChevronRight,
  Eye,
  RefreshCw
} from 'lucide-react';
import { playAudioFeedback } from '../utils/sound';

interface AdminScheduleManagerProps {
  schedule: ScheduleSlot[];
  officers: Officer[];
  initialSlotId?: string | null;
  onCreateSlot: (newSlot: ScheduleSlot) => void;
  onUpdateSlot: (updatedSlot: ScheduleSlot) => void;
  onDeleteSlot: (slotId: string) => void;
  onAddLog?: (description: string, actor: string) => void;
}

export const AdminScheduleManager: React.FC<AdminScheduleManagerProps> = ({
  schedule,
  officers,
  initialSlotId,
  onCreateSlot,
  onUpdateSlot,
  onDeleteSlot,
  onAddLog
}) => {
  // Filters and search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<'all' | 'gereja' | 'kapel' | 'rs'>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<ScheduleSlot | null>(null);

  // Form states for creating / editing slot
  const [formData, setFormData] = useState<{
    id?: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    location: string;
    targetTotal: number;
    selectedOfficerIds: string[];
    koorlapOfficerIds: string[];
    status: ScheduleSlot['status'];
  }>({
    date: '2026-09-06',
    time: '18:00',
    location: 'Gereja Paroki Santo Yakobus',
    targetTotal: 4,
    selectedOfficerIds: [],
    koorlapOfficerIds: [],
    status: 'Scheduled'
  });

  // Officer search inside create/edit modal
  const [officerModalSearch, setOfficerModalSearch] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    playAudioFeedback('success');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper Indonesian day calculation
  const getIndonesianDisplayDate = (dateStr: string) => {
    try {
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const dt = new Date(dateStr + 'T00:00:00');
      const dayName = days[dt.getDay()];
      const dayNum = String(dt.getDate()).padStart(2, '0');
      const monthName = months[dt.getMonth() + 1];
      const year = dt.getFullYear();
      return `${dayName}, ${dayNum} ${monthName} ${year}`;
    } catch {
      return dateStr;
    }
  };

  // Unique list of dates for filter dropdown
  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(schedule.map(s => s.date))).sort();
    return dates;
  }, [schedule]);

  // Filtered schedules list
  const filteredSchedule = useMemo(() => {
    return schedule.filter(slot => {
      // Location filter
      if (locationFilter === 'gereja' && !slot.location.toLowerCase().includes('gereja')) return false;
      if (locationFilter === 'kapel' && !slot.location.toLowerCase().includes('kapel')) return false;
      if (locationFilter === 'rs' && !(slot.location.toLowerCase().includes('rs') || slot.location.toLowerCase().includes('rumah sakit') || slot.location.toLowerCase().includes('korsa'))) return false;

      // Date filter
      if (dateFilter !== 'all' && slot.date !== dateFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDate = slot.displayDate.toLowerCase().includes(q) || slot.date.includes(q);
        const matchesLoc = slot.location.toLowerCase().includes(q);
        const matchesTime = slot.massTime.toLowerCase().includes(q);
        const matchesOfficer = (slot.serverNames || []).some(n => n && n.toLowerCase().includes(q));
        const matchesId = (slot.serverIds || []).some(id => id && id.includes(q));

        return matchesDate || matchesLoc || matchesTime || matchesOfficer || matchesId;
      }

      return true;
    }).sort((a, b) => {
      // Sort by date then time
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.massTime.localeCompare(b.massTime);
    });
  }, [schedule, locationFilter, dateFilter, searchQuery]);

  // Compute live statistics
  const totalOfficersAssigned = useMemo(() => {
    return schedule.reduce((acc, slot) => acc + (slot.serverIds?.length || 0), 0);
  }, [schedule]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    playAudioFeedback('tap');
    setFormData({
      date: '2026-09-06',
      time: '18:00',
      location: 'Gereja Paroki Santo Yakobus',
      targetTotal: 4,
      selectedOfficerIds: [],
      koorlapOfficerIds: [],
      status: 'Scheduled'
    });
    setOfficerModalSearch('');
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (slot: ScheduleSlot) => {
    playAudioFeedback('tap');
    setEditingSlot(slot);

    // Extract time without "WIB"
    const rawTime = slot.massTime.replace(/WIB/gi, '').trim();
    const timeFormatted = rawTime.length === 4 ? `0${rawTime}` : rawTime;

    // Detect koorlaps specifically for this slot
    const assignedIds = (slot.serverIds || []).filter((id): id is string => Boolean(id));
    const slotKoorlapSet = new Set((slot.koorlapIds || []).map(id => id.padStart(3, '0')));
    
    // Also include anyone with role 'KORLAP' in serverRoles
    (slot.serverRoles || []).forEach((role, idx) => {
      if (role === 'KORLAP' && slot.serverIds[idx]) {
        slotKoorlapSet.add(slot.serverIds[idx]!.padStart(3, '0'));
      }
    });

    const koorlaps = assignedIds.filter(id => slotKoorlapSet.has(id.padStart(3, '0')));

    setFormData({
      id: slot.id,
      date: slot.date,
      time: timeFormatted,
      location: slot.location,
      targetTotal: slot.targetTotal || slot.serverIds.length || 4,
      selectedOfficerIds: assignedIds,
      koorlapOfficerIds: koorlaps,
      status: slot.status || 'Scheduled'
    });
    setOfficerModalSearch('');
  };

  // Open edit modal if initialSlotId is passed from parent/calendar
  React.useEffect(() => {
    if (initialSlotId && schedule.length > 0) {
      const target = schedule.find(s => s.id === initialSlotId);
      if (target) {
        handleOpenEditModal(target);
      }
    }
  }, [initialSlotId, schedule]);

  // Toggle Officer selection in Modal
  const toggleOfficerSelection = (officerId: string) => {
    playAudioFeedback('tap');
    const norm = officerId.padStart(3, '0');
    setFormData(prev => {
      const exists = prev.selectedOfficerIds.some(id => id === officerId || id.padStart(3, '0') === norm);
      if (exists) {
        return {
          ...prev,
          selectedOfficerIds: prev.selectedOfficerIds.filter(id => id !== officerId && id.padStart(3, '0') !== norm),
          koorlapOfficerIds: prev.koorlapOfficerIds.filter(id => id !== officerId && id.padStart(3, '0') !== norm)
        };
      } else {
        return {
          ...prev,
          selectedOfficerIds: [...prev.selectedOfficerIds, officerId]
        };
      }
    });
  };

  const handleToggleOfficerSelection = toggleOfficerSelection;

  // Toggle Koorlap role within selected officers
  const toggleOfficerKoorlap = (officerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playAudioFeedback('tap');
    const norm = officerId.padStart(3, '0');
    setFormData(prev => {
      const isKoorlap = prev.koorlapOfficerIds.some(id => id === officerId || id.padStart(3, '0') === norm);
      return {
        ...prev,
        koorlapOfficerIds: isKoorlap 
          ? prev.koorlapOfficerIds.filter(id => id !== officerId && id.padStart(3, '0') !== norm)
          : [...prev.koorlapOfficerIds, officerId]
      };
    });
  };

  // Save Create Slot
  const handleSaveCreate = () => {
    if (!formData.date || !formData.time || !formData.location) {
      alert('Mohon lengkapi Tanggal, Jam Misa, dan Lokasi.');
      return;
    }

    const newId = `sch-sep-${String(schedule.length + 1).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
    const displayDate = getIndonesianDisplayDate(formData.date);
    const serverNames = formData.selectedOfficerIds.map(id => {
      const off = officers.find(o => o.id === id || o.id.padStart(3, '0') === id.padStart(3, '0'));
      return off ? off.name : `Petugas #${id}`;
    });

    const cleanTime = formData.time.replace(/WIB/gi, '').trim();
    const formattedMassTime = cleanTime ? `${cleanTime} WIB` : '18:00 WIB';

    const newSlot: ScheduleSlot = {
      id: newId,
      date: formData.date,
      displayDate: displayDate,
      massTime: formattedMassTime,
      location: formData.location,
      targetTotal: Math.max(formData.targetTotal, formData.selectedOfficerIds.length),
      serverIds: formData.selectedOfficerIds,
      serverNames: serverNames,
      koorlapIds: formData.koorlapOfficerIds,
      serverRoles: formData.selectedOfficerIds.map(id => {
        const norm = id.padStart(3, '0');
        const isKoor = formData.koorlapOfficerIds.some(kid => kid === id || kid.padStart(3, '0') === norm);
        return isKoor ? 'KORLAP' : 'AI';
      }),
      status: formData.status,
      attendedServerIds: []
    };

    onCreateSlot(newSlot);
    setIsCreateModalOpen(false);
    showToast(`Jadwal misa baru (${displayDate} - ${formattedMassTime}) berhasil dibuat!`);
    if (onAddLog) {
      onAddLog(`Buat Jadwal Misa Baru: ${displayDate} @ ${formattedMassTime} di ${formData.location} (${formData.selectedOfficerIds.length} Petugas)`, 'Admin Jadwal');
    }
  };

  // Save Edit Slot
  const handleSaveEdit = () => {
    if (!editingSlot) return;

    if (!formData.date || !formData.time || !formData.location) {
      alert('Mohon lengkapi Tanggal, Jam Misa, dan Lokasi.');
      return;
    }

    const displayDate = getIndonesianDisplayDate(formData.date);
    const serverNames = formData.selectedOfficerIds.map(id => {
      const off = officers.find(o => o.id === id || o.id.padStart(3, '0') === id.padStart(3, '0'));
      return off ? off.name : `Petugas #${id}`;
    });

    const cleanTime = formData.time.replace(/WIB/gi, '').trim();
    const formattedMassTime = cleanTime ? `${cleanTime} WIB` : editingSlot.massTime;

    const updated: ScheduleSlot = {
      ...editingSlot,
      date: formData.date,
      displayDate: displayDate,
      massTime: formattedMassTime,
      location: formData.location,
      targetTotal: Math.max(formData.targetTotal, formData.selectedOfficerIds.length),
      serverIds: formData.selectedOfficerIds,
      serverNames: serverNames,
      koorlapIds: formData.koorlapOfficerIds,
      serverRoles: formData.selectedOfficerIds.map(id => {
        const norm = id.padStart(3, '0');
        const isKoor = formData.koorlapOfficerIds.some(kid => kid === id || kid.padStart(3, '0') === norm);
        return isKoor ? 'KORLAP' : 'AI';
      }),
      status: formData.status,
      attendedServerIds: (editingSlot.attendedServerIds || []).filter(id => 
        formData.selectedOfficerIds.some(sid => sid === id || sid.padStart(3, '0') === id.padStart(3, '0'))
      )
    };

    onUpdateSlot(updated);
    setEditingSlot(null);
    showToast(`Jadwal misa (${displayDate} - ${formattedMassTime}) berhasil diperbarui!`);
    if (onAddLog) {
      onAddLog(`Update Jadwal Misa ${editingSlot.id}: ${displayDate} @ ${formattedMassTime} (${formData.selectedOfficerIds.length} Petugas)`, 'Admin Jadwal');
    }
  };

  // Confirm Delete Slot
  const handleConfirmDelete = () => {
    if (!slotToDelete) return;
    playAudioFeedback('tap');
    onDeleteSlot(slotToDelete.id);
    showToast(`Jadwal misa (${slotToDelete.displayDate} - ${slotToDelete.massTime}) berhasil dihapus.`);
    if (onAddLog) {
      onAddLog(`Hapus Jadwal Misa ${slotToDelete.id}: ${slotToDelete.displayDate} @ ${slotToDelete.massTime}`, 'Admin Jadwal');
    }
    setSlotToDelete(null);
  };

  // Quick Duplicate Slot
  const handleDuplicateSlot = (slot: ScheduleSlot) => {
    playAudioFeedback('tap');
    const newId = `sch-sep-${String(schedule.length + 1).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
    const duplicatedSlot: ScheduleSlot = {
      ...slot,
      id: newId,
      attendedServerIds: [],
      status: 'Scheduled'
    };
    onCreateSlot(duplicatedSlot);
    showToast(`Jadwal misa berhasil diduplikasi ke slot baru #${newId}!`);
  };

  // Check double-duty conflicts for an officer on the selected date/time
  const getConflictWarning = (officerId: string, currentDate: string, currentTime: string, excludeSlotId?: string) => {
    const cleanCurrentTime = currentTime.replace(/WIB/gi, '').trim();
    const norm = officerId.padStart(3, '0');
    const conflicts = schedule.filter(s => {
      if (excludeSlotId && s.id === excludeSlotId) return false;
      if (s.date !== currentDate) return false;
      const cleanTime = s.massTime.replace(/WIB/gi, '').trim();
      const isSameTime = cleanTime === cleanCurrentTime;
      const isAssigned = (s.serverIds || []).some(sid => sid && (sid === officerId || sid.padStart(3, '0') === norm));
      return isSameTime && isAssigned;
    });

    return conflicts.length > 0;
  };

  // Officers filtered for modal assignment selection
  const modalFilteredOfficers = useMemo(() => {
    if (!officerModalSearch.trim()) return officers;
    const q = officerModalSearch.toLowerCase();
    return officers.filter(o => 
      o.name.toLowerCase().includes(q) || 
      o.id.includes(q) || 
      (o.wilayah && o.wilayah.toLowerCase().includes(q))
    );
  }, [officers, officerModalSearch]);

  return (
    <div className="flex-1 bg-[#FAF7F2] overflow-y-auto p-6 md:p-8 selection:bg-primary/20 space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-700 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-emerald-500 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#D9CEBA] p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[#5B1414] text-xs font-black uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Pusat Manajemen &amp; Editor Jadwal Misa</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#5B1414] font-headline tracking-tight">
            Kelola Jadwal &amp; Penugasan Petugas
          </h2>
          <p className="text-xs md:text-sm text-[#6E5A4B] mt-1 font-medium max-w-3xl">
            Tambah sesi misa baru, edit alokasi petugas altar, tukar penugasan, dan kelola peran Koorlap secara langsung. Seluruh perubahan terhubung live ke Kiosk, Kalender, dan Portal Petugas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-[#5B1414] hover:bg-[#420D0D] text-white text-xs font-bold rounded-2xl shadow-md transition-all uppercase tracking-wider flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Buat Jadwal Baru</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white border border-[#D9CEBA] p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[#6E5A4B] mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Sesi Misa</span>
            <Calendar className="w-4 h-4 text-[#5B1414]" />
          </div>
          <p className="text-xl font-black text-[#5B1414]">{schedule.length}</p>
          <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">September 2026</span>
        </div>

        <div className="bg-white border border-[#D9CEBA] p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[#6E5A4B] mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Slot Petugas</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-black text-amber-700">{totalOfficersAssigned}</p>
          <span className="text-[10px] text-[#6E5A4B] font-medium mt-0.5 block">Penugasan Terjadwal</span>
        </div>

        <div className="bg-white border border-[#D9CEBA] p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[#6E5A4B] mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Gereja Utama</span>
            <MapPin className="w-4 h-4 text-[#5B1414]" />
          </div>
          <p className="text-xl font-black text-[#5B1414]">
            {schedule.filter(s => s.location.toLowerCase().includes('gereja')).length} Sesi
          </p>
          <span className="text-[10px] text-[#6E5A4B] font-medium mt-0.5 block">Paroki Santo Yakobus</span>
        </div>

        <div className="bg-white border border-[#D9CEBA] p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[#6E5A4B] mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Kapel JPII</span>
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-black text-blue-800">
            {schedule.filter(s => s.location.toLowerCase().includes('kapel')).length} Sesi
          </p>
          <span className="text-[10px] text-[#6E5A4B] font-medium mt-0.5 block">Misa Wilayah &amp; Khusus</span>
        </div>

        <div className="bg-white border border-[#D9CEBA] p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[#6E5A4B] mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Korsa &amp; RS EH</span>
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-emerald-800">
            {schedule.filter(s => s.location.toLowerCase().includes('rs') || s.location.toLowerCase().includes('rumah sakit') || s.location.toLowerCase().includes('korsa')).length} Sesi
          </p>
          <span className="text-[10px] text-emerald-700 font-medium mt-0.5 block">Pelayanan Korsa &amp; RS</span>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white border border-[#D9CEBA] p-4 rounded-2xl shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-[#6E5A4B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan tanggal, jam, petugas, ID..."
            className="w-full bg-[#FAF7F2] border border-[#D9CEBA] rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-[#2B241E] placeholder:text-[#8C7A6B] focus:outline-none focus:border-[#5B1414] focus:ring-1 focus:ring-[#5B1414]"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7A6B] hover:text-[#2B241E]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          
          {/* Location Filter */}
          <div className="flex items-center bg-[#FAF7F2] border border-[#D9CEBA] rounded-xl p-1 text-xs">
            <button
              onClick={() => { playAudioFeedback('tap'); setLocationFilter('all'); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                locationFilter === 'all' ? 'bg-[#5B1414] text-white shadow-xs' : 'text-[#6E5A4B] hover:text-[#2B241E]'
              }`}
            >
              Semua Lokasi
            </button>
            <button
              onClick={() => { playAudioFeedback('tap'); setLocationFilter('gereja'); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                locationFilter === 'gereja' ? 'bg-[#5B1414] text-white shadow-xs' : 'text-[#6E5A4B] hover:text-[#2B241E]'
              }`}
            >
              Gereja Utama
            </button>
            <button
              onClick={() => { playAudioFeedback('tap'); setLocationFilter('kapel'); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                locationFilter === 'kapel' ? 'bg-[#5B1414] text-white shadow-xs' : 'text-[#6E5A4B] hover:text-[#2B241E]'
              }`}
            >
              Kapel JPII
            </button>
            <button
              onClick={() => { playAudioFeedback('tap'); setLocationFilter('rs'); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                locationFilter === 'rs' ? 'bg-emerald-800 text-white shadow-xs' : 'text-[#6E5A4B] hover:text-[#2B241E]'
              }`}
            >
              Korsa &amp; RS EH
            </button>
          </div>

          {/* Date Dropdown */}
          <select
            value={dateFilter}
            onChange={e => { playAudioFeedback('tap'); setDateFilter(e.target.value); }}
            className="bg-[#FAF7F2] border border-[#D9CEBA] rounded-xl px-3 py-2 text-xs font-semibold text-[#5B1414] focus:outline-none focus:border-[#5B1414]"
          >
            <option value="all">Semua Tanggal ({availableDates.length})</option>
            {availableDates.map(d => (
              <option key={d} value={d}>
                {getIndonesianDisplayDate(d)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Schedule Table View */}
      <div className="bg-white border border-[#D9CEBA] rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#D9CEBA] text-[11px] font-black text-[#5B1414] uppercase tracking-wider">
                <th className="py-4 px-5">Slot ID &amp; Tanggal</th>
                <th className="py-4 px-5">Waktu &amp; Lokasi</th>
                <th className="py-4 px-5">Kapasitas</th>
                <th className="py-4 px-5">Daftar Petugas Terjadwal</th>
                <th className="py-4 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE2D5] text-xs">
              {filteredSchedule.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#6E5A4B]">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-80" />
                    <p className="font-bold text-sm">Tidak ada jadwal misa yang sesuai dengan filter.</p>
                    <p className="text-xs text-[#8C7A6B] mt-1">Coba ubah kata kunci pencarian atau reset filter lokasi/tanggal.</p>
                  </td>
                </tr>
              ) : (
                filteredSchedule.map(slot => {
                  const isKapel = slot.location.toLowerCase().includes('kapel');
                  const assignedCount = slot.serverIds?.length || 0;

                  return (
                    <tr key={slot.id} className="hover:bg-[#FAF7F2]/70 transition-colors">
                      
                      {/* ID & Date */}
                      <td className="py-4 px-5 align-top">
                        <span className="inline-block font-mono text-[10px] font-bold bg-[#FAF7F2] border border-[#D9CEBA] text-[#5B1414] px-2 py-0.5 rounded-md mb-1">
                          {slot.id}
                        </span>
                        <div className="font-bold text-[#2B241E] text-sm">
                          {slot.displayDate}
                        </div>
                        <span className="text-[11px] text-[#6E5A4B] font-medium">
                          {slot.date}
                        </span>
                      </td>

                      {/* Time & Location */}
                      <td className="py-4 px-5 align-top">
                        <div className="flex items-center gap-1.5 font-extrabold text-[#5B1414]">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>{slot.massTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#6E5A4B] mt-1">
                          <MapPin className={`w-3.5 h-3.5 ${isKapel ? 'text-blue-600' : 'text-[#5B1414]'}`} />
                          <span className={isKapel ? 'text-blue-700 font-bold' : 'font-semibold'}>
                            {slot.location}
                          </span>
                        </div>
                      </td>

                      {/* Capacity */}
                      <td className="py-4 px-5 align-top">
                        <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-xl text-xs font-bold">
                          <span>{assignedCount}</span>
                          <span className="text-amber-700 font-normal">/ {slot.targetTotal}</span>
                        </div>
                      </td>

                      {/* Assigned Officers */}
                      <td className="py-4 px-5 align-top">
                        <div className="flex flex-wrap gap-1.5 max-w-xl">
                          {slot.serverIds && slot.serverIds.length > 0 ? (
                            slot.serverIds.map((sid, idx) => {
                              const off = officers.find(o => o.id === sid || o.id.padStart(3, '0') === sid?.padStart(3, '0'));
                              const slotKoorlapSet = new Set((slot.koorlapIds || []).map(id => id.padStart(3, '0')));
                              const isKoorlap = sid ? slotKoorlapSet.has(sid.padStart(3, '0')) : false;
                              const displayName = off ? (off.shortName || off.name) : (slot.serverNames?.[idx] || `ID ${sid}`);

                              return (
                                <span 
                                  key={idx}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${
                                    isKoorlap 
                                      ? 'bg-amber-100/80 border-amber-300 text-amber-900 shadow-2xs' 
                                      : 'bg-[#FAF7F2] border-[#D9CEBA] text-[#2B241E]'
                                  }`}
                                  title={off ? `${off.name} (${off.wilayah || 'Asisten Imam'})` : displayName}
                                >
                                  {isKoorlap && <ShieldCheck className="w-3 h-3 text-amber-700" />}
                                  <span className="font-mono text-[9px] text-[#6E5A4B]">#{sid}</span>
                                  <span>{displayName}</span>
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-xs text-rose-600 font-medium italic flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Belum ada petugas yang dialokasikan
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 align-top text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditModal(slot)}
                          className="p-1.5 bg-white hover:bg-amber-50 border border-[#D9CEBA] hover:border-amber-400 text-[#5B1414] hover:text-amber-800 rounded-xl transition-all shadow-xs inline-flex items-center gap-1 text-xs font-bold"
                          title="Edit Jadwal & Alokasi Petugas"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDuplicateSlot(slot)}
                          className="p-1.5 bg-white hover:bg-[#FAF7F2] border border-[#D9CEBA] text-[#6E5A4B] rounded-xl transition-all shadow-xs inline-flex items-center gap-1 text-xs font-semibold"
                          title="Duplikasi Jadwal ini"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setSlotToDelete(slot)}
                          className="p-1.5 bg-white hover:bg-rose-50 border border-[#D9CEBA] hover:border-rose-300 text-rose-600 hover:text-rose-800 rounded-xl transition-all shadow-xs inline-flex items-center gap-1 text-xs font-semibold"
                          title="Hapus Jadwal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW SCHEDULE SLOT                                           */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div 
            className="bg-white border border-[#D9CEBA] w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#5B1414] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-amber-300/30">
                  <Plus className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-headline">Buat Sesi Jadwal Misa Baru</h3>
                  <p className="text-xs text-amber-200/90 font-medium">Tentukan waktu, lokasi, dan alokasi petugas altar</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              
              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Date */}
                <div>
                  <label className="block font-bold text-[#5B1414] mb-1">Tanggal Misa</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-[#FAF7F2] border border-[#D9CEBA] rounded-xl px-3 py-2 font-medium text-[#2B241E] focus:outline-none focus:border-[#5B1414]"
                  />
                  <span className="text-[10px] text-[#6E5A4B] mt-1 block font-medium">
                    {getIndonesianDisplayDate(formData.date)}
                  </span>
                </div>

                {/* Time */}
                <div>
                  <label className="block font-bold text-[#5B1414] mb-1">Jam Misa</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.time}
                      onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      placeholder="e.g. 18:00"
                      className="w-full bg-[#FAF7F2] border border-[#D9CEBA] rounded-xl px-3 py-2 font-medium text-[#2B241E] focus:outline-none focus:border-[#5B1414]"
                    />
                  </div>
                  {/* Quick Time Pills */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['06:00', '08:00', '10:00', '17:00', '18:00', '18:30', '19:00'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, time: t }))}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                          formData.time === t ? 'bg-[#5B1414] text-white border-[#5B1414]' : 'bg-[#FAF7F2] text-[#6E5A4B] border-[#D9CEBA]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block font-bold text-[#5B1414] mb-1">Lokasi Ibadah</label>
                  <select
                    value={formData.location}
                    onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-[#FAF7F2] border border-[#D9CEBA] rounded-xl px-3 py-2 font-semibold text-[#5B1414] focus:outline-none focus:border-[#5B1414]"
                  >
                    <option value="Gereja Paroki Santo Yakobus">Gereja Paroki Santo Yakobus</option>
                    <option value="Kapel John Paul II">Kapel John Paul II</option>
                    <option value="Rumah Sakit EH">Rumah Sakit EH (Korsa &amp; RS)</option>
                  </select>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-[#6E5A4B] font-bold">Target Petugas:</span>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={formData.targetTotal}
                      onChange={e => setFormData(prev => ({ ...prev, targetTotal: parseInt(e.target.value) || 1 }))}
                      className="w-16 bg-[#FAF7F2] border border-[#D9CEBA] rounded-lg px-2 py-1 text-center font-bold text-[#5B1414]"
                    />
                  </div>
                </div>
              </div>

              {/* Officer Picker Section */}
              <div className="border-t border-[#D9CEBA] pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-[#5B1414] text-sm flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-600" />
                      <span>Alokasi Asisten Imam ({formData.selectedOfficerIds.length} Dipilih)</span>
                    </h4>
                    <p className="text-[11px] text-[#6E5A4B]">Pilih petugas untuk ditugaskan pada sesi misa ini. Klik perisai untuk menetapkan Koorlap.</p>
                  </div>

                  <div className="w-64">
                    <input
                      type="text"
                      value={officerModalSearch}
                      onChange={e => setOfficerModalSearch(e.target.value)}
                      placeholder="Cari nama / ID petugas..."
                      className="w-full bg-[#FAF7F2] border border-[#D9CEBA] rounded-xl px-3 py-1.5 text-xs text-[#2B241E] focus:outline-none focus:border-[#5B1414]"
                    />
                  </div>
                </div>

                {/* Selected Officers Strip */}
                {formData.selectedOfficerIds.length > 0 && (
                  <div className="mb-3 p-3 bg-amber-50/70 border border-amber-200 rounded-2xl">
                    <div className="text-[11px] font-bold text-amber-900 mb-1.5 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-amber-700" />
                      <span>Petugas Terpilih ({formData.selectedOfficerIds.length}):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.selectedOfficerIds.map(sid => {
                        const off = officers.find(o => o.id === sid || o.id.padStart(3, '0') === sid.padStart(3, '0'));
                        const isKoorlap = formData.koorlapOfficerIds.includes(sid);
                        return (
                          <div
                            key={sid}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                              isKoorlap ? 'bg-amber-200 border-amber-400 text-amber-950' : 'bg-white border-[#D9CEBA] text-[#2B241E]'
                            }`}
                          >
                            <span className="font-mono text-[9px] text-[#6E5A4B]">#{sid}</span>
                            <span>{off ? off.name : sid}</span>
                            <button
                              type="button"
                              onClick={e => toggleOfficerKoorlap(sid, e)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase transition-colors ${
                                isKoorlap 
                                  ? 'bg-amber-600 text-white hover:bg-amber-700' 
                                  : 'bg-[#EAE2D5] text-[#6E5A4B] hover:bg-amber-300 hover:text-amber-950'
                              }`}
                              title={isKoorlap ? 'Status: Koorlap (Klik untuk ubah jadi AI)' : 'Status: AI (Klik untuk jadikan Koorlap)'}
                            >
                              {isKoorlap ? 'KOORLAP' : 'AI'}
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleOfficerSelection(sid)}
                              className="text-[#8C7A6B] hover:text-rose-600 ml-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available Officers Scroll List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1 bg-[#FAF7F2] border border-[#D9CEBA] rounded-2xl">
                  {modalFilteredOfficers.map(off => {
                    const isSelected = formData.selectedOfficerIds.includes(off.id) || formData.selectedOfficerIds.includes(off.id.padStart(3, '0'));
                    const hasConflict = getConflictWarning(off.id, formData.date, formData.time);

                    return (
                      <div
                        key={off.id}
                        onClick={() => toggleOfficerSelection(off.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#5B1414] text-white border-[#5B1414] shadow-xs'
                            : hasConflict
                            ? 'bg-rose-50/70 border-rose-200 text-[#2B241E] hover:border-rose-400'
                            : 'bg-white border-[#D9CEBA] text-[#2B241E] hover:border-[#5B1414]/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-[10px] font-black shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-[#FAF7F2] text-[#5B1414] border border-[#D9CEBA]'
                          }`}>
                            {off.id}
                          </div>
                          <div className="truncate">
                            <p className="font-bold text-xs truncate leading-tight">{off.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                              <span className={isSelected ? 'text-amber-200' : 'text-[#6E5A4B]'}>
                                {off.dutyCount || 0} Tugas
                              </span>
                              {off.isKoorlap && (
                                <span className={`px-1 rounded text-[9px] font-bold ${
                                  isSelected ? 'bg-amber-300 text-black' : 'bg-amber-100 text-amber-900'
                                }`}>
                                  Koorlap
                                </span>
                              )}
                              {hasConflict && !isSelected && (
                                <span className="text-rose-600 font-bold flex items-center gap-0.5">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  Bentrok
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 ml-2">
                          {isSelected ? (
                            <CheckCircle2 className="w-4 h-4 text-amber-300" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-[#D9CEBA]" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-[#FAF7F2] border-t border-[#D9CEBA] p-4 flex items-center justify-between">
              <span className="text-xs text-[#6E5A4B] font-medium">
                {formData.selectedOfficerIds.length} petugas dipilih untuk jadwal ini.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-white border border-[#D9CEBA] hover:bg-[#FAF7F2] text-[#6E5A4B] font-bold rounded-xl text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveCreate}
                  className="px-5 py-2 bg-[#5B1414] hover:bg-[#420D0D] text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Simpan Jadwal Baru</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT EXISTING SCHEDULE SLOT                                        */}
      {/* ========================================================================= */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div 
            className="bg-white border border-[#D9CEBA] w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#5B1414] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-amber-300/30">
                  <Edit3 className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-headline">Edit Jadwal Misa #{editingSlot.id}</h3>
                  <p className="text-xs text-amber-200/90 font-medium">{editingSlot.displayDate} - {editingSlot.massTime}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingSlot(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              
              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Date */}
                <div>
                  <label className="block font-bold text-[#5B1414] mb-1">Tanggal Misa</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-[#FAF7F2] border border-[#D9CEBA] rounded-xl px-3 py-2 font-medium text-[#2B241E] focus:outline-none focus:border-[#5B1414]"
                  />
                  <span className="text-[10px] text-[#6E5A4B] mt-1 block font-medium">
                    {getIndonesianDisplayDate(formData.date)}
                  </span>
                </div>

                {/* Time */}
                <div>
                  <label className="block font-bold text-[#5B1414] mb-1">Jam Misa</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full bg-[#FAF7F2] border border-[#D9CEBA] rounded-xl px-3 py-2 font-medium text-[#2B241E] focus:outline-none focus:border-[#5B1414]"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['06:00', '08:00', '10:00', '17:00', '18:00', '18:30', '19:00'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, time: t }))}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                          formData.time === t ? 'bg-[#5B1414] text-white border-[#5B1414]' : 'bg-[#FAF7F2] text-[#6E5A4B] border-[#D9CEBA]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block font-bold text-[#5B1414] mb-1">Lokasi Ibadah</label>
                  <select
                    value={formData.location}
                    onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-[#FAF7F2] border border-[#D9CEBA] rounded-xl px-3 py-2 font-semibold text-[#5B1414] focus:outline-none focus:border-[#5B1414]"
                  >
                    <option value="Gereja Paroki Santo Yakobus">Gereja Paroki Santo Yakobus</option>
                    <option value="Kapel John Paul II">Kapel John Paul II</option>
                    <option value="Rumah Sakit EH">Rumah Sakit EH (Korsa &amp; RS)</option>
                  </select>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-[#6E5A4B] font-bold">Target Petugas:</span>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={formData.targetTotal}
                      onChange={e => setFormData(prev => ({ ...prev, targetTotal: parseInt(e.target.value) || 1 }))}
                      className="w-16 bg-[#FAF7F2] border border-[#D9CEBA] rounded-lg px-2 py-1 text-center font-bold text-[#5B1414]"
                    />
                  </div>
                </div>
              </div>

              {/* Status Selector */}
              <div className="bg-[#FAF7F2] border border-[#D9CEBA] p-3 rounded-2xl flex items-center justify-between">
                <span className="font-bold text-[#5B1414]">Status Operasional Slot:</span>
                <select
                  value={formData.status}
                  onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as ScheduleSlot['status'] }))}
                  className="bg-white border border-[#D9CEBA] rounded-xl px-3 py-1.5 font-bold text-xs text-[#5B1414] focus:outline-none"
                >
                  <option value="Scheduled">Scheduled (Terjadwal)</option>
                  <option value="Tukar Jadwal">Tukar Jadwal (Ada Pergantian)</option>
                  <option value="Needs Server">Needs Server (Kurang Petugas)</option>
                  <option value="Berlangsung">Berlangsung (Sedang Berjalan)</option>
                  <option value="Selesai">Selesai (Sudah Terlaksana)</option>
                </select>
              </div>

              {/* Officer Picker Section */}
              <div className="border-t border-[#D9CEBA] pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-[#5B1414] text-sm flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-600" />
                      <span>Alokasi Asisten Imam ({formData.selectedOfficerIds.length} Petugas)</span>
                    </h4>
                    <p className="text-[11px] text-[#6E5A4B]">Centang untuk menambah/menghapus petugas. Klik 'Koorlap' untuk menetapkan koordinator lapangan.</p>
                  </div>

                  <div className="w-64">
                    <input
                      type="text"
                      value={officerModalSearch}
                      onChange={e => setOfficerModalSearch(e.target.value)}
                      placeholder="Cari nama / ID petugas..."
                      className="w-full bg-[#FAF7F2] border border-[#D9CEBA] rounded-xl px-3 py-1.5 text-xs text-[#2B241E] focus:outline-none focus:border-[#5B1414]"
                    />
                  </div>
                </div>

                {/* Selected Officers Strip */}
                {formData.selectedOfficerIds.length > 0 && (
                  <div className="mb-3 p-3 bg-amber-50/70 border border-amber-200 rounded-2xl">
                    <div className="text-[11px] font-bold text-amber-900 mb-1.5 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-amber-700" />
                      <span>Petugas Terpilih ({formData.selectedOfficerIds.length}):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.selectedOfficerIds.map(sid => {
                        const off = officers.find(o => o.id === sid || o.id.padStart(3, '0') === sid.padStart(3, '0'));
                        const isKoorlap = formData.koorlapOfficerIds.includes(sid);
                        return (
                          <div
                            key={sid}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                              isKoorlap ? 'bg-amber-200 border-amber-400 text-amber-950' : 'bg-white border-[#D9CEBA] text-[#2B241E]'
                            }`}
                          >
                            <span className="font-mono text-[9px] text-[#6E5A4B]">#{sid}</span>
                            <span>{off ? off.name : sid}</span>
                            <button
                              type="button"
                              onClick={e => toggleOfficerKoorlap(sid, e)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase transition-colors ${
                                isKoorlap 
                                  ? 'bg-amber-600 text-white hover:bg-amber-700' 
                                  : 'bg-[#EAE2D5] text-[#6E5A4B] hover:bg-amber-300 hover:text-amber-950'
                              }`}
                              title={isKoorlap ? 'Status: Koorlap (Klik untuk ubah jadi AI)' : 'Status: AI (Klik untuk jadikan Koorlap)'}
                            >
                              {isKoorlap ? 'KOORLAP' : 'AI'}
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleOfficerSelection(sid)}
                              className="text-[#8C7A6B] hover:text-rose-600 ml-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available Officers Scroll List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1 bg-[#FAF7F2] border border-[#D9CEBA] rounded-2xl">
                  {modalFilteredOfficers.map(off => {
                    const isSelected = formData.selectedOfficerIds.includes(off.id) || formData.selectedOfficerIds.includes(off.id.padStart(3, '0'));
                    const hasConflict = getConflictWarning(off.id, formData.date, formData.time, editingSlot.id);

                    return (
                      <div
                        key={off.id}
                        onClick={() => toggleOfficerSelection(off.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#5B1414] text-white border-[#5B1414] shadow-xs'
                            : hasConflict
                            ? 'bg-rose-50/70 border-rose-200 text-[#2B241E] hover:border-rose-400'
                            : 'bg-white border-[#D9CEBA] text-[#2B241E] hover:border-[#5B1414]/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-[10px] font-black shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-[#FAF7F2] text-[#5B1414] border border-[#D9CEBA]'
                          }`}>
                            {off.id}
                          </div>
                          <div className="truncate">
                            <p className="font-bold text-xs truncate leading-tight">{off.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                              <span className={isSelected ? 'text-amber-200' : 'text-[#6E5A4B]'}>
                                {off.dutyCount || 0} Tugas
                              </span>
                              {off.isKoorlap && (
                                <span className={`px-1 rounded text-[9px] font-bold ${
                                  isSelected ? 'bg-amber-300 text-black' : 'bg-amber-100 text-amber-900'
                                }`}>
                                  Koorlap
                                </span>
                              )}
                              {hasConflict && !isSelected && (
                                <span className="text-rose-600 font-bold flex items-center gap-0.5">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  Bentrok
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 ml-2">
                          {isSelected ? (
                            <CheckCircle2 className="w-4 h-4 text-amber-300" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-[#D9CEBA]" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-[#FAF7F2] border-t border-[#D9CEBA] p-4 flex items-center justify-between">
              <span className="text-xs text-[#6E5A4B] font-medium">
                {formData.selectedOfficerIds.length} petugas dialokasikan.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2 bg-white border border-[#D9CEBA] hover:bg-[#FAF7F2] text-[#6E5A4B] font-bold rounded-xl text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-5 py-2 bg-[#5B1414] hover:bg-[#420D0D] text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION                                                */}
      {/* ========================================================================= */}
      {slotToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#D9CEBA] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-[#5B1414] font-headline">Hapus Sesi Jadwal Misa?</h3>
              <p className="text-xs text-[#6E5A4B]">
                Anda akan menghapus slot <strong>{slotToDelete.displayDate} ({slotToDelete.massTime})</strong> di {slotToDelete.location}. Tindakan ini akan membebaskan {slotToDelete.serverIds?.length || 0} petugas yang terjadwal.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSlotToDelete(null)}
                className="flex-1 py-2.5 bg-[#FAF7F2] hover:bg-[#EAE2D5] text-[#6E5A4B] font-bold rounded-xl text-xs transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                Ya, Hapus Slot
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
