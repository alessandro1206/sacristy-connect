import React, { useState } from 'react';
import { Officer } from '../types';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  MapPin, 
  ShieldCheck, 
  UserCheck, 
  Calendar,
  Sparkles,
  Award,
  Filter
} from 'lucide-react';
import { playAudioFeedback } from '../utils/sound';

interface ServerManagementViewProps {
  officers: Officer[];
  onAddOfficer: (officer: Officer) => void;
  onUpdateOfficer?: (updatedOfficer: Officer) => void;
  onToggleStatus: (id: string) => void;
}

export const ServerManagementView: React.FC<ServerManagementViewProps> = ({
  officers,
  onAddOfficer,
  onUpdateOfficer,
  onToggleStatus
}) => {
  // Form fields state (exact match to Google Stitch design)
  const [namaLengkap, setNamaLengkap] = useState<string>('');
  const [noAbsen, setNoAbsen] = useState<string>('');
  const [masaBakti, setMasaBakti] = useState<string>('2024 - 2027');
  const [wilayah, setWilayah] = useState<string>('');
  const [peranPetugas, setPeranPetugas] = useState<'hanya' | 'koorlap'>('hanya');
  const [preferensiMisaHarian, setPreferensiMisaHarian] = useState<'ya' | 'tidak'>('ya');
  const [lokasiPelayanan, setLokasiPelayanan] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit Officer Modal State
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editWilayah, setEditWilayah] = useState<string>('');
  const [editRole, setEditRole] = useState<'Asisten Imam' | 'Koorlap'>('Asisten Imam');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editStatus, setEditStatus] = useState<'Aktif' | 'Cuti' | 'Tidak Aktif'>('Aktif');

  // Search and filter for registered list
  const [search, setSearch] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterLokasi, setFilterLokasi] = useState<string>('all');

  const openEditModal = (officer: Officer) => {
    setEditingOfficer(officer);
    setEditName(officer.name);
    setEditWilayah(officer.wilayah);
    setEditRole(officer.isKoorlap ? 'Koorlap' : 'Asisten Imam');
    setEditPhone(officer.phone || '0812-0000-0000');
    setEditStatus(officer.status);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOfficer) return;

    const isKoor = editRole === 'Koorlap';
    const nameTrim = editName.trim();
    const nameParts = nameTrim.split(' ');
    const shortName = nameParts.length <= 2 ? nameTrim : `${nameParts[0]} ${nameParts.slice(1).map(p => p[0] + '.').join(' ')}`;

    const updated: Officer = {
      ...editingOfficer,
      name: nameTrim,
      shortName,
      wilayah: editWilayah.trim(),
      isKoorlap: isKoor,
      role: isKoor ? 'Asisten Imam - Koordinator Lapangan (Koorlap)' : 'Asisten Imam',
      phone: editPhone.trim(),
      status: editStatus
    };

    if (onUpdateOfficer) {
      onUpdateOfficer(updated);
    }
    playAudioFeedback('success');
    setSuccessMessage(`Profil ${nameTrim} (ID #${editingOfficer.id}) berhasil diperbarui!`);
    setTimeout(() => setSuccessMessage(null), 4000);
    setEditingOfficer(null);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLengkap.trim() || !noAbsen.trim()) {
      alert('Mohon lengkapi Nama Lengkap dan No. Absen!');
      return;
    }

    const formattedId = noAbsen.trim().padStart(3, '0');
    const isKoorlap = peranPetugas === 'koorlap';
    const chosenLocation = lokasiPelayanan || 'Gereja Utama';

    const newOfficer: Officer = {
      id: formattedId,
      name: namaLengkap.trim(),
      shortName: namaLengkap.trim().split(' ')[0] + ' ' + (namaLengkap.trim().split(' ')[1]?.[0] || '') + '.',
      initials: namaLengkap.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      role: isKoorlap ? 'Asisten Imam - Koordinator Lapangan (Koorlap)' : 'Asisten Imam',
      isKoorlap: isKoorlap,
      wilayah: wilayah.trim() || 'Wilayah Santo Petrus',
      lokasiPelayanan: chosenLocation,
      masaBakti: masaBakti.trim() || '2024 - 2027',
      preferensiMisaHarian: preferensiMisaHarian === 'ya',
      phone: '0812-0000-0000',
      avatarUrl: `https://images.unsplash.com/photo-${isKoorlap ? '1507003211169-0a1dd7228f2d' : '1534528741775-53994a69daeb'}?w=300&h=300&fit=crop&crop=face`,
      dutyCount: 0,
      status: 'Aktif'
    };

    onAddOfficer(newOfficer);
    playAudioFeedback('success');
    setSuccessMessage(`Data ${namaLengkap} (No. ${formattedId}) berhasil disimpan ke database asisten imam!`);
    setTimeout(() => setSuccessMessage(null), 4000);

    // Reset form
    setNamaLengkap('');
    setNoAbsen('');
    setWilayah('');
    setLokasiPelayanan('');
  };

  const filteredOfficers = officers.filter(o => {
    const matchesSearch = 
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.id.includes(search) ||
      (o.wilayah && o.wilayah.toLowerCase().includes(search.toLowerCase())) ||
      (o.lokasiPelayanan && o.lokasiPelayanan.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterRole === 'koorlap' && !o.isKoorlap && !o.role.toLowerCase().includes('koorlap')) return false;
    if (filterRole === 'asisten' && (o.isKoorlap || o.role.toLowerCase().includes('koorlap'))) return false;
    if (filterLokasi !== 'all' && o.lokasiPelayanan !== filterLokasi) return false;

    return true;
  });

  return (
    <div className="flex-1 bg-[#fbf9f5] overflow-y-auto p-6 md:p-8 selection:bg-primary/20">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Toast / Banner Success */}
        {successMessage && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-300 text-emerald-900 px-5 py-3.5 rounded-xl shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-semibold">{successMessage}</p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 1: FORM INPUT PROFIL ASISTEN IMAM (Replika Persis Stitch Image 1) */}
        {/* ========================================================================= */}
        <div className="bg-[#f7f3eb] border border-[#e6ded2] rounded-2xl p-6 md:p-8 shadow-xs">
          {/* Header Title & Subtitle */}
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[#7c191e] font-serif tracking-tight">
              Input Profil Asisten Imam
            </h2>
            <p className="text-sm text-[#665e55] mt-1 font-medium">
              Formulir pendaftaran untuk mengelola data 170 petugas Asisten Imam Paroki Santo Yakobus.
            </p>
            <p className="text-xs text-[#8f857a] mt-0.5 italic">
              Data ini dikelola sebagai database dasar selama masa tugas 3 tahun.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: Nama Lengkap & No. Absen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-[#4a4239] uppercase tracking-wider">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  required
                  className="w-full px-4 py-2.5 bg-white border border-[#d6cbbe] rounded-lg text-sm text-[#2b241e] placeholder:text-[#9e9488] focus:outline-none focus:ring-2 focus:ring-[#7c191e]/40 focus:border-[#7c191e] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#4a4239] uppercase tracking-wider">
                  No. Absen
                </label>
                <input
                  type="text"
                  value={noAbsen}
                  onChange={(e) => setNoAbsen(e.target.value)}
                  placeholder="001-170"
                  required
                  className="w-full px-4 py-2.5 bg-white border border-[#d6cbbe] rounded-lg text-sm text-[#2b241e] placeholder:text-[#9e9488] focus:outline-none focus:ring-2 focus:ring-[#7c191e]/40 focus:border-[#7c191e] transition-all"
                />
              </div>
            </div>

            {/* Row 2: Masa Bakti (3 Tahun) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4a4239] uppercase tracking-wider">
                Masa Bakti (3 Tahun)
              </label>
              <input
                type="text"
                value={masaBakti}
                onChange={(e) => setMasaBakti(e.target.value)}
                placeholder="Contoh: 2024 - 2027"
                className="w-full px-4 py-2.5 bg-white border border-[#d6cbbe] rounded-lg text-sm text-[#2b241e] placeholder:text-[#9e9488] focus:outline-none focus:ring-2 focus:ring-[#7c191e]/40 focus:border-[#7c191e] transition-all"
              />
            </div>

            {/* Row 3: Wilayah */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4a4239] uppercase tracking-wider">
                Wilayah
              </label>
              <input
                type="text"
                value={wilayah}
                onChange={(e) => setWilayah(e.target.value)}
                placeholder="Contoh: Wilayah Santo Petrus"
                className="w-full px-4 py-2.5 bg-white border border-[#d6cbbe] rounded-lg text-sm text-[#2b241e] placeholder:text-[#9e9488] focus:outline-none focus:ring-2 focus:ring-[#7c191e]/40 focus:border-[#7c191e] transition-all"
              />
            </div>

            {/* Row 4: Peran Petugas (Radio Buttons) */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-[#4a4239] uppercase tracking-wider block">
                Peran Petugas
              </label>
              <div className="flex flex-wrap items-center gap-6 text-sm text-[#3b342e]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="peranPetugas"
                    checked={peranPetugas === 'hanya'}
                    onChange={() => setPeranPetugas('hanya')}
                    className="w-4 h-4 text-[#7c191e] accent-[#7c191e] focus:ring-[#7c191e]"
                  />
                  <span>Hanya Asisten Imam</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="peranPetugas"
                    checked={peranPetugas === 'koorlap'}
                    onChange={() => setPeranPetugas('koorlap')}
                    className="w-4 h-4 text-[#7c191e] accent-[#7c191e] focus:ring-[#7c191e]"
                  />
                  <span>Asisten Imam - Koordinator Lapangan (Koorlap)</span>
                </label>
              </div>
            </div>

            {/* Row 5: Preferensi Misa Harian (Radio Buttons) */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-[#4a4239] uppercase tracking-wider block">
                Preferensi Misa Harian
              </label>
              <div className="flex items-center gap-6 text-sm text-[#3b342e]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="preferensiMisaHarian"
                    checked={preferensiMisaHarian === 'ya'}
                    onChange={() => setPreferensiMisaHarian('ya')}
                    className="w-4 h-4 text-[#7c191e] accent-[#7c191e] focus:ring-[#7c191e]"
                  />
                  <span>Ya, Bersedia</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="preferensiMisaHarian"
                    checked={preferensiMisaHarian === 'tidak'}
                    onChange={() => setPreferensiMisaHarian('tidak')}
                    className="w-4 h-4 text-[#7c191e] accent-[#7c191e] focus:ring-[#7c191e]"
                  />
                  <span>Tidak</span>
                </label>
              </div>
            </div>

            {/* Row 6: Kedekatan Lokasi Pelayanan */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-[#4a4239] uppercase tracking-wider">
                Kedekatan Lokasi Pelayanan
              </label>
              <select
                value={lokasiPelayanan}
                onChange={(e) => setLokasiPelayanan(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[#d6cbbe] rounded-lg text-sm text-[#2b241e] focus:outline-none focus:ring-2 focus:ring-[#7c191e]/40 focus:border-[#7c191e] transition-all"
              >
                <option value="">Pilih lokasi pelayanan terdekat</option>
                <option value="Gereja Utama">Gereja Utama Santo Yakobus</option>
                <option value="Kapel 1">Kapel 1 St. Andreas</option>
                <option value="Kapel 2">Kapel 2 St. Petrus</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="w-full md:w-auto px-7 py-3 bg-[#7c191e] hover:bg-[#681419] text-white text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 tracking-wide uppercase"
              >
                <Users className="w-4 h-4" />
                <span>Simpan Data Petugas</span>
              </button>
            </div>
          </form>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: DAFTAR PETUGAS TERDAFTAR (Tabel Persis Gambar Stitch) */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#e6ded2] rounded-2xl p-6 md:p-8 shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-[#2b241e] font-serif">
                Daftar Petugas Terdaftar
              </h3>
              <p className="text-xs text-[#665e55] mt-0.5">
                Total {officers.length} Asisten Imam terdaftar dalam masa bakti aktif
              </p>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-[#9e9488] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama / ID / wilayah..."
                  className="pl-9 pr-3 py-1.5 bg-[#fbf9f5] border border-[#d6cbbe] rounded-lg text-xs text-[#2b241e] focus:outline-none focus:ring-1 focus:ring-[#7c191e] w-48 sm:w-60"
                />
              </div>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-2.5 py-1.5 bg-[#fbf9f5] border border-[#d6cbbe] rounded-lg text-xs text-[#2b241e] focus:outline-none"
              >
                <option value="all">Semua Peran</option>
                <option value="koorlap">Koorlap Saja</option>
                <option value="asisten">Asisten Saja</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-[#eee6da] rounded-xl">
            <table className="w-full text-left text-xs text-[#3b342e]">
              <thead className="bg-[#f7f3eb] text-[#554d44] border-b border-[#eee6da] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-center w-20">No. Absen</th>
                  <th className="px-4 py-3">Nama Lengkap</th>
                  <th className="px-4 py-3">Wilayah</th>
                  <th className="px-4 py-3 text-center">Peran</th>
                  <th className="px-4 py-3">Lokasi</th>
                  <th className="px-4 py-3 text-center">Masa Bakti</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Aksi / Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2ecdf]">
                {filteredOfficers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-[#8f857a] italic">
                      Tidak ada data petugas yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredOfficers.map((officer) => {
                    const isKoorlap = officer.isKoorlap || officer.role.toLowerCase().includes('koorlap');
                    return (
                      <tr key={officer.id} className="hover:bg-[#faf7f0] transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-center text-[#7c191e]">
                          {officer.id}
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#1a140e]">
                          <div className="flex items-center gap-2">
                            <span>{officer.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#554d44]">
                          {officer.wilayah || 'Wilayah 1'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isKoorlap ? (
                            <span className="inline-block px-2.5 py-0.5 bg-[#fce8e8] text-[#8b1e23] border border-[#f3c1c3] rounded-full text-[11px] font-semibold">
                              Asisten Imam + Koorlap
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 bg-[#f0ebe1] text-[#554d44] border border-[#e0d6c7] rounded-full text-[11px] font-medium">
                              Asisten Imam
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#554d44]">
                          {officer.lokasiPelayanan || 'Gereja Utama'}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-[#665e55]">
                          {officer.masaBakti || '2024 - 2027'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => onToggleStatus(officer.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                              officer.status === 'Aktif'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                          >
                            {officer.status}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => openEditModal(officer)}
                            className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#5B1414] border border-[#D9CEBA] rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#5B1414]" />
                            <span>Edit</span>
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

      </div>

      {/* ========================================================================= */}
      {/* MODAL EDIT DATA PETUGAS ASISTEN IMAM                                     */}
      {/* ========================================================================= */}
      {editingOfficer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#f7f3eb] border-2 border-[#e6ded2] rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#e0d6c7] pb-4">
              <div>
                <span className="text-[11px] font-mono font-bold text-[#7c191e] uppercase tracking-wider block">
                  ID Absen #{editingOfficer.id}
                </span>
                <h3 className="text-xl font-bold text-[#2b241e] font-serif">
                  Edit Profil Petugas
                </h3>
              </div>
              <button
                onClick={() => setEditingOfficer(null)}
                className="w-8 h-8 rounded-full bg-[#e8dfd1] text-[#554d44] flex items-center justify-center font-bold hover:bg-[#d6cbbe]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#4a4239] uppercase tracking-wider">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-white border border-[#d6cbbe] rounded-xl text-sm font-semibold text-[#2b241e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#4a4239] uppercase tracking-wider">
                    Wilayah Paroki
                  </label>
                  <input
                    type="text"
                    value={editWilayah}
                    onChange={(e) => setEditWilayah(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#d6cbbe] rounded-xl text-xs text-[#2b241e]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#4a4239] uppercase tracking-wider">
                    Peran Petugas
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#d6cbbe] rounded-xl text-xs font-bold text-[#2b241e]"
                  >
                    <option value="Asisten Imam">Asisten Imam</option>
                    <option value="Koorlap">Asisten Imam + Koorlap</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#4a4239] uppercase tracking-wider">
                    No. WhatsApp / Telepon
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#d6cbbe] rounded-xl text-xs text-[#2b241e]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#4a4239] uppercase tracking-wider">
                    Status Aktivasi
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#d6cbbe] rounded-xl text-xs font-bold text-[#2b241e]"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#e0d6c7]">
                <button
                  type="button"
                  onClick={() => setEditingOfficer(null)}
                  className="px-4 py-2 bg-[#e0d6c7] hover:bg-[#d6cbbe] text-[#554d44] text-xs font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7c191e] hover:bg-[#681419] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Simpan Perubahan Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

