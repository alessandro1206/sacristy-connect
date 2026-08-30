import React, { Component, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };
  public declare props: Readonly<ErrorBoundaryProps>;

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('RootErrorBoundary caught an error:', error, errorInfo);
  }

  handleResetAndReload = () => {
    try {
      localStorage.clear();
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fbf9f5] flex items-center justify-center p-6 text-slate-800">
          <div className="bg-white border border-[#e6ded2] rounded-3xl p-8 max-w-lg w-full shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto text-2xl font-black">
              ⚠️
            </div>
            <h1 className="text-xl font-extrabold text-[#5B1414]">Terjadi Kendala Memuat Aplikasi</h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sistem mendeteksi adanya data sesi browser lama yang tidak sinkron. Silakan klik tombol di bawah untuk menyegarkan aplikasi.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] font-mono text-left text-slate-700 overflow-auto max-h-28">
              {this.state.error?.message || 'Unknown runtime error'}
            </div>
            <button
              onClick={this.handleResetAndReload}
              className="w-full py-3 bg-[#5B1414] hover:bg-[#430d0d] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer uppercase tracking-wider"
            >
              🔄 Refresh &amp; Sinkronkan Ulang Aplikasi
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);
