import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.removeItem('catoca_user');
      localStorage.removeItem('catoca_active_user');
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 shadow-lg">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-black mb-2 text-white">Sociedade Mineira de Catoca</h2>
          <p className="text-sm text-slate-300 max-w-sm mb-6 leading-relaxed">
            Houve uma oscilação na conexão com a plataforma de concessões diamantíferas. Clique abaixo para atualizar o painel.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <RotateCcw size={16} />
              <span>Atualizar Painel</span>
            </button>
            <button
              onClick={this.handleReset}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-95"
            >
              <Home size={16} />
              <span>Página Inicial</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
