import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Copy, Check, CreditCard, ShieldCheck, Zap, Gem } from 'lucide-react';
import confetti from 'canvas-confetti';

export const RechargeModal: React.FC = () => {
  const { closeModal, recharge, formatCurrency } = useApp();
  const [method, setMethod] = useState<'multicaixa' | 'pix' | 'usdt'>('multicaixa');
  const [selectedAmount, setSelectedAmount] = useState<number>(30000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const amounts = [10000, 30000, 80000, 200000, 500000];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleConfirmRecharge = async () => {
    if (finalAmount <= 0) return;
    setIsSubmitting(true);

    try {
      const res = await recharge(finalAmount, method);
      if (res.success) {
        setSuccessMsg(res.message);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0284c7', '#38bdf8', '#ffffff'],
        });
        setTimeout(() => {
          closeModal();
        }, 1500);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white border-t sm:border border-sky-200 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Gem size={16} />
            </div>
            <div>
              <h3 className="text-slate-900 font-black text-base">Alocar Capital Mineral Catoca</h3>
              <p className="text-[11px] text-sky-700 font-bold">Depósito instantâneo no Cofre</p>
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
            <h4 className="text-lg font-bold text-slate-900">Alocação Aprovada!</h4>
            <p className="text-sm text-slate-600">{successMsg}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Method selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-2 block">
                Canal de Alocação Bancária
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('multicaixa')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    method === 'multicaixa'
                      ? 'bg-sky-50 border-sky-500 text-slate-900 shadow-xs ring-1 ring-sky-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard size={18} className="mx-auto mb-1 text-sky-600" />
                  <p className="text-xs font-bold leading-none">Multicaixa</p>
                  <p className="text-[10px] text-slate-500 mt-1">Express AO</p>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('pix')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    method === 'pix'
                      ? 'bg-sky-50 border-sky-500 text-slate-900 shadow-xs ring-1 ring-sky-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base block mb-0.5">💠</span>
                  <p className="text-xs font-bold leading-none">PIX BR</p>
                  <p className="text-[10px] text-slate-500 mt-1">Instantâneo</p>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('usdt')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    method === 'usdt'
                      ? 'bg-sky-50 border-sky-500 text-slate-900 shadow-xs ring-1 ring-sky-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base block mb-0.5">₮</span>
                  <p className="text-xs font-bold leading-none">USDT</p>
                  <p className="text-[10px] text-slate-500 mt-1">TRC-20</p>
                </button>
              </div>
            </div>

            {/* Quick Amounts */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-2 block">
                Valor da Alocação
              </label>
              <div className="grid grid-cols-3 gap-2">
                {amounts.map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-black font-mono transition-all border ${
                      selectedAmount === amt && !customAmount
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {formatCurrency(amt)}
                  </button>
                ))}
              </div>

              <div className="mt-2.5">
                <input
                  type="number"
                  placeholder="Ou digite outro valor em Kz..."
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Payment Details Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Beneficiário:</span>
                <span className="font-bold text-slate-800">Sociedade Mineira de Catoca E.P.</span>
              </div>

              {method === 'multicaixa' && (
                <>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Entidade:</span>
                    <span className="font-mono font-bold text-slate-900">00104 (Catoca Pagamentos)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Referência:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sky-700">928 410 882</span>
                      <button
                        onClick={() => handleCopy('928410882')}
                        className="text-sky-600 font-bold hover:underline text-[10px]"
                      >
                        {copied ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {method === 'pix' && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Chave PIX CNPJ:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sky-700">41.982.441/0001-09</span>
                    <button
                      onClick={() => handleCopy('41982441000109')}
                      className="text-sky-600 font-bold hover:underline text-[10px]"
                    >
                      {copied ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>
              )}

              {method === 'usdt' && (
                <div className="text-xs space-y-1">
                  <span className="text-slate-500 block">Endereço TRC20:</span>
                  <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200">
                    <span className="font-mono text-[10px] text-slate-800 truncate">
                      TYq9cCatocaSaurimoMineralTr20X81
                    </span>
                    <button
                      onClick={() => handleCopy('TYq9cCatocaSaurimoMineralTr20X81')}
                      className="text-sky-600 font-bold text-[10px] shrink-0 ml-2"
                    >
                      {copied ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleConfirmRecharge}
              disabled={isSubmitting || finalAmount <= 0}
              className="w-full py-3 rounded-xl btn-diamond-primary text-xs font-bold shadow-sm active:scale-98 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Confirmando...' : `Confirmar Alocação de ${formatCurrency(finalAmount)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
