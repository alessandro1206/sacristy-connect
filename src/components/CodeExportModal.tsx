import React, { useState } from 'react';
import { 
  KIOSK_HTML_TEMPLATE, 
  ADMIN_HTML_TEMPLATE, 
  PYTHON_FLASK_SCRIPT, 
  REQUIREMENTS_TXT, 
  SETUP_GUIDE_MD 
} from '../data/standaloneTemplates';
import { Copy, Check, Download, FileCode, Terminal, BookOpen, X, Sparkles } from 'lucide-react';

interface CodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'kiosk' | 'admin' | 'python' | 'reqs' | 'guide'>('kiosk');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  if (!isOpen) return null;

  const getActiveContent = () => {
    switch (activeTab) {
      case 'kiosk': return { title: 'kiosk.html', code: KIOSK_HTML_TEMPLATE, lang: 'html' };
      case 'admin': return { title: 'admin.html', code: ADMIN_HTML_TEMPLATE, lang: 'html' };
      case 'python': return { title: 'app.py', code: PYTHON_FLASK_SCRIPT, lang: 'python' };
      case 'reqs': return { title: 'requirements.txt', code: REQUIREMENTS_TXT, lang: 'text' };
      case 'guide': return { title: 'PANDUAN_SETUP.md', code: SETUP_GUIDE_MD, lang: 'markdown' };
    }
  };

  const currentFile = getActiveContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopiedTab(activeTab);
    setTimeout(() => setCopiedTab(null), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.title;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 z-50 animate-in fade-in">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 md:p-6 border-b border-outline-variant bg-surface flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary text-white rounded-xl">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-primary font-headline">
                Ekspor Kode Standalone & Backend Python Google Sheets
              </h3>
              <p className="text-xs md:text-sm text-on-surface-variant font-medium">
                Salin langsung atau unduh template file HTML & script Flask backend untuk dideploy di server Anda.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-outline-variant bg-surface-container px-4 gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('kiosk')}
            className={`py-3 px-4 text-xs md:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'kiosk'
                ? 'border-primary text-primary bg-surface-container-lowest'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <FileCode className="w-4 h-4 text-primary" />
            <span>kiosk.html</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`py-3 px-4 text-xs md:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'admin'
                ? 'border-primary text-primary bg-surface-container-lowest'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <FileCode className="w-4 h-4 text-primary" />
            <span>admin.html</span>
          </button>

          <button
            onClick={() => setActiveTab('python')}
            className={`py-3 px-4 text-xs md:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'python'
                ? 'border-primary text-primary bg-surface-container-lowest'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-700" />
            <span>app.py (Flask + Sheets)</span>
          </button>

          <button
            onClick={() => setActiveTab('reqs')}
            className={`py-3 px-4 text-xs md:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'reqs'
                ? 'border-primary text-primary bg-surface-container-lowest'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Terminal className="w-4 h-4 text-secondary" />
            <span>requirements.txt</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 text-xs md:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-primary text-primary bg-surface-container-lowest'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-700" />
            <span>Panduan Setup Google Sheets</span>
          </button>
        </div>

        {/* Toolbar in Code Box */}
        <div className="p-3 bg-neutral-900 text-neutral-300 flex justify-between items-center text-xs px-4 border-b border-neutral-800 shrink-0">
          <span className="font-mono text-neutral-400 font-bold">{currentFile.title}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
            >
              {copiedTab === activeTab ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-container text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File</span>
            </button>
          </div>
        </div>

        {/* Code Content Area */}
        <div className="flex-1 p-4 bg-neutral-950 text-neutral-100 font-mono text-xs overflow-auto leading-relaxed">
          <pre className="whitespace-pre">
            <code>{currentFile.code}</code>
          </pre>
        </div>

      </div>
    </div>
  );
};
