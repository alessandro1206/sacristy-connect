import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
  ShieldCheck, 
  MessageSquare, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { Officer, ScheduleSlot, UserSession } from '../types';
import { playAudioFeedback } from '../utils/sound';

interface OfficerPersonalScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSession: UserSession;
  officers: Officer[];
  schedule: ScheduleSlot[];
  onOpenLeaveModal?: () => void;
  onOpenSwapChat?: () => void;
  onLogout?: () => void;
  onOpenLoginModal?: (role?: 'officer' | 'register') => void;
}

export const OfficerPersonalScheduleModal: React.FC<OfficerPersonalScheduleModalProps> = ({
  isOpen,
  onClose,
  userSession,
  officers,
  schedule,
  onOpenLeaveModal,
  onOpenSwapChat,
  onLogout,
  onOpenLoginModal
}) => {
  const [activeTab, setActiveTab] = useState<'duties' | 'profile'>('duties');
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>(userSession.officerId || '001');
  const [searchDateQuery, setSearchDateQuery] = useState<string>('');

  if (!isOpen) {
    return null;
  }


  // Find selected officer details
  const officer = officers.find(o => o.id === selectedOfficerId || o.id.padStart(3, '0') === selectedOfficerId.padStart(3, '0')) || officers[0] || {
    id: '001',
    name: 'Gatot Christhariyono',
    shortName: 'Gatot Christhariyono',
    initials: 'GC',
    role: 'Asisten Imam - Koordinator Lapangan (Koorlap)',
    wilayah: 'Wilayah Agustinus',
    phone: '0812-3456-7890',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    dutyCount: 12,
    status: 'Aktif' as const
  };


  // Find all schedule slots assigned to this officer in September 2026
  const officerId3 = officer.id.padStart(3, '0');
  const myAssignedSlots = schedule.filter(slot => {
    if (!slot.serverIds) return false;
    return slot.serverIds.some(sid => sid && (sid === officer.id || sid.padStart(3, '0') === officerId3));
  });

  const filteredDutySlots = myAssignedSlots.filter(slot => {
    if (!searchDateQuery.trim()) return true;
    const q = searchDateQuery.toLowerCase();
    return (
      slot.displayDate.toLowerCase().includes(q) ||
      slot.massTime.toLowerCase().includes(q) ||
      slot.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-[#FAF7F2] border-2 border-[#D9CEBA] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-[#5B1414] text-white p-5 flex items-center justify-between relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-bl-full pointer-events-none" />
          
          <div className="flex items-center gap-3.5 z-10">
            <img 
              src={officer.avatarUrl} 
              alt={officer.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-300 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-400 text-[#4A0E17] text-[10px] font-black uppercase tracking-wider font-mono">
                  No. {officer.id.padStart(3, '0')}
                </span>
                <span className="text-xs font-semibold text-white/80">
                  {officer.wilayah || 'Asisten Imam'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold font-headline text-white mt-0.5">
                {officer.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 z-10">
            <button
              onClick={() => {
                playAudioFeedback('tap');
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Navigation Sub-header with Officer Selector */}
        <div className="bg-white border-b border-[#E8DFC8] px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('duties')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'duties' 
                  ? 'bg-[#5B1414] text-white shadow-xs' 
                  : 'bg-[#FAF7F2] text-[#6E5A4B] hover:bg-[#F3EDE2]'
              }`}
            >
              📅 Tanggal Tugas Saya ({myAssignedSlots.length})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'profile' 
                  ? 'bg-[#5B1414] text-white shadow-xs' 
                  : 'bg-[#FAF7F2] text-[#6E5A4B] hover:bg-[#F3EDE2]'
              }`}
            >
              👤 Profil &amp; Status
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#6E5A4B]">Pilih Petugas:</span>
            <select
              value={selectedOfficerId}
              onChange={(e) => setSelectedOfficerId(e.target.value)}
              className="px-2.5 py-1.5 bg-[#FAF7F2] border border-[#D9CEBA] rounded-xl text-xs font-bold text-[#5B1414] focus:outline-none cursor-pointer"
            >
              {officers.map(o => (
                <option key={o.id} value={o.id}>
                  #{o.id.padStart(3, '0')} — {o.name} ({o.wilayah || 'Asisten Imam'})
                </option>
              ))}
            </select>
          </div>

          {onLogout && (
            <button
              onClick={() => {
                playAudioFeedback('tap');
                onLogout();
                onClose();
              }}
              className="text-red-700 hover:text-red-900 font-bold flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Sesi</span>
            </button>
          )}
        </div>

        {/* Modal Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">

          {/* Unauthenticated Login Prompt Banner */}
          {!userSession.isAuthenticated && (
            <div className="p-4 bg-[#FAF3E6] border border-[#E6D6BD] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <p className="font-bold text-[#5B1414]">Anda belum masuk akun (Tamu / Guest)</p>
                  <p className="text-[#6E5A4B] text-[11px]">Masuk akun atau daftarkan akun baru untuk mengakses profil resmi Anda.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    playAudioFeedback('tap');
                    onClose();
                    onOpenLoginModal?.('officer');
                  }}
                  className="px-3.5 py-1.5 bg-[#5B1414] hover:bg-[#420D0D] text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  🔑 Masuk
                </button>
                <button
                  onClick={() => {
                    playAudioFeedback('tap');
                    onClose();
                    onOpenLoginModal?.('register');
                  }}
                  className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-[#4A0E17] font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  ➕ Buat Akun
                </button>
              </div>
            </div>
          )}

          {activeTab === 'duties' && (

            <div className="space-y-3">
              {/* Header & Date Search Filter */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <h3 className="text-xs font-black text-[#5B1414] uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#5B1414]" />
                  <span>JADWAL TUGAS MISA</span>
                </h3>
                <span className="text-[11px] font-bold text-[#8C7662]">
                  Total: {filteredDutySlots.length} Misa Terdaftar
                </span>
              </div>

              {/* Date Search Input Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchDateQuery}
                  onChange={(e) => setSearchDateQuery(e.target.value)}
                  placeholder="🔍 Cari tanggal tugas (contoh: 06 Sep, Minggu, 18:00)..."
                  className="w-full px-4 py-2 bg-white border border-[#D9CEBA] rounded-xl text-xs font-semibold text-[#2C2420] focus:outline-none focus:border-[#5B1414] shadow-2xs"
                />
                {searchDateQuery && (
                  <button
                    onClick={() => setSearchDateQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8C7662] hover:text-[#5B1414]"
                  >
                    ✕ Hapus
                  </button>
                )}
              </div>

              {filteredDutySlots.length === 0 ? (
                <div className="p-8 text-center bg-white border border-[#E8DFC8] rounded-2xl text-[#8C7662]">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600 mb-2 opacity-80" />
                  <p className="text-sm font-bold text-[#2C2420]">Tidak ada jadwal tugas yang cocok</p>
                  <p className="text-xs mt-1">Coba kata kunci pencarian tanggal yang lain.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredDutySlots.map((slot, idx) => {
                    const isAttended = slot.attendedServerIds?.includes(officer.id);
                    return (
                      <div 
                        key={slot.id || idx}
                        className="bg-white border-2 border-[#D9CEBA] rounded-2xl p-4 shadow-2xs hover:border-[#5B1414] transition-all"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#5B1414]/10 text-[#5B1414] text-xs font-bold uppercase font-mono">
                              📅 {slot.displayDate}
                            </span>
                            <span className="text-xs font-extrabold text-[#5B1414]">
                              ⏰ {slot.massTime}
                            </span>
                            {isAttended && (
                              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                                ✓ Hadir
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-extrabold text-[#2C2420] flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#7C191E]" />
                            <span>{slot.location}</span>
                          </h4>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (

            <div className="bg-white border border-[#E8DFC8] rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-black text-[#5B1414] uppercase tracking-wider">
                Informasi Pelayanan Asisten Imam
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFC8]">
                  <span className="text-[#8C7662] block mb-0.5">Nama Lengkap</span>
                  <span className="font-bold text-[#2C2420] text-sm">{officer.name}</span>
                </div>
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFC8]">
                  <span className="text-[#8C7662] block mb-0.5">No. Absen Petugas</span>
                  <span className="font-bold text-[#5B1414] font-mono text-sm">No. {officer.id.padStart(3, '0')}</span>
                </div>
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFC8]">
                  <span className="text-[#8C7662] block mb-0.5">Wilayah Paroki</span>

                  <span className="font-bold text-[#2C2420]">{officer.wilayah}</span>
                </div>
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFC8]">
                  <span className="text-[#8C7662] block mb-0.5">Status Akses</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                    ✓ Aktif Terverifikasi
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-white border-t border-[#E8DFC8] p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {onOpenLeaveModal && (
              <button
                onClick={() => {
                  playAudioFeedback('tap');
                  onClose();
                  onOpenLeaveModal();
                }}
                className="px-3.5 py-2 bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#5B1414] border border-[#D9CEBA] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Ajukan Cuti / Izin</span>
              </button>
            )}
          </div>

          <button
            onClick={() => {
              playAudioFeedback('tap');
              onClose();
            }}
            className="px-5 py-2 bg-[#5B1414] hover:bg-[#4A0E17] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
