import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Gift, CheckCircle2, Sparkles, Gem, Calendar, Award, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Transaction } from '../types';

export const DailyRewardModal: React.FC = () => {
  const { closeModal, user, formatCurrency } = useApp();
  const [claiming, setClaiming] = useState(false);
  const [claimedToday, setClaimedToday] = useState(false);
  const [rewardMsg, setRewardMsg] = useState('');

  const days = [
    { day: 1, amount: 500, carats: 0.05, label: 'Dia 1' },
    { day: 2, amount: 750, carats: 0.08, label: 'Dia 2' },
    { day: 3, amount: 1000, carats: 0.12, label: 'Dia 3' },
    { day: 4, amount: 1500, carats: 0.18, label: 'Dia 4' },
    { day: 5, amount: 2000, carats: 0.25, label: 'Dia 5' },
    { day: 6, amount: 3000, carats: 0.35, label: 'Dia 6' },
    { day: 7, amount: 5000, carats: 0.50, label: 'Dia 7 💎' },
  ];

  // Determine current streak day based on user state or today's date
  const currentDayIndex = 0; // Today is day 1 or active streak

  const handleClaimBonus = async () => {
    if (!user || claiming || claimedToday) return;
    setClaiming(true);

    const bonusAmount = days[currentDayIndex].amount;
    const bonusCarats = days[currentDayIndex].carats;

    try {
      const userRef = doc(db, 'users', user.id);
      const newBalance = (user.balance || 0) + bonusAmount;
      const newTodayEarnings = (user.todayEarnings || 0) + bonusAmount;
      const newTotalEarnings = (user.totalEarnings || 0) + bonusAmount;
      const newCarats = Number(((user.totalCaratsExtracted || 0) + bonusCarats).toFixed(2));

      await updateDoc(userRef, {
        balance: newBalance,
        todayEarnings: newTodayEarnings,
        totalEarnings: newTotalEarnings,
        totalCaratsExtracted: newCarats,
      });

      const txId = `tx-bonus-${Date.now()}`;
      const bonusTx: Transaction = {
        id: txId,
        userId: user.id,
        type: 'task_reward',
        amount: bonusAmount,
        status: 'completed',
        date: new Date().toLocaleDateString('pt-BR'),
        timestamp: Date.now(),
        note: `Bónus de Presença Diária Catoca (+${bonusCarats} ct)`,
      };
      await setDoc(doc(db, 'transactions', txId), bonusTx);

      setClaimedToday(true);
      setRewardMsg(`Recebeu +${formatCurrency(bonusAmount)} e +${bonusCarats} ct de diamantes!`);

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0284c7', '#38bdf8', '#f59e0b', '#ffffff'],
      });
    } catch (err: any) {
      console.error('Erro ao reivindicar bónus:', err);
      setRewardMsg('Erro ao registrar no banco de dados. Tente novamente.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white border-t sm:border border-sky-200 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md">
              <Gift size={18} />
            </div>
            <div>
              <h3 className="text-slate-900 font-black text-base leading-tight">
                Bónus de Presença Diária
              </h3>
              <p className="text-[11px] text-amber-700 font-bold">
                Recompensas dos Operadores Catoca
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* Hero Card */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white relative overflow-hidden shadow-md mb-4">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none" />
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-100">
              <Sparkles size={14} />
              <span>Rotina de Lavra Ativa</span>
            </div>
            <h4 className="text-lg font-black text-white">Check-in de Concessão</h4>
            <p className="text-xs text-amber-100/90 leading-relaxed">
              Marque presença diariamente na Sociedade Mineira de Catoca para acumular Kz no cofre e fragmentos de quilates diamantíferos.
            </p>
          </div>
        </div>

        {/* 7-Day Streak Timeline */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-sky-600" />
              <span>Ciclo Semanal de Presença</span>
            </span>
            <span className="text-[11px] text-emerald-600 font-mono">Próxima meta: Dia 7 💎</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {days.slice(0, 4).map((d, i) => (
              <div
                key={d.day}
                className={`p-2.5 rounded-2xl border text-center transition-all ${
                  i === 0
                    ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-300 shadow-xs'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-500 block">{d.label}</span>
                <span className="text-xs font-black text-slate-900 block font-mono mt-0.5">
                  {formatCurrency(d.amount)}
                </span>
                <span className="text-[9px] text-sky-700 font-bold block mt-0.5">
                  +{d.carats} ct
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {days.slice(4).map((d) => (
              <div
                key={d.day}
                className={`p-2.5 rounded-2xl border text-center ${
                  d.day === 7
                    ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-400 ring-1 ring-amber-300 shadow-xs'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-500 block">{d.label}</span>
                <span className="text-xs font-black text-slate-900 block font-mono mt-0.5">
                  {formatCurrency(d.amount)}
                </span>
                <span className="text-[9px] text-amber-700 font-bold block mt-0.5">
                  +{d.carats} ct
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback / Claim Status */}
        {rewardMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 mb-4 animate-fadeIn">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>{rewardMsg}</span>
          </div>
        )}

        {/* Claim Action Button */}
        <button
          onClick={handleClaimBonus}
          disabled={claiming || claimedToday}
          className="w-full py-3.5 rounded-2xl btn-diamond-primary text-xs font-black shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-60"
        >
          {claiming ? (
            <span>Creditando no Cofre...</span>
          ) : claimedToday ? (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} />
              <span>Presença Registrada Hoje!</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Award size={16} />
              <span>Marcar Presença e Coletar Bónus ({formatCurrency(days[0].amount)})</span>
            </span>
          )}
        </button>

        {/* Extra Mining Missions Info */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-bold text-slate-600">Missões Adicionais da Mina:</p>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-[10px]">
                1
              </div>
              <span className="text-slate-800 font-semibold">Ativar Concessão VIP de 120 dias</span>
            </div>
            <span className="text-[10px] font-black text-emerald-600 font-mono">+120 dias de lucro</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-[10px]">
                2
              </div>
              <span className="text-slate-800 font-semibold">Convidar operadores para a equipe</span>
            </div>
            <span className="text-[10px] font-black text-emerald-600 font-mono">10% comissão</span>
          </div>
        </div>
      </div>
    </div>
  );
};
