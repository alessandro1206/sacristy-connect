import React, { useState, useEffect } from 'react';
import { 
  X, 
  KeyRound, 
  ShieldCheck, 
  UserCheck, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Sparkles,
  Save,
  RotateCcw
} from 'lucide-react';
import { Officer, UserSession } from '../types';
import { 
  getAdminCredentials, 
  saveAdminCredentials, 
  getOfficerPin, 
  saveOfficerPin, 
  verifyAdminCredentials, 
  verifyOfficerPin 
} from '../utils/authStore';
import { playAudioFeedback } from '../utils/sound';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  officers: Officer[];
  userSession: UserSession;
  initialTab?: 'koorlap' | 'admin';
  onPasswordChanged?: (role: 'koorlap' | 'admin', message: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  officers,
  userSession,
  initialTab = 'koorlap',
  onPasswordChanged
}) => {
  const [activeTab, setActiveTab] = useState<'koorlap' | 'admin'>('koorlap');

  // Koorlap / Officer Form State
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');
  const [currentPin, setCurrentPin] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [showKoorlapPin, setShowKoorlapPin] = useState<boolean>(false);

  // Admin Form State
  const [currentAdminPass, setCurrentAdminPass] = useState<string>('');
  const [newAdminUser, setNewAdminUser] = useState<string>('admin');
  const [newAdminPass, setNewAdminPass] = useState<string>('');
  const [confirmAdminPass, setConfirmAdminPass] = useState<string>('');
  const [showAdminPass, setShowAdminPass] = useState<boolean>(false);

  // Feedback states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync initial tab and officer when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      
      // Determine tab based on userSession or initialTab
      if (userSession.role === 'admin') {
        setActiveTab('admin');
      } else {
        setActiveTab(initialTab);
      }

      // Pre-select officer
      if (userSession.officerId) {
        setSelectedOfficerId(userSession.officerId);
      } else if (officers.length > 0) {
        // Default to first koorlap or officer
        const firstKoorlap = officers.find(o => o.isKoorlap || o.role.toLowerCase().includes('koorlap'));
        setSelectedOfficerId(firstKoorlap ? firstKoorlap.id : officers[0].id);
      }

      // Load current admin username
      const adminCreds = getAdminCredentials();
      setNewAdminUser(adminCreds.username);

      // Reset password inputs
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setCurrentAdminPass('');
      setNewAdminPass('');
      setConfirmAdminPass('');
    }
  }, [isOpen, initialTab, userSession, officers]);

  if (!isOpen) return null;

  const koorlaps = officers.filter(o => o.isKoorlap || o.role.toLowerCase().includes('koorlap'));
  const selectedOfficer = officers.find(o => o.id === selectedOfficerId || o.id.padStart(3, '0') === selectedOfficerId.padStart(3, '0'));

  // 1. Submit Koorlap / Officer PIN Change
  const handleKoorlapPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedOfficerId) {
      setErrorMsg('Silakan pilih akun Koorlap / Petugas.');
      playAudioFeedback('error');
      return;
    }

    if (!currentPin) {
      setErrorMsg('Harap masukkan PIN saat ini (Default: 1234).');
      playAudioFeedback('error');
      return;
    }

    if (!verifyOfficerPin(selectedOfficerId, currentPin)) {
      setErrorMsg('PIN Lama salah! Pastikan Anda memasukkan PIN yang benar.');
      playAudioFeedback('error');
      return;
    }

    if (newPin.trim().length < 4) {
      setErrorMsg('PIN Baru minimal 4 digit angka.');
      playAudioFeedback('error');
      return;
    }

    if (!/^\d+$/.test(newPin.trim())) {
      setErrorMsg('PIN Baru harus berupa angka saja (contoh: 1234, 5678).');
      playAudioFeedback('error');
      return;
    }

    if (newPin !== confirmPin) {
      setErrorMsg('Konfirmasi PIN Baru tidak cocok.');
      playAudioFeedback('error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const ok = saveOfficerPin(selectedOfficerId, newPin.trim());
      setIsLoading(false);
      if (ok) {
        playAudioFeedback('success');
        const offName = selectedOfficer ? selectedOfficer.name : `Petugas #${selectedOfficerId}`;
        const msg = `PIN untuk ${offName} (#${selectedOfficerId.padStart(3, '0')}) berhasil diperbarui!`;
        setSuccessMsg(msg);
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        onPasswordChanged?.('koorlap', msg);
      } else {
        setErrorMsg('Gagal menyimpan PIN baru ke sistem.');
        playAudioFeedback('error');
      }
    }, 300);
  };

  // 2. Submit Admin Username / Password Change
  const handleAdminPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanUser = newAdminUser.trim().toLowerCase();
    const cleanCurrentPass = currentAdminPass.trim();
    const cleanNewPass = newAdminPass.trim();
    const cleanConfirmPass = confirmAdminPass.trim();

    if (!cleanCurrentPass) {
      setErrorMsg('Harap masukkan Password Admin saat ini.');
      playAudioFeedback('error');
      return;
    }

    const currentCreds = getAdminCredentials();
    if (!verifyAdminCredentials(currentCreds.username, cleanCurrentPass)) {
      setErrorMsg('Password Admin Lama salah! Akses ditolak.');
      playAudioFeedback('error');
      return;
    }

    if (!cleanUser || cleanUser.length < 3) {
      setErrorMsg('Username Admin minimal 3 karakter.');
      playAudioFeedback('error');
      return;
    }

    if (cleanNewPass.length < 4) {
      setErrorMsg('Password Admin Baru minimal 4 karakter.');
      playAudioFeedback('error');
      return;
    }

    if (cleanNewPass !== cleanConfirmPass) {
      setErrorMsg('Konfirmasi Password Admin Baru tidak cocok.');
      playAudioFeedback('error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const ok = saveAdminCredentials(cleanUser, cleanNewPass);
      setIsLoading(false);
      if (ok) {
        playAudioFeedback('success');
        const msg = `Kredensial Admin berhasil diperbarui! Username: ${cleanUser}`;
        setSuccessMsg(msg);
        setCurrentAdminPass('');
        setNewAdminPass('');
        setConfirmAdminPass('');
        onPasswordChanged?.('admin', msg);
      } else {
        setErrorMsg('Gagal menyimpan kredensial Admin baru.');
        playAudioFeedback('error');
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white text-center relative shrink-0 border-b border-slate-800">
          <button
            onClick={() => {
              playAudioFeedback('tap');
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 p-0.5 mx-auto mb-2 flex items-center justify-center shadow-md">
            <KeyRound className="w-6 h-6 text-slate-950" />
          </div>

          <h3 className="text-xl font-black font-headline tracking-tight">
            Ubah Password &amp; PIN
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Kelola kata sandi otorisasi Koordinator Lapangan dan Administrator
          </p>

          {/* Tab Switcher: Tab 1 Koorlap, Tab 2 Admin */}
          <div className="mt-5 grid grid-cols-2 gap-1.5 bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                playAudioFeedback('tap');
                setActiveTab('koorlap');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'koorlap'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>1. Koorlap &amp; Petugas</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playAudioFeedback('tap');
                setActiveTab('admin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>2. Administrator</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh] bg-slate-50/50">
          
          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 1: KOORLAP / OFFICER PIN FORM                                     */}
          {/* ===================================================================== */}
          {activeTab === 'koorlap' && (
            <form onSubmit={handleKoorlapPinSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-950 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-amber-700" />
                  PIN Otorisasi Sesi Misa Kiosk &amp; Profil
                </span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  PIN ini digunakan saat Koorlap membuka sesi absensi di layar Kiosk atau saat login akun mandiri petugas. (Default awal: <strong>1234</strong>).
                </p>
              </div>

              {/* Officer Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pilih Akun Koorlap / Petugas
                </label>
                <select
                  value={selectedOfficerId}
                  onChange={(e) => {
                    setSelectedOfficerId(e.target.value);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-500 shadow-2xs cursor-pointer"
                >
                  <optgroup label="Koordinator Lapangan (Koorlap)">
                    {koorlaps.map(k => (
                      <option key={k.id} value={k.id}>
                        👑 #{k.id.padStart(3, '0')} — {k.name} ({k.wilayah || 'Koorlap'})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Seluruh 170 Asisten Imam">
                    {officers.map(o => (
                      <option key={o.id} value={o.id}>
                        #{o.id.padStart(3, '0')} — {o.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Current PIN */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  PIN Saat Ini (Lama)
                </label>
                <div className="relative">
                  <input
                    type={showKoorlapPin ? 'text' : 'password'}
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    placeholder="Masukkan PIN lama (Default: 1234)"
                    maxLength={6}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-500 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKoorlapPin(!showKoorlapPin)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showKoorlapPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New PIN & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    PIN Baru (4-6 Digit Angka)
                  </label>
                  <input
                    type={showKoorlapPin ? 'text' : 'password'}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Contoh: 5678"
                    maxLength={6}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-500 shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Konfirmasi PIN Baru
                  </label>
                  <input
                    type={showKoorlapPin ? 'text' : 'password'}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Ulangi PIN baru"
                    maxLength={6}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-500 shadow-2xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Menyimpan...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-amber-400" />
                    <span>Simpan PIN Koorlap Baru</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: ADMINISTRATOR CREDENTIALS FORM                                 */}
          {/* ===================================================================== */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminPasswordSubmit} className="space-y-4">
              <div className="p-3 bg-rose-50/80 border border-rose-200/80 rounded-2xl text-xs text-rose-950 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-rose-700" />
                  Kredensial Super Administrator Sakristi
                </span>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  Akun ini memiliki hak akses tertinggi (Dashboard, WA Chat Parser, Pengaturan Jadwal, Database, dan Log Audit).
                </p>
              </div>

              {/* Current Admin Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password Admin Saat Ini (Lama)
                </label>
                <div className="relative">
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    value={currentAdminPass}
                    onChange={(e) => setCurrentAdminPass(e.target.value)}
                    placeholder="Masukkan Password Admin saat ini"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-500 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Username */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Username Admin Baru
                </label>
                <input
                  type="text"
                  value={newAdminUser}
                  onChange={(e) => setNewAdminUser(e.target.value)}
                  placeholder="admin"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-500 shadow-2xs"
                />
              </div>

              {/* New Admin Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password Baru
                  </label>
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    value={newAdminPass}
                    onChange={(e) => setNewAdminPass(e.target.value)}
                    placeholder="Minimal 4 karakter"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-500 shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    value={confirmAdminPass}
                    onChange={(e) => setConfirmAdminPass(e.target.value)}
                    placeholder="Ulangi password baru"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-500 shadow-2xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#5B1414] hover:bg-[#430d0d] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Menyimpan...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-amber-300" />
                    <span>Simpan Password Admin Baru</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Perubahan kata sandi disimpan secara aman di peramban ini.</span>
          <button
            type="button"
            onClick={() => {
              playAudioFeedback('tap');
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
