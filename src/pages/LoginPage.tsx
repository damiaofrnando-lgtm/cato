import React, { useState } from 'react';
import { useApp, ADMIN_UID } from '../context/AppContext';
import { COUNTRY_CODES } from '../data/mockData';
import { Eye, EyeOff, Globe, Phone, Mail, Lock, AlertCircle, Sparkles, Gem } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, demoLogin, navigateTo, openModal, t } = useApp();

  const [loginMode, setLoginMode] = useState<'phone' | 'email'>('phone');
  const [phoneCode, setPhoneCode] = useState('+244');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const identifier = loginMode === 'email' ? email.trim() : phone.trim();

    if (loginMode === 'email') {
      if (!identifier || (!identifier.includes('@') && identifier !== ADMIN_UID)) {
        setError('Por favor, informe um endereço de e-mail válido');
        return;
      }
    } else {
      if (!identifier) {
        setError(t.register.phoneRequired);
        return;
      }
    }

    if (!password.trim()) {
      setError(t.register.passwordRequired);
      return;
    }

    setLoading(true);
    try {
      const res = await login(identifier, phoneCode, password);
      if (res?.success) {
        // successfully logged in
      } else {
        setError(res?.message || t.login.invalidCredentials);
      }
    } catch (err: any) {
      console.error('Falha no login:', err);
      setError(err?.message || 'Erro ao conectar ao banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCountry = COUNTRY_CODES.find(c => c.code === phoneCode) || COUNTRY_CODES[0];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-start relative max-w-md mx-auto">
      {/* Top Banner - Catoca Diamonds */}
      <div className="relative h-64 w-full overflow-hidden bg-slate-900">
        <img
          src="/assets/aistudio/IMG_1491_c7e2abb2.jpeg"
          alt="Catoca Diamantes - Lavra a Céu Aberto"
          className="w-full h-full object-cover opacity-90 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-900/50 to-slate-950/90" />

        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => openModal('language')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs text-white hover:bg-white/30 transition-all active:scale-95 shadow-sm"
          >
            <Globe size={13} className="text-sky-300" />
            <span className="font-semibold uppercase text-[10.5px]">{t.currency === 'Kz' ? 'PT' : 'EN'}</span>
          </button>
        </div>

        {/* Branding Badge with Official Catoca Logo */}
        <div className="absolute bottom-6 left-6 z-20 flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white border-2 border-white/80 p-1 flex items-center justify-center shadow-xl shadow-sky-950/50 overflow-hidden shrink-0">
            <img
              src="/assets/aistudio/IMG_1487_83d7197c.jpeg"
              alt="Catoca Logo Oficial"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-tight leading-none">
                CATOCA
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-sky-500 text-white">
                MINA DE DIAMANTES
              </span>
            </div>
            <p className="text-xs text-sky-200 font-medium mt-1">
              {t.slogan}
            </p>
          </div>
        </div>
      </div>

      {/* Main Curved Login Container - White Diamond */}
      <div className="flex-1 bg-white px-6 pt-6 pb-12 rounded-t-[32px] -mt-5 relative z-20 border-t border-sky-100 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-1.5">
              <span>{t.login.title}</span>
              <span className="text-sky-600">💎</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Acesse sua concessão, lotes de 24h e cofres de rendimento
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Login Type Selector Pills */}
          <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setLoginMode('phone');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === 'phone'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Phone size={14} className={loginMode === 'phone' ? 'text-sky-600' : ''} />
              <span>Telefone Móvel</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('email');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === 'email'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Mail size={14} className={loginMode === 'email' ? 'text-sky-600' : ''} />
              <span>E-mail</span>
            </button>
          </div>

          {loginMode === 'phone' ? (
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                {t.login.phone}
              </label>
              <div className="h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center px-3.5 gap-2.5 focus-within:border-sky-500 focus-within:bg-white transition-all shadow-xs">
                <Phone size={16} className="text-sky-600 shrink-0" />

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryPicker(!showCountryPicker)}
                    className="flex items-center gap-1 text-xs text-slate-800 font-bold py-1 px-1.5 rounded-lg hover:bg-slate-200/60"
                  >
                    <span>{selectedCountry.flag}</span>
                    <span className="font-semibold">{phoneCode}</span>
                  </button>

                  {showCountryPicker && (
                    <div className="absolute top-10 left-0 z-50 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 max-h-48 overflow-y-auto">
                      {COUNTRY_CODES.map(c => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setPhoneCode(c.code);
                            setShowCountryPicker(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-sky-50 flex items-center justify-between text-xs text-slate-800"
                        >
                          <span className="flex items-center gap-1.5">
                            <span>{c.flag}</span>
                            <span className="truncate font-medium">{c.country}</span>
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">{c.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-[1px] h-5 bg-slate-200" />

                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder={t.login.phonePlaceholder}
                  className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                E-mail Institucional ou Pessoal
              </label>
              <div className="h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center px-3.5 gap-2.5 focus-within:border-sky-500 focus-within:bg-white transition-all shadow-xs">
                <Mail size={16} className="text-sky-600 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="exemplo@catoca.ao ou seu e-mail"
                  className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              {t.login.password}
            </label>
            <div className="h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center px-3.5 gap-2.5 focus-within:border-sky-500 focus-within:bg-white transition-all shadow-xs">
              <Lock size={16} className="text-sky-600 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t.login.passwordPlaceholder}
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="rounded accent-sky-600"
              />
              <span>{t.login.remember}</span>
            </label>

            <button
              type="button"
              onClick={() => openModal('customer_service')}
              className="text-sky-600 hover:underline font-semibold"
            >
              {t.login.forgotPassword}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-2xl btn-diamond-primary flex items-center justify-center gap-2 text-sm font-bold shadow-md active:scale-98 transition-all disabled:opacity-50"
          >
            <Sparkles size={16} />
            <span>{loading ? 'Validando...' : t.login.loginNow}</span>
          </button>

          <div className="pt-2 text-center space-y-3">
            <p className="text-xs text-slate-500">
              {t.login.noAccount}{' '}
              <button
                type="button"
                onClick={() => navigateTo('/pages/register/index')}
                className="text-sky-600 font-bold underline ml-1 hover:text-sky-700"
              >
                {t.login.registerNow}
              </button>
            </p>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={demoLogin}
                className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>⚡ Testar como Operador Demonstração (Mina Saurimo)</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
