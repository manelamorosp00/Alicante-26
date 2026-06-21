import React, { useState, useEffect } from 'react';

interface Member {
  id: string;
  name: string;
  nickname?: string;
  avatarUrl: string;
}

export interface CandleDoc {
  memberId: string;
  lit: boolean;
  litAt: number | null;
}

interface SupportWidgetProps {
  language: 'ca' | 'en' | 'an';
  members: Member[];
  activeMemberId: string;
  candles: CandleDoc[];
  onToggleCandle: (memberId: string, currentlyLit: boolean) => void;
}

const EXPIRES_AT = new Date('2026-06-22T18:00:00').getTime();
const HONOREE = 'Emeline';
const HONOREE_EMOJI = '🦋';

export function SupportWidget({ language, members, activeMemberId, candles, onToggleCandle }: SupportWidgetProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (now >= EXPIRES_AT) return null;

  const remaining = EXPIRES_AT - now;
  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  const litCount = candles.filter(c => c.lit).length;
  const myCandle = candles.find(c => c.memberId === activeMemberId);
  const myLit = myCandle?.lit ?? false;

  const t = {
    cheer: { ca: 'ÀNIMS DES DE LA COLLA', en: 'CHEERS FROM THE CREW', an: 'ÁNIMOS DE LA PENA' },
    message: {
      ca: `Demà té un examen molt important. Encén la teva vela per fer-li força. 💪`,
      en: `Tomorrow she has a very important exam. Light your candle to cheer her on. 💪`,
      an: `Mañana tiene un examen mu importante. Enciende tu vela pa darle ánimo. 💪`,
    },
    disappears: { ca: 'EL WIDGET DESAPAREIX EN', en: 'WIDGET DISAPPEARS IN', an: 'EL WIDGET DESAPARECE EN' },
    crew: { ca: 'LA COLLA', en: 'THE CREW', an: 'LA PENA' },
    candlesLit: {
      ca: (n: number) => `${n} vela${n !== 1 ? 's' : ''} encesa${n !== 1 ? 's' : ''}`,
      en: (n: number) => `${n} candle${n !== 1 ? 's' : ''} lit`,
      an: (n: number) => `${n} vela${n !== 1 ? 's' : ''} encendía${n !== 1 ? 's' : ''}`,
    },
    btnOff: { ca: '🕯️ Encén la teva vela', en: '🕯️ Light your candle', an: '🕯️ Enciende tu vela' },
    btnOn: {
      ca: `🔥 Vela encesa · molta sort, ${HONOREE}!`,
      en: `🔥 Candle lit · good luck, ${HONOREE}!`,
      an: `🔥 Vela encendía · ¡mucha suerte, ${HONOREE}!`,
    },
    you: { ca: 'Tu', en: 'You', an: 'Tú' },
  };

  const L = language;

  return (
    <div
      className="mx-0 rounded-none sm:mx-4 sm:rounded-[28px] overflow-hidden border-b sm:border border-[#FFD9B8] shadow-[0_8px_32px_rgba(255,90,31,0.12)]"
      style={{ background: '#FFF4E6' }}
    >
      {/* ── Header gradient ── */}
      <div
        className="relative overflow-hidden px-5 py-4"
        style={{ background: 'linear-gradient(150deg,#FF5A1F,#E0290B)' }}
      >
        {/* Yellow halo */}
        <div
          className="absolute top-0 right-0 w-36 h-36 pointer-events-none"
          style={{
            background: 'radial-gradient(circle,rgba(255,210,63,0.4) 0%,transparent 70%)',
            transform: 'translate(30%,-30%)',
          }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shrink-0 border border-white/30">
            {HONOREE_EMOJI}
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-white/60 font-mono uppercase tracking-widest mb-0.5">
              {t.cheer[L]}
            </p>
            <h2 className="font-display font-black text-2xl sm:text-3xl uppercase text-white leading-none">
              VA, {HONOREE.toUpperCase()}!
            </h2>
            <p className="text-white/85 text-xs mt-1 leading-snug">
              {t.message[L]}
            </p>
          </div>
        </div>
      </div>

      {/* ── Countdown bar ── */}
      <div
        className="flex items-center gap-3 px-5 py-2.5"
        style={{ background: '#2A1A12' }}
      >
        <span className="text-[9px] text-white/40 font-mono uppercase tracking-widest shrink-0 hidden xs:block">
          {t.disappears[L]}
        </span>
        <span
          className="font-mono font-black text-xl sm:text-2xl tracking-wider tabular-nums"
          style={{ color: '#FFD23F' }}
        >
          {String(hours).padStart(2, '0')}h {String(minutes).padStart(2, '0')}m {String(seconds).padStart(2, '0')}s
        </span>
      </div>

      {/* ── Body ── */}
      <div className="px-5 py-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#2A1A12]/50">
            {t.crew[L]}
          </span>
          <span
            className="text-[10px] font-mono font-black uppercase tracking-widest"
            style={{ color: '#E0290B' }}
          >
            {t.candlesLit[L](litCount)}
          </span>
        </div>

        {/* Members grid */}
        <div className="grid grid-cols-5 gap-x-2 gap-y-3 mb-4">
          {members.map(member => {
            const candle = candles.find(c => c.memberId === member.id);
            const isLit = candle?.lit ?? false;
            const isMe = member.id === activeMemberId;
            const label = isMe
              ? t.you[L]
              : (member.nickname || member.name).split(' ')[0];

            return (
              <button
                key={member.id}
                type="button"
                onClick={() => isMe && onToggleCandle(member.id, isLit)}
                className={`flex flex-col items-center gap-1 transition-all select-none ${isMe ? 'cursor-pointer active:scale-95' : 'cursor-default'}`}
                aria-label={isMe ? (myLit ? 'Apaga la teva vela' : t.btnOff[L]) : label}
              >
                <div className="relative">
                  {isLit && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-base z-10 animate-bounce">
                      🔥
                    </span>
                  )}
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${
                      isLit ? 'scale-105' : 'opacity-45 grayscale'
                    }`}
                    style={
                      isLit
                        ? {
                            border: '2px solid #FF5A1F',
                            background: 'rgba(255,90,31,0.08)',
                            boxShadow: '0 0 14px rgba(255,138,0,0.7)',
                          }
                        : {
                            border: '2px dashed #ccc',
                            background: 'rgba(0,0,0,0.04)',
                          }
                    }
                  >
                    {member.avatarUrl}
                  </div>
                </div>
                <span
                  className="text-[9px] font-mono font-black truncate max-w-full leading-none"
                  style={{ color: isLit ? '#E0290B' : 'rgba(42,26,18,0.4)' }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* CTA button */}
        {activeMemberId && (
          <button
            type="button"
            onClick={() => onToggleCandle(activeMemberId, myLit)}
            className="w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]"
            style={
              myLit
                ? {
                    background: '#2A1A12',
                    color: '#FFD23F',
                    boxShadow: '0 4px 16px rgba(42,26,18,0.25)',
                  }
                : {
                    background: 'linear-gradient(135deg,#FF5A1F,#E0290B)',
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(255,90,31,0.4)',
                  }
            }
          >
            {myLit ? t.btnOn[L] : t.btnOff[L]}
          </button>
        )}
      </div>
    </div>
  );
}
