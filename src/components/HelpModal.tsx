import React from 'react';
import { HelpCircle, X, Touchpad, MessageSquare, CheckCircle2, ShieldCheck } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[85vh]">
        <div className="flex justify-between items-center mb-4 border-b border-outline-variant/60 pb-3">
          <div className="flex items-center gap-2 text-primary font-bold text-lg font-headline">
            <HelpCircle className="w-5 h-5" />
            <span>Panduan Penggunaan SacristyConnect</span>
          </div>
          <button onClick={onClose} className="text-xl font-bold text-on-surface-variant">&times;</button>
        </div>

        <div className="space-y-4 text-sm text-on-surface">
          <div className="p-4 bg-surface rounded-xl border border-outline-variant/60">
            <h4 className="font-bold text-primary text-base font-headline mb-1 flex items-center gap-2">
              <Touchpad className="w-4 h-4" />
              1. Cara Presensi Mandiri di Kiosk
            </h4>
            <ul className="list-disc list-inside space-y-1 text-on-surface-variant text-xs md:text-sm mt-2">
              <li>Lihat 4 kartu petugas yang bertugas pada sesi misa aktif.</li>
              <li>Ketik 3 digit nomor ID Anda pada Keypad numerik (contoh: <strong>145</strong> untuk Bpk. Damianus Slamet, <strong>210</strong> untuk Antonius W., <strong>089</strong> untuk Ibu Maria S., <strong>104</strong> untuk Heru P.).</li>
              <li>Tekan tombol <strong>Kirim</strong> atau tombol Enter pada keypad.</li>
              <li>Anda juga dapat langsung <strong>menekan kartu foto</strong> Anda untuk mengisi ID secara instan.</li>
            </ul>
          </div>

          <div className="p-4 bg-surface rounded-xl border border-outline-variant/60">
            <h4 className="font-bold text-primary text-base font-headline mb-1 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              2. AI Chat Converter WhatsApp di Admin
            </h4>
            <ul className="list-disc list-inside space-y-1 text-on-surface-variant text-xs md:text-sm mt-2">
              <li>Salin pesan WhatsApp dari grup Sakristi mengenai pertukaran tugas misa atau izin cuti.</li>
              <li>Tempelkan pada kotak <em>AI Chat Converter</em> di Admin Backoffice.</li>
              <li>Klik tombol <strong>Update &amp; Generate Schedule Changes</strong>.</li>
              <li>AI Gemini 3.7 akan otomatis mendeteksi nama petugas, tanggal misa, petugas pengganti, dan memperbarui tabel jadwal serta log audit secara real-time!</li>
            </ul>
          </div>

          <div className="p-4 bg-surface rounded-xl border border-outline-variant/60">
            <h4 className="font-bold text-primary text-base font-headline mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              3. Ekspor ke Python Flask &amp; Google Sheets
            </h4>
            <p className="text-xs md:text-sm text-on-surface-variant mt-2 leading-relaxed">
              Klik tombol <strong>Ekspor Kode</strong> di sudut kanan atas untuk mendapatkan source code lengkap <code>kiosk.html</code>, <code>admin.html</code>, dan <code>app.py</code> (backend Flask dengan Google Sheets API) yang dapat langsung dijalankan di server lokal paroki Anda.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-container"
          >
            Mengerti &amp; Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
