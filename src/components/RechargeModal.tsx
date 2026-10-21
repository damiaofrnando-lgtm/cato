import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Copy, 
  Check, 
  CreditCard, 
  ShieldCheck, 
  Gem, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  AlertCircle, 
  PhoneCall, 
  Hash, 
  FileCheck2, 
  Building 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RechargeModal: React.FC = () => {
  const { closeModal, recharge, formatCurrency } = useApp();
  
  // Channels: bfa (IBAN BFA), express (Multicaixa Express), paypay (PayPay AO)
  const [method, setMethod] = useState<'bfa' | 'express' | 'paypay'>('bfa');
  const [selectedAmount, setSelectedAmount] = useState<number>(10000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Receipt / Comprovante state
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
  const [txReferenceInput, setTxReferenceInput] = useState<string>('');
  const [proofError, setProofError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const amounts = [5000, 10000, 15000, 20000, 30000, 50000, 75000];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  // Compress and handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProofError('');
    setProofFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize to max 900px to maintain clean Firestore document size
        const canvas = document.createElement('canvas');
        const maxDim = 900;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setProofPreview(compressedDataUrl);
        } else {
          setProofPreview(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProof = () => {
    setProofPreview(null);
    setProofFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmRecharge = async () => {
    if (finalAmount <= 0) {
      setProofError('Por favor selecione ou digite um valor válido.');
      return;
    }

    if (!proofPreview) {
      setProofError('Por favor anexe a fotografia ou captura do comprovativo de pagamento.');
      return;
    }

    setIsSubmitting(true);
    setProofError('');

    try {
      const channelLabel = method === 'bfa' ? 'BFA IBAN' : method === 'express' ? 'Multicaixa Express' : 'PayPay AO';
      const senderInfoText = [
        senderName ? `Titular: ${senderName}` : '',
        txReferenceInput ? `Ref/ID: ${txReferenceInput}` : '',
      ].filter(Boolean).join(' | ');

      const res = await recharge(finalAmount, channelLabel, proofPreview, senderInfoText);
      if (res.success) {
        setSuccessMsg(res.message);
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#0284c7', '#38bdf8', '#f59e0b', '#ffffff'],
        });
        setTimeout(() => {
          closeModal();
        }, 2200);
      } else {
        setProofError(res.message || 'Erro ao processar depósito.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white border-t sm:border border-sky-200 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Gem size={17} />
            </div>
            <div>
              <h3 className="text-slate-900 font-black text-base leading-tight">
                Depósito & Alocação de Capital
              </h3>
              <p className="text-[11px] text-sky-700 font-bold">
                Sociedade Mineira de Catoca
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {successMsg ? (
          <div className="py-8 text-center space-y-3 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border-2 border-emerald-300 shadow-sm">
              <ShieldCheck size={36} />
            </div>
            <h4 className="text-lg font-black text-slate-900">Comprovativo Enviado!</h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
              {successMsg}
            </p>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 space-y-1 inline-block text-left w-full max-w-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Valor Alocado:</span>
                <span className="font-bold text-emerald-600">{formatCurrency(finalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Canal:</span>
                <span className="font-bold capitalize">{method.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-sky-700">Verificado & Registrado</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Method selection with Official Logos */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-2 block">
                Escolha o Canal de Pagamento Oficial:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* BFA */}
                <button
                  type="button"
                  onClick={() => setMethod('bfa')}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                    method === 'bfa'
                      ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-400/60 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="w-10 h-7 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center p-0.5">
                    <img 
                      src="/assets/images/bfa_logo.jpg" 
                      alt="BFA" 
                      className="w-full h-full object-contain" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-xs font-black text-slate-900 mt-1">BFA</p>
                  <p className="text-[9.5px] text-slate-500 font-mono">IBAN</p>
                </button>

                {/* Multicaixa Express */}
                <button
                  type="button"
                  onClick={() => setMethod('express')}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                    method === 'express'
                      ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-400/60 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="w-10 h-7 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center p-0.5">
                    <img 
                      src="/assets/images/express_logo.jpg" 
                      alt="Express" 
                      className="w-full h-full object-contain" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-xs font-black text-slate-900 mt-1">Express</p>
                  <p className="text-[9.5px] text-slate-500 font-mono">Telefone</p>
                </button>

                {/* PayPay AO */}
                <button
                  type="button"
                  onClick={() => setMethod('paypay')}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                    method === 'paypay'
                      ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-400/60 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="w-10 h-7 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center p-0.5">
                    <img 
                      src="/assets/images/paypay_logo.jpg" 
                      alt="PayPay" 
                      className="w-full h-full object-contain" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-xs font-black text-slate-900 mt-1">PayPay</p>
                  <p className="text-[9.5px] text-slate-500 font-mono">Referência</p>
                </button>
              </div>
            </div>

            {/* Official Deposit Data Details Box */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/50 border border-sky-200 shadow-inner space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-[10px] font-black uppercase text-sky-800 tracking-wider flex items-center gap-1">
                  <Building size={13} />
                  <span>Dados Bancários Oficiais</span>
                </span>
                <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full font-mono">
                  Depósito Seguro
                </span>
              </div>

              {/* BFA Details */}
              {method === 'bfa' && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Banco:</span>
                    <span className="font-bold text-slate-900">BFA (Banco de Fomento Angola)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Nome / Titular:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">Justino</span>
                      <button
                        type="button"
                        onClick={() => handleCopy('Justino', 'nome')}
                        className="text-sky-600 hover:text-sky-800 text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100"
                      >
                        {copiedKey === 'nome' ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-mono">IBAN BFA:</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-black text-xs text-sky-800 break-all select-all">
                        000600005833872230121
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy('000600005833872230121', 'iban')}
                        className="px-2.5 py-1 rounded-lg bg-sky-600 text-white text-[10px] font-bold shrink-0 flex items-center gap-1 active:scale-95 shadow-xs"
                      >
                        {copiedKey === 'iban' ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copiedKey === 'iban' ? 'Copiado' : 'Copiar IBAN'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Multicaixa Express Details */}
              {method === 'express' && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Serviço:</span>
                    <span className="font-bold text-slate-900">Multicaixa Express</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Nome / Destinatário:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">Justino</span>
                      <button
                        type="button"
                        onClick={() => handleCopy('Justino', 'nome')}
                        className="text-sky-600 hover:text-sky-800 text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100"
                      >
                        {copiedKey === 'nome' ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-mono">NÚMERO EXPRESS:</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-black text-sm text-sky-800 select-all tracking-wider">
                        933 191 188
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy('933191188', 'express')}
                        className="px-2.5 py-1 rounded-lg bg-sky-600 text-white text-[10px] font-bold shrink-0 flex items-center gap-1 active:scale-95 shadow-xs"
                      >
                        {copiedKey === 'express' ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copiedKey === 'express' ? 'Copiado' : 'Copiar Número'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PayPay AO Details */}
              {method === 'paypay' && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Carteira / Gateway:</span>
                    <span className="font-bold text-slate-900">PayPay Angola</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">ENTIDADE (ENT):</span>
                        <span className="font-mono font-black text-sm text-slate-900">10116</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('10116', 'ent')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1"
                      >
                        {copiedKey === 'ent' ? 'Copiado' : 'Copiar Ent'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">REFERÊNCIA (REF):</span>
                        <span className="font-mono font-black text-sm text-sky-800">935723248</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('935723248', 'ref')}
                        className="px-2.5 py-1 rounded-lg bg-sky-600 text-white text-[10px] font-bold flex items-center gap-1 active:scale-95 shadow-xs"
                      >
                        {copiedKey === 'ref' ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copiedKey === 'ref' ? 'Copiado' : 'Copiar Ref'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Amounts */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Valor a Depositar:
                </label>
                <span className="text-xs font-black text-sky-700 font-mono">
                  Total: {formatCurrency(finalAmount)}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {amounts.map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-black font-mono transition-all border ${
                      selectedAmount === amt && !customAmount
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs ring-1 ring-sky-400'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {formatCurrency(amt)}
                  </button>
                ))}
              </div>

              <div className="mt-2">
                <input
                  type="number"
                  placeholder="Ou digite outro valor em Kz..."
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            {/* Upload Comprovativo Section */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileCheck2 size={15} className="text-sky-600" />
                  <span>Comprovativo de Transferência (Obrigatório)</span>
                </label>
                {proofPreview && (
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Anexado
                  </span>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              {!proofPreview ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 px-3 border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/50 hover:bg-sky-50 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-sky-200 shadow-xs flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform">
                    <Upload size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Tirar Foto ou Anexar Comprovativo
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Captura da tela do BFA, Multicaixa Express ou talão de depósito
                    </p>
                  </div>
                </button>
              ) : (
                <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                      <img
                        src={proofPreview}
                        alt="Comprovativo Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {proofFileName || 'comprovativo_deposito.jpg'}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                        <Check size={11} />
                        <span>Pronto para confirmação</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold"
                    >
                      Trocar
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveProof}
                      className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Optional sender fields */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    Nome no Comprovativo:
                  </label>
                  <input
                    type="text"
                    placeholder="Seu nome / titular..."
                    value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    Nº de Transação / Ref:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 928410..."
                    value={txReferenceInput}
                    onChange={e => setTxReferenceInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {proofError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-1.5 animate-fadeIn">
                <AlertCircle size={14} className="shrink-0" />
                <span>{proofError}</span>
              </div>
            )}

            {/* Confirm button */}
            <button
              type="button"
              onClick={handleConfirmRecharge}
              disabled={isSubmitting || finalAmount <= 0}
              className="w-full py-3.5 rounded-2xl btn-diamond-primary text-xs font-black shadow-md active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Validando comprovativo no cofre...</span>
              ) : (
                <>
                  <Check size={16} />
                  <span>Confirmar Depósito de {formatCurrency(finalAmount)}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
