import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  KeyRound, 
  AlertCircle, 
  Sparkles, 
  X, 
  Eye, 
  EyeOff, 
  Users, 
  UserCheck, 
  Award, 
  ChevronRight,
  Info
} from 'lucide-react';
import { Officer, UserRole, UserSession } from '../types';
import { CHURCH_LOGO } from '../data/initialData';
import { playAudioFeedback } from '../utils/sound';

interface MultiLevelLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
  officers: Officer[];
  initialRole?: UserRole;
  targetViewLabel?: string;
}

export const MultiLevelLoginModal: React.FC<MultiLevelLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  officers,
  initialRole = 'officer',
  targetViewLabel
}) => {
  const [activeTab, setActiveTab] = useState<UserRole>(initialRole === 'guest' ? 'officer' : initialRole);
  
  // Sync activeTab whenever modal opens or initialRole changes
  useEffect(() => {
    if (isOpen) {
      const targetRole = initialRole === 'guest' ? 'officer' : initialRole;
      setActiveTab(targetRole);
      setErrorMsg(null);
      
      // Auto-prefill admin credentials if opening as admin for smoother experience
      if (targetRole === 'admin') {
        setAdminUser('admin');
        setAdminPass('sakristi123');
      }
    }
  }, [isOpen, initialRole]);

  // Officer Level Form State
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');
  const [officerPin, setOfficerPin] = useState<string>('');
  
  // Koorlap Level Form State
  const [koorlapUser, setKoorlapUser] = useState<string>('');
  const [koorlapPin, setKoorlapPin] = useState<string>('');

  // Admin Level Form State
  const [adminUser, setAdminUser] = useState<string>('admin');
  const [adminPass, setAdminPass] = useState<string>('sakristi123');

  const [showPass, setShowPass] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const koorlaps = officers.filter(o => o.isKoorlap || o.role.toLowerCase().includes('koorlap'));

  const handleTabChange = (role: UserRole) => {
    playAudioFeedback('tap');
    setActiveTab(role);
    setErrorMsg(null);
  };


  const handleOfficerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const officer = officers.find(o => o.id === selectedOfficerId);
    if (!officer) {
      setErrorMsg('Petugas tidak ditemukan dalam daftar.');
      playAudioFeedback('error');
      return;
    }

    if (officerPin.trim().length < 4) {
      setErrorMsg('PIN Petugas minimal 4 digit.');
      playAudioFeedback('error');
      return;
    }

    const isKoorlapAssigned = officer.isKoorlap || officer.role.toLowerCase().includes('koorlap');

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      playAudioFeedback('success');
      onLoginSuccess({
        isAuthenticated: true,
        role: isKoorlapAssigned ? 'koorlap' : 'officer',
        officerId: officer.id,
        name: officer.name,
        avatarUrl: officer.avatarUrl,
        loginTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      });
    }, 400);
  };


  const handleKoorlapLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUser = koorlapUser.trim().toLowerCase();
    const cleanPin = koorlapPin.trim();

    if (!cleanUser || !cleanPin) {
      setErrorMsg('Harap masukkan Username/ID dan PIN Koorlap.');
      playAudioFeedback('error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const matchedKoorlap = officers.find(o => (o.id === cleanUser || o.shortName.toLowerCase().includes(cleanUser)) && (o.isKoorlap || o.role.toLowerCase().includes('koorlap')));
      const koorlapName = matchedKoorlap ? matchedKoorlap.name : 'Koordinator Lapangan';
      const avatarUrl = matchedKoorlap ? matchedKoorlap.avatarUrl : undefined;

      setIsLoading(false);
      playAudioFeedback('success');
      onLoginSuccess({
        isAuthenticated: true,
        role: 'koorlap',
        officerId: matchedKoorlap?.id || 'koorlap-01',
        name: koorlapName,
        avatarUrl,
        loginTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      });
    }, 400);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUser = adminUser.trim().toLowerCase();
    const cleanPass = adminPass.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMsg('Harap masukkan Username dan Password Admin.');
      playAudioFeedback('error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const validUsers = ['admin', 'sakristi', 'paroki', 'pengurus', 'pastor'];
      const isValidUser = validUsers.includes(cleanUser) || cleanUser.length >= 3;
      const isValidPass = cleanPass.length >= 4;

      if (isValidUser && isValidPass) {
        setIsLoading(false);
        playAudioFeedback('success');
        onLoginSuccess({
          isAuthenticated: true,
          role: 'admin',
          name: 'Administrator Sakristi',
          loginTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        });
      } else {
        setIsLoading(false);
        setErrorMsg('Username atau Password Admin salah. (Gunakan: admin / sakristi123)');
        playAudioFeedback('error');
      }
    }, 400);
  };

  const fillDemoCredentials = () => {
    playAudioFeedback('tap');
    setErrorMsg(null);
    if (activeTab === 'officer') {
      const sample = officers[0] || { id: '001' };
      setSelectedOfficerId(sample.id);
      setOfficerPin('1234');
    } else if (activeTab === 'koorlap') {
      const koorlap = koorlaps[0] || { id: '145' };
      setKoorlapUser(koorlap.id);
      setKoorlapPin('1234');
    } else {
      setAdminUser('admin');
      setAdminPass('sakristi123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden relative flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-900 p-6 text-white text-center relative shrink-0 border-b border-slate-800">
          <button
            onClick={() => {
              playAudioFeedback('tap');
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 p-0.5 mx-auto mb-2 flex items-center justify-center shadow-md overflow-hidden">
            <img
              src={CHURCH_LOGO}
              alt="Logo Paroki"
              className="w-full h-full object-cover rounded-[14px] bg-white"
            />
          </div>

          <h3 className="text-xl font-black font-headline tracking-tight">
            {initialRole === 'admin' ? 'Login Administrator' : 'Portal Masuk Sakristi'}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {initialRole === 'admin' 
              ? 'Masuk ke Backoffice Pengelola Paroki Santo Yakobus' 
              : targetViewLabel ? `Akses ${targetViewLabel}` : 'Otorisasi Akun Petugas & Administrator'}
          </p>

          {/* Level Tabs selector - Hidden if Admin Login */}
          {initialRole !== 'admin' && (
            <div className="mt-5 grid grid-cols-2 gap-1.5 bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700/60">
              <button
                type="button"
                onClick={() => handleTabChange('officer')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'officer' || activeTab === 'koorlap'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-black' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Petugas / Koorlap</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('admin')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'admin' 
                    ? 'bg-amber-400 text-slate-950 shadow-md font-black' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Backoffice</span>
              </button>
            </div>
          )}

        </div>

        {/* Tab Descriptions & Form Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh] bg-slate-50/50">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Demo Fill Header */}
          <div className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-xl text-xs text-slate-600 shadow-2xs">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-700 shrink-0" />
              <span>
                {activeTab === 'officer' && 'Tingkat 1: Presensi mandiri & cek jadwal tugas.'}
                {activeTab === 'koorlap' && 'Tingkat 2: Ploting posisi tugas & supervisi presensi.'}
                {activeTab === 'admin' && 'Tingkat 3: Akses penuh backoffice & generator jadwal.'}
              </span>
            </div>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-[11px] font-bold text-slate-900 hover:underline flex items-center gap-1 shrink-0 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Isi Otomatis</span>
            </button>
          </div>

          {/* 1. OFFICER LOGIN FORM */}
          {activeTab === 'officer' && (
            <form onSubmit={handleOfficerLogin} className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Pilih Nama / ID Petugas
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <select
                    value={selectedOfficerId}
                    onChange={(e) => {
                      setSelectedOfficerId(e.target.value);
                      if (!officerPin) setOfficerPin('1234');
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-bold text-slate-900 outline-none transition-all cursor-pointer shadow-2xs"
                  >
                    <option value="">-- Pilih Nama / ID Petugas Anda --</option>
                    {officers.map(o => (
                      <option key={o.id} value={o.id}>
                        #{o.id.padStart(3, '0')} &bull; {o.name} ({o.wilayah || 'Asisten Imam'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  PIN Keamanan (Default: 1234)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={officerPin}
                    onChange={(e) => setOfficerPin(e.target.value)}
                    placeholder="Masukkan PIN 4-digit"
                    maxLength={6}
                    className="w-full pl-10 pr-11 py-3 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-sm font-semibold text-slate-900 outline-none transition-all tracking-widest font-mono shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <span>Memverifikasi...</span>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <span>Masuk Portal Petugas</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. KOORLAP LOGIN FORM */}
          {activeTab === 'koorlap' && (
            <form onSubmit={handleKoorlapLogin} className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Pilih Petugas Koorlap Jaga
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <select
                    value={koorlapUser}
                    onChange={(e) => {
                      setKoorlapUser(e.target.value);
                      if (!koorlapPin) setKoorlapPin('1234');
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-bold text-slate-900 outline-none transition-all cursor-pointer shadow-2xs"
                  >
                    <option value="">-- Pilih Koorlap Terdaftar --</option>
                    {koorlaps.map(k => (
                      <option key={k.id} value={k.id}>
                        👑 #{k.id.padStart(3, '0')} &bull; {k.name} ({k.wilayah || 'Koorlap'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  PIN Otorisasi Koorlap (Default: 1234)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={koorlapPin}
                    onChange={(e) => setKoorlapPin(e.target.value)}
                    placeholder="Masukkan PIN"
                    className="w-full pl-10 pr-11 py-3 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-sm font-semibold text-slate-900 outline-none transition-all tracking-widest font-mono shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <span>Memverifikasi...</span>
                ) : (
                  <>
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Masuk Sesi Koorlap</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. ADMIN LOGIN FORM */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Username Admin
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7662]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    placeholder="Username Admin (admin / sakristi)"
                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#D9CEBA] focus:border-[#5B1414] rounded-xl text-sm font-semibold text-[#2C2420] outline-hidden transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-[#5B1414] uppercase tracking-wider">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7662]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    placeholder="Password Admin (sakristi123)"
                    className="w-full pl-10 pr-11 py-3 bg-white border-2 border-[#D9CEBA] focus:border-[#5B1414] rounded-xl text-sm font-semibold text-[#2C2420] outline-hidden transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C7662] hover:text-[#2C2420]"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#5B1414] hover:bg-[#450e0e] text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <span>Memverifikasi...</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Buka Akses Admin Full</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Cancel / Guest option */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                playAudioFeedback('tap');
                onClose();
              }}
              className="text-xs font-bold text-[#8C7662] hover:text-[#2C2420] transition-colors cursor-pointer"
            >
              Lanjutkan Tanpa Login (Tamu / Guest)
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
