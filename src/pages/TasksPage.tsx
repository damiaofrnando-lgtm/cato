import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VIP_TIERS } from '../data/mockData';
import { 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Clock, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Gem,
  Award,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  Coins
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TasksPage: React.FC = () => {
  const { 
    currentVipTier, 
    formatCurrency, 
    navigateTo, 
    countdownFormatted,
    countdownSeconds,
    triggerSimulated24hProfit,
    lastAutoProfit,
    user
  } = useApp();

  const [simulating, setSimulating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Calculate percentage of 24h cycle elapsed (24h = 86400 seconds)
  const totalCycleSeconds = 24 * 60 * 60;
  const elapsedSeconds = Math.max(0, totalCycleSeconds - countdownSeconds);
  const progressPercent = Math.min(100, Math.max(1, Math.round((elapsedSeconds / totalCycleSeconds) * 100)));

  const handleSimulateCycle = async () => {
    setSimulating(true);
    setFeedbackMsg('');

    try {
      const res = await triggerSimulated24hProfit();
      setFeedbackMsg(res.message);

      if (res.success) {
        confetti({
          particleCount: 110,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#0284c7', '#38bdf8', '#ffffff', '#e0f2fe', '#60a5fa'],
        });
        setTimeout(() => setFeedbackMsg(''), 5000);
      }
    } finally {
      setSimulating(false);
    }
  };

  const hasActiveDiamond = currentVipTier && currentVipTier.id > 0;

  return (
    <div className="pb-28 pt-2 px-4 space-y-4 max-w-md mx-auto">
      {/* Page Title & Luxury Crystalline Header */}
      <div className="diamond-crystal-card p-5 rounded-3xl border border-sky-100 shadow-md relative overflow-hidden bg-white">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-sky-100/60 diamond-shape opacity-40 pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Gem size={24} />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">
              Extração Automática de Diamantes
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Ciclo contínuo de 24 horas · Lucro gerado 100% no automático
            </p>
          </div>
        </div>

        {feedbackMsg && (
          <div className="mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold text-center">
            {feedbackMsg}
          </div>
        )}
      </div>

      {/* Main Active Diamond Card & 24h Countdown Clock */}
      {hasActiveDiamond ? (
        <div className="p-5 rounded-3xl bg-white border border-sky-200 shadow-md relative overflow-hidden space-y-4">
          {/* Subtle diamond watermarks */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-radial from-sky-100/80 to-transparent -mr-10 -mt-10 pointer-events-none" />

          {/* Diamond Identity Header */}
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-sky-400 shadow-sm shrink-0 bg-slate-50">
              <img
                src={currentVipTier.diamondImage}
                alt={currentVipTier.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-slate-900/70 text-[9px] font-black text-white text-center py-0.5 font-mono">
                {currentVipTier.name}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Plano Ativo
                </span>
                <span className="text-[10px] font-mono text-slate-400">120 DIAS</span>
              </div>
              <h3 className="text-sm font-black text-slate-900 mt-0.5 truncate">
                {currentVipTier.title}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {currentVipTier.diamondCut} · {currentVipTier.caratCapacity}
              </p>
            </div>
          </div>

          {/* Prominent 24-Hour Countdown Clock Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white relative overflow-hidden shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase text-sky-300 flex items-center gap-1.5 font-mono">
                <Clock size={13} className="text-sky-400 animate-spin" />
                <span>Ciclo de Lucro Automático (24h)</span>
              </span>
              <span className="text-[10px] text-slate-300 font-mono">
                {progressPercent}% decorrido
              </span>
            </div>

            {/* Countdown Numbers */}
            <div className="text-center py-2">
              <span className="text-3xl font-black tracking-widest font-mono text-white drop-shadow-md">
                {countdownFormatted}
              </span>
              <p className="text-[11px] text-sky-200 font-medium mt-1">
                Ao término das 24h, o lucro diário é depositado direto na sua conta!
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden mt-3">
              <div
                className="h-full bg-gradient-to-r from-sky-400 via-blue-400 to-emerald-400 transition-all duration-1000 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Profit Breakdown for this Diamond */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 block text-[10px] font-mono uppercase">Ganho Diário Automático</span>
              <span className="text-base font-black text-emerald-600 font-mono block mt-0.5">
                +{formatCurrency(currentVipTier.dailyIncome)}
              </span>
              <span className="text-[9.5px] text-slate-400">Sem necessidade de coletar</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 block text-[10px] font-mono uppercase">Ganho em 120 Dias</span>
              <span className="text-base font-black text-sky-700 font-mono block mt-0.5">
                {formatCurrency(currentVipTier.total120Days)}
              </span>
              <span className="text-[9.5px] text-slate-400">Retorno garantido</span>
            </div>
          </div>

          {/* Notice: No Manual Collect Needed! */}
          <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-[11.5px] flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <div className="leading-snug">
              <strong>Sem Botão de Coleta: </strong>
              O lucro é gerado e creditado automaticamente no seu saldo a cada 24 horas.
            </div>
          </div>

          {/* Test / Simulation Action (for Instant Verification) */}
          <div className="pt-1">
            <button
              onClick={handleSimulateCycle}
              disabled={simulating}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <RefreshCw size={13} className={simulating ? 'animate-spin' : ''} />
              <span>Simular Término de 24h (Testar Crédito Automático)</span>
            </button>
          </div>
        </div>
      ) : (
        /* User Has No VIP Diamond - Call To Action with Paused Clock */
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto shadow-inner border border-slate-200">
            <Clock size={32} />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>RELÓGIO PAUSADO</span>
            </div>
            <h3 className="text-base font-black text-slate-900">
              O Relógio Só Conta Após a Compra de um Plano
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 max-w-xs mx-auto leading-relaxed">
              Enquanto você não comprar um diamante VIP, o relógio permanece parado. Assim que adquirir um plano, a contagem regressiva de 24h é iniciada para obter lucro automático!
            </p>
          </div>

          {/* Frozen Timer Display */}
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white max-w-xs mx-auto">
            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Contador 24h</span>
            <span className="text-2xl font-black font-mono tracking-widest text-slate-400">--:--:--</span>
            <span className="text-[10.5px] text-amber-300 block mt-1 font-medium">Aguardando ativação de plano</span>
          </div>

          {/* Diamond Showcase Preview */}
          <div className="grid grid-cols-3 gap-2 my-2">
            {VIP_TIERS.slice(1, 4).map(v => (
              <div key={v.id} className="p-2 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="w-10 h-10 rounded-xl overflow-hidden mx-auto mb-1 border border-slate-200">
                  <img src={v.diamondImage} alt={v.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] font-black text-slate-900 block">{v.name}</span>
                <span className="text-[9.5px] font-bold text-emerald-600 font-mono">+{formatCurrency(v.dailyIncome)}/dia</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigateTo('/pages/vip/index')}
            className="w-full py-3 rounded-2xl btn-diamond-primary text-xs font-black flex items-center justify-center gap-2 shadow-md active:scale-98"
          >
            <span>Ver Todos os Planos de Diamantes (VIP 1 ao 15)</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Last Automatic Credit Info */}
      {lastAutoProfit && (
        <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Coins size={16} className="text-amber-500" />
            <div>
              <span className="text-[10.5px] text-slate-500 block">Último Lucro Automático</span>
              <span className="font-black text-slate-800">{lastAutoProfit.tierName}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-black text-emerald-600 font-mono">+{formatCurrency(lastAutoProfit.amount)}</span>
            <span className="text-[10px] text-slate-400 block font-mono">às {lastAutoProfit.time}</span>
          </div>
        </div>
      )}

      {/* Real-time Catoca Processing Plants (Automated 24/7 Operations) */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider px-1 flex items-center gap-1.5">
          <Cpu size={14} className="text-sky-600" />
          <span>Operação Industrial Automatizada Catoca (24h)</span>
        </h4>

        <div className="space-y-2.5">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 border border-sky-100">
                <Layers size={17} />
              </div>
              <div>
                <h5 className="text-xs font-black text-slate-900">Usina de Tratamento Mineral (UTM-1)</h5>
                <p className="text-[10.5px] text-slate-500">Britagem e lavagem contínua de kimberlito</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
              Operando 24h
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                <Zap size={17} />
              </div>
              <div>
                <h5 className="text-xs font-black text-slate-900">Triagem Óptica por Raios-X</h5>
                <p className="text-[10.5px] text-slate-500">Detecção automatizada de diamantes brutos</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
              Fluxo Contínuo
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
                <ShieldCheck size={17} />
              </div>
              <div>
                <h5 className="text-xs font-black text-slate-900">Certificação Kimberley & Cofre Catoca</h5>
                <p className="text-[10.5px] text-slate-500">Auditoria e distribuição direta aos concessionários</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 shrink-0">
              Certificado
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
