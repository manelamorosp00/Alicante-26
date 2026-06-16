import React, { useState } from 'react';
import { Language, PlanItem } from '../types';
import { Star, MapPin, ExternalLink, Plus, Euro, BookmarkCheck, Info } from 'lucide-react';

interface RecomanacionsProps {
  language: Language;
  onAddToPlan: (prefill: Partial<PlanItem>) => void;
}

type RecSection = 'bars' | 'restaurants' | 'excursions';

interface RecItem {
  id: string;
  name: string;
  description: string;
  stars: number;   // 1–5
  price?: string;  // e.g. "~28€/pp", "Gratis", "15–30€"
  location?: string;
  highlight?: string; // "TripAdvisor #1", "TheFork 9.8", "⭐⭐⭐⭐⭐"
  requiresReservation?: boolean;
  category: string; // matches PLAN_CATEGORIES label
}

const BARS: RecItem[] = [
  {
    id: 'el_drago',
    name: 'El Drago',
    description: 'El bar imprescindible de Villajoyosa. Terrassa animada, birres fredes i ambient de festa garantit fins a les tantes.',
    stars: 5,
    price: '~3–5€/birra',
    location: 'Villajoyosa (La Vila Joiosa)',
    highlight: '⭐ Recomanat #1',
    category: '🍺 Birres',
  },
  {
    id: 'zerca',
    name: 'Zerca Cervezacafé',
    description: 'Bar de cerveses artesanes amb ambient modernot. Bona selecció de tirades i tapes variades per picar.',
    stars: 4,
    price: '~4–6€/birra',
    location: 'Carrer Colón 21, Villajoyosa',
    category: '🍺 Birres',
  },
  {
    id: 'coconuts',
    name: 'Coconuts Beach Bar',
    description: 'Xiringuito de platja amb vista al mar, còctels, música i ambient relaxat. Perfecte per a les tardes.',
    stars: 4,
    price: '~7–10€/còctel',
    location: 'Platja de Villajoyosa',
    category: '🍺 Birres',
  },
  {
    id: 'haventje',
    name: "Café 't Haventje",
    description: 'Bar clàssic amb encant, proper al port. Tranquil, amb bon servei i per a sessions llargues.',
    stars: 4,
    location: 'Port de Villajoyosa',
    category: '🍺 Birres',
  },
  {
    id: 'gambrinus',
    name: 'Cervecería Gambrinus',
    description: 'Cerveseria de tota la vida amb terrassa gran. Bon lloc per reunir tot el grup i fer rondes llargues.',
    stars: 4,
    location: 'Villajoyosa',
    category: '🍺 Birres',
  },
  {
    id: 'shannon',
    name: 'Shannon Irish Pub',
    description: 'Pub irlandès amb futbol, Guinness i ambient internacional. Per a les nits que vols allargar fins aviat.',
    stars: 3,
    price: '~5€/pint',
    location: 'Villajoyosa',
    category: '🍺 Birres',
  },
  {
    id: 'cruz_blanca',
    name: 'Cruz Blanca / Rosa dels Vents',
    description: 'Dues opcions molt estimades pels locals. Ambient autèntic, preus populars i bon rotllo.',
    stars: 4,
    location: 'Villajoyosa',
    category: '🍺 Birres',
  },
  {
    id: 'bar_olivo',
    name: 'Bar El Olivo',
    description: 'Bar de barri, molt local, tranquil i perfecte per a aperitius llargs i nit baixa.',
    stars: 3,
    location: 'Villajoyosa',
    category: '🍺 Birres',
  },
];

const RESTAURANTS: RecItem[] = [
  {
    id: 'casa_elordi',
    name: 'Casa Elordi',
    description: 'El millor restaurant de Villajoyosa per TripAdvisor. Cuina de mercat, producte local i servei impecable. Reserva obligatòria.',
    stars: 5,
    price: '~35–50€/pp',
    location: 'Villajoyosa',
    highlight: 'TripAdvisor #1 Villajoyosa',
    requiresReservation: true,
    category: '🥘 Tapes',
  },
  {
    id: 'taverna_posit',
    name: 'Taverna El Pòsit',
    description: 'Local amb molt bona relació qualitat-preu. Menú per 28€ que inclou entrants, principal i postres. 1085 ressenyes 4.3★.',
    stars: 5,
    price: 'Menú 28€/pp',
    location: 'Villajoyosa',
    highlight: '4.3★ (1085 res.)',
    requiresReservation: true,
    category: '🥘 Tapes',
  },
  {
    id: 'made',
    name: 'Made Restaurant',
    description: 'Cuina mediterrània contemporània amb una puntuació de 9.8 a TheFork. Imprescindible reservar amb antelació.',
    stars: 5,
    price: '~40€/pp',
    location: 'Villajoyosa',
    highlight: 'TheFork 9.8/10',
    requiresReservation: true,
    category: '🍽️ Sopar',
  },
  {
    id: 'ca_marta',
    name: 'Ca Marta',
    description: 'Restaurant familiar amb cuina casolana i peix fresc del mercat. L\'arròs és espectacular.',
    stars: 4,
    price: '~25–35€/pp',
    location: 'Villajoyosa',
    category: '🥘 Tapes',
  },
  {
    id: 'bocado_deluxe',
    name: 'Bar Bocado Deluxe',
    description: 'Tapes creatives i entrepans gourmet. Perfecte per a un dinar informal sense estrènyer-se la cartera.',
    stars: 4,
    price: '~15–20€/pp',
    location: 'Villajoyosa',
    category: '🥘 Tapes',
  },
  {
    id: 'tasqueta_antiga',
    name: "La Tasqueta de L'Antiga",
    description: 'Tapes valencianes clàssiques en un espai petit i acollidor. Molt popular entre els locals.',
    stars: 4,
    price: '~20–28€/pp',
    location: 'Villajoyosa',
    category: '🥘 Tapes',
  },
  {
    id: 'hogar_pescador',
    name: 'El Hogar del Pescador',
    description: 'Peix i marisc fresquíssim directament del port. Especialitat en arròs a banda i calderet.',
    stars: 4,
    price: '~30–40€/pp',
    location: 'Port de Villajoyosa',
    category: '🥘 Tapes',
  },
  {
    id: 'el_guitarra',
    name: 'Restaurant El Guitarra',
    description: 'Clàssic de la zona amb bon marisc i cuina tradicional marinera. Relació qualitat-preu molt decent.',
    stars: 3,
    price: '~25–35€/pp',
    location: 'Villajoyosa',
    category: '🥘 Tapes',
  },
];

const EXCURSIONS: RecItem[] = [
  {
    id: 'kayak_cales',
    name: 'Kayak per les Cales de Villajoyosa',
    description: 'Excursió de 3 hores en kayak per cales amagades inaccessibles per terra. Aigües cristal·lines i snorkel inclòs.',
    stars: 5,
    price: '~30€/pp',
    location: 'Port de Villajoyosa',
    highlight: '~3h · Snorkel inclòs',
    category: '🏄 Excursió',
  },
  {
    id: 'barco_tabarca',
    name: 'Barco a Tabarca + Snorkel',
    description: "L'illa de Tabarca és Reserva Marina. Aigües increïbles per fer snorkel i el poble és molt bonic. Vaixell des d'Alacant.",
    stars: 5,
    price: '15–30€/pp',
    location: 'Port d\'Alacant → Tabarca',
    highlight: 'Reserva Marina Nacional',
    category: '⛵ Barca',
  },
  {
    id: 'lloguer_barco',
    name: 'Lloguer de Barco sense Llicència',
    description: 'Lloguer d\'embarcació per a 10 persones. No cal llicència! Perfecte per explorar cales i banyar-vos on vulgueu.',
    stars: 5,
    price: '~190€/h (÷10pp = 19€/pp)',
    location: 'Port de Villajoyosa',
    highlight: 'Fins a 10 persones',
    requiresReservation: true,
    category: '⛵ Barca',
  },
  {
    id: 'senderisme_aitana',
    name: 'Senderisme Serra d\'Aitana',
    description: "El punt més alt de la província d'Alacant (1.558m). Ruta de 40 min des del port de muntanya amb vistes espectaculars.",
    stars: 4,
    price: 'Gratis',
    location: 'Serra d\'Aitana (40 min en cotxe)',
    highlight: '1.558m · Vistes al mar',
    category: '🏄 Excursió',
  },
  {
    id: 'casc_antic_vila',
    name: 'Casc Antic de Villajoyosa',
    description: 'Passejada pels carrers de colors de la Vila. Cases pintades de colors vius, mercat de peixateria i cafès amb encant.',
    stars: 4,
    price: 'Gratis',
    location: 'Centre Villajoyosa',
    highlight: 'Cases de colors úniques',
    category: '🏛️ Cultura',
  },
  {
    id: 'ruta_platges',
    name: 'Ruta de Platges de Villajoyosa',
    description: 'Explorar les platges al voltant de Villajoyosa: Platja de l\'Ampolla, Cala de la Creu, Platja Nord. Combinació perfecta.',
    stars: 4,
    price: 'Gratis',
    location: 'Villajoyosa i rodalies',
    category: '🏖️ Platja',
  },
  {
    id: 'museu_xocolata',
    name: 'Museu de Xocolata Valor',
    description: 'El famós museu de la fàbrica Valor, al centre de Villajoyosa. Degustació de productes i visita guiada molt entretinguda.',
    stars: 3,
    price: '~5–8€/pp',
    location: 'Fàbrica Valor, Villajoyosa',
    highlight: 'Degustació inclosa',
    category: '🏛️ Cultura',
  },
  {
    id: 'boat_party',
    name: 'Boat Party fins a Benidorm',
    description: "Vaixell de festa fins a Benidorm amb DJ, begudes i ambient de festes. Una nit de Fogueres a l'estil més canalla.",
    stars: 4,
    price: '~30–50€/pp',
    location: 'Port de Benidorm',
    highlight: 'DJ · Open bar · Nit de festa',
    requiresReservation: true,
    category: '🎉 Festa',
  },
  {
    id: 'snorkel_coves',
    name: 'Snorkel a les Coves Marines',
    description: 'Exploració submarina de les coves i esculls de la costa de Villajoyosa. Ideal per als matins tranquils.',
    stars: 4,
    price: '~15–20€/pp',
    location: 'Cales de Villajoyosa',
    category: '🏄 Excursió',
  },
];

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < count ? 'fill-art-yellow text-art-yellow' : 'text-[#2d2d2d]/20'}`}
        />
      ))}
    </div>
  );
}

export const Recomanacions: React.FC<RecomanacionsProps> = ({ language, onAddToPlan }) => {
  const [activeSection, setActiveSection] = useState<RecSection>('bars');

  const sectionConfig: Record<RecSection, { label: string; emoji: string; items: RecItem[]; color: string }> = {
    bars: {
      label: language === 'ca' ? 'Bars & Birres' : language === 'en' ? 'Bars & Beers' : 'Bare\' y Birra\'',
      emoji: '🍺',
      items: BARS,
      color: 'bg-amber-500',
    },
    restaurants: {
      label: language === 'ca' ? 'Restaurants' : language === 'en' ? 'Restaurants' : 'Re\'taurante\'',
      emoji: '🥘',
      items: RESTAURANTS,
      color: 'bg-art-orange',
    },
    excursions: {
      label: language === 'ca' ? 'Excursions' : language === 'en' ? 'Activities' : 'Excursione\'',
      emoji: '🏄',
      items: EXCURSIONS,
      color: 'bg-emerald-600',
    },
  };

  const current = sectionConfig[activeSection];

  const handleAddToPlan = (item: RecItem) => {
    onAddToPlan({
      title: item.name,
      description: item.description,
      location: item.location ?? '',
      category: item.category,
      estimatedPrice: item.price ?? '',
      requiresReservation: item.requiresReservation ?? false,
      date: '2026-06-22',
      time: '20:00',
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 py-2">

      {/* Header */}
      <div className="bg-[#2d2d2d] p-6 text-white shadow-[4px_4px_0px_0px_#FF6321] relative overflow-hidden flex flex-col gap-2">
        <div className="absolute right-2 top-2 text-6xl opacity-10 select-none pointer-events-none">🌊</div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🗺️</span>
          <h2 className="font-display font-black uppercase text-base text-art-yellow tracking-wide">
            {language === 'ca' ? 'Guia de Recomanacions · Villajoyosa & Alacant'
              : language === 'en' ? 'Recommendations Guide · Villajoyosa & Alicante'
              : 'Guía de Recomanasione\' · La Vila y Alicante'}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-white/85 font-semibold max-w-3xl leading-relaxed">
          {language === 'ca'
            ? 'Selecció curada dels millors llocs, bars, restaurants i activitats per al viatge. Clica "Afegir al pla" per moure qualsevol recomanació directament a l\'Itinerari.'
            : language === 'en'
            ? 'Curated selection of the best spots, bars, restaurants and activities for the trip. Click "Add to plan" to move any recommendation straight to the Itinerary tab.'
            : 'Cantera selesionà de lo\' meihore\' sítio\', bare\', re\'taurante\' y líos del viaje. Dale a "Suma ar Pla" pa mandar cualquier cosa ar itinerario.'}
        </p>
        <div className="flex items-center gap-2 mt-1 bg-white/10 border border-white/20 px-3 py-2 text-[11px] font-mono text-white/70 self-start">
          <Info className="w-3.5 h-3.5 shrink-0" />
          {language === 'ca'
            ? 'Els preus i la disponibilitat poden variar. Comproveu-ho sempre!'
            : language === 'en'
            ? 'Prices and availability may vary. Always verify before visiting!'
            : '¡Los precio\' y aforo pueden cambiar. Comproba\'lo siempre!'}
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex border-2 border-[#2d2d2d] shadow-[3px_3px_0px_0px_#2d2d2d] overflow-hidden">
        {(Object.entries(sectionConfig) as [RecSection, typeof current][]).map(([key, cfg]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveSection(key)}
            className={`flex-1 py-3 px-2 text-center text-xs md:text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 border-r-2 border-[#2d2d2d] last:border-r-0 ${
              activeSection === key
                ? `${cfg.color} text-white`
                : 'bg-white text-art-text hover:bg-[#fdfaf2]'
            }`}
          >
            <span className="text-base">{cfg.emoji}</span>
            <span className="hidden sm:inline">{cfg.label}</span>
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {current.items.map((item) => (
          <div
            key={item.id}
            className="bg-white border-2 border-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] hover:shadow-[6px_6px_0px_0px_#2d2d2d] hover:-translate-y-0.5 transition-all flex flex-col"
          >
            {/* Card header stripe */}
            <div className={`px-4 py-2 flex items-center justify-between gap-2 border-b-2 border-[#2d2d2d] ${item.stars === 5 ? 'bg-art-yellow/20' : 'bg-[#fdfaf2]'}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <StarRow count={item.stars} />
                {item.highlight && (
                  <span className="text-[9px] font-mono font-black uppercase bg-[#2d2d2d] text-white px-1.5 py-0.5 leading-none">
                    {item.highlight}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-mono text-art-text/40 uppercase shrink-0">{item.category}</span>
            </div>

            <div className="p-4 flex flex-col gap-2 flex-1">
              <h3 className="font-display font-black uppercase text-sm text-art-text leading-tight">
                {item.name}
              </h3>

              <p className="text-xs text-art-text/75 font-medium leading-relaxed flex-1">
                {item.description}
              </p>

              {/* Metadata row */}
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {item.price && (
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-50 border border-emerald-400 text-emerald-700 px-2 py-0.5">
                    <Euro className="w-3 h-3" />
                    {item.price}
                  </span>
                )}
                {item.requiresReservation && (
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold bg-amber-50 border border-amber-400 text-amber-700 px-2 py-0.5">
                    <BookmarkCheck className="w-3 h-3" />
                    {language === 'ca' ? 'Cal reserva' : language === 'en' ? 'Reserv. needed' : 'Rese\'va nece\'aria'}
                  </span>
                )}
                {item.location && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-art-text/50">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-[140px]">{item.location}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Card footer: actions */}
            <div className="px-4 pb-4 flex items-center gap-2">
              {item.location && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + (item.location ?? ''))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-3 border-2 border-[#2d2d2d] bg-white text-art-text hover:bg-[#fdfaf2] text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#2d2d2d] hover:-translate-y-px transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  Maps
                </a>
              )}
              <button
                type="button"
                onClick={() => handleAddToPlan(item)}
                className="flex-1 py-2 px-3 border-2 border-[#2d2d2d] bg-art-orange hover:bg-art-orange/85 text-white text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#2d2d2d] hover:-translate-y-px transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                {language === 'ca' ? 'Afegir al Pla' : language === 'en' ? 'Add to Plan' : 'Suma ar Pla'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
