import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, CheckCircle2, AlertCircle, ShieldCheck, Eye, EyeOff, KeyRound } from 'lucide-react';

export const PaymentPasswordModal: React.FC = () => {
  const { closeModal, user, setPaymentPassword } = useApp();
  
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const isAlreadySet = !!user?.payPasswordSet;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 4 || password.length > 6) {
      setError('A senha de pagamento deve conter entre 4 e 6 dígitos numéricos.');
      return;
    }

    if (!/^\d+$/.test(password)) {
      setError('A senha deve conter exclusivamente números (ex: 123456).');
      return;
    }

    if (password !== confirmPassword) {
      setError('A confirmação da senha não confere com a senha digitada.');
      return;
    }

    setLoading(true);
    try {
      const res = await setPaymentPassword(password);
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
              <KeyRound size={18} />
            </div>
            <div>
              <h3 className="text-slate-900 font-black text-base leading-tight">
                {isAlreadySet ? 'Alterar Senha de Pagamento' : 'Definir Senha de Pagamento'}
              </h3>
              <p className="text-[11px] text-sky-700 font-bold">
                Segurança de Saques e Resgates Catoca
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
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 mb-4 flex items-start gap-2.5">
          <ShieldCheck size={18} className="text-amber-700 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 leading-relaxed">
            Esta senha de 4 a 6 dígitos numéricos será solicitada para confirmar qualquer retirada do seu saldo de diamantes. Não a compartilhe com terceiros.
          </p>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-300">
              <CheckCircle2 size={36} />
            </div>
            <h4 className="text-base font-black text-slate-900">Senha Configurada com Sucesso!</h4>
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

            {/* Password input */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                Nova Senha de Pagamento (4 a 6 dígitos numéricos):
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={6}
                  required
                  placeholder="Ex: 123456"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-sm tracking-widest font-mono font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                Confirmar Senha de Pagamento:
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={6}
                required
                placeholder="Repita a mesma senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm tracking-widest font-mono font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl btn-diamond-primary text-xs font-black shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
              >
                <Lock size={15} />
                <span>{loading ? 'Salvando Senha...' : 'Salvar Senha de Pagamento'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
