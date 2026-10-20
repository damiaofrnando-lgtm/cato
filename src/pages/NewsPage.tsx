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
      {/* Header Card */}
      <div className="diamond-crystal-card p-5 rounded-3xl border border-sky-100 shadow-md relative overflow-hidden bg-white space-y-2">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-sky-100/50 diamond-shape opacity-40 pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Artigos & Certificações Catoca</h2>
            <p className="text-xs text-slate-600">Geologia, regulação Kimberley e economia mineral em Angola</p>
          </div>
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
