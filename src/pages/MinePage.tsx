import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { subscribeToTeamMembers } from '../services/firestoreService';
import { 
  CreditCard, 
  FileText, 
  TrendingUp, 
  Sparkles, 
  Headphones, 
  Download, 
  Globe, 
  LogOut, 
  ChevronRight, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Gem, 
  AlertTriangle, 
  X,
  CheckCircle2,
  Building2,
  Users,
  Gift
} from 'lucide-react';

export const MinePage: React.FC = () => {
  const { 
    user, 
    currentVipTier, 
    formatCurrency, 
    logout, 
    openModal, 
    navigateTo, 
    t, 
    hideBalance, 
    toggleHideBalance,
    transactions 
  } = useApp();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [teamCount, setTeamCount] = useState<number>(0);

  useEffect(() => {
    if (!user?.inviteCode) return;
    const unsub = subscribeToTeamMembers(user.inviteCode, (members) => {
      setTeamCount(members.length);
    });
    return () => unsub();
  }, [user?.inviteCode]);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogoutAction = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  const menuItems = [
    {
      id: 'records',
      label: t.mine.menu.transactionRecords,
      icon: FileText,
      color: 'text-sky-600',
      action: () => navigateTo('/pages/records/index'),
    },
    {
      id: 'receiving',
      label: 'Conta Multicaixa / Bancária',
      icon: CreditCard,
      color: 'text-blue-600',
      action: () => openModal('withdraw'),
    },
    {
      id: 'fund',
      label: 'Fundo de Kimberlito Catoca',
      icon: TrendingUp,
      color: 'text-cyan-600',
      action: () => openModal('wealth_fund'),
    },
    {
      id: 'daily_reward',
      label: 'Bónus de Presença Diária & Missões',
      icon: Gift,
      color: 'text-amber-500',
      action: () => openModal('daily_reward'),
    },
    {
      id: 'service',
      label: 'Apoio ao Operador de Mina',
      icon: Headphones,
      color: 'text-sky-700',
      action: () => openModal('customer_service'),
    },
    {
      id: 'download',
      label: 'Baixar Aplicativo Oficial',
      icon: Download,
      color: 'text-slate-700',
      action: () => openModal('app_download'),
    },
    {
      id: 'language',
      label: t.mine.menu.language,
      icon: Globe,
      color: 'text-blue-500',
      action: () => openModal('language'),
    },
  ];

  return (
    <div className="pb-28 pt-2 px-4 space-y-4 max-w-md mx-auto">
      {/* User Header Profile Card - Diamond White Faceted */}
      <div className="diamond-crystal-card p-5 rounded-3xl border border-sky-100 shadow-md relative overflow-hidden bg-white">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-36 h-36 bg-sky-100/50 diamond-shape opacity-40 pointer-events-none" />

        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl p-0.5 bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 shadow-sm overflow-hidden">
              <img
                src={user?.avatar || '/assets/aistudio/IMG_1488_7432a176.jpeg'}
                alt="Avatar"
                className="w-full h-full rounded-2xl object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/aistudio/IMG_1488_7432a176.jpeg';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">
                  {user ? `${user.phoneCode} ${user.phone}` : 'Não conectado'}
                </h2>
                <span
                  className="text-[10px] font-black px-2 py-0.5 rounded-md text-white shadow-xs"
                  style={{ background: currentVipTier.accentColor || '#0284c7' }}
                >
                  {currentVipTier.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                <span>ID: {user?.id}</span>
                <span>•</span>
                <span className="text-sky-700 font-bold">Convite: {user?.inviteCode}</span>
              </p>
              {user?.email && (
                <p className="text-[10.5px] text-slate-400 truncate max-w-[200px] mt-0.5">
                  ✉️ {user.email}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleHideBalance}
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all"
              title="Ocultar/Exibir Saldo"
            >
              {hideBalance ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center hover:bg-rose-100 transition-all active:scale-95"
              title="Encerrar Sessão"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>

        {/* Diamond Carats & Kz Balances */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200 shadow-inner space-y-3 relative z-10">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[11px] text-slate-500 block font-medium">Saldo em Kz no Cofre</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                {formatCurrency(user?.balance || 0)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Total de Quilates Extraídos</span>
              <span className="text-sm font-black text-sky-700 font-mono">
                💎 {user?.totalCaratsExtracted ?? 0} ct
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px]">Rendimento Hoje:</span>
              <span className="font-extrabold text-emerald-600 font-mono">
                +{formatCurrency(user?.todayEarnings || 0)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Rendimento Total Acumulado:</span>
              <span className="font-extrabold text-slate-900 font-mono">
                {formatCurrency(user?.totalEarnings || 0)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              onClick={() => openModal('recharge')}
              className="py-2.5 rounded-xl btn-diamond-primary text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <ArrowUpCircle size={15} />
              <span>Alocar Capital</span>
            </button>
            <button
              onClick={() => openModal('withdraw')}
              className="py-2.5 rounded-xl btn-diamond-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95"
            >
              <ArrowDownCircle size={15} className="text-sky-600" />
              <span>Sacar Fundos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Concession Operator Stats from Firestore */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-[9.5px] text-slate-400 block font-mono">EXTRATO</span>
          <span className="text-base font-black text-slate-900 font-mono">{transactions.length}</span>
          <span className="text-[9px] text-slate-500 block">Operações</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-[9.5px] text-slate-400 block font-mono">PARCEIROS</span>
          <span className="text-base font-black text-sky-700 font-mono">{teamCount}</span>
          <span className="text-[9px] text-slate-500 block">Membros Lavra</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-[9.5px] text-slate-400 block font-mono">PRODUÇÃO</span>
          <span className="text-base font-black text-emerald-600 font-mono">
            {user?.totalCaratsExtracted ?? 0}
          </span>
          <span className="text-[9px] text-slate-500 block">Quilates</span>
        </div>
      </div>

      {/* Live Bank Account Document Status from Firestore */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <CreditCard size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">Conta de Saque Cadastrada</h4>
              <p className="text-[10px] text-slate-500">Documento em tempo real no Firestore</p>
            </div>
          </div>
          <button
            onClick={() => openModal('withdraw')}
            className="text-[11px] font-bold text-sky-600 hover:underline cursor-pointer"
          >
            {user?.bankAccount ? 'Alterar' : '+ Cadastrar'}
          </button>
        </div>

        {user?.bankAccount ? (
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-[10.5px]">Titular:</span>
              <span className="font-bold text-slate-800">{user.bankAccount.accountName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-[10.5px]">Banco / Método:</span>
              <span className="font-semibold text-slate-700 capitalize">
                {user.bankAccount.bankName || user.bankAccount.accountType.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-200">
              <span className="text-slate-400 text-[10.5px]">IBAN / Conta:</span>
              <span className="font-bold text-sky-700">{user.bankAccount.accountNumber}</span>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => openModal('withdraw')}
            className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition-colors"
          >
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle size={15} className="shrink-0 text-amber-600" />
              <span className="text-[11px] font-medium">Nenhuma conta vinculada para recebimento de saques</span>
            </div>
            <span className="text-[10px] font-bold text-sky-600 underline shrink-0">Configurar</span>
          </div>
        )}
      </div>

      {/* Menu List - White Diamond */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-xs">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center ${item.color}`}>
                  <Icon size={17} />
                </div>
                <span className="text-xs font-bold text-slate-800">{item.label}</span>
              </div>
              <ChevronRight size={15} className="text-slate-400" />
            </button>
          );
        })}
      </div>

      {/* Logout Button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-3.5 rounded-2xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-rose-600 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
        >
          <LogOut size={16} />
          <span>{t.mine.menu.logout}</span>
        </button>
      </div>

      {/* Company Footer Note */}
      <div className="text-center pt-2 space-y-1">
        <p className="text-[11px] font-bold text-slate-500">
          Sociedade Mineira de Catoca E.P.
        </p>
        <p className="text-[10px] text-slate-400">
          Saurimo, Lunda Sul · República de Angola
        </p>
      </div>

      {/* In-App Logout Confirmation Modal (Diamond Theme) */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-rose-100 shadow-2xl space-y-4 relative overflow-hidden animate-scaleIn">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-rose-100/50 rounded-full opacity-60 pointer-events-none" />

            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto shadow-xs">
              <LogOut size={26} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">Encerrar Sessão</h3>
              <p className="text-xs text-slate-500 leading-relaxed px-2">
                Deseja realmente sair da sua conta na Concessão de Diamantes Catoca?
              </p>
            </div>

            {user && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-400">Operador:</span>
                  <span className="font-bold text-slate-800">{user.phoneCode} {user.phone}</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-400">Plano VIP:</span>
                  <span className="font-bold text-sky-700">{currentVipTier.name}</span>
                </div>
                <p className="text-[10.5px] text-emerald-600 font-medium pt-1.5 border-t border-slate-200 flex items-center gap-1">
                  <span>✓</span>
                  <span>Seus diamantes e o ciclo de lucro de 24h permanecerão seguros.</span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all active:scale-95 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmLogoutAction}
                className="py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sim, Encerrar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
