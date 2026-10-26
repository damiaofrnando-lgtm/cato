import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, CreditCard, CheckCircle2, AlertCircle, Building2, ShieldCheck, Check } from 'lucide-react';

const ANGOLAN_BANKS = [
  { id: 'bfa', name: 'BFA (Banco de Fomento Angola)', code: '0006' },
  { id: 'bai', name: 'BAI (Banco Angolano de Investimentos)', code: '0040' },
  { id: 'bma', name: 'Banco Millennium Atlântico', code: '0055' },
  { id: 'bic', name: 'Banco BIC Angola', code: '0051' },
  { id: 'bci', name: 'BCI (Comércio e Indústria)', code: '0005' },
  { id: 'bcga', name: 'Banco Caixa Geral Angola', code: '0044' },
  { id: 'express', name: 'Multicaixa Express (Número Móvel)', code: 'MCX' },
];

export const BindIbanModal: React.FC = () => {
  const { closeModal, user, bindBankAccount } = useApp();
  
  const [bankName, setBankName] = useState<string>(user?.bankAccount?.bankName || ANGOLAN_BANKS[0].name);
  const [accountName, setAccountName] = useState<string>(user?.bankAccount?.accountName || '');
  const [accountNumber, setAccountNumber] = useState<string>(user?.bankAccount?.accountNumber || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!accountName.trim()) {
      setError('Por favor, informe o nome completo do titular da conta.');
      return;
    }

    if (!accountNumber.trim()) {
      setError('Por favor, informe o número do IBAN ou do Multicaixa Express.');
      return;
    }

    setLoading(true);
    try {
      const res = await bindBankAccount(bankName, accountName.trim(), accountNumber.trim());
      if (res.success) {
        setSuccess(res.message);
        setTimeout(() => {
          closeModal();
        }, 1600);
      } else {
        setError(res.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white border-t sm:border border-sky-200 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <CreditCard size={18} />
            </div>
            <div>
              <h3 className="text-slate-900 font-black text-base leading-tight">
                Vincular IBAN de Pagamento
              </h3>
              <p className="text-[11px] text-sky-700 font-bold">
                Recebimento Oficial de Saques Catoca
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

        {/* Informational notice */}
        <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200/80 mb-4 flex items-start gap-2.5">
          <ShieldCheck size={18} className="text-sky-700 shrink-0 mt-0.5" />
          <p className="text-xs text-sky-900 leading-relaxed">
            Cadastre os dados da sua conta bancária angolana (BFA, BAI, etc.) ou Multicaixa Express. Os saques de rendimentos serão transferidos para esta conta.
          </p>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-300">
              <CheckCircle2 size={36} />
            </div>
            <h4 className="text-base font-black text-slate-900">IBAN Vinculado com Sucesso!</h4>
            <p className="text-xs text-slate-600">
              {success}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Bank Select */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                Instituição Bancária / Método:
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              >
                {ANGOLAN_BANKS.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                Nome Completo do Titular:
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Justino Fernando da Silva"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>

            {/* IBAN / Account Number */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                Número do IBAN ou Multicaixa Express:
              </label>
              <input
                type="text"
                required
                placeholder="Ex: 000600005833872230121 ou 933191188"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono font-bold"
              />
              <p className="text-[10.5px] text-slate-400 mt-1">
                Formato com 21 dígitos (IBAN bancário) ou 9 dígitos (Express).
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl btn-diamond-primary text-xs font-black shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
              >
                <Check size={16} />
                <span>{loading ? 'Salvando no Firestore...' : 'Confirmar e Vincular IBAN'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
