import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { User, Transaction } from '../types';
import { VIP_TIERS } from '../data/mockData';
import {
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  Eye,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  Search,
  Filter,
  PlusCircle,
  MinusCircle,
  ExternalLink,
  FileText,
  RefreshCw,
  Bell,
  Gem,
  ChevronRight,
  Copy,
  CheckCircle2,
  Wallet,
  Phone,
  Mail,
  Calendar,
  Building,
  Lock,
  LogOut,
  Maximize2,
  FileCheck2,
  Trash2,
  UserX,
} from 'lucide-react';
import { ADMIN_UID, ADMIN_EMAILS } from '../context/AppContext';

export const AdminPage: React.FC = () => {
  const {
    user,
    allUsers,
    allTransactions,
    pendingDepositsCount,
    pendingWithdrawalsCount,
    totalPendingCount,
    approveDeposit,
    rejectDeposit,
    approveWithdraw,
    rejectWithdraw,
    adjustUserBalance,
    deleteUser,
    formatCurrency,
    navigateTo,
    logout,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'approvals' | 'users' | 'balance_adjust' | 'all_tx'>('approvals');
  const [txFilter, setTxFilter] = useState<'pending' | 'deposits_pending' | 'withdrawals_pending' | 'completed' | 'failed' | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [vipFilter, setVipFilter] = useState<number | 'all'>('all');

  // Modal / Action states
  const [selectedProofImg, setSelectedProofImg] = useState<string | null>(null);
  const [rejectModalTx, setRejectModalTx] = useState<Transaction | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Balance adjustment state
  const [adjustTargetUser, setAdjustTargetUser] = useState<User | null>(null);
  const [adjustMode, setAdjustMode] = useState<'credit' | 'debit'>('credit');
  const [adjustAmountStr, setAdjustAmountStr] = useState<string>('5000');
  const [adjustReasonPreset, setAdjustReasonPreset] = useState<string>('Bónus por liderança de equipa');
  const [adjustReasonCustom, setAdjustReasonCustom] = useState<string>('');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      // Type/Status filter
      if (txFilter === 'pending') {
        if (tx.status !== 'pending') return false;
      } else if (txFilter === 'deposits_pending') {
        if (tx.type !== 'recharge' || tx.status !== 'pending') return false;
      } else if (txFilter === 'withdrawals_pending') {
        if (tx.type !== 'withdraw' || tx.status !== 'pending') return false;
      } else if (txFilter === 'completed') {
        if (tx.status !== 'completed') return false;
      } else if (txFilter === 'failed') {
        if (tx.status !== 'failed') return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = tx.userName?.toLowerCase().includes(term);
        const matchPhone = tx.userPhone?.toLowerCase().includes(term);
        const matchEmail = tx.userEmail?.toLowerCase().includes(term);
        const matchNote = tx.note?.toLowerCase().includes(term);
        const matchId = tx.id?.toLowerCase().includes(term);
        const matchAccount = tx.accountNumber?.toLowerCase().includes(term);
        if (!matchName && !matchPhone && !matchEmail && !matchNote && !matchId && !matchAccount) {
          return false;
        }
      }

      return true;
    });
  }, [allTransactions, txFilter, searchTerm]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      if (vipFilter !== 'all' && (u.vipLevel || 0) !== vipFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = u.name?.toLowerCase().includes(term);
        const matchPhone = u.phone?.toLowerCase().includes(term);
        const matchEmail = u.email?.toLowerCase().includes(term);
        const matchId = u.id?.toLowerCase().includes(term);
        const matchIban = u.bankAccount?.accountNumber?.toLowerCase().includes(term);
        if (!matchName && !matchPhone && !matchEmail && !matchId && !matchIban) {
          return false;
        }
      }
      return true;
    });
  }, [allUsers, vipFilter, searchTerm]);

  // Financial statistics
  const stats = useMemo(() => {
    const pendingWithdrawalsSum = allTransactions
      .filter((t) => t.type === 'withdraw' && t.status === 'pending')
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    const pendingDepositsSum = allTransactions
      .filter((t) => t.type === 'recharge' && t.status === 'pending')
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    const approvedDepositsSum = allTransactions
      .filter((t) => t.type === 'recharge' && t.status === 'completed')
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    const approvedWithdrawalsSum = allTransactions
      .filter((t) => t.type === 'withdraw' && t.status === 'completed')
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    return {
      pendingWithdrawalsSum,
      pendingDepositsSum,
      approvedDepositsSum,
      approvedWithdrawalsSum,
      totalUsers: allUsers.length,
    };
  }, [allTransactions, allUsers]);

  // Handle Approve
  const handleApprove = async (tx: Transaction) => {
    setActionLoading(true);
    setActionFeedback(null);
    try {
      let res;
      if (tx.type === 'recharge') {
        res = await approveDeposit(tx.id);
      } else {
        res = await approveWithdraw(tx.id);
      }
      if (res.success) {
        setActionFeedback({ type: 'success', msg: res.message });
      } else {
        setActionFeedback({ type: 'error', msg: res.message });
      }
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionFeedback(null), 5000);
    }
  };

  // Handle Reject Submit
  const handleConfirmReject = async () => {
    if (!rejectModalTx) return;
    setActionLoading(true);
    setActionFeedback(null);
    try {
      let res;
      if (rejectModalTx.type === 'recharge') {
        res = await rejectDeposit(rejectModalTx.id, rejectReason);
      } else {
        res = await rejectWithdraw(rejectModalTx.id, rejectReason);
      }
      if (res.success) {
        setActionFeedback({ type: 'success', msg: res.message });
        setRejectModalTx(null);
        setRejectReason('');
      } else {
        setActionFeedback({ type: 'error', msg: res.message });
      }
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionFeedback(null), 5000);
    }
  };

  // Handle Delete User Submit
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setActionLoading(true);
    setActionFeedback(null);
    try {
      const res = await deleteUser(userToDelete.id);
      if (res.success) {
        setActionFeedback({ type: 'success', msg: res.message });
        setUserToDelete(null);
      } else {
        setActionFeedback({ type: 'error', msg: res.message });
      }
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionFeedback(null), 5000);
    }
  };

  // Handle Balance Adjust Submit
  const handleExecuteBalanceAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTargetUser) {
      setActionFeedback({ type: 'error', msg: 'Selecione um operador para realizar o ajuste.' });
      return;
    }
    const amt = parseFloat(adjustAmountStr);
    if (!amt || amt <= 0) {
      setActionFeedback({ type: 'error', msg: 'Informe um valor numérico válido maior que zero.' });
      return;
    }

    const finalReason = adjustReasonCustom.trim()
      ? `${adjustReasonPreset}: ${adjustReasonCustom.trim()}`
      : adjustReasonPreset;

    const delta = adjustMode === 'credit' ? amt : -amt;

    setActionLoading(true);
    setActionFeedback(null);
    try {
      const res = await adjustUserBalance(adjustTargetUser.id, delta, finalReason);
      if (res.success) {
        setActionFeedback({ type: 'success', msg: res.message });
        setAdjustReasonCustom('');
        // Update local user target
        const updated = allUsers.find((u) => u.id === adjustTargetUser.id);
        if (updated) setAdjustTargetUser(updated);
      } else {
        setActionFeedback({ type: 'error', msg: res.message });
      }
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionFeedback(null), 6000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-start pb-20 relative max-w-md mx-auto text-slate-900">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-950 via-sky-950 to-slate-900 text-white p-4 pt-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg border border-sky-300/30">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black tracking-tight leading-none text-white">
                  PAINEL ADMINISTRATIVO
                </h1>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                  ADM ATIVO
                </span>
              </div>
              <p className="text-[11px] text-sky-300 font-mono mt-0.5">
                UID: 0j4XJDI6iXgXpODNoMZHs7daRnR2
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('/pages/index/index')}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white border border-white/20 flex items-center gap-1 transition-all active:scale-95"
              title="Acessar Modo Operador / Mina"
            >
              <span>Ver Mina</span>
            </button>
            <button
              onClick={logout}
              className="w-8 h-8 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 flex items-center justify-center border border-rose-500/30 transition-all active:scale-95"
              title="Encerrar Sessão de Administrador"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* Real-Time Alert Banner if there are pending items */}
        {totalPendingCount > 0 ? (
          <div className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 flex items-center justify-between text-xs animate-pulse">
            <div className="flex items-center gap-2 text-amber-200 font-bold">
              <Bell size={15} className="text-amber-400 animate-bounce" />
              <span>
                {totalPendingCount} solicitaç{totalPendingCount > 1 ? 'ões pendentes' : 'ão pendente'} aguardando aprovação!
              </span>
            </div>
            <button
              onClick={() => {
                setActiveTab('approvals');
                setTxFilter('pending');
              }}
              className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-1 rounded-lg uppercase tracking-wider"
            >
              Ver Agora
            </button>
          </div>
        ) : (
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-400/20 flex items-center gap-2 text-[11px] text-emerald-300 font-medium">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>Fila de pagamentos em dia. Nenhuma pendência no cofre mineral.</span>
          </div>
        )}
      </div>

      {/* Global Feedback Alert */}
      {actionFeedback && (
        <div
          className={`mx-3 mt-3 p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-sm animate-fadeIn ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}
        >
          {actionFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span className="flex-1">{actionFeedback.msg}</span>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-slate-700">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Statistics Cards Grid (Numbers and Notifications) */}
      <div className="p-3 grid grid-cols-2 gap-2">
        {/* Saques Pendentes */}
        <div
          onClick={() => {
            setActiveTab('approvals');
            setTxFilter('withdrawals_pending');
          }}
          className={`p-3 rounded-2xl border cursor-pointer transition-all ${
            txFilter === 'withdrawals_pending' && activeTab === 'approvals'
              ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-400/50 shadow-md'
              : 'bg-white border-slate-200 hover:border-sky-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Saques Pendentes
            </span>
            <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-mono font-bold text-[10px]">
              {pendingWithdrawalsCount}
            </div>
          </div>
          <p className="text-base font-black text-rose-600 font-mono">
            {formatCurrency(stats.pendingWithdrawalsSum)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {pendingWithdrawalsCount} pedido{pendingWithdrawalsCount !== 1 ? 's' : ''} de retirada
          </p>
        </div>

        {/* Depósitos Pendentes */}
        <div
          onClick={() => {
            setActiveTab('approvals');
            setTxFilter('deposits_pending');
          }}
          className={`p-3 rounded-2xl border cursor-pointer transition-all ${
            txFilter === 'deposits_pending' && activeTab === 'approvals'
              ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-400/50 shadow-md'
              : 'bg-white border-slate-200 hover:border-sky-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Depósitos Pendentes
            </span>
            <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-mono font-bold text-[10px]">
              {pendingDepositsCount}
            </div>
          </div>
          <p className="text-base font-black text-amber-600 font-mono">
            {formatCurrency(stats.pendingDepositsSum)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {pendingDepositsCount} comprovativo{pendingDepositsCount !== 1 ? 's' : ''} para validar
          </p>
        </div>

        {/* Total Usuários */}
        <div
          onClick={() => setActiveTab('users')}
          className={`p-3 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'users'
              ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-400/50 shadow-md'
              : 'bg-white border-slate-200 hover:border-sky-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Operadores Catoca
            </span>
            <Users size={14} className="text-sky-600" />
          </div>
          <p className="text-base font-black text-slate-900 font-mono">
            {stats.totalUsers}
          </p>
          <p className="text-[10px] text-sky-700 font-medium mt-0.5">
            Ver e gerir contas
          </p>
        </div>

        {/* Depósitos Aprovados */}
        <div
          onClick={() => {
            setActiveTab('approvals');
            setTxFilter('completed');
          }}
          className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs cursor-pointer hover:border-emerald-300"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total Depositado
            </span>
            <Wallet size={14} className="text-emerald-600" />
          </div>
          <p className="text-base font-black text-emerald-600 font-mono">
            {formatCurrency(stats.approvedDepositsSum)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Alocações consolidadas
          </p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="px-3 mb-3">
        <div className="flex p-1 bg-white rounded-2xl border border-slate-200 shadow-xs gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('approvals')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
              activeTab === 'approvals'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Aprovações</span>
            {totalPendingCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] flex items-center justify-center font-mono">
                {totalPendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={14} />
            <span>Usuários</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('balance_adjust')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'balance_adjust'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wallet size={14} />
            <span>Gerir Saldo</span>
          </button>
        </div>
      </div>

      {/* TAB 1: APROVAÇÕES DE SAQUES E DEPÓSITOS */}
      {activeTab === 'approvals' && (
        <div className="px-3 space-y-3">
          {/* Subfilter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setTxFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                txFilter === 'pending'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              Pendentes ({totalPendingCount})
            </button>
            <button
              onClick={() => setTxFilter('deposits_pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                txFilter === 'deposits_pending'
                  ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              Depósitos ({pendingDepositsCount})
            </button>
            <button
              onClick={() => setTxFilter('withdrawals_pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                txFilter === 'withdrawals_pending'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              Saques ({pendingWithdrawalsCount})
            </button>
            <button
              onClick={() => setTxFilter('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                txFilter === 'completed'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              Aprovados
            </button>
            <button
              onClick={() => setTxFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                txFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              Todas
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por operador, telefone, IBAN ou valor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-sky-500 shadow-xs"
            />
          </div>

          {/* Transaction Cards List */}
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
              <h4 className="text-sm font-bold text-slate-800">Nenhuma transação correspondente</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Não há operações pendentes com estes critérios no momento.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((tx) => {
                const isDeposit = tx.type === 'recharge';
                const isPending = tx.status === 'pending';
                const isCompleted = tx.status === 'completed';
                const isFailed = tx.status === 'failed';

                return (
                  <div
                    key={tx.id}
                    className={`p-4 rounded-3xl border transition-all bg-white shadow-xs space-y-3 ${
                      isPending
                        ? isDeposit
                          ? 'border-amber-300 ring-1 ring-amber-200'
                          : 'border-rose-300 ring-1 ring-rose-200'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                            isDeposit
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {isDeposit ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-900">
                              {isDeposit ? 'Depósito de Capital' : 'Solicitação de Saque'}
                            </span>
                            <span
                              className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-full ${
                                isPending
                                  ? 'bg-amber-100 text-amber-800'
                                  : isCompleted
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {isPending ? 'PENDENTE' : isCompleted ? 'APROVADO' : 'RECUSADO'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            {tx.date} · Ref: {tx.id.slice(-8)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-sm font-black font-mono block ${
                            isDeposit ? 'text-emerald-600' : 'text-slate-900'
                          }`}
                        >
                          {isDeposit ? '+' : ''}
                          {formatCurrency(Math.abs(tx.amount))}
                        </span>
                        {tx.paymentMethod && (
                          <span className="text-[10px] text-sky-700 font-bold uppercase">
                            {tx.paymentMethod}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Operator Information */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Operador / Nome:</span>
                        <span className="font-bold text-slate-800 truncate block">
                          {tx.userName || 'Operador Catoca'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Telefone:</span>
                        <span className="font-mono font-bold text-slate-800 block">
                          {tx.userPhone || '—'}
                        </span>
                      </div>

                      {/* Bank account or sender info */}
                      {tx.accountNumber && (
                        <div className="col-span-2 pt-1 border-t border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block">
                              Destino ({tx.accountType || 'Multicaixa'}):
                            </span>
                            <span className="font-mono font-bold text-xs text-sky-800 select-all">
                              {tx.accountNumber} ({tx.accountName || 'Titular'})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(tx.accountNumber || '', tx.id)}
                            className="text-[10px] font-bold text-sky-600 bg-white px-2 py-1 rounded-lg border border-slate-200 flex items-center gap-1 active:scale-95"
                          >
                            {copiedId === tx.id ? <Check size={11} /> : <Copy size={11} />}
                            <span>{copiedId === tx.id ? 'Copiado' : 'Copiar'}</span>
                          </button>
                        </div>
                      )}

                      {tx.senderName && (
                        <div className="col-span-2 pt-1 border-t border-slate-200">
                          <span className="text-[10px] text-slate-400 block">Dados do Comprovativo:</span>
                          <span className="font-medium text-slate-700 text-[11px] block">
                            {tx.senderName}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Comprovativo de Pagamento Attached (for Deposits) */}
                    {tx.proofUrl && (
                      <div className="p-2 rounded-2xl bg-sky-50/50 border border-sky-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            onClick={() => setSelectedProofImg(tx.proofUrl || null)}
                            className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-300 overflow-hidden shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <img
                              src={tx.proofUrl}
                              alt="Comprovativo"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              Comprovativo de Pagamento
                            </span>
                            <span className="text-[10px] text-sky-700 font-medium">
                              Foto anexada pelo operador
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedProofImg(tx.proofUrl || null)}
                          className="px-2.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold flex items-center gap-1 active:scale-95 shadow-xs"
                        >
                          <Maximize2 size={12} />
                          <span>Ver Foto</span>
                        </button>
                      </div>
                    )}

                    {/* Admin justification note if rejected */}
                    {tx.adminNote && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                        <span className="font-bold block text-[10px] text-rose-600 uppercase">
                          Motivo Registrado:
                        </span>
                        <span>{tx.adminNote}</span>
                      </div>
                    )}

                    {/* Action Buttons for Pending Items */}
                    {isPending && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleApprove(tx)}
                          className="py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <Check size={15} />
                          <span>Aprovar {isDeposit ? 'Depósito' : 'Saque'}</span>
                        </button>

                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => {
                            setRejectModalTx(tx);
                            setRejectReason(
                              isDeposit
                                ? 'Comprovativo não identificado ou valor não consta no extrato bancário.'
                                : 'Dados bancários inconsistentes ou divergência de titularidade.'
                            );
                          }}
                          className="py-2.5 px-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <X size={15} />
                          <span>Recusar</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VER TODOS OS USUÁRIOS */}
      {activeTab === 'users' && (
        <div className="px-3 space-y-3">
          {/* Search & VIP Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome, telefone, email, UID ou IBAN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-sky-500 shadow-xs"
              />
            </div>

            {/* VIP Level Filter chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                onClick={() => setVipFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                  vipFilter === 'all'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Todos ({allUsers.length})
              </button>
              {VIP_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setVipFilter(tier.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                    vipFilter === tier.id
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  {tier.name}
                </button>
              ))}
            </div>
          </div>

          {/* User Cards List */}
          <div className="space-y-3">
            {filteredUsers.map((u) => {
              const vipInfo = VIP_TIERS.find((t) => t.id === (u.vipLevel || 0)) || VIP_TIERS[0];
              const isTargetAdmin =
                u.id === ADMIN_UID ||
                (u.email && ADMIN_EMAILS.includes(u.email)) ||
                (user && user.id === u.id);

              return (
                <div
                  key={u.id}
                  className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 hover:border-sky-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-xs">
                        {u.name ? u.name.charAt(0).toUpperCase() : 'O'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-black text-slate-900 truncate">{u.name || 'Operador'}</h4>
                          <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                            {vipInfo.name}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono truncate">
                          Tel: {u.phone} · UID: {u.id.slice(0, 10)}...
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setAdjustTargetUser(u);
                          setActiveTab('balance_adjust');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-bold border border-sky-200 flex items-center gap-1 active:scale-95 transition-all"
                        title="Ajustar saldo e auditar"
                      >
                        <Wallet size={12} />
                        <span>Saldo</span>
                      </button>

                      {isTargetAdmin ? (
                        <span
                          className="px-2 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200 flex items-center gap-1"
                          title="Conta de Administrador Protegida"
                        >
                          <ShieldCheck size={11} className="text-sky-600" />
                          <span>Admin</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setUserToDelete(u)}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-[11px] font-bold border border-rose-200 flex items-center gap-1 active:scale-95 transition-all"
                          title="Remover operador do sistema"
                        >
                          <Trash2 size={12} />
                          <span>Remover</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Financial & Profile Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Saldo em Cofre:</span>
                      <span className="font-mono font-black text-slate-900 block">
                        {formatCurrency(u.balance || 0)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Ganhos Totais:</span>
                      <span className="font-mono font-bold text-emerald-600 block">
                        {formatCurrency(u.totalEarnings || 0)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">E-mail:</span>
                      <span className="font-medium text-slate-700 truncate block">
                        {u.email || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Senha de Pagamento:</span>
                      <span
                        className={`font-bold text-[10px] px-1.5 py-0.5 rounded-md inline-block ${
                          u.payPasswordSet
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {u.payPasswordSet ? 'Configurada' : 'Não definida'}
                      </span>
                    </div>

                    {/* Bank Account */}
                    <div className="col-span-2 pt-1 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">IBAN / Conta Bancária:</span>
                        <span className="font-mono font-bold text-xs text-slate-800 block">
                          {u.bankAccount?.accountNumber
                            ? `${u.bankAccount.accountNumber} (${u.bankAccount.accountName})`
                            : 'Nenhum IBAN vinculado'}
                        </span>
                      </div>
                      {u.bankAccount?.accountNumber && (
                        <button
                          type="button"
                          onClick={() => handleCopy(u.bankAccount?.accountNumber || '', u.id)}
                          className="text-[10px] font-bold text-sky-600 bg-white px-2 py-0.5 rounded border border-slate-200"
                        >
                          {copiedId === u.id ? 'Copiado' : 'Copiar'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ADICIONAR E REMOVER SALDO COM SEUS MOTIVOS */}
      {activeTab === 'balance_adjust' && (
        <div className="px-3 space-y-4">
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Wallet size={16} className="text-sky-600" />
                <span>Gestão Manual de Saldo & Auditoria</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Adicione créditos ou remova saldo com registro obrigatório de justificativa.
              </p>
            </div>

            {/* Target User Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Operador Destinatário:
              </label>
              {adjustTargetUser ? (
                <div className="p-3 rounded-2xl bg-sky-50 border border-sky-300 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-900 block">
                      {adjustTargetUser.name} ({adjustTargetUser.phone})
                    </span>
                    <span className="text-[11px] text-sky-800 font-mono">
                      Saldo Atual: {formatCurrency(adjustTargetUser.balance || 0)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdjustTargetUser(null)}
                    className="text-xs font-bold text-sky-600 hover:underline"
                  >
                    Trocar
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Pesquisar operador para selecionar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-sky-500"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1 border border-slate-200 rounded-2xl p-1 bg-slate-50">
                    {filteredUsers.slice(0, 8).map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setAdjustTargetUser(u)}
                        className="w-full text-left p-2 rounded-xl bg-white hover:bg-sky-50 text-xs flex justify-between items-center border border-slate-100"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{u.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{u.phone}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-700">
                          {formatCurrency(u.balance || 0)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Mode Toggle (Credit / Debit) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Tipo de Operação:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustMode('credit')}
                  className={`py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                    adjustMode === 'credit'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-400/50'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <PlusCircle size={16} />
                  <span>Adicionar Saldo (+)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustMode('debit')}
                  className={`py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                    adjustMode === 'debit'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-400/50'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MinusCircle size={16} />
                  <span>Remover Saldo (-)</span>
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Valor do Ajuste (Kz):
              </label>
              <input
                type="number"
                value={adjustAmountStr}
                onChange={(e) => setAdjustAmountStr(e.target.value)}
                placeholder="Ex: 10000"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 focus:outline-hidden focus:border-sky-500 shadow-xs"
              />

              {/* Quick amount chips */}
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {[2000, 5000, 10000, 25000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAdjustAmountStr(amt.toString())}
                    className="py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold font-mono text-slate-700"
                  >
                    {formatCurrency(amt)}
                  </button>
                ))}
              </div>
            </div>

            {/* Mandatory Reason (Motivo do Ajuste) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Motivo Obrigatório do Ajuste:
              </label>
              <select
                value={adjustReasonPreset}
                onChange={(e) => setAdjustReasonPreset(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-sky-500"
              >
                <option value="Bónus por liderança de equipa">Bónus por liderança de equipa</option>
                <option value="Recompensa promocional Catoca">Recompensa promocional Catoca</option>
                <option value="Ajuste manual de alocação">Ajuste manual de alocação</option>
                <option value="Correção de depósito bancário">Correção de depósito bancário</option>
                <option value="Penalidade por infração de termos">Penalidade por infração de termos</option>
                <option value="Reembolso de operação técnica">Reembolso de operação técnica</option>
                <option value="Outro motivo específico">Outro motivo específico</option>
              </select>

              <textarea
                rows={2}
                value={adjustReasonCustom}
                onChange={(e) => setAdjustReasonCustom(e.target.value)}
                placeholder="Observações complementares para auditoria interna..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-sky-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="button"
              disabled={actionLoading || !adjustTargetUser || !adjustAmountStr}
              onClick={handleExecuteBalanceAdjust}
              className={`w-full py-3.5 rounded-2xl text-xs font-black shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 text-white disabled:opacity-50 ${
                adjustMode === 'credit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {actionLoading ? (
                <span>Gravando no cofre...</span>
              ) : (
                <>
                  <Check size={16} />
                  <span>
                    Confirmar {adjustMode === 'credit' ? 'Crédito' : 'Débito'} de {formatCurrency(parseFloat(adjustAmountStr) || 0)}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* FULL-SCREEN PROOF IMAGE MODAL */}
      {selectedProofImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <FileCheck2 size={16} className="text-sky-400" />
                <span>Comprovativo de Depósito Bancário</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedProofImg(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 bg-slate-100 flex items-center justify-center">
              {selectedProofImg.startsWith('data:application/pdf') ? (
                <div className="p-8 text-center space-y-3">
                  <FileText size={54} className="mx-auto text-rose-500" />
                  <p className="text-sm font-bold text-slate-800">Comprovativo em Ficheiro PDF</p>
                  <a
                    href={selectedProofImg}
                    download="comprovativo_catoca_adm.pdf"
                    className="inline-block px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold shadow-xs hover:bg-sky-700"
                  >
                    Baixar / Abrir Documento PDF
                  </a>
                </div>
              ) : (
                <img
                  src={selectedProofImg}
                  alt="Comprovativo Ampliado"
                  className="w-full h-auto max-h-[70vh] object-contain rounded-2xl"
                />
              )}
            </div>
            <div className="p-3 bg-white border-t border-slate-200 text-center">
              <button
                type="button"
                onClick={() => setSelectedProofImg(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT WITH REASON MODAL */}
      {rejectModalTx && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Recusar {rejectModalTx.type === 'recharge' ? 'Depósito' : 'Saque'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Valor: {formatCurrency(Math.abs(rejectModalTx.amount))}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalTx(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Justificativa para o Operador:
              </label>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Informe o motivo da recusa..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalTx(null)}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={actionLoading || !rejectReason.trim()}
                onClick={handleConfirmReject}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50"
              >
                {actionLoading ? 'Processando...' : 'Confirmar Recusa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE USER MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-xs">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Remover Operador do Sistema
                  </h3>
                  <p className="text-[11px] text-rose-600 font-bold">
                    Eliminação de registo na base de dados
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setUserToDelete(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X size={16} />
              </button>
            </div>

            {/* User details preview card */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Nome do Operador:</span>
                <span className="font-bold text-slate-900">{userToDelete.name || 'Sem nome'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Telefone / Contato:</span>
                <span className="font-mono font-bold text-slate-900">{userToDelete.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">E-mail Registrado:</span>
                <span className="font-medium text-slate-700 truncate max-w-[200px]">{userToDelete.email || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Saldo em Carteira:</span>
                <span className="font-mono font-black text-slate-900">{formatCurrency(userToDelete.balance || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Nível VIP:</span>
                <span className="font-bold text-sky-700">VIP {userToDelete.vipLevel || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Identificador UID:</span>
                <span className="font-mono text-[10px] text-slate-500 truncate max-w-[200px]">{userToDelete.id}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Tem certeza que deseja apagar o registro deste operador? O documento será removido permanentemente da coleção de utilizadores no Firestore da Catoca Diamante.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setUserToDelete(null)}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmDeleteUser}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all disabled:opacity-50"
              >
                <Trash2 size={14} />
                <span>{actionLoading ? 'Removendo...' : 'Confirmar Remoção'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
