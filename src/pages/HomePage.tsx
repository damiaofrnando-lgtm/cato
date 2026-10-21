import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  TrendingUp, 
  Sparkles, 
  HelpCircle, 
  Briefcase, 
  Download, 
  Volume2, 
  ChevronRight, 
  Zap, 
  ShieldCheck, 
  Clock,
  Layers,
  Award
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { 
    user, 
    currentVipTier, 
    formatCurrency, 
    navigateTo, 
    openModal, 
    t, 
    tasksRemainingToday, 
    countdownFormatted, 
    isClockActive,
    announcements,
    miningTasks,
    concessionStats
  } = useApp();

  const shortcuts = [
    {
      id: 'invite',
      label: 'Convidar\nParceiros',
      icon: Users,
      color: 'from-sky-500 to-blue-600',
      action: () => navigateTo('/pages/team/index'),
    },
    {
      id: 'recharge',
      label: 'Alocar\nCapital',
      icon: ArrowUpCircle,
      color: 'from-blue-600 to-indigo-600',
      action: () => openModal('recharge'),
    },
    {
      id: 'withdraw',
      label: 'Solicitar\nSaque',
      icon: ArrowDownCircle,
      color: 'from-emerald-500 to-teal-600',
      action: () => openModal('withdraw'),
    },
    {
      id: 'fund',
      label: 'Fundo de\nKimberlito',
      icon: TrendingUp,
      color: 'from-cyan-600 to-blue-700',
      action: () => openModal('wealth_fund'),
    },
    {
      id: 'lucky',
      label: 'Roleta de\nDiamantes',
      icon: Sparkles,
      color: 'from-amber-400 to-orange-500',
      action: () => openModal('lucky_draw'),
    },
    {
      id: 'news',
      label: 'Processo\nKimberley',
      icon: HelpCircle,
      color: 'from-sky-400 to-cyan-600',
      action: () => navigateTo('/pages/news/index'),
    },
    {
      id: 'agent',
      label: 'Carreira\nde Lavra',
      icon: Briefcase,
      color: 'from-indigo-500 to-blue-700',
      action: () => navigateTo('/pages/agent/index'),
    },
    {
      id: 'download',
      label: 'Aplicativo\nOficial',
      icon: Download,
      color: 'from-slate-700 to-slate-900',
      action: () => openModal('app_download'),
    },
  ];

  const featuredTask = miningTasks.length > 0 ? miningTasks[0] : null;
  const progressPercent = Math.min(
    100,
    Math.round(((user?.tasksCompletedToday ?? 0) / currentVipTier.dailyTasks) * 100)
  );

  return (
    <div className="pb-28 pt-2 px-4 space-y-4 max-w-md mx-auto">
      {/* Wallet Balance Diamond Card - White Luxury Faceted */}
      <div className="diamond-crystal-card rounded-3xl p-5 border border-sky-100 relative overflow-hidden shadow-lg bg-white">
        {/* Diamond Geometric Watermark Background */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-36 h-36 bg-gradient-to-br from-sky-100/60 to-blue-200/40 diamond-shape opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-24 h-24 bg-gradient-to-tr from-sky-50 to-blue-100 diamond-shape opacity-30 pointer-events-none" />

        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            {/* Diamond Shaped Avatar Frame */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 p-0.5 rounded-2xl shadow-md flex items-center justify-center">
                <img
                  src={user?.avatar || '/assets/images/catoca_diamond_gem_1792306524777.jpg'}
                  alt="Avatar Catoca"
                  className="w-full h-full rounded-2xl object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/images/catoca_diamond_gem_1792306524777.jpg';
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-[9px] shadow">
                💎
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">
                  {user ? `${user.phoneCode} ${user.phone.slice(0, 3)}***${user.phone.slice(-3)}` : 'Operador Catoca'}
                </span>
                <span
                  className="text-[10px] font-black px-2 py-0.5 rounded-md text-white shadow-sm"
                  style={{ background: currentVipTier.accentColor || '#0284c7' }}
                >
                  {currentVipTier.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                <span>ID: {user?.id || 'CATOCA-SAURIMO'}</span>
                <span>•</span>
                <span className="text-sky-700 font-bold">{user?.totalCaratsExtracted ?? 0} ct</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => openModal('recharge')}
            className="px-3.5 py-1.5 rounded-xl btn-diamond-primary text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95"
          >
            <Zap size={13} fill="currentColor" />
            <span>Alocar</span>
          </button>
        </div>

        {/* Balance Display */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/80 shadow-inner space-y-3 relative z-10">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[11px] text-slate-500 block font-medium flex items-center gap-1">
                <span>Saldo em Cofre</span>
                <span className="text-[10px] text-sky-600 font-semibold">(AO Kwanza)</span>
              </span>
              <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                {formatCurrency(user?.balance || 0)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Rendimento Hoje</span>
              <span className="text-xs font-bold text-emerald-600 font-mono">
                +{formatCurrency(user?.todayEarnings || 0)}
              </span>
            </div>
          </div>

          {/* Daily Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] text-slate-600">
              <span className="flex items-center gap-1">
                <Layers size={12} className="text-sky-600" />
                <span>Lotes Minerados do Ciclo 24h:</span>
              </span>
              <span className="font-mono font-bold text-sky-700">
                {user?.tasksCompletedToday ?? 0} / {currentVipTier.dailyTasks}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 24h Automatic Cycle Countdown Banner */}
      <div 
        onClick={() => navigateTo(isClockActive ? '/pages/tasks/index' : '/pages/vip/index')}
        className={`cursor-pointer diamond-card rounded-2xl p-3.5 border shadow-sm flex items-center justify-between transition-all ${
          isClockActive 
            ? 'bg-gradient-to-r from-sky-50 via-white to-blue-50 border-sky-200' 
            : 'bg-gradient-to-r from-slate-50 via-white to-amber-50/60 border-slate-200 hover:border-amber-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-md ${
            isClockActive ? 'bg-gradient-to-tr from-sky-500 to-blue-600' : 'bg-gradient-to-tr from-slate-400 to-slate-600'
          }`}>
            <Clock size={20} className={isClockActive ? 'animate-spin' : ''} style={{ animationDuration: '10s' }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                isClockActive ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {isClockActive ? 'Extração de Diamantes 24h' : 'Relógio Inativo'}
              </span>
              {isClockActive ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ) : (
                <span className="text-[10px] text-amber-600 font-bold font-mono">Sem Plano</span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-800 mt-0.5">
              {isClockActive ? 'Próximo crédito automático em:' : 'Inicia 24h após comprar um plano:'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className={`px-2.5 py-1 rounded-lg font-mono font-black text-sm tracking-wider shadow ${
            isClockActive ? 'bg-slate-900 text-sky-300' : 'bg-slate-800 text-slate-300'
          }`}>
            {isClockActive ? countdownFormatted : '--:--:--'}
          </div>
          <span className={`text-[10px] font-bold block mt-0.5 ${
            isClockActive ? 'text-emerald-600' : 'text-sky-600 underline'
          }`}>
            {isClockActive ? 'Lucro 100% Automático' : 'Comprar Diamante VIP'}
          </span>
        </div>
      </div>

      {/* Marquee Ticker Announcement - Real-Time Firestore */}
      <div className="bg-white border border-slate-200 rounded-2xl px-3.5 py-2 flex items-center gap-2.5 overflow-hidden shadow-xs">
        <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
          <Volume2 size={13} />
        </div>
        <div className="overflow-hidden whitespace-nowrap flex-1 text-xs text-slate-600">
          <div className="animate-marquee font-medium">
            {announcements && announcements.length > 0
              ? announcements.map(a => a.text).join(' ••• ')
              : 'Concessão Mineira de Catoca · Central de extração diamantífera de Saurimo em tempo real'}
          </div>
        </div>
      </div>

      {/* Hero Banner Showcase - Catoca Diamonds */}
      <div className="relative h-44 rounded-3xl overflow-hidden shadow-md border border-slate-200">
        <img
          src="/assets/images/catoca_diamond_hero_1792306524766.jpg"
          alt="Sociedade Mineira de Catoca"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/images/catoca_heavy_truck_1792584629309.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-4 flex flex-col justify-end">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-extrabold text-white bg-blue-600 px-2 py-0.5 rounded-md uppercase tracking-wider">
              Mina de Saurimo · Lunda Sul
            </span>
            <span className="text-[10px] font-bold text-sky-200 bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-md">
              4ª Maior do Mundo
            </span>
          </div>
          <h3 className="text-base font-extrabold text-white leading-tight">
            Extração de Diamantes & Partilha de Rendimentos
          </h3>
          <p className="text-xs text-slate-200 mt-0.5">
            Processamento de minério kimberlítico gerado automaticamente a cada 24 horas.
          </p>
        </div>
      </div>

      {/* 8 Shortcuts Grid - White Diamond Cards */}
      <div className="grid grid-cols-4 gap-2.5">
        {shortcuts.map(sc => {
          const Icon = sc.icon;
          return (
            <button
              key={sc.id}
              onClick={sc.action}
              className="bg-white p-2.5 rounded-2xl flex flex-col items-center text-center border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-sm active:scale-95 transition-all group"
            >
              <div
                className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${sc.color} flex items-center justify-center text-white mb-1.5 shadow-sm group-hover:scale-105 transition-transform`}
              >
                <Icon size={19} strokeWidth={2.2} />
              </div>
              <span className="text-[10.5px] font-semibold text-slate-700 leading-tight whitespace-pre-line">
                {sc.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Featured Automatic 24h Diamond Plan & Profit */}
      <div className="bg-white p-4 rounded-3xl border border-sky-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Seu Plano de Diamante Catoca</h3>
              <p className="text-[10px] text-slate-500">Ciclo de 24h com rendimento 100% automático</p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('/pages/vip/index')}
            className="text-xs text-sky-600 font-bold flex items-center gap-0.5 hover:underline"
          >
            <span>Ver Planos VIP</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div
          onClick={() => navigateTo('/pages/tasks/index')}
          className="p-3.5 rounded-2xl border border-sky-200 bg-gradient-to-br from-white to-sky-50/50 cursor-pointer hover:border-sky-300 transition-all space-y-3 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-sky-400 shadow-xs shrink-0 bg-slate-50">
              <img
                src={currentVipTier.diamondImage}
                alt={currentVipTier.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-700 font-mono">
                  {currentVipTier.name}
                </span>
                <span className="text-xs font-black text-slate-900 truncate">
                  {currentVipTier.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {currentVipTier.diamondCut} · {currentVipTier.caratCapacity}
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-400 font-mono block">LUCRO / DIA</span>
              <span className="text-xs font-black text-emerald-600 font-mono">
                +{formatCurrency(currentVipTier.dailyIncome)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-mono text-[10px] text-slate-600">
              <Clock size={12} className="text-sky-500" />
              <span>Contador: <strong className="text-slate-800">{countdownFormatted}</strong></span>
            </span>
            <span className="text-sky-600 font-bold flex items-center gap-1">
              <span>Ver Ciclo Automático</span>
              <ChevronRight size={13} />
            </span>
          </div>
        </div>
      </div>

      {/* Official Catoca Mining Governance & Live Concession Metrics */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-sky-600" />
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Consórcio & Produção em Tempo Real
            </h4>
          </div>
          <span className="text-[10px] text-emerald-600 font-mono font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>AO VIVO NO FIRESTORE</span>
          </span>
        </div>

        {/* Live Metrics from Firestore */}
        {concessionStats && (
          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div>
              <span className="text-[9px] text-slate-400 block font-mono">EXTRAÇÃO TOTAL</span>
              <span className="text-xs font-black text-sky-700 font-mono">
                {concessionStats.totalCaratsMined.toLocaleString('pt-BR')} ct
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block font-mono">OPERADORES</span>
              <span className="text-xs font-black text-slate-900 font-mono">
                {concessionStats.activeOperatorsCount.toLocaleString('pt-BR')}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block font-mono">DISTRIBUÍDO</span>
              <span className="text-xs font-black text-emerald-600 font-mono">
                {(concessionStats.totalDistributedKz / 1000000).toFixed(1)}M Kz
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 pt-0.5 text-center text-xs font-bold text-slate-600">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
            <span className="text-[11px] font-black text-slate-800">ENDIAMA E.P.</span>
            <span className="text-[9px] text-slate-400 font-normal">Concessão Nacional</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
            <span className="text-[11px] font-black text-slate-800">KIMBERLEY</span>
            <span className="text-[9px] text-slate-400 font-normal">Selo de Origem Ética</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
            <span className="text-[11px] font-black text-slate-800">GIA GEMOLOGY</span>
            <span className="text-[9px] text-slate-400 font-normal">Grau de Pureza VVS</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
            <span className="text-[11px] font-black text-slate-800">MULTICAIXA</span>
            <span className="text-[9px] text-slate-400 font-normal">Liquidação BAI Express</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
            <span className="text-[11px] font-black text-slate-800">SODIAM E.P.</span>
            <span className="text-[9px] text-slate-400 font-normal">Comercialização</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
            <span className="text-[11px] font-black text-slate-800">UTM-1 & UTM-2</span>
            <span className="text-[9px] text-slate-400 font-normal">Usinas Saurimo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
