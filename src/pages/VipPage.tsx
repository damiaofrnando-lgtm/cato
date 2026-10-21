import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VIP_TIERS } from '../data/mockData';
import { Sparkles, Check, ShieldCheck, Zap, AlertCircle, Gem, ArrowRight, Clock, Award, Calendar, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const VipPage: React.FC = () => {
  const { user, upgradeVip, openModal, formatCurrency, countdownFormatted, navigateTo } = useApp();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmTier, setConfirmTier] = useState<typeof VIP_TIERS[0] | null>(null);

  const currentLevel = user?.vipLevel ?? 0;
  const activeTier = VIP_TIERS.find(t => t.id === currentLevel);

  const handlePurchase = async (tier: typeof VIP_TIERS[0]) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!user || user.balance < tier.price) {
      setErrorMsg(`Saldo insuficiente no cofre (${formatCurrency(user?.balance || 0)}). Necessário ${formatCurrency(tier.price)} para comprar o diamante ${tier.name} (${tier.title}).`);
      setTimeout(() => {
        openModal('recharge');
      }, 1600);
      return;
    }

    const res = await upgradeVip(tier.id);
    if (res.success) {
      setSuccessMsg(res.message);
      setConfirmTier(null);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#0284c7', '#38bdf8', '#ffffff', '#e0f2fe', '#60a5fa'],
      });
      setTimeout(() => setSuccessMsg(''), 5000);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="pb-28 pt-2 px-4 space-y-4 max-w-md mx-auto">
      {/* Concessions Header - White Diamond Faceted */}
      <div className="diamond-crystal-card p-5 rounded-3xl border border-sky-100 shadow-md relative overflow-hidden bg-white">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-sky-100/60 diamond-shape opacity-40 pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Gem size={24} />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Planos de Diamantes & Cargos</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Adquira um diamante: o relógio de 24h gera lucro automático por 120 dias
            </p>
          </div>
        </div>

        {/* Active Diamond Status Box */}
        {activeTier && activeTier.id > 0 ? (
          <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border border-sky-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-sky-400 shadow-sm shrink-0 bg-white">
                <img
                  src={activeTier.diamondImage}
                  alt={activeTier.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-sky-700 block">SEU DIAMANTE ATIVO</span>
                <span className="text-sm font-black text-slate-900 block">{activeTier.name} · {activeTier.title}</span>
                <span className="text-xs font-bold text-emerald-600 font-mono">+{formatCurrency(activeTier.dailyIncome)}/dia</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block font-mono">PRÓXIMO LUCRO EM</span>
              <span className="text-xs font-black text-sky-700 font-mono flex items-center gap-1 justify-end">
                <Clock size={12} className="animate-spin text-sky-500" />
                <span>{countdownFormatted}</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Clock size={16} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-800 block">RELÓGIO AGUARDANDO PLANO</span>
                <p className="text-[11px] text-slate-600">O relógio só começa a contar 24h após você comprar um plano.</p>
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-300 font-mono font-bold text-xs shrink-0">
              --:--:--
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold text-center">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Information Banner: Automatic Profit 24h & 120 Days */}
      <div className="p-3 rounded-2xl bg-sky-50/80 border border-sky-200/60 flex items-start gap-2.5 text-xs text-slate-700">
        <Sparkles size={16} className="text-sky-600 shrink-0 mt-0.5" />
        <div className="text-[11.5px] leading-relaxed">
          <span className="font-black text-slate-900">Lucro 100% Automático: </span>
          Após comprar um diamante, o relógio regressivo de 24h é iniciado. Não precisa coletar manualmente: o lucro diário cai direto na sua conta durante <span className="font-bold text-sky-800">120 dias consecutivos</span>.
        </div>
      </div>

      {/* 15 VIP Diamond Plans List */}
      <div className="space-y-4">
        {VIP_TIERS.filter(tier => tier.id > 0).map(tier => {
          const isCurrent = currentLevel === tier.id;

          return (
            <div
              key={tier.id}
              className={`p-4 rounded-3xl border relative overflow-hidden transition-all shadow-xs ${
                isCurrent
                  ? 'bg-gradient-to-br from-sky-50 via-white to-blue-50 border-sky-400 ring-2 ring-sky-300/60 shadow-md'
                  : 'bg-white border-slate-200 hover:border-sky-300 hover:shadow-sm'
              }`}
            >
              {tier.isPopular && !isCurrent && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-sky-600 to-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-xs">
                  Alta Demanda Saurimo
                </div>
              )}

              {/* Top Row: Cargo Photograph + Diamond Cut Badge + Title + Price */}
              <div className="flex gap-3.5 items-start">
                {/* Cargo Photograph */}
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-sky-100 shadow-sm shrink-0 bg-slate-900 group">
                  <img
                    src={tier.cargoImage || tier.diamondImage}
                    alt={tier.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/images/catoca_miner_helper_1792584628027.jpg';
                    }}
                  />
                  <div className="absolute top-1 left-1 w-6 h-6 rounded-lg overflow-hidden border border-white/60 shadow-xs bg-black/40">
                    <img
                      src={tier.diamondImage}
                      alt={tier.diamondCut}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 backdrop-blur-xs text-[9px] font-black text-white text-center py-0.5 font-mono">
                    {tier.name}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 font-mono">
                      {tier.name}
                    </span>
                    <span className="text-xs font-black text-slate-900 truncate">
                      {tier.title}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 font-medium mt-0.5 line-clamp-2">
                    {tier.cargoDescription || tier.diamondCut}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-sky-700 font-semibold mt-1">
                    <span>💎 {tier.diamondCut}</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Alocação:</span>
                    <span className="text-sm font-black text-slate-900 font-mono">
                      {formatCurrency(tier.price)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown Table - 3 Columns */}
              <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-center">
                <div className="p-1.5 bg-white rounded-xl border border-slate-100">
                  <span className="text-slate-500 block text-[9.5px]">Ganho Diário:</span>
                  <span className="font-black text-emerald-600 font-mono text-xs block mt-0.5">
                    +{formatCurrency(tier.dailyIncome)}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">Automático 24h</span>
                </div>

                <div className="p-1.5 bg-white rounded-xl border border-slate-100">
                  <span className="text-slate-500 block text-[9.5px]">Duração:</span>
                  <span className="font-extrabold text-slate-800 text-xs block mt-0.5">
                    120 Dias
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">Contrato Ativo</span>
                </div>

                <div className="p-1.5 bg-white rounded-xl border border-slate-100">
                  <span className="text-slate-500 block text-[9.5px]">Total 120 Dias:</span>
                  <span className="font-black text-sky-700 font-mono text-xs block mt-0.5">
                    {formatCurrency(tier.total120Days)}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">Retorno Global</span>
                </div>
              </div>

              {/* Action Bottom Bar */}
              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                  <Award size={13} className="text-sky-600" />
                  <span>Capacidade: <strong className="text-slate-800">{tier.caratCapacity}</strong></span>
                </div>

                {isCurrent ? (
                  <span className="px-3.5 py-1.5 rounded-xl bg-sky-100 text-sky-800 text-xs font-bold flex items-center gap-1">
                    <Check size={14} />
                    <span>Diamante Ativo</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handlePurchase(tier)}
                    className="px-4 py-2 rounded-xl btn-diamond-primary text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <span>Comprar Diamante</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
