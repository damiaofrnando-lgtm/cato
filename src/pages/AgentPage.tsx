import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Briefcase, Award, CheckCircle, Gem, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AgentPage: React.FC = () => {
  const { formatCurrency } = useApp();
  const [telegramUsername, setTelegramUsername] = useState('');
  const [teamExperience, setTeamExperience] = useState('10-50');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramUsername.trim()) return;

    setSubmitted(true);
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0284c7', '#38bdf8', '#ffffff'],
    });
  };

  const salaries = [
    { rank: 'Líder Regional Júnior de Lavra', teamSize: '15 operadores ativos', salary: 150000, color: 'text-sky-700' },
    { rank: 'Supervisor de Extração Saurimo', teamSize: '40 operadores ativos', salary: 450000, color: 'text-blue-700' },
    { rank: 'Gerente Estratégico de Kimberlito', teamSize: '100 operadores ativos', salary: 1200000, color: 'text-indigo-700' },
    { rank: 'Embaixador Mineral Catoca', teamSize: '250 operadores ativos', salary: 3500000, color: 'text-amber-600' },
  ];

  return (
    <div className="pb-28 pt-2 px-4 space-y-4 max-w-md mx-auto">
      {/* Header Card */}
      <div className="diamond-crystal-card p-5 rounded-3xl border border-sky-100 shadow-md relative overflow-hidden bg-white space-y-2">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-sky-100/50 diamond-shape opacity-40 pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Briefcase size={22} />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Carreira de Agente Oficial Catoca</h2>
            <p className="text-xs text-slate-600">Receba remuneração mensal fixa + partilha mineral da mina</p>
          </div>
        </div>
      </div>

      {/* Salary table */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Award size={15} className="text-sky-600" />
          <span>Tabela de Remuneração Fixa Mensal</span>
        </h3>

        <div className="space-y-2">
          {salaries.map((s, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
            >
              <div>
                <p className={`font-black ${s.color}`}>{s.rank}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Meta: {s.teamSize}</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono">SALÁRIO FIXO</span>
                <span className="font-black text-slate-900 text-sm font-mono">
                  {formatCurrency(s.salary)} <span className="text-[10px] text-slate-500 font-normal">/mês</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Application Form */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-black text-slate-900">Candidatura para Agente Mineral</h3>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <CheckCircle size={32} className="text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">Candidatura Registrada!</h4>
            <p className="text-xs text-slate-600">
              O departamento de relações institucionais de Catoca entrará em contato via WhatsApp/Telegram em até 24 horas.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                WhatsApp ou Telegram de Contato
              </label>
              <input
                type="text"
                required
                value={telegramUsername}
                onChange={e => setTelegramUsername(e.target.value)}
                placeholder="+244 9... ou @usuario"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Experiência em Gestão de Equipes
              </label>
              <select
                value={teamExperience}
                onChange={e => setTeamExperience(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
              >
                <option value="1-10">1 a 10 membros</option>
                <option value="10-50">10 a 50 membros</option>
                <option value="50-200">50 a 200 membros</option>
                <option value="200+">Mais de 200 membros</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl btn-diamond-primary text-xs font-bold shadow-sm"
            >
              Enviar Candidatura Oficial
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
