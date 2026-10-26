import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VIP_DAILY_PRESENCE_BONUS, VIP_TIERS } from '../data/mockData';
import { X, Gift, CheckCircle2, Sparkles, Gem, Award, Crown, ArrowRight, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DailyRewardModal: React.FC = () => {
  const { closeModal, user, formatCurrency, claimDailyPresenceReward, navigateTo } = useApp();
  const [claiming, setClaiming] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const currentVipLevel = user?.vipLevel ?? 0;
  const userBonusAmount = VIP_DAILY_PRESENCE_BONUS[currentVipLevel] ?? 2;
  const todayStr = new Date().toISOString().split('T')[0];
  const alreadyClaimed = user?.lastDailyRewardDate === todayStr;

  const vipBonusList = [
    { level: 1, name: 'VIP 1', bonus: 5, title: 'Ajudante de Mina' },
    { level: 2, name: 'VIP 2', bonus: 10, title: 'Auxiliar de Armazém' },
    { level: 3, name: 'VIP 3', bonus: 15, title: 'Operador de Equipamentos' },
    { level: 4, name: 'VIP 4', bonus: 20, title: 'Motorista de Mina' },
    { level: 5, name: 'VIP 5', bonus: 25, title: 'Técnico de Electricidade' },
    { level: 6, name: 'VIP 6', bonus: 30, title: 'Técnico de Mecânica' },
    { level: 7, name: 'VIP 7', bonus: 35, title: 'Técnico de Segurança' },
    { level: 8, name: 'VIP 8', bonus: 40, title: 'Técnico de Topografia' },
    { level: 9, name: 'VIP 9', bonus: 50, title: 'Técnico de Geologia' },
    { level: 10, name: 'VIP 10', bonus: 55, title: 'Técnico de Laboratório' },
    { level: 11, name: 'VIP 11', bonus: 60, title: 'Técnico de Processamento' },
    { level: 12, name: 'VIP 12', bonus: 65, title: 'Supervisor de Operações' },
    { level: 13, name: 'VIP 13', bonus: 70, title: 'Engenheiro de Minas' },
    { level: 14, name: 'VIP 14', bonus: 75, title: 'Chefe de Departamento' },
    { level: 15, name: 'VIP 15', bonus: 80, title: 'Director de Operações' },
  ];

  const handleClaim = async () => {
    if (claiming || alreadyClaimed) return;
    setClaiming(true);
    setFeedback(null);

    try {
      const res = await claimDailyPresenceReward();
      setFeedback(res);

      if (res.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0284c7', '#38bdf8', '#f59e0b', '#ffffff'],
        });
      }
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white border-t sm:border border-sky-200 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md">
              <Gift size={18} />
            </div>
            <div>
              <h3 className="text-slate-900 font-black text-base leading-tight">
                Bónus de Presença Diária
              </h3>
              <p className="text-[11px] text-amber-700 font-bold">
                Check-in de Concessão por Nível VIP
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* Current VIP User Badge */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white relative overflow-hidden shadow-md mb-4">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-sky-500/20 rounded-full pointer-events-none" />

          <div className="flex items-center justify-between relative z-10 mb-2">
            <span className="text-[10px] font-mono uppercase text-sky-300 font-bold flex items-center gap-1">
              <Crown size={12} className="text-amber-400" />
              <span>Seu Cargo Concessionário</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase bg-sky-500/30 text-sky-200 border border-sky-400/40 font-mono">
              {currentVipLevel > 0 ? `VIP ${currentVipLevel}` : 'Estagiário'}
            </span>
          </div>

          <div className="flex items-end justify-between relative z-10">
            <div>
              <span className="text-xs text-slate-300 block">Seu Bónus de Presença Hoje:</span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                +{formatCurrency(userBonusAmount)}
              </span>
            </div>
            {alreadyClaimed ? (
              <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-xl flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>Confirmado Hoje</span>
              </span>
            ) : (
              <span className="text-[11px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2.5 py-1 rounded-xl flex items-center gap-1">
                <Clock size={13} />
                <span>Pronto p/ Resgatar</span>
              </span>
            )}
          </div>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 mb-4 animate-fadeIn ${
              feedback.success
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-amber-50 border-amber-300 text-amber-800'
            }`}
          >
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Claim Action Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleClaim}
            disabled={claiming || alreadyClaimed}
            className="w-full py-3.5 rounded-2xl btn-diamond-primary text-xs font-black shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-60 cursor-pointer"
          >
            {claiming ? (
              <span>Creditando no Cofre...</span>
            ) : alreadyClaimed ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                <span>Presença Já Registrada Hoje!</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Award size={16} />
                <span>Marcar Presença e Receber {formatCurrency(userBonusAmount)}</span>
              </span>
            )}
          </button>
          {alreadyClaimed && (
            <p className="text-[10.5px] text-center text-slate-400 mt-1.5">
              O próximo check-in diário será liberado amanhã às 00:00.
            </p>
          )}
        </div>

        {/* VIP Presence Bonus Escalation Table */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              <span>Tabela Oficial de Bónus por Nível VIP:</span>
            </span>
            <button
              type="button"
              onClick={() => {
                closeModal();
                navigateTo('/pages/vip/index');
              }}
              className="text-[11px] text-sky-600 hover:underline flex items-center gap-0.5"
            >
              <span>Subir de VIP</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-200">
            {vipBonusList.map((item) => {
              const isUserLevel = currentVipLevel === item.level;
              return (
                <div
                  key={item.level}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    isUserLevel
                      ? 'bg-gradient-to-b from-sky-50 to-white border-sky-400 ring-2 ring-sky-300 shadow-xs'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-[11px] font-black text-slate-900">{item.name}</span>
                    {isUserLevel && <span className="text-[8px] bg-sky-500 text-white px-1 rounded font-bold">VOCÊ</span>}
                  </div>
                  <span className="text-xs font-black text-emerald-600 font-mono block mt-0.5">
                    +{item.bonus} Kz
                  </span>
                  <span className="text-[8.5px] text-slate-400 block truncate" title={item.title}>
                    {item.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notice */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
          <span>Quanto maior seu plano VIP, maior o bônus diário.</span>
          <button
            type="button"
            onClick={() => {
              closeModal();
              navigateTo('/pages/vip/index');
            }}
            className="text-sky-600 font-bold hover:underline shrink-0 ml-2"
          >
            Ver Planos VIP
          </button>
        </div>
      </div>
    </div>
  );
};
