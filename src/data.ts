import { Member, SightseeingItem, PlanItem, VoteItem } from './types';

export const defaultMembers: Member[] = [
  { id: 'sally', name: 'Sally', nickname: 'Sally Jefaza', avatarUrl: '💃', role: 'rolePlanner', color: 'from-pink-400 to-rose-600' },
  { id: 'lluc', name: 'Lluc', nickname: 'Lluc er Copas', avatarUrl: '🍻', role: 'roleParty', color: 'from-orange-400 to-amber-600' },
  { id: 'luke', name: 'Luke', nickname: "Luke Skywalker d'Alacant", avatarUrl: '🏄‍♂️', role: 'roleDriver', color: 'from-blue-400 to-indigo-600' },
  { id: 'alba', name: 'Alba', nickname: 'Alba Gourmet', avatarUrl: '🍕', role: 'roleChef', color: 'from-emerald-400 to-teal-600' },
  { id: 'manel', name: 'Manel', nickname: 'Manel Treasurer', avatarUrl: '💰', role: 'roleTreasurer', color: 'from-purple-400 to-violet-600' },
  { id: 'roger', name: 'Roger', nickname: 'Roger Flash', avatarUrl: '📸', role: 'roleFotografo', color: 'from-yellow-400 to-amber-500' },
  { id: 'jesus', name: 'Jesús', nickname: 'Jesús Sirena', avatarUrl: '🏊‍♂️', role: 'roleInfiltrado', color: 'from-cyan-400 to-sky-600' },
  { id: 'emelin', name: 'Emelin', nickname: 'Emelin la Bella', avatarUrl: '💅', role: 'roleDormilon', color: 'from-fuchsia-400 to-pink-600' },
  { id: 'eva', name: 'Eva', nickname: 'Eva Sunbath', avatarUrl: '🏖️', role: 'roleDormilon', color: 'from-red-400 to-orange-600' },
  { id: 'amiga_eva', name: 'Amiga Eva', nickname: "La Increïble Amiga d'Eva", avatarUrl: '🕶️', role: 'roleInfiltrado', color: 'from-zinc-400 to-slate-600' },
];

export const defaultSightseeings: SightseeingItem[] = [
  {
    id: 'castillo',
    title: {
      ca: 'Castell de Santa Bàrbara',
      en: 'Santa Bárbara Castle',
      an: "Ca'tiyo de Çanta Bárbara",
    },
    description: {
      ca: "Una fortalesa medieval imponent a dalt del mont Benacantil que ofereix les millors vistes panoràmiques de tota la badia d'Alacant. Imprescindible pujar-hi cap al tard!",
      en: 'A stunning medieval fortress perched on Mount Benacantil, offering breathtaking panoramic views of the entire Alicante bay. A must-visit at sunset!',
      an: "Un ca'tiyaço de la edá media que e'tá en lo arto del monte Benacantí. Tie' una' vi'ta colosale' de toda la playa. ¡Hay que de çubí a la faha de la tarde!",
    },
    location: 'Monte Benacantil, 03002 Alicante',
    image: 'https://images.unsplash.com/photo-1592906209472-a36b1f3782ef?auto=format&fit=crop&q=80&w=600',
    category: 'culture',
  },
  {
    id: 'explanada',
    title: {
      ca: "Explanada d'Espanya",
      en: 'Explanade of Spain',
      an: "La E'planá d'E'paña",
    },
    description: {
      ca: "El passeig marítim més emblemàtic d'Alacant, pavimentat amb més de 6 milions de tesel·les de mosaic que dibuixen onades vermelles, blaves i blanques sota files de palmeres.",
      en: 'Alicante\'s most iconic maritime boulevard, paved with over 6 million mosaic tiles forming red, blue, and white waves beneath towering rows of palm trees.',
      an: "Un paçeadero de lo má' bonico, asulehao con má' de sei' miyone' de piedreçita' de colore' pa' posturita frent'ar mar. ¡Lleno palmerita'!",
    },
    location: 'Paseo de la Explanada, 03002 Alicante',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600',
    category: 'viewpoint',
  },
  {
    id: 'barrio_santa_cruz',
    title: {
      ca: 'Barri de Santa Creu',
      en: 'Santa Cruz Barrio',
      an: "El Barrio de la Çanta Cru'",
    },
    description: {
      ca: "El nucli antic d'Alacant situat als peus del castell. Carrers estrets amb escales, façanes blanques plenes de flors, testos i racons amb encant medieval.",
      en: 'The old quarter of Alicante at the foot of Mount Benacantil. Narrow, stair-filled streets with white houses decorated with colorful flower pots.',
      an: "El ca'co viejo der pueblo, pegao ar monte. Un fartusco de cue'tecilla', casita ramificá' de cal, con flowerpot' y guirnalda' pa hacerse retratito' chulo'.",
    },
    location: 'Barrio de Santa Cruz, Alicante',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=600',
    category: 'culture',
  },
  {
    id: 'isla_tabarca',
    title: {
      ca: "Excursió a l'Illa de Tabarca",
      en: 'Tabarca Island Day Trip',
      an: 'Vihe en barco a la Arresife de Tabarca',
    },
    description: {
      ca: 'L\'única illa habitada de la Comunitat Valenciana. Reserva marina natural ideal pel snorkel, provar un bon "caldero tabarquino" i passejar pel seu poble emmurallat.',
      en: 'The only inhabited island of the Valencian community. A protected marine reserve ideal for snorkeling, tasting the authentic Tabarca fish stew, and walking inside its historic city walls.',
      an: "La única i'la con gente del de la sona. Un paraíço de agua' tran'parente' pa' de ve' peçe'. Te metes un caldero de pe'cao entre pesho i espalda en er puerto.",
    },
    location: 'Puerto de Alicante (Ferry Tabarca)',
    image: 'https://images.unsplash.com/photo-1563212450-48e02c6114eb?auto=format&fit=crop&q=80&w=600',
    category: 'beach',
  },
  {
    id: 'playa_postiguet',
    title: {
      ca: 'Platja del Postiguet',
      en: 'Postiguet Beach',
      an: "Er playaso der Po'tigué",
    },
    description: {
      ca: 'La platja daurada de la ciutat, just als peus del castell. Aigua neta, palmeres al sorral i una vora plena de xiringuitos on prendre un refresc o fer de dinar.',
      en: 'The premium golden city beach located directly beneath the castle. Warm crystal waters, palm trees in the sand, and dynamic beach bars to sip on a cold drink.',
      an: "La playa grande de toda la vía, al ladito der monte. Ağua limpita, turisteo, arenal fino y chiringuito' pa ponersi fino a cervesiya fría.",
    },
    location: 'Calle de Jovellanos, 03002 Alicante',
    image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80&w=600',
    category: 'beach',
  },
  {
    id: 'mercado_central',
    title: {
      ca: "Mercat Central d'Alacant",
      en: 'Central Market of Alicante',
      an: "La Plaça de Abasto' de Alacant",
    },
    description: {
      ca: "La catedral de la gastronomia local. Un edifici històric modernista ple de tapes increïbles, productes súper frescos per cuinar al xalet i tapes de tapes de peix fresc.",
      en: 'The cathedral of local gastronomy. A beautiful modernist building full of premium tapas, super-fresh ingredients to cook back at our Airbnb villa, and local treats.',
      an: "El meho sitito pa' de comé tapeo fresco de la bahía. Un templo d'asuleho' lleno d'embutío, jamón, marisco pa asá en er xalé, y paradas de terrasa.",
    },
    location: 'Avenida de Alfonso El Sabio, 8, 03004 Alicante',
    image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=600',
    category: 'food',
  },
];

export const defaultPlans: PlanItem[] = [
  {
    id: 'p1',
    title: 'Arribada al Xalet i Barbacoa de Benvinguda',
    description: "Arribem a l'Airbnb, ens dividim les habitacions, ens posem els banyadors i fem barbacoa inaugural a la piscina per inaugurar el viatge.",
    date: '2026-06-22',
    time: '14:00',
    location: 'El nostre Airbnb de somni',
    votes: ['sally', 'manel', 'alba', 'roger'],
  },
  {
    id: 'p2',
    title: 'Capvespre al Castell de Santa Bàrbara',
    description: 'Pugem al castell en ascensor o fent passeig per veure tota la costa il·luminada pel cel taronja. Després farem unes birres pel barri antic.',
    date: '2026-06-22',
    time: '19:30',
    location: 'Castillo de Santa Bárbara',
    votes: ['sally', 'luke', 'lluc', 'eva'],
  },
  {
    id: 'p3',
    title: 'Dia Complet a la Platja de San Juan',
    description: "Platja mítica d'arena fina kilomètrica. Ens asseiem en un xiringuito o preparem picnic de platja. Jocs a la sorra, voleibol i capbussades.",
    date: '2026-06-23',
    time: '10:30',
    location: 'Playa de San Juan, Alicante',
    votes: ['jesus', 'emelin', 'eva', 'amiga_eva', 'luke'],
  },
  {
    id: 'p4',
    title: 'Nit d\'Estrelles i "La Ruleta dels Càstigs"',
    description: 'Gran sopar sota el porxo del xalet, tertúlia, begudes de nit d\'Alicant i la primera gran sessió de jocs i girs a la ruleta al nostre jardí.',
    date: '2026-06-23',
    time: '21:30',
    location: 'Airbnb Piscina & Jardí',
    votes: ['lluc', 'manel', 'sally', 'roger', 'jesus'],
  },
  {
    id: 'p5',
    title: 'Excursió de dia Sencer a Tabarca',
    description: 'Agafem el vaixell ràpid (ferry) al port de bon matí. Snorkel en aigües cristal·lines rítmiques, arròs a banda col·lectiu i passeig pels penya-segats històrics.',
    date: '2026-06-24',
    time: '09:45',
    location: 'Puerto de Alicante / Isla Tabarca',
    votes: ['sally', 'manel', 'alba', 'luke', 'roger', 'jesus', 'emelin', 'eva'],
  },
  {
    id: 'p6',
    title: 'Sopar de Gala de Tapes i "Tardeo"',
    description: 'El clàssic "tardeo" d\'Alacant! Sortim vora la plaça de las Flores, anem de tapes de mercat, formatges canalles, i de nit una copa elegant pel port.',
    date: '2026-06-25',
    time: '17:00',
    location: 'Calle Castaños / Centro de Alicante',
    votes: ['lluc', 'alba', 'eva', 'amiga_eva'],
  },
];

export const defaultVotes: VoteItem[] = [
  {
    id: 'v1',
    question: {
      ca: "Quin dia farem el dinar d'arròs col·lectiu a l'illa de Tabarca?",
      en: 'What day should we book our group seafood rice in Tabarca island?',
      an: '¿Qué mediodía nos metemo er peasso arró colosá en Tabarca?',
    },
    options: [
      { id: 'o1_ca', text: { ca: 'Dimecres 24 de Juny', en: 'Wednesday, June 24', an: "Miércole' 24 de Hunio" }, votes: ['sally', 'manel', 'alba', 'roger', 'jesus', 'eva'] },
      { id: 'o2_ca', text: { ca: 'Dijous 25 de Juny', en: 'Thursday, June 25', an: "Hueve' 25 de Hunio" }, votes: ['luke', 'lluc', 'emelin', 'amiga_eva'] },
    ],
    createdBy: 'sally',
    closed: false,
  },
  {
    id: 'v2',
    question: {
      ca: 'Qui conduirà el cotxe principal durant les excursions cap a cales?',
      en: 'Who is officially driving the main car to the isolated coves?',
      an: "¿Quién lleva er volante del buga' grante de ruta calera?",
    },
    options: [
      { id: 'o1_v2', text: { ca: 'En Luke (Pilot oficial certificat)', en: 'Luke (Our certified pilot)', an: 'Er Luke (Piloto aselerao)' }, votes: ['luke', 'sally', 'manel', 'lluc', 'eva'] },
      { id: 'o2_v2', text: { ca: 'En Lluc (Té copilot que li canta les rotondes)', en: 'Lluc (Needs co-pilot for roundabouts)', an: 'Er Lluc (Pero guiándole er GPS la peñita)' }, votes: ['alba', 'roger', 'jesus', 'emelin', 'amiga_eva'] },
    ],
    createdBy: 'manel',
    closed: false,
  },
];

export const punishmentOptions: { text: Record<'ca' | 'en' | 'an', string> }[] = [
  {
    text: {
      ca: 'Pagar la propera ronda de canyes / cerveses!',
      en: 'Pay for the next cluster of drinks!',
      an: "¡Pagá la primera ronta de mi'ta' en la barra!",
    },
  },
  {
    text: {
      ca: 'Cuinar la barbacoa de demà al migdia sota el sol!',
      en: "Be the BBQ Chef for tomorrow's lunch in the sun!",
      an: '¡Soplar y avivar er carbón der asao de mañana ar solano!',
    },
  },
  {
    text: {
      ca: 'Netejar tots els plats del súper sopar de grup!',
      en: "Wash all the greasy plates of our giant squad dinner!",
      an: "¡Dejarse er espinazo fregando to' er carril de platos grasientos!",
    },
  },
  {
    text: {
      ca: 'Anar demà a comprar gel i begudes corrent sota la calitg!',
      en: 'Run tomorrow morning to fetch ice and beverages!',
      an: "¡Corré ar chino a d'escorfó de mañana a por lo' sacos de hielo!",
    },
  },
  {
    text: {
      ca: 'Netejar les fulles de la piscina amb el pal d\'Alicant!',
      en: "Clean the pool leaves with the majestic skimmer!",
      an: "¡Quitá las hojica' y mosquito' de la piscina con er salavar!",
    },
  },
  {
    text: {
      ca: 'Fer un ball de flamenc lliure de 30 segons al porxo!',
      en: 'Do a free-style 30 second flamenco dance on the porch!',
      an: "¡Haserçi un baile por bulería' con taconeo d'un minuto en la terraza!",
    },
  },
  {
    text: {
      ca: 'Fer un massatge de peus al cuiner del dia!',
      en: "Give a quick foot rub to the official cook!",
      an: '¡Fregà er pie cansao der cocinero de turno con carantoña!',
    },
  },
  {
    text: {
      ca: 'Triar la llista de reproducció musical del cotxe demà sencera!',
      en: 'Select the primary playlist of the car for the entire day tomorrow!',
      an: '¡Elegí er repertorio musical der casset der coche tol día de mañana!',
    },
  },
];

export const defaultExpenses: any[] = [
  {
    id: 'e1',
    description: 'Compra supermercat Mercadona (Carn, carbó, begudes, esmorzar)',
    amount: 145.50,
    paidBy: 'manel',
    splitBetween: [], // Empty means split among all 10
    date: '2026-06-22',
  },
  {
    id: 'e2',
    description: 'Tickets vaixell ràpid ferry de grup per Tabarca',
    amount: 110.00,
    paidBy: 'sally',
    splitBetween: [],
    date: '2026-06-23',
  },
  {
    id: 'e3',
    description: 'Aperitiu i tapes sorra a la Platja de San Juan',
    amount: 52.00,
    paidBy: 'lluc',
    splitBetween: ['lluc', 'luke', 'jesus', 'eva', 'amiga_eva'], // split among some
    date: '2026-06-23',
  },
];
