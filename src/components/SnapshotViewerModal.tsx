import React from 'react';
import { X, CheckCircle2, Camera, Calendar, Clock, User, ShieldCheck } from 'lucide-react';
import { playAudioFeedback } from '../utils/sound';

export interface SnapshotViewerData {
  snapshotUrl: string;
  officerName: string;
  officerId: string;
  massSession?: string;
  timestamp?: string;
  wilayah?: string;
}

interface SnapshotViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: SnapshotViewerData | null;
}

export const SnapshotViewerModal: React.FC<SnapshotViewerModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  if (!isOpen || !data) return null;

  const handleClose = () => {
    playAudioFeedback('tap');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border-2 border-[#D9CEBA] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#5B1414] to-[#7C191E] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Camera className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-headline font-extrabold text-sm tracking-wide">
                Bukti Foto Wajah Presensi
              </h3>
              <p className="text-[11px] text-white/80 font-medium">
                Verifikasi Kehadiran Sakristi
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Snapshot Photo Container */}
        <div className="p-5 flex flex-col items-center bg-[#FAF7F2]">
          <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-lg w-full max-w-[320px] aspect-4/3 bg-black flex items-center justify-center">
            <img
              src={data.snapshotUrl}
              alt={`Foto Presensi ${data.officerName}`}
              className="w-full h-full object-cover"
            />
            {/* Live Watermark Overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 text-left text-white flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-bold">VERIFIKASI HADIR</span>
              </div>
              {data.timestamp && (
                <span className="text-[10px] font-mono opacity-90">{data.timestamp}</span>
              )}
            </div>
          </div>

          {/* Details Card */}
          <div className="w-full mt-4 bg-white rounded-2xl border border-[#D9CEBA] p-4 space-y-2.5 text-xs text-[#2C2420]">
            <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-2">
              <span className="text-[#8C7662] flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#5B1414]" />
                Petugas:
              </span>
              <div className="text-right">
                <span className="font-extrabold text-[#5B1414] text-sm block">
                  {data.officerName}
                </span>
                <span className="font-mono text-[11px] text-[#8C7662] font-bold">
                  No. Absen: #{data.officerId.padStart(3, '0')}
                </span>
              </div>
            </div>

            {data.massSession && (
              <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-2">
                <span className="text-[#8C7662] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#5B1414]" />
                  Sesi Misa:
                </span>
                <span className="font-bold text-[#2C2420] text-right truncate max-w-[200px]">
                  {data.massSession}
                </span>
              </div>
            )}

            {data.wilayah && (
              <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-2">
                <span className="text-[#8C7662] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#5B1414]" />
                  Wilayah / Lingkungan:
                </span>
                <span className="font-bold text-[#2C2420]">
                  {data.wilayah}
                </span>
              </div>
            )}

            {data.timestamp && (
              <div className="flex items-center justify-between">
                <span className="text-[#8C7662] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#5B1414]" />
                  Waktu Presensi:
                </span>
                <span className="font-mono font-bold text-emerald-700">
                  {data.timestamp}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#E8DFC8] flex justify-end">
          <button
            onClick={handleClose}
            className="px-5 py-2 bg-[#5B1414] hover:bg-[#4A0E17] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
};
