import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Send, Headphones, MessageCircle, Gem } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

export const CustomerServiceModal: React.FC = () => {
  const { closeModal, openModal, managerWhatsAppUrl, whatsappGroupUrl } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: `Olá! Bem-vindo(a) à Central de Operações da Sociedade Mineira de Catoca (Saurimo). Como podemos ajudar você com seus lotes de extração 24h, concessões ou liquidação Multicaixa?`,
      time: 'Agora',
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      let reply = 'Recebemos sua mensagem! O suporte técnico aos operadores de Catoca opera 24h por dia para garantir a continuidade da extração mineral.';
      const lower = userMsg.text.toLowerCase();
      if (lower.includes('domingo') || lower.includes('parado') || lower.includes('segunda')) {
        reply = 'Aos domingos não se realizam tarefas nem extrações na mina de Catoca devido à manutenção preventiva técnica das usinas. O relógio de 24 horas para de contar e dará sequência na segunda-feira às 00:00!';
      } else if (lower.includes('saque') || lower.includes('sacar')) {
        reply = 'Os saques de rendimentos de diamantes são liquidados diretamente via rede Multicaixa Express (Angola), BAI e BFA em até 15 minutos úteis.';
      } else if (lower.includes('aloc') || lower.includes('recarga') || lower.includes('depositar')) {
        reply = 'As alocações de capital na mina de Catoca são creditadas instantaneamente mediante validação da referência bancária Multicaixa ou PIX/USDT.';
      } else if (lower.includes('tarefa') || lower.includes('lote') || lower.includes('24h') || lower.includes('relógio') || lower.includes('hora')) {
        reply = 'O ciclo de extração de diamantes dura 24 horas contínuas! Ao zerar o relógio regressivo, as usinas de tratamento mineral geram novos lotes automaticamente para sua concessão. (Lembrando que aos domingos o relógio pausa e retoma na segunda-feira).';
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: reply,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-sm bg-white border border-sky-200 rounded-3xl p-5 shadow-2xl flex flex-col h-[520px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Headphones size={18} />
            </div>
            <div>
              <h3 className="text-slate-900 font-black text-sm">Apoio ao Operador Catoca</h3>
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Mina de Saurimo Ativa 24h</span>
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <X size={17} />
          </button>
        </div>

        {/* Official Channels Banner */}
        <div className="p-3 my-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-sky-700 text-white flex flex-col gap-2 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <MessageCircle size={15} />
              </div>
              <div>
                <span className="text-[9px] uppercase font-mono text-emerald-200 block">Comunidade & Gerente</span>
                <span className="text-xs font-black">Canais Oficiais Catoca</span>
              </div>
            </div>
            <span className="text-[9.5px] bg-white/20 text-white px-2 py-0.5 rounded-full font-mono font-bold">
              Telegram & WhatsApp
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => openModal('channel_select', { type: 'group' })}
              className="px-2.5 py-1.5 rounded-xl bg-white text-emerald-800 text-[10.5px] font-black shadow-xs hover:bg-emerald-50 active:scale-95 transition-all text-center cursor-pointer"
            >
              Grupo Discussão
            </button>
            <button
              type="button"
              onClick={() => openModal('channel_select', { type: 'manager' })}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 text-white border border-white/30 text-[10.5px] font-black shadow-xs hover:bg-slate-900 active:scale-95 transition-all text-center cursor-pointer"
            >
              Falar c/ Gerente
            </button>
          </div>
        </div>

        {/* Chat message history */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-br-xs shadow-xs'
                    : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-slate-400 mt-0.5 px-1">{msg.time}</span>
            </div>
          ))}
        </div>

        {/* Quick links & input form */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-[10px]">
            <button
              onClick={() => {
                setInputText('Por que o relógio para no domingo e não tem tarefas?');
              }}
              className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap font-medium"
            >
              Domingos na Mina
            </button>
            <button
              onClick={() => {
                setInputText('Como funciona o ciclo automático de 24 horas?');
              }}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap font-medium"
            >
              Ciclo 24h
            </button>
            <button
              onClick={() => {
                setInputText('Como recebo o saque via Multicaixa Express?');
              }}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap font-medium"
            >
              Saques Multicaixa
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua dúvida sobre a mina..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={handleSend}
              className="px-3.5 py-2 rounded-xl btn-diamond-primary text-white flex items-center justify-center shadow-xs"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
