import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { COUNTRY_CODES } from '../data/mockData';
import { Eye, EyeOff, Globe, Phone, Mail, Lock, Ticket, RefreshCw, AlertCircle, Sparkles, Gem, User as UserIcon } from 'lucide-react';
import confetti from 'canvas-confetti';

export const RegisterPage: React.FC = () => {
  const { register, demoLogin, navigateTo, routeParams, openModal, t } = useApp();

  const [name, setName] = useState('');
  const [phoneCode, setPhoneCode] = useState('+244');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState(routeParams.i || routeParams.inviteCode || '1fg9kafci6');
  const [generatedCaptcha, setGeneratedCaptcha] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [captchaInput, setCaptchaInput] = useState(() => generatedCaptcha);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  useEffect(() => {
    if (routeParams.i || routeParams.inviteCode) {
      setInviteCode(routeParams.i || routeParams.inviteCode);
    }
  }, [routeParams]);

  const refreshCaptcha = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCaptcha(code);
    setCaptchaInput(code);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanPhone) {
      setError(t.register.phoneRequired);
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Por favor, informe um endereço de e-mail válido');
      return;
    }
    if (!password.trim()) {
      setError(t.register.passwordRequired);
      return;
    }
    if (!confirmPassword.trim()) {
      setError(t.register.confirmPasswordRequired);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.register.passwordMismatch);
      return;
    }
    if (!inviteCode.trim()) {
      setError(t.register.inviteRequired);
      return;
    }
    if (captchaInput.trim() && captchaInput.trim() !== generatedCaptcha) {
      setError('Código de verificação incorreto. Tente novamente.');
      refreshCaptcha();
      return;
    }

    setLoading(true);
    try {
      const res = await register(cleanPhone, phoneCode, cleanEmail, password, inviteCode.trim(), name.trim());
      if (res?.success) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#0284c7', '#38bdf8', '#ffffff', '#e0f2fe', '#60a5fa'],
        });
      } else {
        setError(res?.message || 'Falha ao emitir credencial. Verifique os dados informados.');
      }
    } catch (err: any) {
      console.error('Falha ao registrar:', err);
      setError(err?.message || 'Erro ao conectar à plataforma.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCountry = COUNTRY_CODES.find(c => c.code === phoneCode) || COUNTRY_CODES[0];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-start relative max-w-md mx-auto">
      {/* Top Diamond Hero Header */}
      <div className="relative h-64 w-full overflow-hidden bg-slate-900">
        <img
          src="/assets/aistudio/IMG_1491_c7e2abb2.jpeg"
          alt="Catoca Diamantes - Lavra a Céu Aberto"
          className="w-full h-full object-cover opacity-90 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-900/50 to-slate-950/90" />

        {/* Top bar with Language switch */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => openModal('language')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs text-white hover:bg-white/30 transition-all active:scale-95 shadow-sm"
          >
            <Globe size={13} className="text-sky-300" />
            <span className="font-semibold uppercase text-[10.5px]">{t.currency === 'Kz' ? 'PT' : 'EN'}</span>
          </button>
        </div>

        {/* Diamond Geometric Branding Badge with Official Logo */}
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
                DIAMANTES
              </span>
            </div>
            <p className="text-xs text-sky-200 font-medium mt-1">
              Sociedade Mineira de Catoca · Saurimo
            </p>
          </div>
        </div>
      </div>

      {/* Main Curved White Diamond Container */}
      <div className="flex-1 bg-white px-6 pt-6 pb-12 rounded-t-[32px] -mt-5 relative z-20 border-t border-sky-100 shadow-xl space-y-4">
        {/* Diamond Header Accent */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-1.5">
              <span>{t.register.title}</span>
              <span className="text-sky-600">💎</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Participe da extração automatizada de 24h na 4ª maior mina do mundo
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-mono">BÔNUS INICIAL</span>
            <span className="text-xs font-black text-emerald-600 font-mono">+650 Kz</span>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-3.5">
          {/* Full Name Field */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Nome Completo do Operador
            </label>
            <div className="h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center px-3.5 gap-2.5 focus-within:border-sky-500 focus-within:bg-white transition-all shadow-xs">
              <UserIcon size={16} className="text-sky-600 shrink-0" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Manuel António da Silva"
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Phone Field */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              {t.register.phone}
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
                placeholder={t.register.phonePlaceholder}
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              E-mail Institucional ou Pessoal
            </label>
            <div className="h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center px-3.5 gap-2.5 focus-within:border-sky-500 focus-within:bg-white transition-all shadow-xs">
              <Mail size={16} className="text-sky-600 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="exemplo@catoca.ao ou seu e-mail"
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              {t.register.password}
            </label>
            <div className="h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center px-3.5 gap-2.5 focus-within:border-sky-500 focus-within:bg-white transition-all shadow-xs">
              <Lock size={16} className="text-sky-600 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t.register.passwordPlaceholder}
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

          {/* Confirm Password */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              {t.register.confirmPassword}
            </label>
            <div className="h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center px-3.5 gap-2.5 focus-within:border-sky-500 focus-within:bg-white transition-all shadow-xs">
              <Lock size={16} className="text-sky-600 shrink-0" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder={t.register.confirmPasswordPlaceholder}
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-slate-400 hover:text-slate-700"
              >
                {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>

          {/* Invite Code */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-slate-700">
                {t.register.inviteCode}
              </label>
              <span className="text-[10px] text-sky-600 font-semibold">
                Concessão Vinculada
              </span>
            </div>
            <div className="h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center px-3.5 gap-2.5 focus-within:border-sky-500 focus-within:bg-white transition-all shadow-xs">
              <Ticket size={16} className="text-sky-600 shrink-0" />
              <input
                type="text"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
                placeholder={t.register.inviteCodePlaceholder}
                className="flex-1 bg-transparent text-sm text-slate-900 font-mono uppercase tracking-wider placeholder-slate-400 focus:outline-none"
              />
              <span className="text-[10px] text-sky-700 bg-sky-100 px-2 py-0.5 rounded font-bold">
                OFICIAL
              </span>
            </div>
          </div>

          {/* Captcha */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              {t.register.captcha}
            </label>
            <div className="flex items-center gap-2">
              <div className="h-12 flex-1 rounded-2xl bg-slate-50 border border-slate-200 flex items-center px-3.5 focus-within:border-sky-500 focus-within:bg-white transition-all shadow-xs">
                <input
                  type="text"
                  maxLength={4}
                  value={captchaInput}
                  onChange={e => setCaptchaInput(e.target.value)}
                  placeholder="Código de 4 dígitos"
                  className="w-full bg-transparent text-sm text-slate-900 font-mono tracking-widest placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div
                onClick={refreshCaptcha}
                className="h-12 w-28 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs select-none shrink-0 hover:border-sky-500 transition-all"
                title="Clique para gerar outro captcha"
              >
                <span className="font-mono font-black text-lg tracking-widest text-sky-700 italic skew-x-3">
                  {generatedCaptcha}
                </span>
                <RefreshCw size={12} className="text-slate-400" />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button - Diamond Blue Gradient */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-2 rounded-2xl btn-diamond-primary flex items-center justify-center gap-2 text-sm font-bold shadow-md active:scale-98 transition-all disabled:opacity-50"
          >
            <Sparkles size={16} />
            <span>{loading ? 'Emitindo Credencial...' : t.register.registerNow}</span>
          </button>

          {/* Switch to Login */}
          <div className="pt-3 text-center space-y-3">
            <p className="text-xs text-slate-500">
              {t.register.hasAccount}{' '}
              <button
                type="button"
                onClick={() => navigateTo('/pages/login/index')}
                className="text-sky-600 font-bold underline ml-1 hover:text-sky-700"
              >
                {t.register.loginNow}
              </button>
            </p>

            <div className="pt-2 border-t border-slate-100">
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
