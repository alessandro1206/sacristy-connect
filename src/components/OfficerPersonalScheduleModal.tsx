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
  LogOut,
  User
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
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>(
    userSession.officerId || (userSession.isAuthenticated ? '001' : '')
  );
  const [searchDateQuery, setSearchDateQuery] = useState<string>('');

  if (!isOpen) {
    return null;
  }

  // Find selected officer details if any
  const officer = selectedOfficerId
    ? officers.find(o => o.id === selectedOfficerId || o.id.padStart(3, '0') === selectedOfficerId.padStart(3, '0'))
    : null;

  // Find all schedule slots assigned to this officer in September 2026
  const officerId3 = officer ? officer.id.padStart(3, '0') : '';
  const myAssignedSlots = officer ? schedule.filter(slot => {
    if (!slot.serverIds) return false;
    return slot.serverIds.some(sid => sid && (sid === officer.id || sid.padStart(3, '0') === officerId3));
  }) : [];

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
        className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between relative overflow-hidden shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3.5 z-10">
            {officer ? (
              <img 
                src={officer.avatarUrl} 
                alt={officer.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md bg-white"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-amber-400 flex items-center justify-center shadow-md">
                <User className="w-7 h-7 text-amber-400" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider font-mono">
                  {officer ? `No. ${officer.id.padStart(3, '0')}` : 'Tamu / Belum Login'}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {officer ? (officer.wilayah || 'Asisten Imam') : 'Paroki Santo Yakobus'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black font-headline text-white mt-1">
                {officer ? officer.name : 'Profil & Tanggal Tugas Saya'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 z-10">
            <button
              onClick={() => {
                playAudioFeedback('tap');
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Navigation Sub-header with Officer Selector */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('duties')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'duties' 
                  ? 'bg-slate-900 text-white shadow-xs font-black' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              📅 Tanggal Tugas ({myAssignedSlots.length})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'profile' 
                  ? 'bg-slate-900 text-white shadow-xs font-black' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              👤 Profil &amp; Status
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">Pilih Petugas:</span>
            <select
              value={selectedOfficerId}
              onChange={(e) => setSelectedOfficerId(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none cursor-pointer max-w-[240px] truncate shadow-2xs"
            >
              <option value="">-- Pilih ID / Nama Petugas Anda --</option>
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
              className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Sesi</span>
            </button>
          )}
        </div>

        {/* Modal Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 bg-slate-50/50">

          {/* Unauthenticated Login Prompt Banner */}
          {!userSession.isAuthenticated && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <p className="font-bold text-amber-950">Anda belum masuk akun (Tamu / Guest)</p>
                  <p className="text-amber-800 text-[11px]">Masuk akun atau daftarkan akun baru untuk mengakses profil resmi Anda.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    playAudioFeedback('tap');
                    onClose();
                    onOpenLoginModal?.('officer');
                  }}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  🔑 Masuk
                </button>
                <button
                  onClick={() => {
                    playAudioFeedback('tap');
                    onClose();
                    onOpenLoginModal?.('register');
                  }}
                  className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-xs transition-all cursor-pointer"
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
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>JADWAL TUGAS MISA</span>
                </h3>
                <span className="text-[11px] font-bold text-slate-500">
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
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-400 shadow-2xs"
                />
                {searchDateQuery && (
                  <button
                    onClick={() => setSearchDateQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700"
                  >
                    ✕ Hapus
                  </button>
                )}
              </div>

              {filteredDutySlots.length === 0 ? (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600 mb-2 opacity-80" />
                  <p className="text-sm font-bold text-slate-900">Tidak ada jadwal tugas yang cocok</p>
                  <p className="text-xs mt-1">Coba kata kunci pencarian tanggal yang lain.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredDutySlots.map((slot, idx) => {
                    const isAttended = slot.attendedServerIds?.includes(officer ? officer.id : '');
                    const slotKoorlapSet = new Set((slot.koorlapIds || []).map(id => id.padStart(3, '0')));
                    const isKoorlapForThisSlot = officer && slotKoorlapSet.has(officer.id.padStart(3, '0'));

                    return (
                      <div 
                        key={slot.id || idx}
                        className={`bg-white border rounded-2xl p-4 shadow-2xs hover:border-slate-400 transition-all ${
                          isKoorlapForThisSlot ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap justify-between">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase font-mono">
                                📅 {slot.displayDate}
                              </span>
                              <span className="text-xs font-black text-slate-900">
                                ⏰ {slot.massTime}
                              </span>
                              {isAttended && (
                                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                                  ✓ Hadir
                                </span>
                              )}
                            </div>

                            {/* Slot-specific Role Badge */}
                            {isKoorlapForThisSlot ? (
                              <span className="text-[10px] font-black bg-amber-100 text-amber-950 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                                👑 Koorlap Bertugas
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full">
                                Asisten Imam (AI)
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-600" />
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

          {activeTab === 'profile' && officer && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Informasi Pelayanan Asisten Imam
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Nama Lengkap</span>
                  <span className="font-bold text-slate-900 text-sm">{officer.name}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-0.5">No. Absen Petugas</span>
                  <span className="font-black text-slate-900 font-mono text-sm">No. {officer.id.padStart(3, '0')}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Wilayah Paroki</span>
                  <span className="font-bold text-slate-900">{officer.wilayah}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Status Akses</span>
                  <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                    ✓ Aktif Terverifikasi
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-white border-t border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {onOpenLeaveModal && (
              <button
                onClick={() => {
                  playAudioFeedback('tap');
                  onClose();
                  onOpenLeaveModal();
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-600" />
                <span>Ajukan Cuti / Izin</span>
              </button>
            )}
          </div>

          <button
            onClick={() => {
              playAudioFeedback('tap');
              onClose();
            }}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
