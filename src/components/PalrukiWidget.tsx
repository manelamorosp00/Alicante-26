import { useState } from 'react';

interface PalrukiWidgetProps {
  language: 'ca' | 'en' | 'an';
}

const T = {
  subtitle:   { ca: 'Joc de pales · 4+ jugadors', en: 'Paddle game · 4+ players', an: 'Juego de palas · 4+ jugadores' },
  clickHint:  { ca: '👆 Clica per a les regles i putades', en: '👆 Tap for rules & challenges', an: '👆 Toca pa las reglas y putadas' },
  moreInfo:   { ca: 'Més info', en: 'More info', an: 'Más info' },
  objective:  {
    ca: "L'objectiu: arribar tots junts fins al 20 sense fallar. 🍺",
    en: 'Goal: reach 20 together without missing a hit. 🍺',
    an: "El objetivo: llegá toos hasta er 20 sin fallar. 🍺",
  },
  howTitle:   { ca: 'Com es juga', en: 'How to play', an: 'Cómo se juega' },
  steps: {
    ca: [
      'Mínim 4 jugadors amb pales. Qui toca la pilota diu el número en veu alta.',
      'Es compta en alt fins a arribar a 20 entre tots, sense fallar cap toc.',
      'Qui toca al 20 inventa una putada nova. Qui falla, beu! 🍺',
      "Es torna a començar des de l'1 acumulant putades... fins que us canseu.",
    ],
    en: [
      'Minimum 4 players with paddles. Whoever hits the ball calls the number out loud.',
      'Count up to 20 together without missing a single hit.',
      'Whoever hits on 20 invents a new challenge. Whoever misses, drinks! 🍺',
      'Start again from 1 adding challenges... until you give up.',
    ],
    an: [
      'Mínimo 4 jugaores con palas. Quien toca la pelota dice er número en voz alta.',
      'Se cuenta hasta 20 entre toos, sin fallar ningún toque.',
      'Quien toca ar 20 se inventa una putada nueva. ¡Quien falla, bebe! 🍺',
      "Se vuelve a empezá desde er 1 acumulando putadas... hasta que os cansáis.",
    ],
  },
  putadesTitle: { ca: "Putades d'exemple", en: 'Example challenges', an: 'Putadas de ejemplo' },
  putades: {
    ca: [
      { num: '5',  text: 'Has de dir "four" (en anglès) en comptes de cinc.' },
      { num: '8',  text: 'Has de dir "miaaauu" 🐱' },
      { num: '13', text: 'Has de dir "12" en comptes de tretze.' },
    ],
    en: [
      { num: '5',  text: 'You must say "quatre" (in Catalan) instead of five.' },
      { num: '8',  text: 'You must say "miaaauu" 🐱' },
      { num: '13', text: 'You must say "12" instead of thirteen.' },
    ],
    an: [
      { num: '5',  text: 'Tienes que desí "four" (en inglés) en vez de cinco.' },
      { num: '8',  text: 'Tienes que desí "miaaauu" 🐱' },
      { num: '13', text: 'Tienes que desí "12" en vez de trece.' },
    ],
  },
  disclaimer: {
    ca: 'Beveu amb cap. Hidrateu-vos i aneu amb compte amb el sol. 🌞',
    en: 'Drink responsibly. Stay hydrated and watch out for the sun. 🌞',
    an: "Bebé con cabeza. Hidrataos y cuidaos der sol. 🌞",
  },
};

export function PalrukiWidget({ language: L }: PalrukiWidgetProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── Small dashboard card ── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full text-left cursor-pointer active:scale-[0.98] transition-transform"
        aria-label="Obrir regles PALRUKI"
      >
        <div
          className="relative overflow-hidden rounded-[22px] flex items-center gap-3 px-4 py-3"
          style={{ background: 'linear-gradient(150deg,#FF5A1F,#E0290B)' }}
        >
          {/* Yellow halo */}
          <div
            className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
            style={{
              background: 'radial-gradient(circle,rgba(255,210,63,0.45) 0%,transparent 70%)',
              transform: 'translate(30%,-30%)',
            }}
          />

          {/* Icon */}
          <span className="text-3xl shrink-0 relative z-10">🏓</span>

          {/* Text */}
          <div className="flex-1 min-w-0 relative z-10">
            <p className="font-display font-black text-xl uppercase text-white leading-none tracking-wide">
              PALRUKI
            </p>
            <p className="text-[10px] text-white/70 font-mono uppercase tracking-widest mt-0.5">
              {T.subtitle[L]}
            </p>
            <p className="text-[10px] text-white/50 font-mono mt-1">
              {T.clickHint[L]}
            </p>
          </div>

          {/* Info badge */}
          <div
            className="shrink-0 relative z-10 flex items-center gap-1 px-2.5 py-1.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)' }}
          >
            <span className="text-white text-lg leading-none">ⓘ</span>
            <span className="text-[10px] text-white font-mono font-black uppercase tracking-wider hidden sm:block">
              {T.moreInfo[L]}
            </span>
          </div>
        </div>
      </button>

      {/* ── Modal overlay ── */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(10,6,4,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-[24px] overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.35)] max-h-[90vh] overflow-y-auto"
            style={{ background: '#FFF4E6', border: '1px solid #FFD9B8' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              className="relative overflow-hidden px-5 py-5"
              style={{ background: 'linear-gradient(150deg,#FF5A1F,#E0290B)' }}
            >
              <div
                className="absolute top-0 right-0 w-36 h-36 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle,rgba(255,210,63,0.45) 0%,transparent 70%)',
                  transform: 'translate(30%,-30%)',
                }}
              />
              {/* Close button */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer font-black text-lg"
                aria-label="Tancar"
              >
                ×
              </button>

              <div className="relative z-10 flex items-center gap-3">
                <span className="text-4xl">🏓</span>
                <div>
                  <h2 className="font-display font-black text-3xl uppercase text-white leading-none">
                    PALRUKI
                  </h2>
                  <p className="text-[10px] text-white/65 font-mono uppercase tracking-widest mt-0.5">
                    {T.subtitle[L]}
                  </p>
                  <p className="text-white/85 text-xs mt-2 leading-snug">
                    {T.objective[L]}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal body */}
            <div className="px-5 py-5 flex flex-col gap-5">

              {/* How to play */}
              <div>
                <p
                  className="text-[10px] font-mono font-black uppercase tracking-widest mb-3"
                  style={{ color: 'rgba(42,26,18,0.45)' }}
                >
                  {T.howTitle[L]}
                </p>
                <ol className="flex flex-col gap-2">
                  {T.steps[L].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className="font-display font-black text-lg leading-none shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ color: '#E0290B', background: '#FFEAD2' }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-sm text-[#2A1A12] leading-snug pt-1">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Putades */}
              <div>
                <p
                  className="text-[10px] font-mono font-black uppercase tracking-widest mb-3"
                  style={{ color: 'rgba(42,26,18,0.45)' }}
                >
                  {T.putadesTitle[L]}
                </p>
                <div className="flex flex-col gap-2">
                  {T.putades[L].map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl"
                      style={{ background: 'white', border: '1px solid #FFD9B8' }}
                    >
                      <span
                        className="font-display font-black text-xl leading-none shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ color: '#E0290B', background: '#FFEAD2' }}
                      >
                        {p.num}
                      </span>
                      <span className="text-sm text-[#2A1A12] leading-snug">{p.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <p
                className="text-[11px] text-center font-mono leading-snug"
                style={{ color: 'rgba(42,26,18,0.4)' }}
              >
                {T.disclaimer[L]}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
