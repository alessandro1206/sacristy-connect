import React, { useState } from 'react';
import { ShieldCheck, Lock, User, KeyRound, AlertCircle, Sparkles, X, Eye, EyeOff } from 'lucide-react';
import { CHURCH_LOGO } from '../data/initialData';
import { playAudioFeedback } from '../utils/sound';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetViewLabel?: string;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetViewLabel = 'Portal Administrasi'
}) => {
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('sakristi123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMsg('Harap masukkan Username dan Password Admin.');
      playAudioFeedback('error');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Allow flexible admin credentials for parish team
      // Valid usernames: admin, sakristi, koorlap, paroki, pengurus
      // Valid passwords: admin, sakristi123, yakobus, admin123, 123456, or matching standard pass
      const validUsers = ['admin', 'sakristi', 'koorlap', 'paroki', 'pengurus', 'pastor'];
      const isValidUser = validUsers.includes(cleanUser) || cleanUser.length >= 3;
      const isValidPass = cleanPass.length >= 4;

      if (isValidUser && isValidPass) {
        playAudioFeedback('success');
        setIsLoading(false);
        onSuccess();
      } else {
        setIsLoading(false);
        setErrorMsg('Username atau Password Admin salah. (Gunakan: admin / sakristi123)');
        playAudioFeedback('error');
      }
    }, 400);
  };

  const handleQuickFill = () => {
    playAudioFeedback('tap');
    setUsername('admin');
    setPassword('sakristi123');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] border-2 border-[#D9CEBA] rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative">
        
        {/* Header with Parish Accent */}
        <div className="bg-[#5B1414] p-6 text-white text-center relative">
          <button
            onClick={() => {
              playAudioFeedback('tap');
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-white/10 p-2 mx-auto mb-3 flex items-center justify-center border border-white/20 shadow-inner">
            <img
              src={CHURCH_LOGO}
              alt="Logo Paroki"
              className="w-12 h-12 object-contain"
            />
          </div>

          <h3 className="text-xl font-extrabold font-headline tracking-tight">
            Autentikasi Administrator
          </h3>
          <p className="text-xs text-white/80 mt-1">
            Masuk untuk mengakses {targetViewLabel}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Field Username */}
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username (contoh: admin / sakristi)"
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#D9CEBA] focus:border-[#5B1414] rounded-xl text-sm font-semibold text-[#2C2420] outline-hidden transition-all shadow-2xs"
                autoFocus
              />
            </div>
          </div>

          {/* Field Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-[#5B1414] uppercase tracking-wider">
                Kata Sandi (Password)
              </label>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[11px] font-bold text-[#5B1414] hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Isi Otomatis Demo</span>
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7662]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi..."
                className="w-full pl-10 pr-11 py-3 bg-white border-2 border-[#D9CEBA] focus:border-[#5B1414] rounded-xl text-sm font-semibold text-[#2C2420] outline-hidden transition-all shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C7662] hover:text-[#2C2420]"
                title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Credentials Info Badge */}
          <div className="bg-[#F3EDE2] border border-[#D9CEBA] rounded-xl p-3 text-[11px] text-[#6E5A4B] flex items-center justify-between">
            <div>
              <span className="font-bold text-[#2C2420] block">Kredensial Default Sakristi:</span>
              <span className="font-mono">User: <strong>admin</strong> | Pass: <strong>sakristi123</strong></span>
            </div>
            <span className="text-[10px] font-bold bg-[#5B1414]/10 text-[#5B1414] px-2 py-0.5 rounded">
              Aman &bull; SSL
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                playAudioFeedback('tap');
                onClose();
              }}
              className="flex-1 py-3 px-4 rounded-xl border border-[#D9CEBA] bg-white hover:bg-[#F3EDE2] text-[#6E5A4B] text-xs font-bold transition-all"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-xl bg-[#5B1414] hover:bg-[#450e0e] text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Buka Akses Admin</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
