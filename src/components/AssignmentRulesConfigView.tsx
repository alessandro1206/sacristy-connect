import React, { useState } from 'react';
import { AssignmentRulesConfig, LeaveRecord, Officer } from '../types';
import { 
  Sliders, 
  Users, 
  MapPin, 
  FileSpreadsheet, 
  Download, 
  Sparkles, 
  Check, 
  ArrowRight, 
  CheckCircle2, 
  RotateCw,
  ExternalLink,
  ShieldAlert,
  Info
} from 'lucide-react';
import { playAudioFeedback } from '../utils/sound';
import { GoogleFormLeaveModal } from './GoogleFormLeaveModal';

interface AssignmentRulesConfigViewProps {
  initialRules: AssignmentRulesConfig;
  officers: Officer[];
  leaveRecords: LeaveRecord[];
  onSaveRules: (rules: AssignmentRulesConfig) => void;
  onAddLeaveRecord: (leave: LeaveRecord) => void;
  onGenerateAutoSchedule: () => void;
  onBackToPatterns: () => void;
}

export const AssignmentRulesConfigView: React.FC<AssignmentRulesConfigViewProps> = ({
  initialRules,
  officers,
  leaveRecords,
  onSaveRules,
  onAddLeaveRecord,
  onGenerateAutoSchedule,
  onBackToPatterns
}) => {
  const [rules, setRules] = useState<AssignmentRulesConfig>(initialRules);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSave = () => {
    onSaveRules(rules);
    playAudioFeedback('success');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    playAudioFeedback('tap');
    setTimeout(() => {
      onSaveRules(rules);
      onGenerateAutoSchedule();
      setIsGenerating(false);
    }, 700);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        
        {/* Header (Screenshot 1 replica) */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-primary font-headline mb-1">
            LANGKAH 3 DARI 4
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-primary font-headline tracking-tight">
            Aturan Penugasan Petugas
          </h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            Tentukan aturan otomatisasi untuk membantu sistem membagi jadwal secara adil, memastikan keseimbangan keterampilan, dan rotasi lokasi yang tepat.
          </p>
        </div>

        {saveSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-900 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Aturan penugasan berhasil disimpan ke konfigurasi sistem sakristi.</span>
          </div>
        )}

        {/* 2-Column Grid (Image 1 replica) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: 4 Constraint Sections */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Batasan Tugas Bulanan */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs">
              <h2 className="text-base font-bold text-on-surface font-headline mb-1 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                <span>Batasan Tugas Bulanan</span>
              </h2>
              <p className="text-xs text-on-surface-variant mb-4">
                Atur jumlah minimum dan maksimum penugasan untuk setiap petugas dalam satu bulan.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-outline-variant bg-surface">
                  <label className="text-xs font-bold text-on-surface block mb-1">
                    Minimum Penugasan per Orang
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={rules.maxDutyPerPerson}
                    value={rules.minDutyPerPerson}
                    onChange={e => setRules({ ...rules, minDutyPerPerson: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-sm font-bold font-mono rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="p-3.5 rounded-xl border border-outline-variant bg-surface">
                  <label className="text-xs font-bold text-on-surface block mb-1">
                    Maksimum Penugasan per Orang
                  </label>
                  <input
                    type="number"
                    min={rules.minDutyPerPerson}
                    max={10}
                    value={rules.maxDutyPerPerson}
                    onChange={e => setRules({ ...rules, maxDutyPerPerson: parseInt(e.target.value) || 4 })}
                    className="w-full px-3 py-2 text-sm font-bold font-mono rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Kriteria Senioritas & Pasangan */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs">
              <h2 className="text-base font-bold text-on-surface font-headline mb-1 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>Kriteria Senioritas &amp; Pasangan</span>
              </h2>
              <p className="text-xs text-on-surface-variant mb-4">
                Pastikan setiap sesi misa memiliki keseimbangan antara petugas senior dan junior.
              </p>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-outline-variant bg-surface hover:bg-surface-container-high cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={rules.requireSeniorJuniorPair}
                    onChange={e => setRules({ ...rules, requireSeniorJuniorPair: e.target.checked })}
                    className="w-4 h-4 mt-0.5 accent-primary rounded cursor-pointer shrink-0"
                  />
                  <div>
                    <span className="text-xs md:text-sm font-bold text-on-surface block">
                      Wajibkan Pasangan Senior-Junior
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      Sistem tidak akan memasangkan dua petugas baru (Junior) dalam satu tugas krusial.
                    </span>
                  </div>
                </label>

                <div className="p-3.5 rounded-xl border border-outline-variant bg-surface">
                  <label className="text-xs font-bold text-on-surface block mb-1.5">
                    Rasio Minimal Petugas Senior per Sesi Misa
                  </label>
                  <select
                    value={rules.minSeniorRatio}
                    onChange={e => setRules({ ...rules, minSeniorRatio: e.target.value })}
                    className="w-full px-3 py-2 text-xs md:text-sm rounded-lg border border-outline-variant bg-surface-container-lowest font-medium outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Minimal 25% Senior">Minimal 25% Senior (1 Senior per 4 Petugas)</option>
                    <option value="Minimal 50% Senior">Minimal 50% Senior (2 Senior per 4 Petugas)</option>
                    <option value="Minimal 75% Senior">Minimal 75% Senior (3 Senior per 4 Petugas)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Preferensi & Rotasi Lokasi */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs">
              <h2 className="text-base font-bold text-on-surface font-headline mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Preferensi &amp; Rotasi Lokasi</span>
              </h2>
              <p className="text-xs text-on-surface-variant mb-4">
                Atur bagaimana sistem mendistribusikan penugasan di berbagai lokasi gereja untuk menghindari kelelahan atau monopoli lokasi.
              </p>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-outline-variant bg-surface hover:bg-surface-container-high cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={rules.enableLocationRotation}
                    onChange={e => setRules({ ...rules, enableLocationRotation: e.target.checked })}
                    className="w-4 h-4 mt-0.5 accent-primary rounded cursor-pointer shrink-0"
                  />
                  <div>
                    <span className="text-xs md:text-sm font-bold text-on-surface block">
                      Aktifkan Rotasi Lokasi (Gereja Utama vs Kapel)
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      Mencegah seorang petugas bertugas di Gereja Utama berturut-turut lebih dari 2 kali.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-outline-variant bg-surface hover:bg-surface-container-high cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={rules.familyMassPreference}
                    onChange={e => setRules({ ...rules, familyMassPreference: e.target.checked })}
                    className="w-4 h-4 mt-0.5 accent-primary rounded cursor-pointer shrink-0"
                  />
                  <div>
                    <span className="text-xs md:text-sm font-bold text-on-surface block">
                      Patuhi Preferensi Misa Keluarga
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      Sistem akan memprioritaskan jadwal yang sama untuk petugas yang berasal dari satu keluarga (jika terdata).
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* 4. Manajemen Cuti & Prioritas Petugas (Screenshot 1 replica + Google Form Download) */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs">
              <h2 className="text-base font-bold text-on-surface font-headline mb-1 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-primary" />
                <span>Manajemen Cuti &amp; Prioritas Petugas</span>
              </h2>
              <p className="text-xs text-on-surface-variant mb-4">
                Kelola ketersediaan petugas dan prioritas penugasan khusus untuk peran tertentu.
              </p>

              {/* Integrasi Cuti (Google Form) Card */}
              <div className="p-4 rounded-xl border border-outline-variant bg-surface-container/60 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 font-bold text-xs md:text-sm text-primary">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Integrasi Cuti (Google Form)</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 max-w-lg">
                    Data cuti dari (<strong>120 petugas</strong> tanggal mulai s/d selesai) diimpor secara otomatis untuk memastikan tidak ada jadwal bentrok selama masa libur.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="self-start sm:self-auto shrink-0 flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download / Kelola Cuti</span>
                </button>
              </div>

              {/* PRIORITAS LOKASI & PERAN KHUSUS */}
              <div className="pt-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  PRIORITAS LOKASI &amp; PERAN KHUSUS
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-outline-variant bg-surface hover:bg-surface-container-high cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={rules.priorityKoorlap}
                      onChange={e => setRules({ ...rules, priorityKoorlap: e.target.checked })}
                      className="w-4 h-4 mt-0.5 accent-primary rounded cursor-pointer shrink-0"
                    />
                    <div>
                      <span className="text-xs md:text-sm font-bold text-on-surface block">
                        Prioritas 40 Koordinator Lapangan (Koorlap)
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        Sistem akan memprioritaskan 40 Altar Server senior sebagai Koorlap di setiap sesi misa utama.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-outline-variant bg-surface hover:bg-surface-container-high cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={rules.optimizeChapelB}
                      onChange={e => setRules({ ...rules, optimizeChapelB: e.target.checked })}
                      className="w-4 h-4 mt-0.5 accent-primary rounded cursor-pointer shrink-0"
                    />
                    <div>
                      <span className="text-xs md:text-sm font-bold text-on-surface block">
                        Optimal Penugasan Kapel 2 (Kapel B)
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        Memprioritaskan grup petugas wilayah tertentu untuk melayani di Kapel B guna efisiensi transportasi.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: DAMPAK ATURAN (Screenshot 1 replica) */}
          <div className="lg:col-span-4 space-y-5 sticky top-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-3 font-headline">
                  DAMPAK ATURAN
                </h3>
                <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
                  Berdasarkan pengaturan saat ini, sistem otomasi akan mengelola penugasan dengan prioritas berikut:
                </p>

                <ul className="space-y-2.5 text-xs text-on-surface">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>Distribusi merata: {rules.minDutyPerPerson}-{rules.maxDutyPerPerson} tugas/bulan per orang.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>Kualitas pelayanan dijaga dengan rasio {rules.minSeniorRatio}.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>Rotasi aktif untuk mencegah monopoli Gereja Utama.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>Mengakomodasi cuti individual ({leaveRecords.length || 120} petugas).</span>
                  </li>
                  {rules.priorityKoorlap && (
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>Prioritas 40 Koorlap di setiap sesi.</span>
                    </li>
                  )}
                  {rules.optimizeChapelB && (
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>Optimasi Kapel B untuk efisiensi wilayah.</span>
                    </li>
                  )}
                </ul>

                {/* Estimate blue box */}
                <div className="mt-5 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Kalkulasi estimasi:</strong> Sistem dapat memenuhi 98% dari aturan ini dengan ketersediaan petugas saat ini.
                  </p>
                </div>
              </div>

              {/* Action Buttons (Screenshot 1 replica) */}
              <div className="mt-6 space-y-2.5">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-primary hover:bg-primary-container active:scale-95 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className={`w-4 h-4 text-amber-300 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Menyusun Jadwal...' : 'GENERATE JADWAL OTOMATIS'}</span>
                </button>

                <button
                  type="button"
                  onClick={onBackToPatterns}
                  className="w-full bg-surface-container hover:bg-surface-container-high text-primary font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider border border-outline-variant transition-colors"
                >
                  SIMPAN ATURAN &amp; KEMBALI
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Google Form Leave Modal */}
      <GoogleFormLeaveModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        leaveRecords={leaveRecords}
        officers={officers}
        onAddLeave={onAddLeaveRecord}
        onSyncWithScheduler={() => {
          setRules({ ...rules, googleFormLeaveSync: true });
        }}
      />
    </div>
  );
};
