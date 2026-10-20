import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_TEAM_MEMBERS } from '../data/mockData';
import { Users, Copy, Check, QrCode, Share2, Award, UserPlus, Gift, Gem } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { User } from '../types';

export const TeamPage: React.FC = () => {
  const { user, formatCurrency, t } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [realMembers, setRealMembers] = useState<any[]>([]);

  const inviteCode = user?.inviteCode || '1fg9kafci6';
  const inviteLink = `${window.location.origin}/#/pages/register/index?i=${inviteCode}`;

  useEffect(() => {
    if (!inviteCode) return;
    const q = query(collection(db, 'users'), where('invitedBy', '==', inviteCode));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: any[] = [];
        snap.forEach((d) => {
          const u = d.data() as User;
          list.push({
            id: u.id,
            phone: u.phone ? `${u.phone.slice(0, 3)}****${u.phone.slice(-3)}` : 'Operador Catoca',
            joinDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : 'Hoje',
            level: 1,
            commissionEarned: Math.round((u.totalEarnings || 0) * 0.1),
          });
        });
        setRealMembers(list);
      },
      (err) => {
        console.warn('Erro ao consultar equipe no Firestore:', err);
      }
    );
    return () => unsub();
  }, [inviteCode]);

  const displayMembers = realMembers;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="pb-28 pt-2 px-4 space-y-4 max-w-md mx-auto">
      {/* Referral Card - White Diamond Faceted */}
      <div className="diamond-crystal-card p-5 rounded-3xl border border-sky-100 shadow-md relative overflow-hidden bg-white space-y-4">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-36 h-36 bg-sky-100/50 diamond-shape opacity-40 pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <UserPlus size={24} />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">{t.team.title}</h2>
            <p className="text-xs text-slate-600">
              Convide novos operadores de lavra e receba 10% de comissão diária sobre toda extração!
            </p>
          </div>
        </div>

        {/* Invite Code Box */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 relative z-10">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 font-bold">{t.team.inviteCodeLabel}:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-base text-sky-700 tracking-wider">
                {inviteCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 flex items-center gap-1 text-[11px] font-bold shadow-xs"
              >
                {copiedCode ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex gap-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 py-2.5 rounded-xl btn-diamond-primary text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              {copiedLink ? <Check size={14} /> : <Share2 size={14} />}
              <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link de Convite Catoca'}</span>
            </button>

            <button
              onClick={() => setShowQR(!showQR)}
              className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-200 shadow-xs"
              title="Exibir QR Code"
            >
              <QrCode size={18} />
            </button>
          </div>
        </div>

        {/* QR Code view */}
        {showQR && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-center space-y-2 animate-fadeIn relative z-10">
            <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center shadow-xs">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(inviteLink)}`}
                alt="QR Code Convite Catoca"
                className="w-full h-full"
              />
            </div>
            <p className="text-[11px] font-bold text-slate-700">
              Escaneie para registrar com código {inviteCode}
            </p>
          </div>
        )}
      </div>

      {/* Network Stats - 3 Levels */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Users size={16} className="text-sky-600" />
            <h3 className="font-black text-sm text-slate-900">Membros da Concessão</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500 font-bold">
            {displayMembers.length} OPERADORES
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Nível 1 (10%)</span>
            <span className="text-base font-black text-slate-900 font-mono">
              {displayMembers.filter(m => m.level === 1).length}
            </span>
            <span className="text-[9px] text-emerald-600 block font-bold">
              {formatCurrency(displayMembers.reduce((acc, m) => acc + (m.commissionEarned || 0), 0))}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Nível 2 (3%)</span>
            <span className="text-base font-black text-slate-900 font-mono">0</span>
            <span className="text-[9px] text-emerald-600 block font-bold">0 Kz</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Nível 3 (1%)</span>
            <span className="text-base font-black text-slate-900 font-mono">0</span>
            <span className="text-[9px] text-emerald-600 block font-bold">0 Kz</span>
          </div>
        </div>

        {/* Member list */}
        {displayMembers.length === 0 ? (
          <div className="py-6 px-4 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <Users size={28} className="mx-auto text-slate-400 mb-1" />
            <p className="text-xs font-bold text-slate-700">Nenhum operador cadastrado com o seu código ainda</p>
            <p className="text-[11px] text-slate-500">
              Compartilhe o seu link de convite acima para começar a registrar sua equipe mineral em tempo real no banco de dados!
            </p>
          </div>
        ) : (
          <div className="pt-2 divide-y divide-slate-100">
            {displayMembers.map(m => (
              <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">{m.phone}</span>
                  <span className="text-[10px] text-slate-400 block">Cadastrado: {m.joinDate}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                    Nível {m.level}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-600 block mt-0.5">
                    +{formatCurrency(m.commissionEarned)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
