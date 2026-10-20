import React from 'react';
import { useApp } from '../context/AppContext';
import { Globe, Headphones, ChevronLeft, Eye, EyeOff, Gem } from 'lucide-react';

interface NavbarProps {
  title?: string;
  showBack?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ title, showBack = false }) => {
  const { currentRoute, navigateTo, openModal, user, t, hideBalance, toggleHideBalance, formatCurrency } = useApp();

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigateTo('/pages/index/index');
    }
  };

  const isMainTab = [
    '/pages/index/index',
    '/pages/tasks/index',
    '/pages/vip/index',
    '/pages/team/index',
    '/pages/mine/index',
  ].includes(currentRoute);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2.5">
        {showBack || (!isMainTab && currentRoute !== '/pages/register/index' && currentRoute !== '/pages/login/index') ? (
          <button
            onClick={handleBack}
            className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-900 transition-all active:scale-95"
            aria-label="Voltar"
          >
            <ChevronLeft size={18} />
          </button>
        ) : null}

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('/pages/index/index')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-sky-400 to-indigo-600 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center">
            <Gem size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-slate-900 font-black tracking-tight text-sm leading-none flex items-center gap-1.5">
              <span>CATOCA</span>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-200">
                DIAMANTES
              </span>
            </h1>
            {title ? (
              <p className="text-[11px] text-slate-500 font-medium leading-none mt-1">
                {title}
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">
                Saurimo · Angola
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Balance toggle */}
        {user && isMainTab && (
          <button
            onClick={toggleHideBalance}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700 hover:border-blue-300 transition-all"
            title="Alternar visibilidade do saldo"
          >
            {hideBalance ? <EyeOff size={13} className="text-slate-400" /> : <Eye size={13} className="text-blue-600" />}
            <span className="font-extrabold text-xs text-slate-900 font-mono">
              {formatCurrency(user.balance)}
            </span>
          </button>
        )}

        {/* Language switch */}
        <button
          onClick={() => openModal('language')}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 border border-slate-200 transition-all active:scale-95"
          title="Mudar idioma"
        >
          <Globe size={13} className="text-blue-600" />
          <span className="uppercase text-[10.5px] font-bold">
            {t.currency === 'Kz' ? 'PT' : 'EN'}
          </span>
        </button>

        {/* Customer service */}
        <button
          onClick={() => openModal('customer_service')}
          className="relative w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 border border-slate-200 transition-all active:scale-95"
          title="Central de Operações Catoca"
        >
          <Headphones size={15} className="text-blue-600" />
        </button>
      </div>
    </header>
  );
};
