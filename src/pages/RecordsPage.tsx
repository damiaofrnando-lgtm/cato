import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, ArrowUpCircle, ArrowDownCircle, CheckCircle, ClipboardCheck, Gift, Gem } from 'lucide-react';

export const RecordsPage: React.FC = () => {
  const { transactions, formatCurrency } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'recharge' | 'withdraw' | 'tasks'>('all');

  const filtered = transactions.filter(tx => {
    if (activeTab === 'recharge') return tx.type === 'recharge';
    if (activeTab === 'withdraw') return tx.type === 'withdraw';
    if (activeTab === 'tasks') return tx.type === 'task_reward';
    return true;
  });

  return (
    <div className="pb-28 pt-2 px-4 space-y-4 max-w-md mx-auto">
      {/* Header Card */}
      <div className="diamond-crystal-card p-5 rounded-3xl border border-sky-100 shadow-md relative overflow-hidden bg-white space-y-2">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-sky-100/50 diamond-shape opacity-40 pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <FileText size={22} />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Extrato Mineral Catoca</h2>
            <p className="text-xs text-slate-600">Histórico de lotes 24h, alocações e retiradas Multicaixa</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
        {(['all', 'recharge', 'withdraw', 'tasks'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === tab
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab === 'all' ? 'Tudo' : tab === 'recharge' ? 'Alocações' : tab === 'withdraw' ? 'Saques' : 'Extração'}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl text-center text-slate-500 text-xs border border-slate-200 shadow-xs">
            Nenhum registro encontrado nesta categoria mineral.
          </div>
        ) : (
          filtered.map(tx => {
            const isPositive = tx.amount > 0;
            return (
              <div
                key={tx.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      tx.type === 'recharge'
                        ? 'bg-sky-50 text-sky-700'
                        : tx.type === 'withdraw'
                        ? 'bg-blue-50 text-blue-700'
                        : tx.type === 'task_reward'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {tx.type === 'recharge' ? (
                      <ArrowUpCircle size={18} />
                    ) : tx.type === 'withdraw' ? (
                      <ArrowDownCircle size={18} />
                    ) : tx.type === 'task_reward' ? (
                      <Gem size={18} />
                    ) : (
                      <Gift size={18} />
                    )}
                  </div>

                  <div>
                    <p className="font-bold text-slate-900 text-xs leading-snug">{tx.note}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{tx.date}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-black text-xs font-mono ${
                      isPositive ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {isPositive ? `+${formatCurrency(tx.amount)}` : formatCurrency(tx.amount)}
                  </span>
                  <div className="flex items-center gap-1 justify-end text-[10px] text-emerald-600 mt-0.5 font-bold">
                    <CheckCircle size={10} />
                    <span>Confirmado</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
