import React, { useState } from 'react';
import { Officer, PositionAssignment, ScheduleSlot, KoorlapSession } from '../types';
import { 
  Users, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft, 
  Printer, 
  Share2, 
  ShieldCheck, 
  Clock, 
  Star,
  UserCheck,
  Building,
  RotateCcw
} from 'lucide-react';
import { playAudioFeedback } from '../utils/sound';

interface KoorlapPositionManagerProps {
  session: KoorlapSession;
  currentSlot: ScheduleSlot;
  officers: Officer[];
  onBackToKiosk: () => void;
  onSavePositions?: (positions: PositionAssignment[], balaiParoki: Officer[]) => void;
}

const INITIAL_POSITIONS: PositionAssignment[] = [
  { positionId: 'koor', positionName: '1. Koor (Paduan Suara)', assignedOfficerId: null, assignedOfficerName: null },
  { positionId: 'pendamping_romo', positionName: '2. Pendamping Romo (Selebran)', assignedOfficerId: null, assignedOfficerName: null },
  { positionId: 'bunda', positionName: '3. Altar Bunda Maria', assignedOfficerId: null, assignedOfficerName: null },
  { positionId: 'belakang_bunda', positionName: '4. Belakang Bunda Maria', assignedOfficerId: null, assignedOfficerName: null },
  { positionId: 'suster_1', positionName: '5. Suster 1 (Komuni Biarawati)', assignedOfficerId: null, assignedOfficerName: null },
  { positionId: 'suster_2', positionName: '6. Suster 2 (Komuni Biarawati)', assignedOfficerId: null, assignedOfficerName: null },
  { positionId: 'belakang_koor', positionName: '7. Belakang Koor', assignedOfficerId: null, assignedOfficerName: null },
  { positionId: 'balkon', positionName: '8. Balkon Atas', assignedOfficerId: null, assignedOfficerName: null },
];

export const KoorlapPositionManager: React.FC<KoorlapPositionManagerProps> = ({
  session,
  currentSlot,
  officers,
  onBackToKiosk,
  onSavePositions
}) => {
  // Attended officers in this slot (or active officers if mock)
  const attendedOfficers = officers.filter(o => currentSlot.attendedServerIds.includes(o.id));
  // If attended is fewer than 8, let's also allow selecting from all active officers for full demonstration
  const availablePool = attendedOfficers.length >= 4 ? attendedOfficers : officers.filter(o => o.status === 'Aktif');

  const [positions, setPositions] = useState<PositionAssignment[]>(() => {
    // Initial auto-fill for quick setup
    return INITIAL_POSITIONS.map((pos, idx) => {
      const officer = availablePool[idx];
      return {
        ...pos,
        assignedOfficerId: officer ? officer.id : null,
        assignedOfficerName: officer ? officer.name : null,
        assignedOfficerAvatar: officer ? officer.avatarUrl : undefined
      };
    });
  });

  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  // Calculate officers assigned to the 8 positions
  const assignedIds = new Set(positions.map(p => p.assignedOfficerId).filter(Boolean));

  // Remainder officers assigned to Balai Paroki
  const balaiParokiOfficers = availablePool.filter(o => !assignedIds.has(o.id));

  // Assign officer to selected position
  const handleAssignOfficer = (positionId: string, officer: Officer) => {
    playAudioFeedback('success');
    setPositions(prev => prev.map(p => {
      if (p.positionId === positionId) {
        return {
          ...p,
          assignedOfficerId: officer.id,
          assignedOfficerName: officer.name,
          assignedOfficerAvatar: officer.avatarUrl
        };
      }
      // If officer was assigned elsewhere, clear that position
      if (p.assignedOfficerId === officer.id) {
        return {
          ...p,
          assignedOfficerId: null,
          assignedOfficerName: null,
          assignedOfficerAvatar: undefined
        };
      }
      return p;
    }));
    setSelectedPositionId(null);
  };

  // Clear single position
  const handleClearPosition = (positionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playAudioFeedback('delete');
    setPositions(prev => prev.map(p => p.positionId === positionId ? {
      ...p,
      assignedOfficerId: null,
      assignedOfficerName: null,
      assignedOfficerAvatar: undefined
    } : p));
  };

  // Auto assign based on duty experience
  const handleAutoAssign = () => {
    playAudioFeedback('tap');
    const sortedPool = [...availablePool].sort((a, b) => b.dutyCount - a.dutyCount);

    setPositions(INITIAL_POSITIONS.map((pos, idx) => {
      const officer = sortedPool[idx];
      return {
        ...pos,
        assignedOfficerId: officer ? officer.id : null,
        assignedOfficerName: officer ? officer.name : null,
        assignedOfficerAvatar: officer ? officer.avatarUrl : undefined
      };
    }));

    playAudioFeedback('success');
    setSaveBanner('8 Posisi Misa berhasil diatur otomatis berdasarkan kehadiran.');
    setTimeout(() => setSaveBanner(null), 4000);
  };

  const handleSave = () => {
    playAudioFeedback('success');
    if (onSavePositions) {
      onSavePositions(positions, balaiParokiOfficers);
    }
    setSaveBanner('Susunan 8 Posisi dan Alokasi Balai Paroki berhasil disimpan!');
    setTimeout(() => setSaveBanner(null), 3000);
  };

  const handlePrint = () => {
    playAudioFeedback('tap');
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto w-full space-y-6">
        
        {/* Top Header Navigation */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToKiosk}
              className="p-2.5 rounded-xl border border-outline-variant bg-surface hover:bg-surface-container text-primary transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Kiosk</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Koorlap: {session.koorlapName || 'Koordinator Lapangan'}</span>
                </span>
                <span className="text-xs text-on-surface-variant font-medium">
                  ID: {session.koorlapId || '001'}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold text-primary font-headline mt-1">
                Susun 8 Posisi Asisten Imam &amp; Misdinar
              </h1>
              <p className="text-xs text-on-surface-variant">
                Sesi: <strong>{session.selectedDate} &bull; {session.selectedMassTime} WIB</strong> ({session.selectedLocation})
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleAutoAssign}
              className="flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high text-primary px-3.5 py-2 rounded-xl text-xs font-bold border border-outline-variant transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Auto-Susun Posisi</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high text-primary px-3.5 py-2 rounded-xl text-xs font-bold border border-outline-variant transition-all shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Posisi</span>
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-container active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Posisi</span>
            </button>
          </div>
        </div>

        {/* Notification Banner */}
        {saveBanner && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-900 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveBanner}</span>
          </div>
        )}

        {/* 2-Column Grid: 8 Main Positions on Left, Remainder / Balai Paroki on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: 8 Major Positions Grid (Image / User Specs) */}
          <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <div>
                <h2 className="text-base font-bold text-on-surface font-headline flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span>8 Posisi Liturgi Utama Altar &amp; Gereja</span>
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Klik pada posisi lalu pilih petugas yang sudah hadir untuk menugaskan.
                </p>
              </div>

              <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                {positions.filter(p => p.assignedOfficerId).length} / 8 Terisi
              </span>
            </div>

            {/* 8 Positions Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {positions.map((pos) => {
                const isAssigned = !!pos.assignedOfficerId;
                const isSelected = selectedPositionId === pos.positionId;

                return (
                  <div
                    key={pos.positionId}
                    onClick={() => setSelectedPositionId(isSelected ? null : pos.positionId)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between min-h-[110px] ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/30'
                        : isAssigned
                        ? 'border-emerald-300 bg-surface-container-lowest hover:border-emerald-500'
                        : 'border-dashed border-outline-variant bg-surface hover:bg-surface-container'
                    }`}
                  >
                    {/* Header Label */}
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-bold text-primary font-headline uppercase tracking-tight">
                        {pos.positionName}
                      </span>
                      {isAssigned && (
                        <button
                          onClick={(e) => handleClearPosition(pos.positionId, e)}
                          className="text-on-surface-variant hover:text-red-600 p-1 text-xs font-bold"
                          title="Hapus Penugasan"
                        >
                          &times;
                        </button>
                      )}
                    </div>

                    {/* Assigned Officer View */}
                    {isAssigned ? (
                      <div className="flex items-center gap-3 mt-2">
                        {pos.assignedOfficerAvatar ? (
                          <img
                            src={pos.assignedOfficerAvatar}
                            alt={pos.assignedOfficerName || ''}
                            className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                            {pos.assignedOfficerName?.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs md:text-sm font-bold text-on-surface">
                            {pos.assignedOfficerName}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
                            <span className="font-mono font-bold text-primary">ID: {pos.assignedOfficerId}</span>
                            <span>&bull;</span>
                            <span>Asisten Imam</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-on-surface-variant/70 italic flex items-center gap-1">
                        <span>Klik untuk memilih petugas...</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Petugas Hadir & Sisa ke Balai Paroki */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Pool Petugas Hadir */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-on-surface font-headline mb-1 flex items-center justify-between">
                <span>Pilih Petugas Hadir</span>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {availablePool.length} Siap Tugas
                </span>
              </h3>
              <p className="text-xs text-on-surface-variant mb-3">
                {selectedPositionId 
                  ? 'Klik petugas di bawah untuk ditugaskan ke posisi yang dipilih.' 
                  : 'Pilih salah satu posisi di kiri terlebih dahulu.'}
              </p>

              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {availablePool.map(officer => {
                  const isAssigned = assignedIds.has(officer.id);

                  return (
                    <div
                      key={officer.id}
                      onClick={() => {
                        if (selectedPositionId) {
                          handleAssignOfficer(selectedPositionId, officer);
                        } else {
                          playAudioFeedback('tap');
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                        isAssigned
                          ? 'bg-surface border-outline-variant opacity-60'
                          : selectedPositionId
                          ? 'bg-emerald-50 border-emerald-300 hover:bg-emerald-100 hover:scale-[1.01]'
                          : 'bg-surface hover:bg-surface-container border-outline-variant'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={officer.avatarUrl}
                          alt={officer.name}
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                        <div>
                          <div className="font-bold text-on-surface">{officer.name}</div>
                          <div className="text-[10px] text-on-surface-variant font-mono">
                            ID: {officer.id} &bull; {officer.wilayah || officer.role}
                          </div>
                        </div>
                      </div>

                      {isAssigned ? (
                        <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                          Sudah Ditugaskan
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          Tersedia
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sisa Petugas: BALAI PAROKI (User Requirement: sisa dari asisten imam ke balai paroki) */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-on-surface font-headline flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-amber-700" />
                  <span>Alokasi Balai Paroki</span>
                </h3>
                <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                  {balaiParokiOfficers.length} Petugas
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mb-3">
                Sisa asisten imam yang hadir otomatis dialokasikan untuk pelayanan di Balai Paroki &amp; Cadangan Liturgi.
              </p>

              {balaiParokiOfficers.length > 0 ? (
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                  {balaiParokiOfficers.map(officer => (
                    <div key={officer.id} className="p-2 rounded-lg bg-surface border border-outline-variant/60 text-xs flex justify-between items-center">
                      <span className="font-bold text-on-surface">{officer.name}</span>
                      <span className="text-[10px] font-mono text-on-surface-variant">ID: {officer.id}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-surface rounded-xl text-center text-xs text-on-surface-variant">
                  Tidak ada sisa petugas. Seluruh petugas telah terisi pada 8 posisi altar utama.
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
