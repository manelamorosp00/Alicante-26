import React, { useState } from 'react';
import { Language } from '../types';
import { Sunset, Coins, Calendar, Dices, Users, ArrowRight, Check } from 'lucide-react';

interface TutorialOverlayProps {
  language: Language;
  memberName: string;
  onFinish: () => void;
}

// Mini visual previews for each wizard step
const ExpensePreview = () => (
  <div className="w-full bg-[#FFF4E6] border border-[#FFD9B8] p-3 text-left shadow-[0_4px_12px_rgba(42,26,18,0.10)]">
    <div className="flex justify-between items-start mb-2">
      <div>
        <p className="text-[9px] font-mono text-art-text/40 uppercase">Exemple</p>
        <p className="text-2xl font-mono font-black text-art-orange">247.50 €</p>
      </div>
      <span className="text-lg">🍺</span>
    </div>
    <div className="flex flex-col gap-1 pt-2 border-t border-[#FFD9B8]/40">
      {([['💃 Sally', '+42€', 'text-emerald-500'], ['🍻 Lluc', '-18€', 'text-rose-400'], ['💰 Manel', '+24€', 'text-emerald-500']] as const).map(([name, bal, col]) => (
        <div key={name} className="flex justify-between text-[10px]">
          <span className="font-bold text-art-text">{name}</span>
          <span className={`font-mono font-black ${col}`}>{bal}</span>
        </div>
      ))}
    </div>
  </div>
);

const PlanPreview = () => (
  <div className="w-full bg-white border border-[#FFD9B8] p-3 text-left shadow-[0_4px_12px_rgba(42,26,18,0.10)]">
    <div className="flex justify-between items-start mb-1">
      <div>
        <span className="text-[9px] font-mono bg-[#2A1A12] text-white px-1.5 py-0.5">Dilluns 22</span>
        <p className="text-xs font-black text-art-text mt-1 uppercase">🏖️ Platja Sant Joan</p>
      </div>
      <span className="text-[9px] font-mono text-art-text/40">10:30</span>
    </div>
    <p className="text-[10px] text-art-text/60 mb-2">Arena fina, voleibol i xiringuito de luxe.</p>
    <div className="flex gap-1 items-center">
      <span className="text-[10px] font-black text-art-text">👍 4</span>
      <div className="flex gap-0.5 ml-1">
        {['💃','🍻','💰','📸'].map(e => (
          <span key={e} className="text-xs bg-art-orange/10 border border-art-orange/30 px-0.5">{e}</span>
        ))}
      </div>
    </div>
  </div>
);

const WheelPreview = () => (
  <div className="w-full bg-[#2A1A12] border border-[#FFD9B8] p-3 text-center shadow-[3px_3px_0px_0px_#FF6321]">
    <p className="text-[9px] font-mono text-white/50 uppercase mb-1">La Ruleta dels Càstigs</p>
    <p className="text-2xl mb-1">🎡</p>
    <p className="text-[10px] font-black text-art-yellow uppercase">Pagar la propera ronda!</p>
    <div className="flex justify-center gap-1 mt-2">
      {['💃','🍻','🏄‍♂️','🍕'].map(e => (
        <span key={e} className="text-xs bg-white/10 px-1 py-0.5">{e}</span>
      ))}
    </div>
  </div>
);

const ProfilePreview = () => (
  <div className="w-full bg-white border border-[#FFD9B8] p-3 text-left shadow-[0_4px_12px_rgba(42,26,18,0.10)] flex items-center gap-3">
    <div className="w-12 h-12 border border-[#FFD9B8] bg-art-orange/10 flex items-center justify-center text-2xl shrink-0">🕶️</div>
    <div>
      <p className="font-black text-xs text-art-text uppercase">Jade la Misteriosa</p>
      <p className="text-[10px] text-art-text/50 font-mono mt-0.5">✓ Compte Google vinculat</p>
      <p className="text-[10px] text-art-text/40 font-mono">🎰 Rol: Infiltrada</p>
    </div>
  </div>
);

interface Step {
  icon: React.ReactNode;
  titleCa: string; titleEn: string; titleAn: string;
  descCa: string; descEn: string; descAn: string;
  color: string;
  preview: React.ReactNode;
}

const steps: Step[] = [
  {
    icon: <Sunset className="w-10 h-10" />,
    titleCa: 'Benvingut/da a Alacant 2026! 🌴',
    titleEn: 'Welcome to Alicante 2026! 🌴',
    titleAn: '¡Bienvenío a Alacant 2026! 🌴',
    descCa: 'La teva central col·lectiva per gestionar despeses, votar plans i organitzar les Hogueras. Tot en un sol lloc.',
    descEn: 'Your squad hub for managing expenses, voting on plans, and organizing the Hogueras. All in one place.',
    descAn: 'Tu cuartel general pa\' organizar biles, votá plane\' y chungar la\' Hoguera\'. Too en un solo sítio.',
    color: 'text-art-orange',
    preview: (
      <div className="w-full bg-[#2A1A12] border border-[#FFD9B8] p-4 text-center shadow-[3px_3px_0px_0px_#FF6321]">
        <p className="text-[9px] font-mono text-white/40 uppercase mb-1">Compte enrere</p>
        <p className="text-3xl font-mono font-black text-art-yellow">5 dies</p>
        <p className="text-[10px] text-white/60 mt-1">fins les Hogueras de Alacant 🔥</p>
      </div>
    ),
  },
  {
    icon: <Coins className="w-10 h-10" />,
    titleCa: 'Despeses compartides 💰',
    titleEn: 'Shared Expenses 💰',
    titleAn: 'Biles Compartío\' 💰',
    descCa: 'Registreu qui ha pagat i quant. L\'app calcula automàticament quant deu cadascú al final del viatge.',
    descEn: 'Log who paid and how much. The app automatically calculates who owes what at the end of the trip.',
    descAn: 'Anotad quién pagó y cuánto. La app calcula automáticamente quién le debe parné a quién.',
    color: 'text-emerald-500',
    preview: <ExpensePreview />,
  },
  {
    icon: <Calendar className="w-10 h-10" />,
    titleCa: 'Itinerari i Plans 📅',
    titleEn: 'Itinerary & Plans 📅',
    titleAn: 'Itinerario y Plane\' 📅',
    descCa: 'Trobeu l\'itinerari, voteu els plans que us agraden i afegiu-ne de nous. Filtreu per dia i categoria.',
    descEn: 'Browse the itinerary, vote on plans you like, and add new ones. Filter by day and category.',
    descAn: 'Veei el itinerario, votád lo\' plane\' que mo\'en y añadíd uno\' nuevo\'.',
    color: 'text-blue-500',
    preview: <PlanPreview />,
  },
  {
    icon: <Dices className="w-10 h-10" />,
    titleCa: 'Jocs i Votacions 🎲',
    titleEn: 'Games & Polls 🎲',
    titleAn: 'Juego\' y Votasione\' 🎲',
    descCa: 'La Ruleta dels Càstigs decideix qui neteja, cuina o paga la propera ronda. Creeu enquestes per decidir plans.',
    descEn: 'The Punishment Wheel decides who cleans, cooks, or pays next round. Create polls to decide on plans.',
    descAn: 'La Ruleta de lo\' Castigaço\' desidí quién paga. Cread encuesta\' pa\' decidí plane\'.',
    color: 'text-purple-500',
    preview: <WheelPreview />,
  },
  {
    icon: <Users className="w-10 h-10" />,
    titleCa: 'El teu perfil 👤',
    titleEn: 'Your Profile 👤',
    titleAn: 'Tu Jeto 👤',
    descCa: 'A "Perfils" pots editar el teu avatar, sobrenom i rol quan vulguis. El teu compte Google queda vinculat per sempre.',
    descEn: 'In "Profiles" you can edit your avatar, nickname, and role anytime. Your Google account stays linked.',
    descAn: 'En "Perfil" cambiai tu emoji, mote y cargo cuando quierái. Tu Google queda vinculao pa siempre.',
    color: 'text-fuchsia-500',
    preview: <ProfilePreview />,
  },
];

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ language, memberName, onFinish }) => {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  const title = language === 'ca' ? current.titleCa : language === 'en' ? current.titleEn : current.titleAn;
  const desc = language === 'ca' ? current.descCa : language === 'en' ? current.descEn : current.descAn;

  return (
    <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white border-2 border-[#FFD9B8] shadow-[0_8px_32px_rgba(42,26,18,0.18)] rounded-2xl relative">

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#2A1A12]/10">
          <div
            className="h-full bg-art-orange transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-6 flex flex-col items-center text-center gap-4 pt-8">

          {/* Icon */}
          <div className={`${current.color}`}>
            {current.icon}
          </div>

          {/* First step: personalized greeting */}
          {step === 0 && (
            <p className="text-sm font-black text-art-orange uppercase tracking-wider -mb-2">
              {language === 'ca' ? `Hola, ${memberName}!` : language === 'en' ? `Hey, ${memberName}!` : `¡Ey, ${memberName}!`}
            </p>
          )}

          {/* Title */}
          <h2 className="font-display font-black text-xl uppercase text-art-text leading-tight">
            {title}
          </h2>

          {/* Description */}
          <p className="text-sm text-art-text/70 font-medium leading-relaxed">
            {desc}
          </p>

          {/* Visual preview */}
          <div className="w-full">
            {current.preview}
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full mt-1">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="flex-1 py-2.5 border border-[#FFD9B8] font-black uppercase text-xs text-art-text/60 hover:text-art-text hover:bg-[#FFF4E6] transition-all cursor-pointer rounded-2xl"
              >
                {language === 'ca' ? 'Anterior' : language === 'en' ? 'Back' : 'Atrá\''}
              </button>
            )}
            <button
              type="button"
              onClick={() => isLast ? onFinish() : setStep(s => s + 1)}
              className="flex-1 py-2.5 border border-[#FFD9B8] bg-art-orange text-white font-black uppercase text-xs shadow-[0_4px_12px_rgba(42,26,18,0.10)] hover:translate-y-[-1px] hover:shadow-[3px_5px_0px_0px_#2d2d2d] active:translate-y-0 transition-all cursor-pointer rounded-2xl flex items-center justify-center gap-1.5"
            >
              {isLast ? (
                <>
                  <Check className="w-4 h-4" />
                  {language === 'ca' ? 'Començar!' : language === 'en' ? 'Let\'s go!' : '¡A por ello!'}
                </>
              ) : (
                <>
                  {language === 'ca' ? 'Següent' : language === 'en' ? 'Next' : 'Siguient\''}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Step counter */}
          <p className="text-[10px] font-mono text-art-text/30 -mt-1">
            {step + 1} / {steps.length}
          </p>

        </div>
      </div>
    </div>
  );
};
