import React from 'react';
import { useApp } from '../context/AppContext';
import { ChevronRight, BookOpen, Gem, Award, Users, ShieldCheck } from 'lucide-react';

export const NewsPage: React.FC = () => {
  const articles = [
    {
      id: '1',
      title: 'Guia do Operador: Como Funciona o Ciclo Automático de Extração 24h',
      date: '17/10/2026',
      readTime: '2 min',
      summary: 'Entenda como as usinas de tratamento mineral geram novos lotes de kimberlito a cada 24 horas e como coletar seus lucros pontualmente.',
      icon: Gem,
      color: 'text-sky-600',
    },
    {
      id: '2',
      title: 'Processo de Kimberley & Selo Internacional de Procedência Ética',
      date: '15/10/2026',
      readTime: '3 min',
      summary: 'Todos os diamantes extraídos na bacia do Cuango e Saurimo possuem certificado oficial contra diamantes de conflito.',
      icon: ShieldCheck,
      color: 'text-blue-600',
    },
    {
      id: '3',
      title: 'Como Subir de Concessão de Lavra e Multiplicar Quilates Diários',
      date: '12/10/2026',
      readTime: '3 min',
      summary: 'Concessões superiores como Tubo Central e Jazilha Real ampliam a cota diária para até 300.000 Kz/dia em rendimentos.',
      icon: Award,
      color: 'text-amber-500',
    },
    {
      id: '4',
      title: 'Rede de Parceiros Catoca: 10% de Comissão em 3 Níveis',
      date: '08/10/2026',
      readTime: '4 min',
      summary: 'Aprenda a construir sua equipe de operadores de mineração e faturar bonificações perpétuas sobre todas as extrações.',
      icon: Users,
      color: 'text-indigo-600',
    },
  ];

  return (
    <div className="pb-28 pt-2 px-4 space-y-4 max-w-md mx-auto">
      {/* Featured Story Banner: African Mining Indaba */}
      <div className="relative h-48 rounded-3xl overflow-hidden shadow-md border border-slate-200">
        <img
          src="/assets/aistudio/IMG_1490_26bb4c78.jpeg"
          alt="Catoca no African Mining Indaba"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-4 flex flex-col justify-end">
          <span className="text-[10px] font-black uppercase text-amber-300 bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 rounded-full w-fit mb-1">
            Destaque Internacional
          </span>
          <h3 className="text-sm font-black text-white leading-tight">
            Catoca em Destaque na Maior Montra da Mineração em África
          </h3>
          <p className="text-[11px] text-slate-200 mt-0.5 line-clamp-1">
            Comitiva executiva apresenta novos marcos de extração e sustentabilidade na Mining Indaba.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {articles.map(article => {
          const Icon = article.icon;
          return (
            <div
              key={article.id}
              className="bg-white p-4 rounded-3xl border border-slate-200 hover:border-sky-300 transition-all cursor-pointer space-y-2 shadow-xs"
              onClick={() => alert(`Artigo: "${article.title}"\n\n${article.summary}\n\nPara maiores informações, entre em contato com a diretoria mineral de Catoca através do suporte oficial.`)}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5 font-bold">
                  <Icon size={14} className={article.color} />
                  <span>Publicação Oficial</span>
                </span>
                <span>{article.date} · {article.readTime}</span>
              </div>

              <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                {article.title}
              </h3>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {article.summary}
              </p>

              <div className="pt-2 flex justify-between items-center text-xs text-sky-700 font-bold border-t border-slate-100">
                <span>Ler artigo completo</span>
                <ChevronRight size={14} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
