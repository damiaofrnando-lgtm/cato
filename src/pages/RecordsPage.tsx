import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, ArrowUpCircle, ArrowDownCircle, CheckCircle, ClipboardCheck, Gift, Gem, Image as ImageIcon, X } from 'lucide-react';
import { Transaction } from '../types';

export const RecordsPage: React.FC = () => {
  const { transactions, formatCurrency } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'recharge' | 'withdraw' | 'tasks'>('all');
  const [selectedProofTx, setSelectedProofTx] = useState<Transaction | null>(null);

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
            <p className="text-xs text-slate-600">Histórico de lotes 24h, depósitos com comprovativo e retiradas</p>
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
            {tab === 'all' ? 'Tudo' : tab === 'recharge' ? 'Depósitos' : tab === 'withdraw' ? 'Saques' : 'Extração'}
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
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
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

                  <div className="text-right shrink-0">
                    <span
                      className={`font-black text-xs font-mono block ${
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

                {/* Comprovativo attached badge / button */}
                {tx.proofUrl && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10.5px] text-slate-500 flex items-center gap-1">
                      <ImageIcon size={12} className="text-sky-600" />
                      <span>Comprovativo de pagamento anexado</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedProofTx(tx)}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-[10.5px] font-bold transition-colors"
                    >
                      Ver Comprovativo
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Comprovativo Preview Modal */}
      {selectedProofTx && selectedProofTx.proofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-xs font-black text-slate-900">Comprovativo de Depósito</h4>
                <p className="text-[10px] text-slate-500">{selectedProofTx.note}</p>
              </div>
              <button
                onClick={() => setSelectedProofTx(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900"
              >
                <X size={15} />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-96 flex items-center justify-center">
              <img
                src={selectedProofTx.proofUrl}
                alt="Comprovativo"
                className="w-full h-auto max-h-96 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Valor:</span>
                <span className="font-bold text-emerald-600">
                  {formatCurrency(selectedProofTx.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Data:</span>
                <span className="font-bold">{selectedProofTx.date}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedProofTx(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Fechar Visualizador
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
