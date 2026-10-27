import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, ArrowDownCircle, CheckCircle, AlertCircle, Gem } from 'lucide-react';

export const WithdrawModal: React.FC = () => {
  const { closeModal, openModal, withdraw, user, formatCurrency } = useApp();
  const [accountType, setAccountType] = useState<'multicaixa' | 'pix' | 'usdt'>('multicaixa');
  const [accountName, setAccountName] = useState<string>(user?.bankAccount?.accountName || '');
  const [accountNumber, setAccountNumber] = useState<string>(user?.bankAccount?.accountNumber || '');
  const [amountStr, setAmountStr] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const amount = parseFloat(amountStr) || 0;
  const fee = Math.round(amount * 0.05);
  const netAmount = Math.max(0, amount - fee);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (amount < 1000) {
      setError('O valor mínimo de saque é de 1.000 Kz.');
      return;
    }

    if (!user || amount > user.balance) {
      setError('Saldo insuficiente no cofre.');
      return;
    }

    if (!accountName.trim() || !accountNumber.trim()) {
      setError('Preencha ou vincule os dados da conta bancária de destino.');
      return;
    }

    if (!user?.payPasswordSet) {
      setError('Você precisa definir sua Senha de Pagamento antes de solicitar o saque. Clique em "Definir Senha".');
      return;
    }

    if (!pin.trim()) {
      setError('Digite a senha de pagamento verdadeira da sua conta.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await withdraw(amount, accountType, accountNumber, accountName, pin);
      if (res?.success) {
        setSuccess(true);
        setTimeout(() => {
          closeModal();
        }, 1800);
      } else {
        setError(res?.message || 'Erro ao processar saque.');
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
              <ArrowDownCircle size={16} />
            </div>
            <div>
              <h3 className="text-slate-900 font-black text-base">Solicitar Saque de Rendimentos</h3>
              <p className="text-[11px] text-sky-700 font-bold">Liquidação Multicaixa Express em até 15 minutos</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
          >
            <X size={17} />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-300">
              <CheckCircle size={36} />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Saque Solicitado com Sucesso!</h4>
            <p className="text-sm text-slate-600">
              O montante de {formatCurrency(netAmount)} foi enviado para sua conta bancária.
            </p>
          </div>
        ) : (
          <form onSubmit={handleWithdraw} className="space-y-4">
            {/* Balance info */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-[11px] text-slate-500 block">Saldo em Cofre</span>
                <span className="text-base font-black text-slate-900 font-mono">
                  {formatCurrency(user?.balance || 0)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAmountStr(user?.balance.toString() || '0')}
                className="text-xs text-sky-600 font-bold hover:underline"
              >
                Sacar Tudo
              </button>
            </div>

            {/* Account Type */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                Canal de Recebimento
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType('multicaixa')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    accountType === 'multicaixa'
                      ? 'bg-sky-50 border-sky-500 text-slate-900 ring-1 ring-sky-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Multicaixa AO
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('pix')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    accountType === 'pix'
                      ? 'bg-sky-50 border-sky-500 text-slate-900 ring-1 ring-sky-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  PIX BR
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('usdt')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    accountType === 'usdt'
                      ? 'bg-sky-50 border-sky-500 text-slate-900 ring-1 ring-sky-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  USDT TRC20
                </button>
              </div>
            </div>

            {/* Account details */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Titular da Conta Bancária
                </label>
                <button
                  type="button"
                  onClick={() => openModal('bind_iban')}
                  className="text-[11px] font-bold text-sky-600 hover:underline cursor-pointer"
                >
                  {user?.bankAccount ? 'Alterar IBAN' : '+ Vincular IBAN'}
                </button>
              </div>
              <input
                type="text"
                required
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
                placeholder="Nome completo do titular"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-sky-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">
                {accountType === 'multicaixa' ? 'IBAN Angolano (AO06...)' : accountType === 'pix' ? 'Chave PIX (CPF/Telefone/Email)' : 'Endereço TRC-20'}
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                placeholder={accountType === 'multicaixa' ? '000600005833872230121 ou 933191188' : 'Chave de destino'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-sky-500 font-bold"
              />
            </div>

            {/* Amount input */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">
                Valor do Saque (Mínimo: 1.000 Kz)
              </label>
              <input
                type="number"
                required
                value={amountStr}
                onChange={e => setAmountStr(e.target.value)}
                placeholder="Digite o valor..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-sky-500 font-bold"
              />

              {amount > 0 && (
                <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Taxa de processamento interbancário (5%):</span>
                    <span className="font-mono text-slate-700">{formatCurrency(fee)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Valor líquido a receber:</span>
                    <span className="font-mono text-emerald-600">{formatCurrency(netAmount)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* PIN / Senha de Pagamento */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Senha de Pagamento / PIN de Segurança
                </label>
                <button
                  type="button"
                  onClick={() => openModal('payment_password')}
                  className="text-[11px] font-bold text-sky-600 hover:underline cursor-pointer"
                >
                  {user?.payPasswordSet ? 'Alterar Senha' : 'Definir Senha'}
                </button>
              </div>
              <input
                type="password"
                maxLength={6}
                required
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="Digite sua senha de pagamento (4 a 6 dígitos)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono tracking-widest focus:outline-hidden focus:border-sky-500 font-bold"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || amount <= 0}
              className="w-full py-3 rounded-xl btn-diamond-primary text-xs font-bold shadow-sm active:scale-98 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Processando Saque...' : 'Confirmar Solicitação de Saque'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
