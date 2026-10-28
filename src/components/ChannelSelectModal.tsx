import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, MessageCircle, UserCheck, Copy, Check, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';

export const ChannelSelectModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    whatsappGroupUrl,
    telegramGroupUrl,
    managerWhatsAppUrl,
    managerTelegramUrl,
  } = useApp();

  const initialTab: 'group' | 'manager' =
    activeModal?.data?.type === 'manager' ? 'manager' : 'group';

  const [channelType, setChannelType] = useState<'group' | 'manager'>(initialTab);
  const [copiedLink, setCopiedLink] = useState<'whatsapp' | 'telegram' | null>(null);

  const isGroup = channelType === 'group';

  const whatsappUrl = isGroup ? whatsappGroupUrl : managerWhatsAppUrl;
  const telegramUrl = isGroup ? telegramGroupUrl : managerTelegramUrl;

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    closeModal();
  };

  const handleCopy = (url: string, key: 'whatsapp' | 'telegram') => {
    navigator.clipboard.writeText(url);
    setCopiedLink(key);
    setTimeout(() => setCopiedLink(null), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-sky-500 to-blue-600 flex items-center justify-center text-white shadow-xs">
              {isGroup ? <MessageCircle size={20} /> : <UserCheck size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-slate-900">
                  {isGroup ? 'Grupo de Discussão' : 'Gerente de Atendimento'}
                </h3>
                <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                  <ShieldCheck size={10} />
                  <span>Oficial</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Sociedade Mineira de Catoca (Saurimo)
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
          >
            <X size={17} />
          </button>
        </div>

        {/* Tab Switcher (Grupo vs Gerente) */}
        <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setChannelType('group')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              isGroup
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageCircle size={14} className={isGroup ? 'text-sky-600' : 'text-slate-400'} />
            <span>Grupo de Discussão</span>
          </button>
          <button
            type="button"
            onClick={() => setChannelType('manager')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              !isGroup
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck size={14} className={!isGroup ? 'text-emerald-600' : 'text-slate-400'} />
            <span>Gerente de Atendimento</span>
          </button>
        </div>

        {/* Informative Banner */}
        <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-start gap-2.5">
          <Sparkles size={16} className="text-sky-600 shrink-0 mt-0.5" />
          <p className="text-[11.5px] text-sky-900 leading-relaxed">
            {isGroup
              ? 'Participe da comunidade oficial de operadores para acompanhar atualizações, tirar dúvidas e trocar experiências de lavra mineral.'
              : 'Atendimento direto e individual com o Gerente oficial da Concessão Catoca para suporte técnico, depósitos e saques.'}
          </p>
        </div>

        <p className="text-xs font-bold text-slate-700 px-0.5">
          Escolha onde deseja acessar:
        </p>

        {/* Platform Selection Cards: WhatsApp & Telegram */}
        <div className="space-y-3">
          {/* 1. WHATSAPP CARD */}
          <div className="p-4 rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 hover:border-emerald-500 transition-all shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md shrink-0">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-black text-slate-900">WhatsApp</h4>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Disponível
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {isGroup ? 'Grupo oficial no WhatsApp' : 'Gerente oficial no WhatsApp'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenLink(whatsappUrl)}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>{isGroup ? 'Entrar no WhatsApp' : 'Conversar no WhatsApp'}</span>
                <ExternalLink size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleCopy(whatsappUrl, 'whatsapp')}
                className="p-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold flex items-center justify-center gap-1 shrink-0 active:scale-95 transition-all"
                title="Copiar link"
              >
                {copiedLink === 'whatsapp' ? (
                  <Check size={16} className="text-emerald-600" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
          </div>

          {/* 2. TELEGRAM CARD */}
          <div className="p-4 rounded-3xl border-2 border-sky-500/30 bg-gradient-to-br from-sky-50/70 via-white to-sky-50/30 hover:border-sky-500 transition-all shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#229ED9] text-white flex items-center justify-center shadow-md shrink-0">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.942z"/>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-black text-slate-900">Telegram</h4>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                      Disponível
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {isGroup
                      ? 'Grupo oficial no Telegram'
                      : 'Gerente no Telegram (@Anna779446)'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenLink(telegramUrl)}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-[#229ED9] hover:bg-[#1d8bc0] active:scale-98 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>{isGroup ? 'Entrar no Telegram' : 'Conversar no Telegram'}</span>
                <ExternalLink size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleCopy(telegramUrl, 'telegram')}
                className="p-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold flex items-center justify-center gap-1 shrink-0 active:scale-95 transition-all"
                title="Copiar link"
              >
                {copiedLink === 'telegram' ? (
                  <Check size={16} className="text-sky-600" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 text-center">
          <p className="text-[10px] text-slate-400">
            Canais verificados da Sociedade Mineira de Catoca • Saurimo, Angola
          </p>
        </div>
      </div>
    </div>
  );
};
