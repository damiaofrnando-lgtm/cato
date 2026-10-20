import React from 'react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';
import { X, Check } from 'lucide-react';

export const LanguageModal: React.FC = () => {
  const { language, setLanguage, closeModal } = useApp();

  const languages: { id: Language; label: string; flag: string; sub: string }[] = [
    { id: 'pt', label: 'Português', flag: '🇦🇴 🇧🇷', sub: 'Angola (Catoca / Saurimo) · Brasil' },
    { id: 'en', label: 'English', flag: '🇺🇸 🇬🇧', sub: 'International' },
    { id: 'es', label: 'Español', flag: '🇪🇸 🇲🇽', sub: 'España / Latinoamérica' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white border-t sm:border border-sky-200 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-slate-900 font-black text-base">Selecionar Idioma / Language</h3>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
          >
            <X size={17} />
          </button>
        </div>

        <div className="space-y-2.5">
          {languages.map(lang => {
            const isSelected = language === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => {
                  setLanguage(lang.id);
                  closeModal();
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-sky-50 border-sky-500 text-slate-900 shadow-xs ring-1 ring-sky-400'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-left">
                    <p className="font-bold text-xs text-slate-900">{lang.label}</p>
                    <p className="text-[11px] text-slate-500">{lang.sub}</p>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-sky-600 flex items-center justify-center text-white">
                    <Check size={13} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
