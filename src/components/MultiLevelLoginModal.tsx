import React, { useState } from 'react';
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
  initialRole?: UserRole | 'register';
  targetViewLabel?: string;
  onRegisterOfficer?: (officer: Omit<Officer, 'id' | 'shortName' | 'initials'>) => void;
}

export const MultiLevelLoginModal: React.FC<MultiLevelLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  officers,
  initialRole = 'officer',
  targetViewLabel,
  onRegisterOfficer
}) => {
  const [activeTab, setActiveTab] = useState<UserRole | 'register'>(initialRole === 'guest' ? 'officer' : initialRole);
  
  // Officer Level Form State
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('001');
  const [officerPin, setOfficerPin] = useState<string>('1234');
  
  // Koorlap Level Form State
  const [koorlapUser, setKoorlapUser] = useState<string>('koorlap');
  const [koorlapPin, setKoorlapPin] = useState<string>('1234');

  // Admin Level Form State
  const [adminUser, setAdminUser] = useState<string>('admin');
  const [adminPass, setAdminPass] = useState<string>('sakristi123');

  // Register Form State
  const [regName, setRegName] = useState<string>('');
  const [regWilayah, setRegWilayah] = useState<string>('Wilayah Agustinus');
  const [regRole, setRegRole] = useState<'Asisten Imam' | 'Koorlap'>('Asisten Imam');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regPin, setRegPin] = useState<string>('1234');

  const [showPass, setShowPass] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const koorlaps = officers.filter(o => o.isKoorlap || o.role.toLowerCase().includes('koorlap'));

  const handleTabChange = (role: UserRole | 'register') => {
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

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regName.trim()) {
      setErrorMsg('Nama Lengkap harus diisi.');
      playAudioFeedback('error');
      return;
    }

    if (regPin.trim().length < 4) {
      setErrorMsg('PIN Keamanan minimal 4 digit.');
      playAudioFeedback('error');
      return;
    }

    const maxIdNum = officers.reduce((max, o) => {
      const num = parseInt(o.id, 10);
      return !isNaN(num) && num > max ? num : max;
    }, 170);
    const nextId = String(maxIdNum + 1).padStart(3, '0');

    const newOfficerData = {
      name: regName.trim(),
      role: regRole === 'Koorlap' ? 'Asisten Imam - Koordinator Lapangan (Koorlap)' : 'Asisten Imam',
      isKoorlap: regRole === 'Koorlap',
      wilayah: regWilayah,
      phone: regPhone.trim() || '0812-3456-7890',
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face`,
      dutyCount: 0,
      status: 'Aktif' as const,
      lokasiPelayanan: 'Gereja Utama Santo Yakobus',
      masaBakti: '2024 - 2027'
    };

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      playAudioFeedback('success');

      if (onRegisterOfficer) {
        onRegisterOfficer(newOfficerData);
      }

      onLoginSuccess({
        isAuthenticated: true,
        role: regRole === 'Koorlap' ? 'koorlap' : 'officer',
        officerId: nextId,
        name: regName.trim(),
        avatarUrl: newOfficerData.avatarUrl,
        loginTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      });
    }, 500);
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
    } else if (activeTab === 'register') {
      setRegName('Petugas Baru Sakristi');
      setRegPhone('0812-9988-7766');
      setRegPin('1234');
    } else {
      setAdminUser('admin');
      setAdminPass('sakristi123');
    }
  };

  return (

    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] border-2 border-[#D9CEBA] rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden relative flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-[#5B1414] p-6 text-white text-center relative shrink-0">
          <button
            onClick={() => {
              playAudioFeedback('tap');
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-full bg-white p-0.5 mx-auto mb-2 flex items-center justify-center border-2 border-white/40 shadow-sm overflow-hidden">
            <img
              src={CHURCH_LOGO}
              alt="Logo Paroki"
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          <h3 className="text-xl font-extrabold font-headline tracking-tight">
            {initialRole === 'admin' ? 'Login Administrator' : 'Portal Masuk & Pendaftaran Sakristi'}
          </h3>
          <p className="text-xs text-white/80 mt-1">
            {initialRole === 'admin' 
              ? 'Masuk ke Backoffice Pengelola Paroki Santo Yakobus' 
              : targetViewLabel ? `Akses ${targetViewLabel}` : 'Otorisasi & Pendaftaran Akun'}
          </p>

          {/* Level Tabs selector - Hidden if Admin Login */}
          {initialRole !== 'admin' && (
            <div className="mt-5 grid grid-cols-3 gap-1 bg-[#420D0D] p-1.5 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => handleTabChange('officer')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'officer' || activeTab === 'koorlap'
                    ? 'bg-[#FAF7F2] text-[#5B1414] shadow-md font-extrabold' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Petugas / Koorlap</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('register')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'register' 
                    ? 'bg-[#FAF7F2] text-[#5B1414] shadow-md font-extrabold' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Buat Akun</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('admin')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'admin' 
                    ? 'bg-[#FAF7F2] text-[#5B1414] shadow-md font-extrabold' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          )}

        </div>


        {/* Tab Descriptions & Form Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Demo Fill Header */}
          <div className="flex items-center justify-between bg-[#F3EDE2] border border-[#D9CEBA] p-2.5 rounded-xl text-xs text-[#6E5A4B]">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#5B1414] shrink-0" />
              <span>
                {activeTab === 'officer' && 'Tingkat 1: Presensi mandiri, cek jadwal & ajukan cuti.'}
                {activeTab === 'koorlap' && 'Tingkat 2: Ploting posisi tugas & supervisi presensi.'}
                {activeTab === 'admin' && 'Tingkat 3: Akses penuh backoffice & konfigurasi sistem.'}
              </span>
            </div>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-[11px] font-bold text-[#5B1414] hover:underline flex items-center gap-1 shrink-0 bg-white px-2 py-1 rounded-lg border border-[#D9CEBA]"
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Isi Otomatis</span>
            </button>
          </div>

          {/* 1. OFFICER LOGIN FORM */}
          {activeTab === 'officer' && (
            <form onSubmit={handleOfficerLogin} className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-[#5B1414] uppercase tracking-wider">
                  Pilih Nama / ID Petugas
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7662]">
                    <User className="w-4 h-4" />
                  </div>
                  <select
                    value={selectedOfficerId}
                    onChange={(e) => setSelectedOfficerId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#D9CEBA] focus:border-[#5B1414] rounded-xl text-sm font-semibold text-[#2C2420] outline-hidden transition-all appearance-none cursor-pointer"
                  >
                    {officers.map((o) => (
                      <option key={o.id} value={o.id}>
                        [{o.id}] {o.name} ({o.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-[#5B1414] uppercase tracking-wider">
                  PIN Keamanan (Default: 1234)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7662]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={officerPin}
                    onChange={(e) => setOfficerPin(e.target.value)}
                    placeholder="Masukkan PIN 4-digit"
                    maxLength={6}
                    className="w-full pl-10 pr-11 py-3 bg-white border-2 border-[#D9CEBA] focus:border-[#5B1414] rounded-xl text-sm font-semibold text-[#2C2420] outline-hidden transition-all tracking-widest font-mono"
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
                    <UserCheck className="w-4 h-4" />
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
                <label className="block text-xs font-black text-[#5B1414] uppercase tracking-wider">
                  Username / ID Koorlap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7662]">
                    <Award className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={koorlapUser}
                    onChange={(e) => setKoorlapUser(e.target.value)}
                    placeholder="Masukkan ID / Username Koorlap (contoh: koorlap / 145)"
                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#D9CEBA] focus:border-[#5B1414] rounded-xl text-sm font-semibold text-[#2C2420] outline-hidden transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-[#5B1414] uppercase tracking-wider">
                  PIN Koorlap (Default: 1234)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7662]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={koorlapPin}
                    onChange={(e) => setKoorlapPin(e.target.value)}
                    placeholder="Masukkan PIN"
                    className="w-full pl-10 pr-11 py-3 bg-white border-2 border-[#D9CEBA] focus:border-[#5B1414] rounded-xl text-sm font-semibold text-[#2C2420] outline-hidden transition-all tracking-widest font-mono"
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
                    <Award className="w-4 h-4" />
                    <span>Masuk Sesi Koorlap</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* REGISTER NEW ACCOUNT FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <label className="block text-xs font-black text-[#5B1414] uppercase tracking-wider">
                  Nama Lengkap Petugas
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Masukkan Nama Lengkap Sesuai KTP / Paroki"
                  required
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-[#D9CEBA] focus:border-[#5B1414] rounded-xl text-sm font-semibold text-[#2C2420] outline-hidden transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-black text-[#5B1414] uppercase tracking-wider">
                    Wilayah Paroki
                  </label>
                  <select
                    value={regWilayah}
                    onChange={(e) => setRegWilayah(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border-2 border-[#D9CEBA] focus:border-[#5B1414] rounded-xl text-xs font-bold text-[#2C2420] outline-hidden cursor-pointer"
                  >
                    <option value="Wilayah Agustinus">Wilayah Agustinus</option>
                    <option value="Wilayah Anna">Wilayah Anna</option>
                    <option value="Wilayah Fransiskus Asisi">Wilayah Fransiskus Asisi</option>
                    <option value="Wilayah Joachim">Wilayah Joachim</option>
                    <option value="Wilayah Joseph">Wilayah Joseph</option>
                    <option value="Wilayah Maria">Wilayah Maria</option>
                    <option value="Wilayah Paulus">Wilayah Paulus</option>
                    <option value="Wilayah Petrus">Wilayah Petrus</option>
                    <option value="Wilayah Thomas More">Wilayah Thomas More</option>
                    <option value="Wilayah Timotius">Wilayah Timotius</option>
                    <option value="Wilayah Yohanes Rasul">Wilayah Yohanes Rasul</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-black text-[#5B1414] uppercase tracking-wider">
                    Peran Petugas
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-white border-2 border-[#D9CEBA] focus:border-[#5B1414] rounded-xl text-xs font-bold text-[#2C2420] outline-hidden cursor-pointer"
                  >
                    <option value="Asisten Imam">Asisten Imam</option>
                    <option value="Koorlap">Asisten Imam + Koorlap</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-black text-[#5B1414] uppercase tracking-wider">
                    No. WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3 py-2.5 bg-[#ffffff] border-2 border-[#D9CEBA] focus:border-[#5B1414] rounded-xl text-xs font-semibold text-[#2C2420] outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-black text-[#5B1414] uppercase tracking-wider">
                    PIN Keamanan (4 Digit)
                  </label>
                  <input
                    type="password"
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value)}
                    placeholder="Buat PIN 4 Digit"
                    maxLength={6}
                    required
                    className="w-full px-3 py-2.5 bg-white border-2 border-[#D9CEBA] focus:border-[#5B1414] rounded-xl text-xs font-semibold text-[#2C2420] outline-hidden font-mono tracking-widest"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#5B1414] hover:bg-[#450e0e] text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-3 cursor-pointer"
              >
                {isLoading ? (
                  <span>Mendaftarkan Akun...</span>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span>Daftar &amp; Buat Akun Petugas Baru</span>
                  </>
                )}
              </button>
            </form>
          )}


          {/* 3. ADMIN LOGIN FORM */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-[#5B1414] uppercase tracking-wider">
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
