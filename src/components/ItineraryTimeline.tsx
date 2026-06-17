import React, { useState, useEffect } from 'react';
import { Language, Member, PlanItem, PLAN_CATEGORIES } from '../types';
import { t } from '../translations';
import { Calendar, Clock, MapPin, Heart, Plus, Compass, Star, Flame, Check, Sparkles, Euro, BookmarkCheck, Trash2, ChevronDown, ChevronUp, Filter } from 'lucide-react';

interface ItineraryTimelineProps {
  language: Language;
  members: Member[];
  plans: PlanItem[];
  activeMemberId: string;
  onAddPlan: (plan: Omit<PlanItem, 'id' | 'votes'>) => void;
  onVotePlan: (id: string) => void;
  onToggleFavoritePlan: (id: string) => void;
  onDeletePlan: (id: string) => void;
  prefillPlan?: Partial<PlanItem>;
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
    title: { ca: "La Plantà de la Foguera de Platja de Sant Joan 🌴", en: "The Plantà: Mounting Playa de San Juan Bonfire 🌴", an: "La Plantà de la Foguera de la Playa de San Huan 🌴" },
    description: { ca: "Es dóna el pistoletàs oficial a la nostra zona! Es planta el nostre monument gegant d'art satíric a escassos minuts de l'Airbnb.", en: "Official launch in our neighborhood! Watch the majestic satirical bonfire sculpture get mounted steps away from our villa.", an: "¡Empieça er lío de verdá en er barrio! Que se planta er monumento de cartón al ladito del xalé." },
    date: '2026-06-22', time: '18:00', location: 'Avenida de la Costa Blanca (Playa de San Juan), Alicante',
  },
  {
    id: 'hoguera_mascleta',
    title: { ca: "Gran Mascletà Pirotècnica de Sant Joan 💥", en: "Mascletà: Loud Firecracker Spectacle 💥", an: "La Gran Masclitá de Pólvora y Trueno 💥" },
    description: { ca: "La sorollosa tradició d'Alacant! Pólvora, foc i terratrèmol sonor a la Plaça dels Estels (TRAM directe des de Platja de Sant Joan).", en: "The heart-throbbing tradition of Alicante! Firecrackers, smoke, and sheer rhythmic thunder at Plaza de los Luceros.", an: "Er terremoto má' grande de tós. Ruido, olor a pólvora y petardasso en los Luçero'." },
    date: '2026-06-23', time: '14:00', location: 'Plaza de los Luceros, Alicante',
  },
  {
    id: 'hoguera_ofrena',
    title: { ca: "Ofrena de Flors a la Mare de Déu del Remei 💐", en: "Flower Offering to the Virgin Mary 💐", an: "La Ofrenta de Flowerpot' canisla 💐" },
    description: { ca: "Milers de vestits tradicionals alacantins omplen els carrers de flors i música.", en: "Thousands of locals dressed in stunning traditional attire parade with music.", an: "To' los alicantino' con trahe de gala endosando ramazos de flore'." },
    date: '2026-06-23', time: '19:00', location: 'Plaza del Ayuntamiento / Rambla de Alicante',
  },
  {
    id: 'hoguera_nit_mar',
    title: { ca: "Nit Màgica de Sant Joan i Grans Creus a la Platja 🔥🌊", en: "Magical Night of Sant Joan on the Beach 🔥🌊", an: "La Noche de San Huan y Bañito de Media Noche 🔥🌊" },
    description: { ca: "La nit estel·lar! Sopar fred a la Platja de Sant Joan, cremar desitjos i saltar les 7 onades a mitjanit.", en: "Chill dinner on San Juan sand, write and burn wishes in small beach-side fires, and jump 7 waves at midnight.", an: "¡Er grande de los grande'! Çopita canalla a la solana, saltar las siete olitah a las doçe." },
    date: '2026-06-23', time: '23:00', location: 'Playa de San Juan (Zona de Arena / Xiringuitos)',
  },
  {
    id: 'hoguera_crema',
    title: { ca: "La Cremà dels Monuments i la Pirotècnia 'Banyà' 🚒🔥", en: "La Cremà: Burning of the Bonfires and 'Banyà' 🚒🔥", an: "La Cremá y Pistonaso de Ağuita con Bombero' 🚒🔥" },
    description: { ca: "A mitjanit es crema la gran Foguera del nostre barri de Sant Joan. Assistirem a la 'banyà', on els bombers ens mullen amb les mànegues!", en: "At midnight, our local bonfire sculpture is set on fire. Participate in the legendary 'banyà' dousing!", an: "Meten fuego ar casoplón de cartón de la playa. Y lo' bombero' te asoplan con la manguera en la 'banyà'." },
    date: '2026-06-24', time: '23:59', location: 'Avenida de la Costa Blanca, Playa de San Juan',
  },
  {
    id: 'hoguera_castell_focs',
    title: { ca: "Concurs Internacional d'Espectacles de Focs al Postiguet 🎆", en: "International Maritime Fireworks Competition 🎆", an: "Er Concurço de Cohete' canijo' en er mar 🎆" },
    description: { ca: "Primer gran castell de focs artificials de la competició nacional des de l'espigó de la Platja del Postiguet.", en: "The first major show of the international fireworks competition over the sea.", an: "Er pistoletaso de cohetasso' de luce' de colore' colosale' en medio er mar." },
    date: '2026-06-25', time: '23:59', location: 'TRAM Playa del Postiguet, Alicante',
  },
];

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({
  language, members, plans, activeMemberId,
  onAddPlan, onVotePlan, onToggleFavoritePlan, onDeletePlan,
  prefillPlan, onPrefillConsumed,
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'calendar' | 'hogueras'>('calendar');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  // Tracks which plan cards are expanded on mobile
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-06-22');
  const [time, setTime] = useState('12:05');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [requiresReservation, setRequiresReservation] = useState(false);

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
    { date: '2026-06-25', key: 'dayJo', label: 'Dj 25',  full: 'Dijous 25/06'  },
    { date: '2026-06-26', key: 'dayVe', label: 'Dv 26',  full: 'Divendres 26/06'},
  ];

  const translationsCustom: Record<Language, Record<string, string>> = {
    ca: { dayCa: 'Dilluns 22/06', dayMa: 'Dimarts 23/06', dayMe: 'Dimecres 24/06', dayJo: 'Dijous 25/06', dayVe: 'Divendres 26/06' },
    en: { dayCa: 'Monday 22/06',  dayMa: 'Tuesday 23/06', dayMe: 'Wednesday 24/06',dayJo: 'Thursday 25/06',dayVe: 'Friday 26/06'   },
    an: { dayCa: "Lune' 22/06",   dayMa: "Marte' 23/06",  dayMe: "Miércole' 24/06",dayJo: "Hueve' 25/06", dayVe: "Vierne' 26/06"  },
  };

  const getDayName = (dateStr: string) => {
    const matched = tripDays.find(d => d.date === dateStr);
    return matched ? (translationsCustom[language]?.[matched.key] || matched.full) : dateStr;
  };

  const localT: Record<string, Record<Language, string>> = {
    subTabItinerary: { ca: "📅 Itinerari", en: "📅 Itinerary", an: "📅 Calendario" },
    subTabHogueras: { ca: "🔥 Fogueres '26", en: "🔥 Hogueras '26", an: "🔥 Hoguera' '26" },
    addToCalendar:  { ca: "Afegir", en: "Add", an: "Sumar" },
    addedSuccess:   { ca: "Al calendari ✓", en: "Added ✓", an: "Apuntaíto ✓" },
    importedTag:    { ca: "🌴 Oficial", en: "🌴 Official", an: "🌴 Oficial" },
    filterCategory: { ca: "Totes", en: "All", an: "To'" },
    filterBtn:      { ca: "Filtrar", en: "Filter", an: "Filtrá" },
  };

  const baseFiltered = plans.filter(p => {
    if (selectedDay !== 'all' && p.date !== selectedDay) return false;
    if (selectedCategory !== 'all') {
      const cat = PLAN_CATEGORIES.find(c => c.id === selectedCategory);
      if (cat && p.category !== cat.label) return false;
    }
    if (showFavoritesOnly && !(p.favorites || []).includes(activeMemberId)) return false;
    return true;
  });

  const filteredPlans = [...baseFiltered].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handlesSubmitPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    onAddPlan({
      title: title.trim(), description: description.trim(), date, time,
      location: location.trim(),
      ...(category ? { category } : {}),
      ...(estimatedPrice.trim() ? { estimatedPrice: estimatedPrice.trim() } : {}),
      ...(requiresReservation ? { requiresReservation: true } : {}),
    });
    setTitle(''); setDescription(''); setLocation(''); setCategory('');
    setEstimatedPrice(''); setRequiresReservation(false); setShowAddForm(false);
  };

  const handlesImportHoguera = (template: HogueraTemplateEvent) => {
    const titleText = template.title[language] || template.title['ca'];
    if (plans.some(p => p.title === titleText)) return;
    onAddPlan({
      title: titleText,
      description: template.description[language] || template.description['ca'],
      date: template.date, time: template.time, location: template.location,
      isHogueraEvent: true, category: '🔥 Fogueres',
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 py-2">

      {/* Sub-tabs */}
      <div className="flex border-b-4 border-[#2d2d2d] bg-white gap-1 p-1 select-none shadow-[2px_2px_0px_0px_#2d2d2d]">
        <button type="button" onClick={() => setActiveSubTab('calendar')}
          className={`flex-1 py-2.5 text-center text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeSubTab === 'calendar' ? 'bg-art-orange text-white border-2 border-[#2d2d2d]' : 'text-art-text hover:bg-[#fdfaf2]'}`}>
          {localT.subTabItinerary[language]}
        </button>
        <button type="button" onClick={() => setActiveSubTab('hogueras')}
          className={`flex-1 py-2.5 text-center text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${activeSubTab === 'hogueras' ? 'bg-art-yellow text-art-text border-2 border-[#2d2d2d]' : 'text-art-text hover:bg-[#fdfaf2]'}`}>
          <Flame className="w-3.5 h-3.5 text-art-orange shrink-0" />
          {localT.subTabHogueras[language]}
        </button>
      </div>

      {/* CALENDAR TAB */}
      {activeSubTab === 'calendar' && (
        <>
          {/* ── Controls ── */}
          <div className="flex flex-col gap-2">

            {/* Row 1: Day scroll + action buttons */}
            <div className="flex items-center gap-2">
              {/* Day strip — horizontal scroll, no wrap */}
              <div className="flex items-center gap-1 overflow-x-auto flex-1 hide-scrollbar">
                <button type="button" onClick={() => setSelectedDay('all')}
                  className={`px-2.5 py-1.5 border-2 border-[#2d2d2d] text-[10px] font-black uppercase whitespace-nowrap cursor-pointer shrink-0 transition-all ${selectedDay === 'all' ? 'bg-[#2d2d2d] text-white' : 'bg-white text-art-text hover:bg-[#fdfaf2]'}`}>
                  {language === 'ca' ? 'Tots' : language === 'en' ? 'All' : 'To\''}
                </button>
                {tripDays.map(td => (
                  <button key={td.date} type="button" onClick={() => setSelectedDay(td.date)}
                    className={`px-2.5 py-1.5 border-2 border-[#2d2d2d] text-[10px] font-black uppercase whitespace-nowrap cursor-pointer shrink-0 transition-all ${selectedDay === td.date ? 'bg-art-orange text-white' : 'bg-white text-art-text hover:bg-[#fdfaf2]'}`}>
                    {td.label}
                  </button>
                ))}
              </div>

              {/* Favorites toggle */}
              <button type="button" onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`p-1.5 border-2 border-[#2d2d2d] shrink-0 transition-all cursor-pointer ${showFavoritesOnly ? 'bg-art-yellow text-art-text' : 'bg-white text-art-text/60 hover:text-art-text'}`}
                title={language === 'ca' ? 'Preferits' : 'Favorites'}>
                <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-art-text' : ''}`} />
              </button>

              {/* Category filter toggle */}
              <button type="button" onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                className={`flex items-center gap-1 px-2.5 py-1.5 border-2 border-[#2d2d2d] text-[10px] font-black uppercase shrink-0 cursor-pointer transition-all ${selectedCategory !== 'all' ? 'bg-art-orange text-white' : 'bg-white text-art-text hover:bg-[#fdfaf2]'}`}>
                <Filter className="w-3 h-3" />
                {localT.filterBtn[language]}
              </button>

              {/* Add plan */}
              <button type="button" onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1 px-2.5 py-1.5 border-2 border-[#2d2d2d] bg-art-yellow text-art-text font-black text-[10px] uppercase shrink-0 shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-y-[-1px] transition-all cursor-pointer">
                <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                {t('addPlanBtn', language)}
              </button>
            </div>

            {/* Row 2: Category chips (collapsible) */}
            {showCategoryFilter && (
              <div className="flex flex-wrap items-center gap-1.5 animate-fadeIn">
                <button type="button" onClick={() => { setSelectedCategory('all'); setShowCategoryFilter(false); }}
                  className={`px-2.5 py-1 border-2 border-[#2d2d2d] text-[10px] font-black uppercase cursor-pointer ${selectedCategory === 'all' ? 'bg-[#2d2d2d] text-white' : 'bg-white text-art-text hover:bg-[#fdfaf2]'}`}>
                  {localT.filterCategory[language]}
                </button>
                {PLAN_CATEGORIES.map(cat => (
                  <button key={cat.id} type="button"
                    onClick={() => { setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id); setShowCategoryFilter(false); }}
                    className={`px-2.5 py-1 border-2 border-[#2d2d2d] text-[10px] font-bold cursor-pointer ${selectedCategory === cat.id ? 'bg-art-orange text-white' : 'bg-white text-art-text hover:bg-[#fdfaf2]'}`}>
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add form */}
          {showAddForm && (
            <div className="bg-white border-2 border-[#2d2d2d] p-5 shadow-[4px_4px_0px_0px_#2d2d2d] border-t-8 border-t-art-orange animate-fadeIn">
              <h3 className="font-display font-black uppercase text-sm text-art-text mb-4 flex items-center gap-2">
                <Compass className="w-4 h-4 text-art-orange" />
                {t('addPlanBtn', language)}
              </h3>
              <form onSubmit={handlesSubmitPlan} className="flex flex-col gap-3 text-xs">
                <div>
                  <label className="block font-black uppercase tracking-wider text-art-text/60 mb-1 text-[10px]">{t('planTitleField', language)}</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                    placeholder={language === 'ca' ? 'ex: Sopar al Port' : 'e.g.: Sunset beers'}
                    className="w-full px-3 py-2 border-2 border-[#2d2d2d] bg-white font-medium focus:outline-none focus:border-art-orange" />
                </div>
                <div>
                  <label className="block font-black uppercase tracking-wider text-art-text/60 mb-1 text-[10px]">{t('planDescField', language)}</label>
                  <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={2}
                    placeholder={language === 'ca' ? 'Explica la idea...' : 'Describe the plan...'}
                    className="w-full px-3 py-2 border-2 border-[#2d2d2d] bg-white font-medium focus:outline-none focus:border-art-orange" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-black uppercase tracking-wider text-art-text/60 mb-1 text-[10px]">{t('planDateField', language)}</label>
                    <select value={date} onChange={e => setDate(e.target.value)}
                      className="w-full px-2 py-2 border-2 border-[#2d2d2d] bg-white font-bold focus:outline-none cursor-pointer">
                      {tripDays.map(td => <option key={td.date} value={td.date}>{td.full}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-black uppercase tracking-wider text-art-text/60 mb-1 text-[10px]">{t('planTimeField', language)}</label>
                    <input type="time" required value={time} onChange={e => setTime(e.target.value)}
                      className="w-full px-2 py-2 border-2 border-[#2d2d2d] bg-white font-mono font-bold focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block font-black uppercase tracking-wider text-art-text/60 mb-1 text-[10px]">{t('planLocationField', language)}</label>
                  <input type="text" required value={location} onChange={e => setLocation(e.target.value)}
                    placeholder="ex: Playa del Postiguet"
                    className="w-full px-3 py-2 border-2 border-[#2d2d2d] bg-white font-medium focus:outline-none focus:border-art-orange" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-black uppercase tracking-wider text-art-text/60 mb-1 text-[10px]">
                      {language === 'ca' ? 'Categoria' : 'Category'}
                    </label>
                    <select value={category} onChange={e => setCategory(e.target.value)}
                      className="w-full px-2 py-2 border-2 border-[#2d2d2d] bg-white font-bold focus:outline-none cursor-pointer text-xs">
                      <option value="">— Cap</option>
                      {PLAN_CATEGORIES.map(cat => <option key={cat.id} value={cat.label}>{cat.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-black uppercase tracking-wider text-art-text/60 mb-1 text-[10px]">
                      {language === 'ca' ? 'Preu (opcional)' : 'Price (opt.)'}
                    </label>
                    <input type="text" value={estimatedPrice} onChange={e => setEstimatedPrice(e.target.value)}
                      placeholder="ex: 15€/pp"
                      className="w-full px-2 py-2 border-2 border-[#2d2d2d] bg-white font-medium focus:outline-none focus:border-art-orange" />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div className={`w-4 h-4 border-2 border-[#2d2d2d] flex items-center justify-center shrink-0 ${requiresReservation ? 'bg-art-orange' : 'bg-white'}`}
                    onClick={() => setRequiresReservation(!requiresReservation)}>
                    {requiresReservation && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                  </div>
                  <input type="checkbox" checked={requiresReservation} onChange={e => setRequiresReservation(e.target.checked)} className="sr-only" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-art-text/70">
                    <BookmarkCheck className="w-3 h-3 inline mr-1 text-art-orange" />
                    {language === 'ca' ? 'Requereix reserva' : language === 'en' ? 'Requires reservation' : 'Necesita rese\'va'}
                  </span>
                </label>
                <div className="flex gap-2 justify-end pt-1">
                  <button type="button" onClick={() => setShowAddForm(false)}
                    className="py-2 px-3 border-2 border-[#2d2d2d] bg-white text-art-text font-black uppercase text-[10px] cursor-pointer hover:bg-[#fdfaf2]">
                    {t('cancelBtn', language)}
                  </button>
                  <button type="submit"
                    className="py-2 px-4 border-2 border-[#2d2d2d] bg-art-orange text-white font-black uppercase text-[10px] shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-y-[-1px] transition-all cursor-pointer">
                    {t('submitPlan', language)}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Plan list */}
          {filteredPlans.length === 0 ? (
            <div className="bg-white border-2 border-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] py-12 px-6 text-center flex flex-col items-center">
              <Calendar className="text-art-orange/30 w-10 h-10 mb-3 animate-bounce" />
              <h3 className="text-art-text font-display font-black uppercase text-sm">
                {showFavoritesOnly
                  ? (language === 'ca' ? 'Cap pla preferit' : language === 'en' ? 'No favorite plans' : 'No hay faborito\'')
                  : (language === 'ca' ? 'Cap pla amb aquest filtre' : language === 'en' ? 'No plans match filters' : 'No hay plane\'')}
              </h3>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredPlans.map(plan => {
                const planVotes = plan.votes || [];
                const planFavorites = plan.favorites || [];
                const hasVoted = planVotes.includes(activeMemberId);
                const isFavorited = planFavorites.includes(activeMemberId);
                const isExpanded = expandedIds.has(plan.id);

                return (
                  <div key={plan.id} className={`bg-white border-2 border-[#2d2d2d] shadow-[3px_3px_0px_0px_#2d2d2d] transition-all animate-fadeIn ${plan.isHogueraEvent ? 'border-l-4 border-l-art-orange' : ''}`}>

                    {/* ── Compact row (always visible) ── */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(plan.id)}
                      className="w-full flex items-center gap-3 px-3 py-3 text-left cursor-pointer hover:bg-[#fdfaf2] transition-colors"
                    >
                      {/* Time badge */}
                      <span className="bg-[#2d2d2d] text-white font-mono font-bold px-2 py-1 text-[10px] shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{plan.time}
                      </span>

                      {/* Date (only when showing all days) */}
                      {selectedDay === 'all' && (
                        <span className="hidden sm:flex border border-[#2d2d2d]/30 text-art-text/60 font-mono font-bold px-1.5 py-0.5 text-[9px] shrink-0 items-center gap-0.5 leading-none">
                          <Calendar className="w-2.5 h-2.5" />
                          {tripDays.find(d => d.date === plan.date)?.label ?? plan.date}
                        </span>
                      )}

                      {/* Title */}
                      <span className="flex-1 font-display font-black uppercase text-art-text text-sm leading-tight truncate">
                        {plan.title}
                        {isFavorited && <Star className="inline w-3 h-3 text-art-yellow fill-art-yellow ml-1 shrink-0" />}
                      </span>

                      {/* Right: vote count + chevron */}
                      <span className={`flex items-center gap-1 text-[10px] font-black shrink-0 ${hasVoted ? 'text-rose-500' : 'text-art-text/40'}`}>
                        <Heart className={`w-3.5 h-3.5 ${hasVoted ? 'fill-rose-500' : ''}`} />
                        {planVotes.length}
                      </span>
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-art-text/40 shrink-0" />
                        : <ChevronDown className="w-4 h-4 text-art-text/40 shrink-0" />
                      }
                    </button>

                    {/* ── Expanded detail ── */}
                    {isExpanded && (
                      <div className="px-3 pb-4 flex flex-col gap-3 border-t-2 border-[#2d2d2d]/10 animate-fadeIn">

                        {/* Badges row */}
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {selectedDay === 'all' && (
                            <span className="bg-white border border-[#2d2d2d]/40 text-art-text/60 font-mono font-bold px-2 py-0.5 text-[9px] flex items-center gap-1">
                              <Calendar className="w-3 h-3" />{getDayName(plan.date)}
                            </span>
                          )}
                          {plan.isHogueraEvent && (
                            <span className="bg-[#fff3e0] text-art-orange border border-art-orange font-mono font-black uppercase px-2 py-0.5 text-[9px] flex items-center gap-1">
                              <Flame className="w-3 h-3" />{localT.importedTag[language]}
                            </span>
                          )}
                          {plan.category && (
                            <span className="bg-white border border-[#2d2d2d]/30 text-art-text/60 font-mono font-bold px-2 py-0.5 text-[9px]">{plan.category}</span>
                          )}
                          {plan.requiresReservation && (
                            <span className="bg-amber-50 border border-amber-400 text-amber-700 font-mono font-bold px-2 py-0.5 text-[9px] flex items-center gap-1">
                              <BookmarkCheck className="w-3 h-3" />
                              {language === 'ca' ? 'Reserva' : 'Reservation'}
                            </span>
                          )}
                          {plan.estimatedPrice && (
                            <span className="bg-emerald-50 border border-emerald-400 text-emerald-700 font-mono font-bold px-2 py-0.5 text-[9px] flex items-center gap-1">
                              <Euro className="w-3 h-3" />{plan.estimatedPrice}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-xs text-art-text/80 font-medium leading-relaxed">{plan.description}</p>

                        {/* Location */}
                        {plan.location && (
                          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plan.location)}`}
                            target="_blank" rel="noreferrer"
                            className="inline-flex self-start items-center gap-1.5 font-mono font-bold text-[10px] uppercase text-art-orange border border-art-orange/40 hover:border-art-orange px-2 py-1 transition-all">
                            <MapPin className="w-3 h-3" />
                            <span className="max-w-[220px] truncate">{plan.location}</span>
                          </a>
                        )}

                        {/* Action buttons + voters */}
                        <div className="flex items-center justify-between gap-3 pt-1 border-t border-[#2d2d2d]/10">
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => onVotePlan(plan.id)}
                              className={`flex items-center gap-1.5 py-1.5 px-3 border-2 border-[#2d2d2d] text-xs font-black uppercase cursor-pointer transition-all ${hasVoted ? 'bg-rose-50 text-rose-600 shadow-[1px_1px_0px_0px_#2d2d2d]' : 'bg-white text-art-text hover:bg-[#fdfaf2] shadow-[1px_1px_0px_0px_#2d2d2d]'}`}>
                              <Heart className={`w-3.5 h-3.5 ${hasVoted ? 'fill-rose-500 text-rose-500' : ''}`} />
                              {planVotes.length} {language === 'ca' ? 'Vots' : language === 'en' ? 'Votes' : "Voto'"}
                            </button>
                            <button type="button" onClick={() => onToggleFavoritePlan(plan.id)}
                              className={`p-1.5 border-2 border-[#2d2d2d] cursor-pointer transition-all ${isFavorited ? 'bg-[#fffde7] text-art-yellow shadow-[1px_1px_0px_0px_#2d2d2d]' : 'bg-white text-art-text/50 hover:text-art-text shadow-[1px_1px_0px_0px_#2d2d2d]'}`}>
                              <Star className={`w-4 h-4 ${isFavorited ? 'fill-art-yellow text-art-yellow' : ''}`} />
                            </button>
                            <button type="button"
                              onClick={() => { if (window.confirm(language === 'ca' ? 'Eliminar?' : 'Delete?')) onDeletePlan(plan.id); }}
                              className="p-1.5 border-2 border-[#2d2d2d] bg-white text-art-text/30 hover:text-red-500 hover:border-red-300 cursor-pointer transition-all shadow-[1px_1px_0px_0px_#2d2d2d]">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Voter avatars */}
                          {planVotes.length > 0 && (
                            <div className="flex -space-x-1">
                              {planVotes.map(vid => {
                                const u = members.find(m => m.id === vid);
                                return u ? (
                                  <span key={vid} title={u.nickname || u.name}
                                    className="w-5 h-5 border border-[#2d2d2d] rounded-full bg-white flex items-center justify-center text-xs">
                                    {u.avatarUrl}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* HOGUERAS TAB */}
      {activeSubTab === 'hogueras' && (
        <div className="flex flex-col gap-5 animate-fadeIn">
          <div className="bg-[#2d2d2d] border-2 border-[#2d2d2d] p-5 text-white shadow-[4px_4px_0px_0px_#FF6321]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-art-yellow w-4 h-4 shrink-0" />
              <h3 className="font-display font-black uppercase text-sm text-art-yellow">
                {language === 'ca' ? 'Fogueres de Sant Joan 2026' : language === 'en' ? 'Hogueras de Sant Joan 2026' : 'Hoguera\' de Alacant 2026'}
              </h3>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              {language === 'ca'
                ? 'Selecció dels millors actes (22–26 juny). Vota, guarda als preferits o afegeix-los al calendari!'
                : language === 'en'
                ? 'Top events selection (Jun 22–26). Vote, save favorites, or add to our calendar!'
                : '¡Lo mehore\' de las fiesta\' (22–26 hunio). Vota, faborito o súmalo ar calendario!'}
            </p>
          </div>

          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
            {hoguerasTemplates.map(template => {
              const titleText = template.title[language] || template.title['ca'];
              const descText = template.description[language] || template.description['ca'];
              const importedPlan = plans.find(p => p.title === titleText);
              const isImported = !!importedPlan;
              const planVotes = importedPlan?.votes || [];
              const planFavorites = importedPlan?.favorites || [];
              const hasVoted = planVotes.includes(activeMemberId);
              const isFavorited = planFavorites.includes(activeMemberId);

              return (
                <div key={template.id} className={`p-4 bg-white border-2 border-[#2d2d2d] shadow-[3px_3px_0px_0px_#2d2d2d] flex flex-col gap-3 transition-all ${isImported ? 'border-t-4 border-t-art-orange' : ''}`}>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-[#2d2d2d] text-white font-mono font-bold px-2 py-0.5 text-[9px] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{getDayName(template.date)}
                    </span>
                    <span className="border border-[#2d2d2d]/40 text-art-text/60 font-mono font-bold px-2 py-0.5 text-[9px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-art-orange" />{template.time}
                    </span>
                    {isImported && (
                      <span className="bg-[#e8f5e9] text-emerald-800 border border-emerald-600 font-mono font-black uppercase text-[8px] px-1.5 py-0.5">
                        ✓ {language === 'ca' ? 'ACTIU' : 'ON CALENDAR'}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-display font-black uppercase text-art-text leading-tight">{titleText}</h4>
                  <p className="text-[11px] text-art-text/75 leading-relaxed">{descText}</p>

                  <span className="inline-flex items-center gap-1 font-mono text-[9px] text-art-text/40 uppercase">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[200px]">{template.location}</span>
                  </span>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#2d2d2d]/10">
                    {isImported && importedPlan ? (
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => onVotePlan(importedPlan.id)}
                          className={`flex items-center gap-1 py-1 px-2.5 border border-[#2d2d2d] text-[10px] font-black cursor-pointer ${hasVoted ? 'bg-rose-50 text-rose-600' : 'bg-white text-art-text hover:bg-[#fdfaf2]'}`}>
                          <Heart className={`w-3 h-3 ${hasVoted ? 'fill-rose-500 text-rose-500' : ''}`} />{planVotes.length}
                        </button>
                        <button type="button" onClick={() => onToggleFavoritePlan(importedPlan.id)}
                          className={`p-1 border border-[#2d2d2d] cursor-pointer ${isFavorited ? 'bg-[#fffde7]' : 'bg-white hover:bg-[#fdfaf2]'}`}>
                          <Star className={`w-3.5 h-3.5 ${isFavorited ? 'fill-art-yellow text-art-yellow' : 'text-art-text/40'}`} />
                        </button>
                      </div>
                    ) : <div />}

                    {isImported ? (
                      <div className="py-1.5 px-3 border border-emerald-600 bg-[#e8f5e9] text-emerald-800 text-[10px] font-black uppercase flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3px]" />{localT.addedSuccess[language]}
                      </div>
                    ) : (
                      <button type="button" onClick={() => handlesImportHoguera(template)}
                        className="py-1.5 px-3 border-2 border-[#2d2d2d] bg-art-orange text-white text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-y-[-1px] cursor-pointer transition-all flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5 stroke-[3px]" />{localT.addToCalendar[language]}
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
