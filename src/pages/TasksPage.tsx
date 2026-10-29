import React from 'react';
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
  Coins
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { 
    currentVipTier, 
    formatCurrency, 
    navigateTo, 
    countdownFormatted,
    countdownSeconds,
    lastAutoProfit,
    user,
    isSunday,
    isClockPausedForSunday,
    simulateSunday,
    toggleSimulateSunday
  } = useApp();

  // Calculate percentage of 24h cycle elapsed (24h = 86400 seconds)
  const totalCycleSeconds = 24 * 60 * 60;
  const elapsedSeconds = Math.max(0, totalCycleSeconds - countdownSeconds);
  const progressPercent = Math.min(100, Math.max(1, Math.round((elapsedSeconds / totalCycleSeconds) * 100)));

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
      </div>

      {/* Sunday Operational Rest Alert */}
      {isSunday && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-50 to-orange-500/10 border-2 border-amber-300 text-amber-950 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Clock size={17} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider font-mono block">
                  Repouso Operacional da Concessão
                </span>
                <h4 className="text-xs font-black text-amber-950">
                  Domingo: Manutenção Preventiva das Usinas
                </h4>
              </div>
            </div>
            <span className="text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300 font-mono">
              Pausado
            </span>
          </div>
          <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
            <strong>Aviso de Operação: </strong>Aos domingos não são realizadas tarefas nem extrações na mina de Catoca. O relógio de 24 horas parou de contar e dará sequência normalmente na segunda-feira às 00:00!
          </p>
        </div>
      )}

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
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                  isSunday 
                    ? 'bg-amber-100 text-amber-800 border-amber-300' 
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isSunday ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                  {isSunday ? 'Pausa de Domingo' : 'Plano Ativo'}
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

          {/* Circular 24-Hour Countdown Clock Dial */}
          <div className={`p-6 rounded-3xl text-white relative overflow-hidden shadow-xl flex flex-col items-center justify-center transition-all ${
            isSunday 
              ? 'bg-gradient-to-b from-slate-950 via-amber-950/60 to-slate-900' 
              : 'bg-gradient-to-b from-slate-900 via-sky-950 to-slate-900'
          }`}>
            {/* Subtle radial glow */}
            <div className={`absolute inset-0 pointer-events-none ${
              isSunday ? 'bg-radial from-amber-500/15 via-transparent to-transparent' : 'bg-radial from-sky-500/20 via-transparent to-transparent'
            }`} />

            <div className="flex items-center justify-between w-full mb-3 px-1 relative z-10">
              <span className={`text-[11px] font-extrabold uppercase flex items-center gap-1.5 font-mono ${
                isSunday ? 'text-amber-300' : 'text-sky-300'
              }`}>
                <Clock size={13} className={isSunday ? 'text-amber-400' : 'text-sky-400 animate-spin'} style={{ animationDuration: '8s' }} />
                <span>{isSunday ? 'Relógio Pausado (Domingo)' : 'Ciclo de Lucro 24h'}</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono flex items-center gap-1 ${
                isSunday 
                  ? 'text-amber-300 bg-amber-500/20 border border-amber-500/40' 
                  : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isSunday ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
                <span>{isSunday ? 'Retoma 2ª Feira' : 'Automático'}</span>
              </span>
            </div>

            {/* SVG Circular Chronometer Gauge */}
            <div className="relative w-56 h-56 flex items-center justify-center my-2">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 220 220">
                <defs>
                  <linearGradient id="catocaTimerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                  <linearGradient id="catocaSundayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                  <filter id="timerGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={isSunday ? '#f59e0b' : '#38bdf8'} floodOpacity="0.6" />
                  </filter>
                </defs>

                {/* Outer decorative dotted ring */}
                <circle
                  cx="110"
                  cy="110"
                  r="102"
                  fill="none"
                  stroke={isSunday ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.08)'}
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />

                {/* Background Track Circle */}
                <circle
                  cx="110"
                  cy="110"
                  r="86"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth="10"
                />

                {/* Animated Circular Progress Ring */}
                <circle
                  cx="110"
                  cy="110"
                  r="86"
                  fill="none"
                  stroke={isSunday ? 'url(#catocaSundayGradient)' : 'url(#catocaTimerGradient)'}
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeDasharray={540.35}
                  strokeDashoffset={540.35 - (540.35 * Math.min(100, Math.max(1, progressPercent))) / 100}
                  filter="url(#timerGlow)"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>

              {/* Center Content of the Round Clock */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none select-none">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 shadow-sm ${
                  isSunday ? 'bg-amber-500/20 border border-amber-400/40 text-amber-300' : 'bg-sky-500/20 border border-sky-400/40 text-sky-300 animate-pulse'
                }`}>
                  <Gem size={14} />
                </div>

                <span className={`text-[10px] uppercase font-mono font-bold tracking-widest ${
                  isSunday ? 'text-amber-300' : 'text-sky-300'
                }`}>
                  {isSunday ? 'PAUSA OPERACIONAL' : 'TEMPO RESTANTE'}
                </span>

                <div className="text-2xl sm:text-[26px] font-black tracking-wider font-mono text-white drop-shadow-md my-0.5">
                  {countdownFormatted}
                </div>

                {isSunday ? (
                  <span className="text-[9.5px] text-amber-300 font-mono font-black bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-full mt-0.5">
                    RETOMA 2ª FEIRA 00:00
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-300 font-mono font-extrabold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full mt-0.5">
                    {progressPercent}% CONCLUÍDO
                  </span>
                )}
              </div>
            </div>

            <p className={`text-[11px] text-center font-medium mt-1 ${isSunday ? 'text-amber-200' : 'text-sky-200'}`}>
              {isSunday 
                ? 'O relógio parou para o domingo de manutenção e dará sequência na segunda-feira!'
                : 'Ao término das 24h, o lucro do diamante é creditado automaticamente!'}
            </p>
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
        </div>
      ) : (
        /* User Has No VIP Diamond - Round Circular Clock in Standby Mode */
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md text-center space-y-4">
          {/* Circular Standby Clock Dial */}
          <div className="p-5 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white relative overflow-hidden shadow-xl flex flex-col items-center justify-center">
            <div className="flex items-center justify-between w-full mb-2 px-1">
              <span className="text-[11px] font-extrabold uppercase text-amber-300 flex items-center gap-1.5 font-mono">
                <Clock size={13} className="text-amber-400" />
                <span>Relógio Circular 24h</span>
              </span>
              <span className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                Aguardando Plano
              </span>
            </div>

            {/* Circular Gauge */}
            <div className="relative w-48 h-48 flex items-center justify-center my-2">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="78"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="78"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="490"
                  strokeDashoffset="420"
                  className="opacity-40"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                  CONTADOR 24H
                </span>
                <div className="text-2xl font-black font-mono tracking-widest text-slate-300 my-1">
                  --:--:--
                </div>
                <span className="text-[9.5px] text-amber-300 font-medium">
                  Ativação por Plano
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 text-center font-medium">
              O relógio começa a rodar assim que você adquirir um plano VIP.
            </p>
          </div>

          <div>
            <h3 className="text-base font-black text-slate-900">
              Inicie seu Ciclo Automático de 24 Horas
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto leading-relaxed">
              Adquira uma concessão diamantífera de Catoca. O lucro é depositado pontualmente a cada 24h direto na sua conta durante 120 dias!
            </p>
          </div>

          {/* Diamond Showcase Preview */}
          <div className="grid grid-cols-3 gap-2 my-2">
            {VIP_TIERS.slice(1, 4).map(v => (
              <div key={v.id} className="p-2 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="w-10 h-10 rounded-xl overflow-hidden mx-auto mb-1 border border-slate-200">
                  <img
                    src={v.cargoImage || v.diamondImage}
                    alt={v.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/images/catoca_diamond_gem_1792306524777.jpg';
                    }}
                  />
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

      {/* Simulator Switcher for Instant Sunday Mode Testing */}
      <div className="pt-2 pb-1 flex flex-col items-center justify-center space-y-1">
        <button
          type="button"
          onClick={toggleSimulateSunday}
          className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer ${
            simulateSunday 
              ? 'bg-amber-100 text-amber-900 border-amber-300 ring-1 ring-amber-300' 
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Clock size={12} className={simulateSunday ? 'text-amber-600' : 'text-slate-400'} />
          <span>Modo Domingo (Teste): <strong className={simulateSunday ? 'text-amber-700' : 'text-slate-700'}>{simulateSunday ? 'ATIVADO (Pausado)' : 'Desativado'}</strong></span>
        </button>
        <span className="text-[9.5px] text-slate-400">
          {simulateSunday ? 'Simulando domingo: o relógio está pausado e retomará na 2ª feira.' : 'Alternar para simular o comportamento de domingo em qualquer dia.'}
        </span>
      </div>
    </div>
  );
};
