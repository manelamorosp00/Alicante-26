import React, { useState } from 'react';
import { Language } from '../types';
import { Sunset, Coins, Calendar, Dices, Users, ArrowRight, X, Check } from 'lucide-react';

interface TutorialOverlayProps {
  language: Language;
  memberName: string;
  onFinish: () => void;
}

interface Step {
  icon: React.ReactNode;
  titleCa: string;
  titleEn: string;
  titleAn: string;
  descCa: string;
  descEn: string;
  descAn: string;
  tab?: string;
  color: string;
}

const steps: Step[] = [
  {
    icon: <Sunset className="w-10 h-10" />,
    titleCa: 'Benvingut/da a Alacant 2026! 🌴',
    titleEn: 'Welcome to Alicante 2026! 🌴',
    titleAn: '¡Bienvenío a Alacant 2026! 🌴',
    descCa: 'Ets el/la coordinador/a del viatge. Aquí podràs gestionar despeses, votar plans i organitzar les Hogueras amb tots els amics.',
    descEn: 'You are the trip coordinator. Here you can manage expenses, vote on plans, and organize the Hogueras with all your friends.',
    descAn: 'Ere\' er que manda en er viaje. Aquí podrá\' chungar lo\' bile\', votá\' plane\' y organisá la\' Hoguera\' con too el equipo.',
    color: 'text-art-orange',
  },
  {
    icon: <Coins className="w-10 h-10" />,
    titleCa: 'Despeses compartides 💰',
    titleEn: 'Shared Expenses 💰',
    titleAn: 'Biles Compartío\' 💰',
    descCa: 'A la pestanya "Despeses" podeu registrar qui ha pagat i quant. L\'app calcula automàticament qui deu diners a qui al final del viatge.',
    descEn: 'In the "Expenses" tab, log who paid and how much. The app automatically calculates who owes money to whom at the end of the trip.',
    descAn: 'En la pestaña "Biles" anotáis quién pagó y cuánto. La aplimasión calcula automáticamente quién le debe parné a quién ar final.',
    tab: 'expenses',
    color: 'text-emerald-500',
  },
  {
    icon: <Calendar className="w-10 h-10" />,
    titleCa: 'Itinerari i Plans 📅',
    titleEn: 'Itinerary & Plans 📅',
    titleAn: 'Itinerario y Plane\' 📅',
    descCa: 'A "Plans" trobareu l\'itinerari del viatge. Podeu votar els plans que us agraden, afegir-ne de nous i guardar-los com a favorits.',
    descEn: 'In "Plans" you\'ll find the trip itinerary. You can vote on plans you like, add new ones, and save your favourites.',
    descAn: 'En "Plane\'" tiéi el itinerario der viaje. Podéi votá lo\' plane\' que mo\'en, añadí uno\' nuevo\' y guardarlo\' como favoritazo\'.',
    tab: 'plans',
    color: 'text-blue-500',
  },
  {
    icon: <Dices className="w-10 h-10" />,
    titleCa: 'Jocs i Votacions 🎲',
    titleEn: 'Games & Polls 🎲',
    titleAn: 'Juego\' y Votasione\' 🎲',
    descCa: 'La Ruleta dels Càstigs decideix qui neteja, cuina o paga la propera ronda. A les Votacions podeu crear enquestes per decidir plans.',
    descEn: 'The Punishment Wheel decides who cleans, cooks, or pays the next round. In Polls you can create surveys to decide on plans.',
    descAn: 'La Ruleta de lo\' Castigaço\' desidí quién friega, cuina o paga la próxima ronta. En Votasione\' crearéi encuesta\' guapísima\'.',
    tab: 'games',
    color: 'text-purple-500',
  },
  {
    icon: <Users className="w-10 h-10" />,
    titleCa: 'El teu perfil 👤',
    titleEn: 'Your Profile 👤',
    titleAn: 'Tu Jeto 👤',
    descCa: 'A "Perfils" pots editar el teu avatar, sobrenom i rol. El teu compte Google queda vinculat per sempre — la propera vegada entres automàticament.',
    descEn: 'In "Profiles" you can edit your avatar, nickname, and role. Your Google account stays linked — next time you\'ll sign in automatically.',
    descAn: 'En "Perfil" cambiai tu emoji, mote y cargo. Tu cuenta Google queda vinculá pa siempre — la próxima vé\' entrai solo.',
    tab: 'profiles',
    color: 'text-fuchsia-500',
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
      <div className="w-full max-w-md bg-white border-4 border-[#2d2d2d] shadow-[10px_10px_0px_0px_#2d2d2d] rounded-none relative">

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#2d2d2d]/10">
          <div
            className="h-full bg-art-orange transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Skip button */}
        <button
          type="button"
          onClick={onFinish}
          className="absolute top-4 right-4 text-art-text/30 hover:text-art-text/70 transition-colors cursor-pointer"
          title="Saltar tutorial"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8 pt-10 flex flex-col items-center text-center gap-5">

          {/* Step indicator */}
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-art-orange' : i < step ? 'w-3 bg-art-orange/40' : 'w-3 bg-[#2d2d2d]/15'}`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className={`${current.color} mt-1`}>
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

          {/* Actions */}
          <div className="flex gap-3 w-full mt-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="flex-1 py-2.5 border-2 border-[#2d2d2d] font-black uppercase text-xs text-art-text/60 hover:text-art-text hover:bg-[#fdfaf2] transition-all cursor-pointer rounded-none"
              >
                {language === 'ca' ? 'Anterior' : language === 'en' ? 'Back' : 'Atrá\''}
              </button>
            )}
            <button
              type="button"
              onClick={() => isLast ? onFinish() : setStep(s => s + 1)}
              className="flex-1 py-2.5 border-2 border-[#2d2d2d] bg-art-orange text-white font-black uppercase text-xs shadow-[3px_3px_0px_0px_#2d2d2d] hover:translate-y-[-1px] hover:shadow-[3px_5px_0px_0px_#2d2d2d] active:translate-y-0 transition-all cursor-pointer rounded-none flex items-center justify-center gap-1.5"
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
