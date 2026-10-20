import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FUND_PLANS } from '../data/mockData';
import { X, TrendingUp, ShieldCheck, Gem } from 'lucide-react';

export const WealthFundModal: React.FC = () => {
  const { closeModal, investInFund, formatCurrency, user } = useApp();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(FUND_PLANS[0].id);
  const [amountStr, setAmountStr] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const selectedPlan = FUND_PLANS.find(p => p.id === selectedPlanId) || FUND_PLANS[0];
  const amount = parseFloat(amountStr) || 0;
  const estimatedProfit = Math.round(amount * (selectedPlan.totalReturnsPercent / 100));

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (amount < selectedPlan.minAmount) {
      setErrorMsg(`O valor mínimo para este fundo é de ${formatCurrency(selectedPlan.minAmount)}`);
      return;
    }

    if (!user || amount > user.balance) {
      setErrorMsg('Saldo insuficiente no cofre. Por favor, faça uma alocação.');
      return;
    }

    const res = await investInFund(selectedPlan.id, amount);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        closeModal();
      }, 1600);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white border-t sm:border border-sky-200 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <TrendingUp size={16} />
            </div>
            <div>
              <h3 className="text-slate-900 font-black text-base">Fundo de Kimberlito Catoca</h3>
              <p className="text-[11px] text-sky-700 font-bold">Rendimento mineral composto com carats extras</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
          >
            <X size={17} />
          </button>
        </div>

        {successMsg ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-300">
              <ShieldCheck size={36} />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Alocação Confirmada!</h4>
            <p className="text-sm text-slate-600">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleInvest} className="space-y-4">
            <p className="text-xs text-slate-600">
              Alavanque sua cota mineral Catoca em contratos de produção com rendimento diário e prazo fixo.
            </p>

            <div className="space-y-2">
              {FUND_PLANS.map(plan => {
                const isSelected = plan.id === selectedPlanId;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-50 border-sky-500 shadow-xs ring-1 ring-sky-400'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-xs text-slate-900">{plan.title}</h4>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-100 text-sky-800">
                            {plan.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Prazo: <span className="font-bold text-slate-700">{plan.durationDays} dias</span> · Diário: <span className="font-bold text-emerald-600">+{plan.dailyYieldPercent}%</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-600 font-mono">
                          +{plan.totalReturnsPercent}%
                        </span>
                        <span className="text-[10px] text-sky-700 block font-bold font-mono">
                          {plan.caratYield}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">
                Valor da Alocação (Mín: {formatCurrency(selectedPlan.minAmount)})
              </label>
              <input
                type="number"
                required
                value={amountStr}
                onChange={e => setAmountStr(e.target.value)}
                placeholder="Digite o valor..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-500"
              />

              {amount > 0 && (
                <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Retorno mineral estimado ({selectedPlan.totalReturnsPercent}%):</span>
                    <span className="font-mono font-bold text-emerald-600">+{formatCurrency(estimatedProfit)}</span>
                  </div>
                  <div className="flex justify-between text-slate-800 font-bold">
                    <span>Montante final projetado:</span>
                    <span className="font-mono text-slate-900">{formatCurrency(amount + estimatedProfit)}</span>
                  </div>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={amount <= 0}
              className="w-full py-3 rounded-xl btn-diamond-primary text-xs font-bold shadow-sm active:scale-98 transition-all disabled:opacity-50"
            >
              Confirmar Alocação no Fundo
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
