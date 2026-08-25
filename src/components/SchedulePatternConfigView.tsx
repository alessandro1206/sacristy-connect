import React, { useState } from 'react';
import { SchedulePatternConfig, RoutinePattern, DateException } from '../types';
import { 
  Building, 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  ArrowRight, 
  FileSpreadsheet, 
  Check, 
  Layers, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { playAudioFeedback } from '../utils/sound';

interface SchedulePatternConfigViewProps {
  initialConfig: SchedulePatternConfig;
  onSaveConfig: (config: SchedulePatternConfig) => void;
  onProceedToRules: () => void;
}

export const SchedulePatternConfigView: React.FC<SchedulePatternConfigViewProps> = ({
  initialConfig,
  onSaveConfig,
  onProceedToRules
}) => {
  const [config, setConfig] = useState<SchedulePatternConfig>(initialConfig);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // New Routine Pattern form modal / inline state
  const [newRoutine, setNewRoutine] = useState({
    massType: '',
    days: 'Senin - Jumat',
    requiredServers: 2
  });
  const [showAddRoutine, setShowAddRoutine] = useState<boolean>(false);

  // New Date Exception form modal / inline state
  const [newException, setNewException] = useState({
    date: '15/10/2026',
    description: 'Misa Syukur Komuni Pertama',
    requiredServers: 4
  });
  const [showAddException, setShowAddException] = useState<boolean>(false);

  // Toggle locations
  const handleLocationToggle = (key: keyof SchedulePatternConfig['locations']) => {
    setConfig(prev => ({
      ...prev,
      locations: {
        ...prev.locations,
        [key]: !prev.locations[key]
      }
    }));
  };

  // Add Routine Pattern
  const handleAddRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutine.massType.trim()) return;

    const added: RoutinePattern = {
      id: `pat-${Date.now()}`,
      massType: newRoutine.massType.trim(),
      days: newRoutine.days,
      requiredServers: newRoutine.requiredServers
    };

    setConfig(prev => ({
      ...prev,
      routinePatterns: [...prev.routinePatterns, added]
    }));
    setNewRoutine({ massType: '', days: 'Senin - Jumat', requiredServers: 2 });
    setShowAddRoutine(false);
    playAudioFeedback('success');
  };

  const handleDeleteRoutine = (id: string) => {
    playAudioFeedback('delete');
    setConfig(prev => ({
      ...prev,
      routinePatterns: prev.routinePatterns.filter(p => p.id !== id)
    }));
  };

  // Add Date Exception
  const handleAddException = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newException.description.trim()) return;

    const added: DateException = {
      id: `exc-${Date.now()}`,
      date: newException.date,
      description: newException.description.trim(),
      requiredServers: newException.requiredServers
    };

    setConfig(prev => ({
      ...prev,
      dateExceptions: [...prev.dateExceptions, added]
    }));
    setNewException({ date: '20/10/2026', description: '', requiredServers: 4 });
    setShowAddException(false);
    playAudioFeedback('success');
  };

  const handleDeleteException = (id: string) => {
    playAudioFeedback('delete');
    setConfig(prev => ({
      ...prev,
      dateExceptions: prev.dateExceptions.filter(e => e.id !== id)
    }));
  };

  const handleSave = () => {
    onSaveConfig(config);
    playAudioFeedback('success');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Calculate total weekly shifts requirement
  const totalWeeklyShifts = config.routinePatterns.reduce((acc, curr) => {
    const daysMultiplier = curr.days.includes('Senin - Jumat') ? 5 : curr.days.includes('Sabtu & Minggu') ? 2 : 1;
    return acc + (curr.requiredServers * daysMultiplier);
  }, 0) + config.dateExceptions.reduce((acc, curr) => acc + curr.requiredServers, 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        
        {/* Header & Step progress (Screenshot 2 replica) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-primary font-headline mb-1">
              LANGKAH 2 DARI 4 &bull; PENYUSUNAN JADWAL
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-primary font-headline tracking-tight">
              Pengaturan Pola Jadwal
            </h1>
            <p className="text-sm text-on-surface-variant font-medium mt-1">
              Atur kebutuhan rutin petugas sakristi untuk berbagai jenis perayaan dan lokasi. Sistem akan menggunakan pola ini untuk menghasilkan jadwal bulanan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playAudioFeedback('tap');
                alert('Fitur Import Excel Pola Misa aktif: Format template Excel pola rutin paroki berhasil dimuat.');
              }}
              className="flex items-center gap-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant text-primary px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>IMPORT EXCEL</span>
            </button>

            <button
              onClick={() => {
                handleSave();
                onProceedToRules();
              }}
              className="flex items-center gap-2 bg-primary hover:bg-primary-container active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <span>Lanjut: Aturan Penugasan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-900 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Pola jadwal sakristi berhasil disimpan dan siap digenerasikan!</span>
          </div>
        )}

        {/* Main 2-Column Grid (Image 2 replica) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Pemilihan Lokasi, Pola Rutin, Pengecualian Tanggal */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Pemilihan Lokasi */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs">
              <h2 className="text-base font-bold text-on-surface font-headline mb-1 flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" />
                <span>Pemilihan Lokasi</span>
              </h2>
              <p className="text-xs text-on-surface-variant mb-4">
                Pilih gereja atau kapel tempat pola jadwal ini berlaku.
              </p>

              <div className="space-y-2.5">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant bg-surface hover:bg-surface-container-high cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={config.locations.mainChurch}
                    onChange={() => handleLocationToggle('mainChurch')}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                  <span className="text-xs md:text-sm font-bold text-on-surface">
                    Gereja Pusat Santo Yakobus
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant bg-surface hover:bg-surface-container-high cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={config.locations.chapelA}
                    onChange={() => handleLocationToggle('chapelA')}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                  <span className="text-xs md:text-sm font-medium text-on-surface">
                    Kapel St. Andreas (Stasi A)
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant bg-surface hover:bg-surface-container-high cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={config.locations.chapelB}
                    onChange={() => handleLocationToggle('chapelB')}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                  <span className="text-xs md:text-sm font-medium text-on-surface">
                    Kapel St. Petrus (Stasi B)
                  </span>
                </label>
              </div>
            </div>

            {/* 2. Pola Rutin (Mingguan) */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-on-surface font-headline flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <span>Pola Rutin (Mingguan)</span>
                </h2>
                <button
                  onClick={() => setShowAddRoutine(true)}
                  className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-container bg-primary/10 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </div>

              {/* List of routine rows */}
              <div className="space-y-3">
                {config.routinePatterns.map(pattern => (
                  <div 
                    key={pattern.id}
                    className="p-3.5 rounded-xl border border-outline-variant bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                      <div>
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Jenis Misa</span>
                        <span className="text-xs md:text-sm font-bold text-on-surface">{pattern.massType}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Hari</span>
                        <span className="text-xs md:text-sm font-medium text-on-surface">{pattern.days}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/60">
                      <div className="text-right">
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Membutuhkan</span>
                        <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-md">
                          {pattern.requiredServers} Petugas Sakristi
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteRoutine(pattern.id)}
                        className="text-on-surface-variant hover:text-red-600 p-1 rounded-lg transition-colors"
                        title="Hapus Pola"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Form to add Routine Pattern */}
                {showAddRoutine && (
                  <form onSubmit={handleAddRoutine} className="p-3.5 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-on-surface block mb-1">Jenis Misa</label>
                        <input
                          type="text"
                          required
                          value={newRoutine.massType}
                          onChange={e => setNewRoutine({ ...newRoutine, massType: e.target.value })}
                          placeholder="e.g. Misa Jumat Pertama"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-outline-variant bg-surface"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-on-surface block mb-1">Hari Pelaksanaan</label>
                        <select
                          value={newRoutine.days}
                          onChange={e => setNewRoutine({ ...newRoutine, days: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-outline-variant bg-surface"
                        >
                          <option value="Senin - Jumat">Senin - Jumat</option>
                          <option value="Sabtu & Minggu">Sabtu &amp; Minggu</option>
                          <option value="Jumat Pertama">Jumat Pertama</option>
                          <option value="Hari Minggu">Hari Minggu</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-on-surface block mb-1">Jumlah Petugas</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={newRoutine.requiredServers}
                          onChange={e => setNewRoutine({ ...newRoutine, requiredServers: parseInt(e.target.value) || 2 })}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-outline-variant bg-surface font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddRoutine(false)}
                        className="px-3 py-1 text-xs text-on-surface-variant hover:bg-surface-container rounded-lg"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-xs font-bold bg-primary text-white rounded-lg"
                      >
                        Simpan Pola
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* 3. Pengecualian Tanggal Spesifik */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-bold text-on-surface font-headline flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Pengecualian Tanggal Spesifik</span>
                </h2>
                <button
                  onClick={() => setShowAddException(true)}
                  className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-container bg-primary/10 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Pengecualian</span>
                </button>
              </div>
              <p className="text-xs text-on-surface-variant mb-4">
                Timpa pola rutin untuk hari-hari besar atau khusus.
              </p>

              <div className="space-y-3">
                {config.dateExceptions.map(exc => (
                  <div
                    key={exc.id}
                    className="p-3.5 rounded-xl border border-outline-variant bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                      <div>
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Tanggal</span>
                        <span className="text-xs md:text-sm font-mono font-bold text-primary">{exc.date}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Keterangan</span>
                        <span className="text-xs md:text-sm font-semibold text-on-surface">{exc.description}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/60">
                      <div className="text-right">
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Membutuhkan</span>
                        <span className="text-xs font-bold text-amber-800 px-2 py-0.5 bg-amber-100 rounded-md">
                          {exc.requiredServers} Petugas Sakristi
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteException(exc.id)}
                        className="text-on-surface-variant hover:text-red-600 p-1 rounded-lg transition-colors"
                        title="Hapus Pengecualian"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {showAddException && (
                  <form onSubmit={handleAddException} className="p-3.5 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-on-surface block mb-1">Tanggal (DD/MM/YYYY)</label>
                        <input
                          type="text"
                          required
                          value={newException.date}
                          onChange={e => setNewException({ ...newException, date: e.target.value })}
                          placeholder="e.g. 25/12/2026"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-outline-variant bg-surface font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-on-surface block mb-1">Keterangan Misa</label>
                        <input
                          type="text"
                          required
                          value={newException.description}
                          onChange={e => setNewException({ ...newException, description: e.target.value })}
                          placeholder="e.g. Misa Natal Pagi"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-outline-variant bg-surface"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-on-surface block mb-1">Jumlah Petugas</label>
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={newException.requiredServers}
                          onChange={e => setNewException({ ...newException, requiredServers: parseInt(e.target.value) || 4 })}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-outline-variant bg-surface font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddException(false)}
                        className="px-3 py-1 text-xs text-on-surface-variant hover:bg-surface-container rounded-lg"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-xs font-bold bg-primary text-white rounded-lg"
                      >
                        Simpan Pengecualian
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Pratinjau & Summary (Screenshot 2 replica) */}
          <div className="lg:col-span-4 space-y-5 sticky top-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs">
              <h3 className="text-base font-bold text-on-surface font-headline mb-4 flex items-center justify-between">
                <span>Pratinjau: Oktober 2026</span>
                <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Pola Aktif
                </span>
              </h3>

              <div className="space-y-2.5">
                <div className="p-3 bg-surface rounded-xl border border-outline-variant flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-on-surface block">Senin - Jumat</span>
                    <span className="text-[11px] text-on-surface-variant">Misa Harian</span>
                  </div>
                  <span className="text-xs font-bold bg-primary-container text-white px-2.5 py-1 rounded-lg">
                    2
                  </span>
                </div>

                <div className="p-3 bg-surface rounded-xl border border-outline-variant flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-on-surface block">Sabtu &amp; Minggu</span>
                    <span className="text-[11px] text-on-surface-variant">Misa Mingguan</span>
                  </div>
                  <span className="text-xs font-bold bg-primary-container text-white px-2.5 py-1 rounded-lg">
                    4
                  </span>
                </div>

                {config.dateExceptions.map(exc => (
                  <div key={exc.id} className="p-3 bg-surface rounded-xl border border-outline-variant flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-amber-900 block">{exc.date}</span>
                      <span className="text-[11px] text-on-surface-variant">{exc.description}</span>
                    </div>
                    <span className="text-xs font-bold bg-amber-600 text-white px-2.5 py-1 rounded-lg">
                      {exc.requiredServers}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Shift summary */}
              <div className="mt-5 p-3.5 bg-surface-container rounded-xl border border-outline-variant text-center">
                <span className="text-xs text-on-surface-variant font-medium block">
                  Total kebutuhan petugas minggu ini:
                </span>
                <div className="text-2xl font-extrabold text-primary font-headline mt-1">
                  {totalWeeklyShifts} <span className="text-xs font-bold text-on-surface-variant uppercase">shift tugas</span>
                </div>
              </div>

              {/* Primary Save Button */}
              <button
                onClick={handleSave}
                className="w-full mt-4 bg-primary hover:bg-primary-container active:scale-95 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all"
              >
                SIMPAN POLA JADWAL
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
