import React, { useState, useEffect } from 'react';
import { Language, Member, PlanItem, PLAN_CATEGORIES } from '../types';
import { t } from '../translations';
import { Calendar, Clock, MapPin, Heart, Plus, Compass, Star, Flame, Check, Sparkles, Euro, BookmarkCheck } from 'lucide-react';

interface ItineraryTimelineProps {
  language: Language;
  members: Member[];
  plans: PlanItem[];
  activeMemberId: string;
  onAddPlan: (plan: Omit<PlanItem, 'id' | 'votes'>) => void;
  onVotePlan: (id: string) => void;
  onToggleFavoritePlan: (id: string) => void;
  /** When set, auto-opens the add form pre-filled with these values */
  prefillPlan?: Partial<PlanItem>;
  /** Called after the prefill is consumed (to clear it in parent) */
  onPrefillConsumed?: () => void;
}

interface HogueraTemplateEvent {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  date: string;
  time: string;
  location: string;
}

const hoguerasTemplates: HogueraTemplateEvent[] = [
  {
    id: 'hoguera_planta',
    title: {
      ca: "La Plantà de la Foguera de Platja de Sant Joan 🌴",
      en: "The Plantà: Mounting Playa de San Juan Bonfire 🌴",
      an: "La Plantà de la Foguera de la Playa de San Huan 🌴",
    },
    description: {
      ca: "Es dóna el pistoletàs oficial a la nostra zona! Es planta el nostre monument gegant d'art satíric a escassos minuts de l'Airbnb.",
      en: "Official launch in our neighborhood! Watch the majestic satirical bonfire sculpture get mounted steps away from our villa.",
      an: "¡Empieça er lío de verdá en er barrio! Que se planta er monumento de cartón al ladito del xalé.",
    },
    date: '2026-06-22',
    time: '18:00',
    location: 'Avenida de la Costa Blanca (Playa de San Juan), Alicante',
  },
  {
    id: 'hoguera_mascleta',
    title: {
      ca: "Gran Mascletà Pirotècnica de Sant Joan 💥",
      en: "Mascletà: Loud Firecracker Spectacle 💥",
      an: "La Gran Masclitá de Pólvora y Trueno 💥",
    },
    description: {
      ca: "La sorollosa tradició d'Alacant! Pólvora, foc i terratrèmol sonor a la Plaça dels Estels (TRAM directe des de Platja de Sant Joan).",
      en: "The heart-throbbing tradition of Alicante! Firecrackers, smoke, and sheer rhythmic thunder at Plaza de los Luceros (accessible via TRAM from our beach).",
      an: "Er terremoto má' grande de tós. Ruido, olor a pólvora y petardasso en los Luçero' pa poné er vello de punta.",
    },
    date: '2026-06-23',
    time: '14:00',
    location: 'Plaza de los Luceros, Alicante',
  },
  {
    id: 'hoguera_ofrena',
    title: {
      ca: "Ofrena de Flors a la Mare de Déu del Remei 💐",
      en: "Flower Offering to the Virgin Mary 💐",
      an: "La Ofrenta de Flowerpot' canisla 💐",
    },
    description: {
      ca: "Milers de vestits tradicionals alacantins omplen els carrers de flors i música. Un recorregut impressionant que arriba a l'Ajuntament de nit.",
      en: "Thousands of locals dressed in stunning traditional attire parade with music, building a gigantic flower tapestry in the Town Hall square.",
      an: "To' los alicantino' con trahe de gala endosando ramazos de flore' pa tapissar la plaça del Ayuntamiento de noche, de lo má' chulo.",
    },
    date: '2026-06-23',
    time: '19:00',
    location: 'Plaza del Ayuntamiento / Rambla de Alicante',
  },
  {
    id: 'hoguera_nit_mar',
    title: {
      ca: "Nit Màgica de Sant Joan i Grans Creus a la Platja 🔥🌊",
      en: "Magical Night of Sant Joan on the Beach 🔥🌊",
      an: "La Noche de San Huan y Bañito de Media Noche 🔥🌊",
    },
    description: {
      ca: "La nit estel·lar! Sopar fred a la Platja de Sant Joan, cremar desitjos en petites fogueres a la sorra i saltar les 7 onades a mitjanit d'Alacant.",
      en: "The absolute highlights night! Chill dinner on San Juan sand, write and burn wishes in small beach-side fires, and jump 7 waves at midnight.",
      an: "¡Er grande de los grande'! Çopita canalla a la solana en la arena, saltar las siete olitah a las doçe y de quemar lo' deseo' en er fuego.",
    },
    date: '2026-06-23',
    time: '23:00',
    location: 'Playa de San Juan (Zona de Arena / Xiringuitos)',
  },
  {
    id: 'hoguera_crema',
    title: {
      ca: "La Cremà dels Monuments i la Pirotècnia 'Banyà' 🚒🔥",
      en: "La Cremà: Burning of the Bonfires and 'Banyà' 🚒🔥",
      an: "La Cremá y Pistonaso de Ağuita con Bombero' 🚒🔥",
    },
    description: {
      ca: "A mitjanit es crema la gran Foguera del nostre barri de Sant Joan. Assistirem a la 'banyà', on els bombers ens mullen amb les mànegues per refrescar!",
      en: "At midnight, our local Playa de San Juan bonfire sculpture is set on fire. Participate in the legendary 'banyà' dusing to stay cool!",
      an: "Meten fuego ar casoplón de cartón de la playa de noche. Y lo' bombero' te asoplan con la manguera en la 'banyà' pa' d'escorfarse de risa.",
    },
    date: '2026-06-24',
    time: '23:59',
    location: 'Avenida de la Costa Blanca, Playa de San Juan',
  },
  {
    id: 'hoguera_castell_focs',
    title: {
      ca: "Concurs Internacional d'Espectacles de Focs al Postiguet 🎆",
      en: "International Maritime Fireworks Competition 🎆",
      an: "Er Concurço de Cohete' canijo' en er mar 🎆",
    },
    description: {
      ca: "Primer gran castell de focs artificials de la competició nacional. Es llança directament des de l'espigó de la Platja del Postiguet i llueix colossal.",
      en: "The first major show of the spectacular international fireworks competition over the sea. Best viewed with beers on Postiguet beach sand.",
      an: "Er pistoletaso de cohetasso' de luce' de colore' colosale' canisla' encendido' en medio er mar de la playa del Postigué.",
    },
    date: '2026-06-25',
    time: '23:59',
    location: 'TRAM Playa del Postiguet, Alicante',
  },
];

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({
  language,
  members,
  plans,
  activeMemberId,
  onAddPlan,
  onVotePlan,
  onToggleFavoritePlan,
  prefillPlan,
  onPrefillConsumed,
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'calendar' | 'hogueras'>('calendar');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // New Plan Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-06-22');
  const [time, setTime] = useState('12:05');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [requiresReservation, setRequiresReservation] = useState(false);

  // When prefillPlan arrives, open the form pre-populated
  useEffect(() => {
    if (prefillPlan) {
      setTitle(prefillPlan.title ?? '');
      setDescription(prefillPlan.description ?? '');
      setDate(prefillPlan.date ?? '2026-06-22');
      setTime(prefillPlan.time ?? '20:00');
      setLocation(prefillPlan.location ?? '');
      setCategory(prefillPlan.category ?? '');
      setEstimatedPrice(prefillPlan.estimatedPrice ?? '');
      setRequiresReservation(prefillPlan.requiresReservation ?? false);
      setActiveSubTab('calendar');
      setShowAddForm(true);
      onPrefillConsumed?.();
    }
  }, [prefillPlan]); // eslint-disable-line react-hooks/exhaustive-deps

  const tripDays = [
    { date: '2026-06-22', key: 'dayCa', label: 'Dll 22', full: 'Dilluns 22/06' },
    { date: '2026-06-23', key: 'dayMa', label: 'Dmt 23', full: 'Dimarts 23/06' },
    { date: '2026-06-24', key: 'dayMe', label: 'Dmc 24', full: 'Dimecres 24/06' },
    { date: '2026-06-25', key: 'dayJo', label: 'Dj 25', full: 'Dijous 25/06' },
    { date: '2026-06-26', key: 'dayVe', label: 'Dv 26', full: 'Divendres 26/06' },
  ];

  const localT: Record<string, Record<Language, string>> = {
    subTabItinerary: {
      ca: "📅 El Nostre Itinerari",
      en: "📅 Our Group Calendar",
      an: "📅 Er Calendario Compartío",
    },
    subTabHogueras: {
      ca: "🔥 Programa de Fogueres '26",
      en: "🔥 Hogueras '26 Agenda",
      an: "🔥 Er Rebollo de Hoguera' '26",
    },
    hoguerasIntroTitle: {
      ca: "Agenda de les Fogueres de Sant Joan 2026 (Zona Platja Sant Joan)",
      en: "Hogueras de Sant Joan 2026 Agenda (Playa de San Juan stay zone)",
      an: "Agenda de Fogueras de Alacant 2026 (Cerca de nue'tro xalé)",
    },
    hoguerasIntroDesc: {
      ca: "Aquesta és la selecció oficial dels millors actes i esdeveniments de les festes de les Fogueres 2026 a Platja de Sant Joan (al costat de l'Airbnb) i rodalies de la ciutat durant els nostres dies de viatge (22 al 26 de juny). Vota quines t'agraden, fes-les preferides o afegeix-les a l'itinerari general amb un clic per coordinar-nos!",
      en: "This is the official selection of top activities and events during Hogueras 2026 in Playa de San Juan (right by our Airbnb villa) and town center during our trip dates (June 22 to 26). Upvote them, mark them as favorite, or add them with a click to our shared group calendar to stay coordinated!",
      an: "Aquí tieni' la cantera de lo' mehore' líos y cohetes de la' fiesta de la' Hoguera' 2026 en la zona de la Playa (ar lao del xalé) y er sentro. ¡Vota tu jeto, dale a faborito o súmalo ar calendario con un click!",
    },
    addToCalendar: {
      ca: "Afegir a l'Itinerari",
      en: "Add to Itinerary",
      an: "Súmalo ar Calendario",
    },
    addedSuccess: {
      ca: "Afegit a l'Itinerari ✓",
      en: "In Our Calendar ✓",
      an: "Apuntaíto en Itinerario ✓",
    },
    favoritesFilter: {
      ca: "Només Preferits ⭐",
      en: "Favorites Only ⭐",
      an: "Çolo lo' faborito' ⭐",
    },
    allPlansFilter: {
      ca: "Tots els Plans",
      en: "All Plans",
      an: "To' lo' Plane'",
    },
    importedTag: {
      ca: "🌴 Foguera Oficial",
      en: "🌴 Official Hoguera",
      an: "🌴 Fiesta Oficial",
    },
    categoryLabel: {
      ca: "Categoria",
      en: "Category",
      an: "Categoría",
    },
    priceLabel: {
      ca: "Preu estimat (opcional)",
      en: "Estimated price (optional)",
      an: "Precio estimao (opsional)",
    },
    reservationLabel: {
      ca: "Requereix reserva prèvia",
      en: "Requires reservation",
      an: "Necesita rese'va",
    },
    filterCategory: {
      ca: "Totes les Categories",
      en: "All Categories",
      an: "To' lo' Tipo'",
    },
  };

  const getDayName = (dateStr: string) => {
    const matched = tripDays.find(d => d.date === dateStr);
    if (matched) {
      return translationsCustom[language]?.[matched.key] || matched.full;
    }
    return dateStr;
  };

  const translationsCustom: Record<Language, Record<string, string>> = {
    ca: { dayCa: 'Dilluns 22/06', dayMa: 'Dimarts 23/06', dayMe: 'Dimecres 24/06', dayJo: 'Dijous 25/06', dayVe: 'Divendres 26/06' },
    en: { dayCa: 'Monday 22/06', dayMa: 'Tuesday 23/06', dayMe: 'Wednesday 24/06', dayJo: 'Thursday 25/06', dayVe: 'Friday 26/06' },
    an: { dayCa: 'Lune\' 22/06', dayMa: 'Marte\' 23/06', dayMe: 'Miércole\' 24/06', dayJo: 'Hueve\' 25/06', dayVe: 'Vierne\' 26/06' },
  };

  const baseFiltered = plans.filter(p => {
    if (selectedDay !== 'all' && p.date !== selectedDay) return false;
    if (selectedCategory !== 'all') {
      const cat = PLAN_CATEGORIES.find(c => c.id === selectedCategory);
      if (cat && p.category !== cat.label) return false;
    }
    if (showFavoritesOnly) {
      const favList = p.favorites || [];
      return favList.includes(activeMemberId);
    }
    return true;
  });

  const filteredPlans = [...baseFiltered].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  const handlesSubmitPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onAddPlan({
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      location: location.trim(),
      ...(category ? { category } : {}),
      ...(estimatedPrice.trim() ? { estimatedPrice: estimatedPrice.trim() } : {}),
      ...(requiresReservation ? { requiresReservation: true } : {}),
    });

    setTitle('');
    setDescription('');
    setLocation('');
    setCategory('');
    setEstimatedPrice('');
    setRequiresReservation(false);
    setShowAddForm(false);
  };

  const handlesImportHoguera = (template: HogueraTemplateEvent) => {
    const titleText = template.title[language] || template.title['ca'];
    const descText = template.description[language] || template.description['ca'];

    // Check if duplicate exists
    const duplicate = plans.some(p => p.title === titleText);
    if (duplicate) return;

    onAddPlan({
      title: titleText,
      description: descText,
      date: template.date,
      time: template.time,
      location: template.location,
      isHogueraEvent: true,
      category: '🔥 Fogueres',
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 py-2">

      {/* Sub-Tabs Selector Bar */}
      <div className="flex border-b-4 border-[#2d2d2d] bg-white gap-2 p-1 select-none shadow-[2px_2px_0px_0px_#2d2d2d]">
        <button
          type="button"
          onClick={() => setActiveSubTab('calendar')}
          className={`flex-1 py-3 text-center text-xs md:text-sm font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === 'calendar'
              ? 'bg-art-orange text-white border-2 border-[#2d2d2d] shadow-[2px_2px_0px_0px_#2d2d2d]'
              : 'text-art-text hover:bg-art-bg'
          }`}
        >
          {localT.subTabItinerary[language]}
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('hogueras')}
          className={`flex-1 py-3 text-center text-xs md:text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'hogueras'
              ? 'bg-art-yellow text-art-text border-2 border-[#2d2d2d] shadow-[2px_2px_0px_0px_#2d2d2d]'
              : 'text-art-text hover:bg-art-bg'
          }`}
        >
          <Flame className="w-4 h-4 text-art-orange shrink-0 animate-pulse" />
          {localT.subTabHogueras[language]}
        </button>
      </div>

      {/* RENDER TAB 1: GROUP CALENDAR */}
      {activeSubTab === 'calendar' && (
        <>
          {/* Calendar top controls */}
          <div className="flex flex-col gap-3">
            {/* Row 1: Day filters + action buttons */}
            <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
              {/* Day Toggles */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#fdfaf2] w-full md:w-auto">
                <button
                  key="all"
                  type="button"
                  onClick={() => setSelectedDay('all')}
                  className={`px-3 py-2 border-2 border-[#2d2d2d] text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap select-none cursor-pointer ${selectedDay === 'all' ? 'bg-[#2d2d2d] text-white shadow-[2px_2px_0px_0px_#2d2d2d]' : 'bg-white text-art-text hover:bg-[#fdfaf2] hover:translate-y-[-1px]'}`}
                >
                  {language === 'ca' ? 'Tots els dies' : language === 'en' ? 'All Days' : 'To\' lo\' día\''}
                </button>
                {tripDays.map((td) => (
                  <button
                    key={td.date}
                    type="button"
                    onClick={() => setSelectedDay(td.date)}
                    className={`px-3 py-2 border-2 border-[#2d2d2d] text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap select-none cursor-pointer ${selectedDay === td.date ? 'bg-art-orange text-white shadow-[2px_2px_0px_0px_#2d2d2d]' : 'bg-white text-art-text hover:bg-[#fdfaf2] hover:translate-y-[-1px]'}`}
                  >
                    {td.label}
                  </button>
                ))}
              </div>

              {/* Right Action buttons */}
              <div className="flex items-center gap-2.5 w-full md:w-auto">
                {/* Only Favorites toggler */}
                <button
                  type="button"
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`flex-1 md:flex-none py-2 px-3 border-2 border-[#2d2d2d] text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#2d2d2d] ${
                    showFavoritesOnly
                      ? 'bg-art-yellow text-art-text translate-y-[1px]'
                      : 'bg-white text-art-text hover:bg-art-bg'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-art-text text-art-text' : 'text-art-text'}`} />
                  <span>{localT.favoritesFilter[language]}</span>
                </button>

                {/* Add plan button */}
                <button
                  type="button"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex-1 md:flex-none py-2 px-4 border-2 border-[#2d2d2d] text-art-text font-display text-xs font-black uppercase tracking-wider bg-art-yellow hover:bg-art-yellow/85 shadow-[3px_3px_0px_0px_#2d2d2d] hover:translate-y-[-1px] flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none"
                >
                  <Plus className="w-4 h-4 stroke-[3px]" />
                  {t('addPlanBtn', language)}
                </button>
              </div>
            </div>

            {/* Row 2: Category filter chips */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 border-2 border-[#2d2d2d] text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap select-none cursor-pointer ${selectedCategory === 'all' ? 'bg-[#2d2d2d] text-white' : 'bg-white text-art-text hover:bg-[#fdfaf2]'}`}
              >
                {localT.filterCategory[language]}
              </button>
              {PLAN_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)}
                  className={`px-3 py-1.5 border-2 border-[#2d2d2d] text-xs font-bold transition-all whitespace-nowrap select-none cursor-pointer ${selectedCategory === cat.id ? 'bg-art-orange text-white shadow-[2px_2px_0px_0px_#2d2d2d]' : 'bg-white text-art-text hover:bg-[#fdfaf2]'}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* New Custom Plan Form */}
          {showAddForm && (
            <div className="bg-white border-2 border-[#2d2d2d] p-6 shadow-[6px_6px_0px_0px_#2d2d2d] max-w-xl self-end w-full animate-fadeIn border-t-8 border-t-art-orange">
              <h3 className="font-display font-black uppercase text-base text-art-text mb-3 flex items-center gap-2">
                <Compass className="w-5 h-5 text-art-orange" />
                {t('addPlanBtn', language)}
              </h3>

              <form onSubmit={handlesSubmitPlan} className="flex flex-col gap-4 text-xs md:text-sm">
                <div>
                  <label htmlFor="plan-title" className="block text-xs font-black uppercase tracking-wider text-art-text/60 mb-1">
                    {t('planTitleField', language)}
                  </label>
                  <input
                    id="plan-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={language === 'ca' ? 'ex: Sopar al Port o Bany de nit' : language === 'en' ? 'e.g., Yacht tour or Sunset beers' : 'ej: Çopilla o Arreho de bañasera'}
                    className="w-full px-4 py-2.5 border-2 border-[#2d2d2d] bg-white font-medium focus:bg-art-bg/20 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label htmlFor="plan-desc" className="block text-xs font-black uppercase tracking-wider text-art-text/60 mb-1">
                    {t('planDescField', language)}
                  </label>
                  <textarea
                    id="plan-desc"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder={language === 'ca' ? 'Explica la idea de forma divertida...' : language === 'en' ? 'Explain what we will do...' : 'Suelta la película...'}
                    className="w-full px-4 py-2.5 border-2 border-[#2d2d2d] bg-white font-medium focus:bg-art-bg/20 focus:outline-hidden"
                  />
                </div>

                {/* Category + Price row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="plan-category" className="block text-xs font-black uppercase tracking-wider text-art-text/60 mb-1">
                      {localT.categoryLabel[language]}
                    </label>
                    <select
                      id="plan-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-[#2d2d2d] bg-white font-bold focus:outline-hidden cursor-pointer text-sm"
                    >
                      <option value="">— Sense categoria</option>
                      {PLAN_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.label}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="plan-price" className="block text-xs font-black uppercase tracking-wider text-art-text/60 mb-1">
                      {localT.priceLabel[language]}
                    </label>
                    <input
                      id="plan-price"
                      type="text"
                      value={estimatedPrice}
                      onChange={(e) => setEstimatedPrice(e.target.value)}
                      placeholder="ex: 15€/pp, 30€, Gratis"
                      className="w-full px-3 py-2.5 border-2 border-[#2d2d2d] bg-white font-medium focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="plan-date" className="block text-xs font-black uppercase tracking-wider text-art-text/60 mb-1">
                      {t('planDateField', language)}
                    </label>
                    <select
                      id="plan-date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-[#2d2d2d] bg-white font-mono font-bold focus:outline-hidden cursor-pointer"
                    >
                      {tripDays.map(td => (
                        <option key={td.date} value={td.date}>
                          {td.full}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="plan-time" className="block text-xs font-black uppercase tracking-wider text-art-text/60 mb-1">
                      {t('planTimeField', language)}
                    </label>
                    <input
                      id="plan-time"
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-[#2d2d2d] bg-white font-mono font-bold focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="plan-location" className="block text-xs font-black uppercase tracking-wider text-art-text/60 mb-1">
                    {t('planLocationField', language)}
                  </label>
                  <input
                    id="plan-location"
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="ex: Tabarca island / Playa del Postiguet"
                    className="w-full px-4 py-2.5 border-2 border-[#2d2d2d] bg-white font-medium focus:outline-hidden"
                  />
                </div>

                {/* Reservation checkbox */}
                <label className="flex items-center gap-3 cursor-pointer select-none group">
                  <div
                    className={`w-5 h-5 border-2 border-[#2d2d2d] flex items-center justify-center transition-all shrink-0 ${requiresReservation ? 'bg-art-orange' : 'bg-white group-hover:bg-art-bg'}`}
                    onClick={() => setRequiresReservation(!requiresReservation)}
                  >
                    {requiresReservation && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={requiresReservation}
                    onChange={(e) => setRequiresReservation(e.target.checked)}
                    className="sr-only"
                  />
                  <span className="text-xs font-black uppercase tracking-wider text-art-text/70">
                    <BookmarkCheck className="w-3.5 h-3.5 inline mr-1 text-art-orange" />
                    {localT.reservationLabel[language]}
                  </span>
                </label>

                <div className="flex gap-2 justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="py-2.5 px-4 border-2 border-[#2d2d2d] bg-white text-art-text font-black uppercase tracking-wider hover:bg-art-bg shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-y-[-1px] text-xs transition-all cursor-pointer select-none"
                  >
                    {t('cancelBtn', language)}
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-5 border-2 border-[#2d2d2d] bg-art-orange text-white font-black uppercase tracking-wider hover:bg-art-orange/85 shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-y-[-1px] text-xs transition-all cursor-pointer"
                  >
                    {t('submitPlan', language)}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Chronological List of Group Plans */}
          {filteredPlans.length === 0 ? (
            <div className="bg-white border-2 border-[#2d2d2d] shadow-[6px_6px_0px_0px_#2d2d2d] py-14 px-6 text-center flex flex-col items-center justify-center animate-fadeIn">
              <Calendar className="text-art-orange/30 w-12 h-12 mb-3 animate-bounce" />
              <h3 className="text-art-text font-display font-black uppercase text-sm">
                {showFavoritesOnly
                  ? (language === 'ca' ? 'No tens cap pla preferit guardat' : language === 'en' ? 'No favorite plans matching filters' : 'No tieni\' plane\' faborito\' canijo')
                  : (language === 'ca' ? 'No hi ha cap pla amb els filtres seleccionats' : language === 'en' ? 'No plans match the selected filters' : '¡Tranquilos! No hay cantera de planes')}
              </h3>
              <p className="text-xs text-art-text/60 mt-1 max-w-sm font-medium">
                {language === 'ca' ? 'Canvia el filtre de dia o categoria, o afegeix un pla nou!' : language === 'en' ? 'Try changing the day or category filter, or add a new plan!' : 'Cambia er filtro o llança un planeo der bote.'}
              </p>
            </div>
          ) : (
            <div className="relative border-l-4 border-[#2d2d2d] pl-6 ml-4 flex flex-col gap-6">
              {filteredPlans.map((plan) => {
                const planVotes = plan.votes || [];
                const planFavorites = plan.favorites || [];
                const hasVoted = planVotes.includes(activeMemberId);
                const isFavorited = planFavorites.includes(activeMemberId);

                return (
                  <div key={plan.id} className={`relative group p-6 bg-white border-2 border-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] hover:shadow-[6px_6px_0px_0px_#2d2d2d] hover:translate-y-[-1px] transition-all animate-fadeIn ${plan.isHogueraEvent ? 'border-l-8 border-l-art-orange' : ''}`}>

                    {/* Position Pointer Orb */}
                    <div className="absolute -left-[32px] top-6 w-4.5 h-4.5 rounded-full border-2 border-[#2d2d2d] bg-white group-hover:bg-art-orange transition-all flex items-center justify-center shadow-3xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-white animate-pulse"></div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex flex-col gap-1.5 flex-1">
                        {/* Plan Tag Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-[#2d2d2d] text-white font-mono font-bold px-2 py-1 text-[10px] md:text-xs flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {plan.time}
                          </span>
                          {selectedDay === 'all' && (
                            <span className="bg-white border-2 border-[#2d2d2d] text-art-text font-mono font-bold px-2 py-1 text-[10px] sm:text-xs flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {getDayName(plan.date)}
                            </span>
                          )}
                          {plan.isHogueraEvent && (
                            <span className="bg-[#fff3e0] text-art-orange border-2 border-art-orange font-mono font-black uppercase px-2 py-0.5 text-[9px] flex items-center gap-1 leading-none select-none">
                              <Flame className="w-3 h-3 text-art-orange shrink-0" />
                              {localT.importedTag[language]}
                            </span>
                          )}
                          {/* Category badge */}
                          {plan.category && (
                            <span className="bg-white border-2 border-[#2d2d2d]/40 text-art-text/70 font-mono font-bold px-2 py-0.5 text-[9px] leading-none select-none">
                              {plan.category}
                            </span>
                          )}
                          {/* Reservation badge */}
                          {plan.requiresReservation && (
                            <span className="bg-amber-50 border-2 border-amber-500 text-amber-700 font-mono font-bold px-2 py-0.5 text-[9px] leading-none select-none flex items-center gap-1">
                              <BookmarkCheck className="w-3 h-3" />
                              {language === 'ca' ? 'Reserva' : language === 'en' ? 'Reservation' : 'Rese\'va'}
                            </span>
                          )}
                          {/* Price badge */}
                          {plan.estimatedPrice && (
                            <span className="bg-emerald-50 border-2 border-emerald-500 text-emerald-700 font-mono font-bold px-2 py-0.5 text-[9px] leading-none select-none flex items-center gap-1">
                              <Euro className="w-3 h-3" />
                              {plan.estimatedPrice}
                            </span>
                          )}
                        </div>

                        <h4 className="text-base sm:text-lg font-display font-black uppercase text-art-text mt-1.5 flex items-center gap-2 flex-wrap">
                          {plan.title}
                          {isFavorited && <Star className="w-4 h-4 text-art-yellow fill-art-yellow shrink-0 animate-bounce" />}
                        </h4>

                        <p className="text-xs sm:text-sm text-art-text/85 font-medium leading-relaxed max-w-3xl">
                          {plan.description}
                        </p>

                        {plan.location && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plan.location)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex self-start items-center gap-1.5 font-mono font-bold text-[10px] uppercase text-art-orange bg-white border-2 border-art-orange/40 hover:border-art-orange px-2.5 py-1 transition-all mt-2.5 shadow-[1px_1px_0px_0px_#2d2d2d] hover:shadow-[2px_2px_0px_0px_#2d2d2d]"
                          >
                            <MapPin className="w-3.5 h-3.5 text-art-orange" />
                            <span className="max-w-[200px] truncate">{plan.location}</span>
                          </a>
                        )}
                      </div>

                      {/* Micro interaction buttons: Upvote & Favorite */}
                      <div className="flex flex-col sm:flex-row md:flex-col items-end gap-3 justify-between sm:justify-start shrink-0">
                        {/* Vote Action + Heart */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onVotePlan(plan.id)}
                            className={`py-2 px-3 border-2 border-[#2d2d2d] flex items-center gap-1.5 transition-all text-xs font-black uppercase tracking-wider cursor-pointer select-none ${
                              hasVoted
                                ? 'bg-rose-50 text-rose-600 shadow-[2px_2px_0px_0px_#2d2d2d]'
                                : 'bg-white text-art-text hover:bg-art-bg shadow-[2px_2px_0px_0px_#2d2d2d]'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 transition-transform ${hasVoted ? 'fill-rose-500 text-rose-500' : 'text-art-text'}`} />
                            <span>{planVotes.length} {language === 'ca' ? 'Vots' : language === 'en' ? 'Votes' : 'Voto\''}</span>
                          </button>

                          {/* Personal Favorite STAR */}
                          <button
                            type="button"
                            onClick={() => onToggleFavoritePlan(plan.id)}
                            className={`p-2 border-2 border-[#2d2d2d] flex items-center justify-center transition-all cursor-pointer select-none ${
                              isFavorited
                                ? 'bg-[#fffde7] text-art-yellow shadow-[2px_2px_0px_0px_#2d2d2d]'
                                : 'bg-white text-art-text hover:bg-art-bg shadow-[2px_2px_0px_0px_#2d2d2d]'
                            }`}
                            title={language === 'ca' ? 'Marcar favorit' : language === 'en' ? 'Toggle favorite' : 'Faborito'}
                          >
                            <Star className={`w-4 h-4 ${isFavorited ? 'fill-art-yellow text-art-yellow' : 'text-art-text'}`} />
                          </button>
                        </div>

                        {/* Avatars Grid indicator */}
                        <div className="flex flex-col gap-1 items-end pt-1">
                          {/* Upvoters */}
                          {planVotes.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap justify-end">
                              <span className="text-[9px] font-mono font-black text-art-text/45 uppercase">Vots:</span>
                              <div className="flex -space-x-1 overflow-hidden py-0.5">
                                {planVotes.map((voterId) => {
                                  const user = members.find(m => m.id === voterId);
                                  if (!user) return null;
                                  return (
                                    <span
                                      key={voterId}
                                      title={user.nickname || user.name}
                                      className="w-5 h-5 border border-[#2d2d2d] rounded-full bg-white flex items-center justify-center text-xs shadow-3xs cursor-default select-none"
                                    >
                                      {user.avatarUrl}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Favoriters */}
                          {planFavorites.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap justify-end">
                              <span className="text-[9px] font-mono font-black text-art-text/45 uppercase text-amber-600">★ Favs:</span>
                              <div className="flex -space-x-1 overflow-hidden py-0.5">
                                {planFavorites.map((favId) => {
                                  const user = members.find(m => m.id === favId);
                                  if (!user) return null;
                                  return (
                                    <span
                                      key={favId}
                                      title={`${user.nickname || user.name} (Fav)`}
                                      className="w-5 h-5 border border-art-yellow rounded-full bg-white flex items-center justify-center text-[10px] shadow-3xs cursor-default select-none animate-pulse"
                                    >
                                      {user.avatarUrl}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* RENDER TAB 2: HOGUERAS AGENDA EXPLORER */}
      {activeSubTab === 'hogueras' && (
        <div className="flex flex-col gap-6 animate-fadeIn" id="hogueras-special-agenda-view">

          {/* Informative Header board */}
          <div className="bg-[#2d2d2d] border-2 border-[#2d2d2d] p-6 text-white shadow-[4px_4px_0px_0px_#FF6321] relative overflow-hidden flex flex-col gap-2">
            <div className="absolute right-[-10px] bottom-[-20px] w-24 h-24 text-art-orange/15 transform rotate-30 font-mono select-none pointer-events-none text-9xl">
              🔥
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="text-art-yellow w-5 h-5 shrink-0 animate-bounce" />
              <h3 className="font-display font-black uppercase text-base text-art-yellow tracking-wide">
                {localT.hoguerasIntroTitle[language]}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-semibold max-w-3xl relative z-10">
              {localT.hoguerasIntroDesc[language]}
            </p>
          </div>

          {/* List of preset Hogueras events */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            {hoguerasTemplates.map((template) => {
              const titleText = template.title[language] || template.title['ca'];
              const descText = template.description[language] || template.description['ca'];

              // Find matching imported active plan
              const importedPlan = plans.find(p => p.title === titleText);
              const isImported = !!importedPlan;

              // Extract stats if already imported
              const planVotes = importedPlan?.votes || [];
              const planFavorites = importedPlan?.favorites || [];
              const hasVoted = planVotes.includes(activeMemberId);
              const isFavorited = planFavorites.includes(activeMemberId);

              return (
                <div key={template.id} className={`p-5 bg-white border-2 border-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] hover:shadow-[6px_6px_0px_0px_#2d2d2d] flex flex-col justify-between gap-4 transition-all ${isImported ? 'border-t-8 border-t-art-orange' : 'border-t-8 border-t-[#2d2d2d]/30'}`}>
                  <div className="flex flex-col gap-2">
                    {/* Date badge */}
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-[#2d2d2d] text-white font-mono font-bold px-2 py-0.5 text-[10px] flex items-center gap-1 leading-none select-none">
                          <Calendar className="w-3.5 h-3.5" />
                          {getDayName(template.date)}
                        </span>
                        <span className="bg-white border border-[#2d2d2d] text-art-text font-mono font-bold px-2 py-0.5 text-[10px] flex items-center gap-1 leading-none select-none">
                          <Clock className="w-3.5 h-3.5 text-art-orange" />
                          {template.time}
                        </span>
                      </div>

                      {isImported && (
                        <span className="bg-[#e8f5e9] text-emerald-800 border-2 border-emerald-800 font-mono font-black uppercase text-[8px] px-1.5 py-0.5 leading-none select-none animate-pulse">
                          {language === 'ca' ? 'ACTIU ✓' : 'ON CALENDAR ✓'}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-display font-black uppercase text-art-text mt-1.5">
                      {titleText}
                    </h4>

                    <p className="text-xs text-art-text/80 font-medium leading-relaxed">
                      {descText}
                    </p>

                    <span className="inline-flex self-start items-center gap-1.5 font-mono font-bold text-[9px] uppercase text-art-text/50 bg-[#e0f2fe]/40 border border-[#2d2d2d]/10 px-2 py-1 tracking-wider mt-1.5">
                      <MapPin className="w-3 h-3 text-art-blue" />
                      <span className="max-w-[170px] sm:max-w-[220px] truncate">{template.location}</span>
                    </span>
                  </div>

                  {/* Actions area inside card */}
                  <div className="pt-3 border-t-2 border-[#2d2d2d]/10 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">

                    {/* Imported Plan status metrics */}
                    {isImported && importedPlan ? (
                      <div className="flex items-center gap-2">
                        {/* Vote */}
                        <button
                          type="button"
                          onClick={() => onVotePlan(importedPlan.id)}
                          className={`py-1.5 px-2.5 border border-[#2d2d2d] flex items-center gap-1 transition-all text-[10px] font-black uppercase tracking-wider cursor-pointer select-none ${
                            hasVoted ? 'bg-rose-50 text-rose-600' : 'bg-white text-art-text hover:bg-art-bg'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${hasVoted ? 'fill-rose-500 text-rose-500' : ''}`} />
                          <span>{planVotes.length}</span>
                        </button>
                        {/* Favorite */}
                        <button
                          type="button"
                          onClick={() => onToggleFavoritePlan(importedPlan.id)}
                          className={`py-1.5 px-2 border border-[#2d2d2d] flex items-center justify-center transition-all cursor-pointer select-none ${
                            isFavorited ? 'bg-[#fffde7] text-art-yellow' : 'bg-white text-art-text hover:bg-art-bg'
                          }`}
                          title="Marcar favorit"
                        >
                          <Star className={`w-3.5 h-3.5 ${isFavorited ? 'fill-art-yellow text-art-yellow' : ''}`} />
                        </button>
                      </div>
                    ) : (
                      <div className="text-[10px] font-mono text-[#2d2d2d]/40 flex items-center gap-1 italic">
                        {language === 'ca' ? 'Opcional (no compartit)' : 'Optional event'}
                      </div>
                    )}

                    {/* Import / Status Button */}
                    {isImported ? (
                      <div className="py-2 px-3 border-2 border-emerald-800 bg-[#e8f5e9] text-emerald-800 text-center text-xs font-black uppercase tracking-wider select-none shrink-0 flex items-center justify-center gap-1">
                        <Check className="w-3.5 h-3.5 stroke-[3px]" />
                        <span>{localT.addedSuccess[language]}</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlesImportHoguera(template)}
                        className="py-2 px-4 border-2 border-[#2d2d2d] bg-art-orange hover:bg-art-orange/85 text-white shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-y-[-1px] text-center text-xs font-black uppercase tracking-wider cursor-pointer transition-all select-none flex items-center justify-center gap-1 shrink-0"
                      >
                        <Plus className="w-4 h-4 stroke-[3px]" />
                        <span>{localT.addToCalendar[language]}</span>
                      </button>
                    )}

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
