import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Sparkles, Trophy, Gem } from 'lucide-react';
import confetti from 'canvas-confetti';

export const LuckyDrawModal: React.FC = () => {
  const { closeModal, user, spinLuckyDraw, formatCurrency } = useApp();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<{ label: string; value: number } | null>(null);

  const prizes = [
    { label: '1.500 Kz', color: '#0284c7' },
    { label: '3.000 Kz', color: '#0ea5e9' },
    { label: '+3 Giros', color: '#f59e0b' },
    { label: '6.000 Kz', color: '#2563eb' },
    { label: '1.000 Kz', color: '#10b981' },
    { label: '15.000 Kz', color: '#4f46e5' },
  ];

  const handleSpin = () => {
    if (isSpinning || !user || user.luckyDrawSpins <= 0) return;

    setIsSpinning(true);
    setWonPrize(null);

    const prizeIndex = Math.floor(Math.random() * prizes.length);
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const segmentAngle = 360 / prizes.length;
    const targetAngle = 360 * extraSpins + (360 - (prizeIndex * segmentAngle + segmentAngle / 2));

    setRotation(prev => prev + targetAngle);

    setTimeout(async () => {
      const res = await spinLuckyDraw();
      setIsSpinning(false);
      if (res.success) {
        setWonPrize(res.prize);
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#0284c7', '#38bdf8', '#ffffff', '#f59e0b'],
        });
      }
    }, 3200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-sm bg-white border border-sky-200 rounded-3xl p-5 shadow-2xl relative overflow-hidden text-center">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-left">
            <Gem size={18} className="text-sky-600" />
            <h3 className="text-slate-900 font-black text-base">Roleta de Diamantes Catoca</h3>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
          >
            <X size={17} />
          </button>
        </div>

        <p className="text-xs text-slate-600 mb-3">
          Gire a roleta de gemas e ganhe bonificações imediatas em Kz para seu cofre!
        </p>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold mb-3">
          <Trophy size={14} className="text-amber-500" />
          <span>Giros Disponíveis: {user?.luckyDrawSpins ?? 0}</span>
        </div>

        {/* Wheel container */}
        <div className="relative w-64 h-64 mx-auto my-2 flex items-center justify-center">
          <div className="absolute -top-3 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-500 drop-shadow-md" />

          <div
            className="w-60 h-60 rounded-full border-4 border-slate-100 shadow-xl overflow-hidden relative transition-transform"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionDuration: isSpinning ? '3.2s' : '0s',
              transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.2, 1)',
            }}
          >
            {prizes.map((p, idx) => {
              const rotateDeg = (360 / prizes.length) * idx;
              return (
                <div
                  key={idx}
                  className="absolute top-0 left-0 w-full h-full flex justify-center pt-3 text-white font-black text-xs drop-shadow-sm select-none"
                  style={{
                    transform: `rotate(${rotateDeg}deg)`,
                    transformOrigin: '50% 50%',
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-90"
                    style={{
                      background: p.color,
                      clipPath: 'polygon(50% 50%, 21% 0%, 79% 0%)',
                    }}
                  />
                  <span className="relative z-10 pt-2 font-mono">{p.label}</span>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSpin}
            disabled={isSpinning || !user || user.luckyDrawSpins <= 0}
            className="absolute z-30 w-16 h-16 rounded-full bg-white text-slate-900 border-4 border-sky-400 font-black text-xs shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 transition-transform"
          >
            {isSpinning ? '...' : 'GIRAR'}
          </button>
        </div>

        {wonPrize && (
          <div className="mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold animate-bounce">
            🎉 Parabéns! Você ganhou {wonPrize.label}!
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100">
          <p className="text-[11px] text-slate-500">
            Ganhe mais giros ao convidar amigos ou ao alocar capital mineral.
          </p>
        </div>
      </div>
    </div>
  );
};
