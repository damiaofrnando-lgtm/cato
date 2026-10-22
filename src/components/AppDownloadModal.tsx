import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Download, Smartphone, CheckCircle, Apple, Gem } from 'lucide-react';

export const AppDownloadModal: React.FC = () => {
  const { closeModal } = useApp();
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white border-t sm:border border-sky-200 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl text-center">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Download size={16} />
            </div>
            <h3 className="text-slate-900 font-black text-base text-left">Aplicativo Catoca Diamantes</h3>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
          >
            <X size={17} />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-white border-2 border-sky-200 p-1.5 shadow-md flex items-center justify-center overflow-hidden">
            <img
              src="/assets/aistudio/IMG_1487_83d7197c.jpeg"
              alt="Catoca Logo Oficial"
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <h4 className="text-base font-black text-slate-900">Catoca Mineral Mobile v4.1.0</h4>
            <p className="text-xs text-slate-600 mt-1">
              Acompanhamento de extração 24h em tempo real, alertas de novos lotes e saques Multicaixa express.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-400 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Smartphone size={18} className="text-sky-600" />
              <div className="text-left">
                <p className="text-[10px] text-slate-400">Download</p>
                <p className="text-xs font-bold text-slate-900">Android APK</p>
              </div>
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-400 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Apple size={18} className="text-slate-800" />
              <div className="text-left">
                <p className="text-[10px] text-slate-400">Web Clip</p>
                <p className="text-xs font-bold text-slate-900">iOS Safari</p>
              </div>
            </button>
          </div>

          {downloading && (
            <p className="text-xs text-sky-600 font-bold animate-pulse">
              Gerando pacote seguro da Sociedade Mineira de Catoca...
            </p>
          )}

          {downloaded && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5">
              <CheckCircle size={15} />
              <span>Instalador baixado com sucesso!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
