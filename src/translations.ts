import { Language } from './types';

export const translations: Record<string, Record<Language, string>> = {
  // Navigation
  navDashboard: {
    ca: "Inici",
    en: "Dashboard",
    an: "Inisio",
  },
  navExpenses: {
    ca: "Gestió de Gastos",
    en: "Expenses",
    an: "Gasto' Compartío'",
  },
  navPlans: {
    ca: "Horaris i Plans",
    en: "Itinerary & Plans",
    an: "Plane' y Horario'",
  },
  navSightseeing: {
    ca: "Què Veure",
    en: "Sightseeing",
    an: "Cosa' pa Ve'",
  },
  navGames: {
    ca: "Jocs i Ruletes",
    en: "Games & Wheels",
    an: "Çarandola y Voto'",
  },
  navProfiles: {
    ca: "Gestionar Perfils",
    en: "Profiles & Roles",
    an: "La Peñita y Rolo'",
  },

  // General App Phrases
  appTitle: {
    ca: "Alacant 2026 - Control de Viatge",
    en: "Alicante 2026 - Trip Hub",
    an: "Alacant 2026 - Er Control der Viahe",
  },
  appSubtitle: {
    ca: "Setmana del 22 al 26 de Juny de 2026",
    en: "Week of June 22 to 26, 2026",
    an: "La Çemanita der 22 ar 26 de Hunio de 2026",
  },
  whoAreYou: {
    ca: "Qui ets? Tria el teu personatge",
    en: "Who are you? Choose your character",
    an: "¿Tú quié' ere', compare? Escohé tu personaso",
  },
  activeUserLabel: {
    ca: "Usuari actiu",
    en: "Active user",
    an: "Compare desidío",
  },
  changeUser: {
    ca: "Canviar de personatge",
    en: "Switch user",
    an: "Canviá d'avatar, quillo",
  },
  allRights: {
    ca: "Fet amb amor per als amics de viatge d'Alacant 2026",
    en: "Made with love for the Alicante 2026 crew",
    an: "Hecho con musho arte pa' la peñita d'Alacant 2026",
  },

  // Roles Translations
  roleTreasurer: {
    ca: "La Banca (Controla els cèntims)",
    en: "The Banker (Handles money)",
    an: "Er del Taco (Er que lleva er parné)",
  },
  rolePlanner: {
    ca: "El Planificador (Capità d'itineraris)",
    en: "The Trip Planner (Itinerary guru)",
    an: "Er Direstó de la Pompa (Er que s'organiça)",
  },
  roleParty: {
    ca: "El Ministre de Festes (Organitza nits)",
    en: "Minister of Fun (Nightlife expert)",
    an: "Er Festero Mayor (Er de la çarandola y er botellón)",
  },
  roleChef: {
    ca: "Xef Oficial (Especialista en barbacoes)",
    en: "Official Chef (Master of BBQ)",
    an: "Mese de los fogue' (Er der carbón y el asao)",
  },
  roleDriver: {
    ca: "Pilot oficial (Cops a les rotondes)",
    en: "Designated Driver (GPS master)",
    an: "Fittipaldi (Er der volante y las curva')",
  },
  roleDormilon: {
    ca: "Campió de la sesta (Sempre dorm)",
    en: "The Snoozer (Always in bed)",
    an: "Er marmota (Er de la çolana y la roncera)",
  },
  roleFotografo: {
    ca: "Fotògraf (Capturador de memòries i colments)",
    en: "Photographer (Capturer of moments)",
    an: "Er de la semáforo (Er que te cansa con la cámara)",
  },
  roleInfiltrado: {
    ca: "Infiltrat (Agafa menjar d'altres)",
    en: "The Food Scavenger (Eats other's snacks)",
    an: "Er gorrón (Er que rebaña er plato ajeno)",
  },

  // Dashboard / Landing
  daysRemaining: {
    ca: "Dies fins al viatge",
    en: "Days until departure",
    an: "Día' pa que empiese er lío",
  },
  welcomeMessage: {
    ca: "Benvinguts al centre d'operacions!",
    en: "Welcome to the operations center!",
    an: "¡Arsa, quillo! ¡Bienveníos ar búnke central!",
  },
  airbnbCardTitle: {
    ca: "El nostre allotjament de somni",
    en: "Our Dream Residence",
    an: "Er Meho Casoplón pa Dormí",
  },
  airbnbCardDesc: {
    ca: "Un xalet espectacular amb piscina a Alacant, ideal per a 10 persones.",
    en: "A beautiful villa with private pool in Alicante, perfect for 10 friends.",
    an: "Un xalé con susharra de piscinita en Alacant pa' lo' dié' ermano'.",
  },
  viewOnAirbnb: {
    ca: "Veure reserva a Airbnb",
    en: "View Airbnb details",
    an: "Fisgá er Airbnb originá",
  },
  tripDates: {
    ca: "Del 22 al 26 de Juny de 2026",
    en: "June 22 - 26, 2026",
    an: "Der 22 ar 26 de Hunio der do' mil venticié'",
  },
  quickStats: {
    ca: "Resum del Viatge",
    en: "Trip Summary",
    an: "Er resumito de lo que hay",
  },
  statsMembers: {
    ca: "Amics units",
    en: "Friends joined",
    an: "Peñita apuntaílla",
  },
  statsTotalExpenses: {
    ca: "Despesa total",
    en: "Total expenses",
    an: "Arramen de guita",
  },
  statsPlansCount: {
    ca: "Plans programats",
    en: "Scheduled plans",
    an: "Lílo' preparaos",
  },

  // Expenses Tab
  expenseTitle: {
    ca: "Control de Despeses",
    en: "Group Expense Splitter",
    an: "Repartición de Parne' y Gasto'",
  },
  expenseSubtitle: {
    ca: "Paga qui vulgui, l'app calcula qui deu a qui de manera exacta.",
    en: "Anyone pays, the app computes exactly who owes whom.",
    an: "Aquí paga er que tenga, y la máquina diçe quién le debe a quién.",
  },
  addExpenseBtn: {
    ca: "Afegir Gasto",
    en: "Add Expense",
    an: "Mete un gasto ar bote",
  },
  expenseDescInput: {
    ca: "Descripció (ex: Súper Mercadona, Sopar...)",
    en: "Description (e.g., Mercadona supermarket, Dinner)",
    an: "Consesto (ej: Supermercao Mercadona, Bebercio...)",
  },
  expenseAmountInput: {
    ca: "Suma (€)",
    en: "Amount (€)",
    an: "Importe en ebros (€)",
  },
  expensePayer: {
    ca: "Qui ho ha pagat?",
    en: "Who paid?",
    an: "¿Quién ha soltao lo' biles?",
  },
  expenseSplitFor: {
    ca: "Entre qui es divideix? (Deixa buit per repartir entre tots)",
    en: "Split between whom? (Leave empty to split among everyone)",
    an: "¿A quié' le metemo' la clavada? (En blanco pa reparte' entre to')",
  },
  recentExpenses: {
    ca: "Historial de despeses",
    en: "Recent Expenses",
    an: "La cantera de lo' gasto'",
  },
  noExpensesYet: {
    ca: "Encara no hi ha cap despesa. Comença el viatge sense deutes!",
    en: "No expenses logged yet. Keep it clean!",
    an: "¡No hay ni un gasto lodao! De momento e' grati' la jugada.",
  },
  settlementDebts: {
    ca: "Resolució de Deutes (Càlcul intel·ligent)",
    en: "Debt Settlement (Smart Engine)",
    an: "Arreglar Cuentas (Er liquidaor de pufo')",
  },
  debtOwesText: {
    ca: "ha de pagar",
    en: "owes",
    an: "le de' un capasso de ebros a",
  },
  noDebtsYet: {
    ca: "Tots estan al corrent de pagament! Net de deutes.",
    en: "Everyone is fully settled! Zero debts.",
    an: "¡Al día, compadre'! Nadie le debe un clavo a nadie.",
  },
  resetExpensesWarning: {
    ca: "Segur que vols esborrar totes les despeses?",
    en: "Are you sure you want to reset all expenses?",
    an: "¿De verdad quiere' borra' lo' papelillo' der dinero?",
  },

  // Plans Tab
  plansTitle: {
    ca: "Calendari de Plans de la Setmana",
    en: "Our Schedule for the Week",
    an: "La Agenda de los Planaço'",
  },
  plansSubtitle: {
    ca: "Organitza dia a dia el viatge. Vota els plans preferits!",
    en: "Day by day planning. Vote for your favorite activities!",
    an: "Erentorio der día a día. Dale er dedito pa' rriba a lo que te mole.",
  },
  addPlanBtn: {
    ca: "Proposar Nou Pla",
    en: "Propose Plan",
    an: "Vende' un plan",
  },
  planTitleField: {
    ca: "Títol del pla",
    en: "Plan Title",
    an: "Nombre der plan",
  },
  planDescField: {
    ca: "Què farem?",
    en: "Details (What will we do?)",
    an: "¿Qué cohones vam' a hacé?",
  },
  planDateField: {
    ca: "Dia",
    en: "Date",
    an: "Día der lío",
  },
  planTimeField: {
    ca: "Hora",
    en: "Time",
    an: "Hora fihà",
  },
  planLocationField: {
    ca: "Lloc / Adreça",
    en: "Location / Link",
    an: "¿Dónde caé?",
  },
  submitPlan: {
    ca: "Afegir pla",
    en: "Create plan",
    an: "Meté er plan",
  },
  votesCount: {
    ca: "Vots",
    en: "Votes",
    an: "Er que s'apunta",
  },
  dayCa: {
    ca: "Dilluns",
    en: "Monday",
    an: "Lune'",
  },
  dayMa: {
    ca: "Dimarts",
    en: "Tuesday",
    an: "Marte'",
  },
  dayMe: {
    ca: "Dimecres",
    en: "Wednesday",
    an: "Miércoles",
  },
  dayJo: {
    ca: "Dijous",
    en: "Thursday",
    an: "Hueve'",
  },
  dayVe: {
    ca: "Divendres",
    en: "Friday",
    an: "Vierne'",
  },

  // Sightseeing Tab
  sightTitle: {
    ca: "Què Podem Veure a Alacant?",
    en: "What Must We See in Alicante?",
    an: "El Catálogó Monumentá d'Alacant",
  },
  sightSubtitle: {
    ca: "Guia ràpida amb joies recomanades de la Costa Blanca per fer turisme.",
    en: "A curated list of amazing local viewpoints, landmarks, and beaches in Costa Blanca.",
    an: "Los sitito' má' salaos e importanti' de la Costa Blanca pa' postureá'.",
  },
  addressLabel: {
    ca: "Adreça",
    en: "Address",
    an: "Er sitito en er gúguel map'",
  },

  // Games Tab
  gamesTitle: {
    ca: "La Tribu dels Jocs i Votacions",
    en: "Games Corner & Group Votes",
    an: "Er Recreo de Jugetará y Decisión'",
  },
  gamesSubtitle: {
    ca: "Feu una votació ràpida o tireu la ruleta dels millors (o pitjors!) càstigs de viatge.",
    en: "Launch group votes or spin the classic wheel of trip awards or penalties.",
    an: "Echa una votación rápida o dale un viaje a la çarandola pa' que te caiga er castiguito o er premio.",
  },
  spinWheelTitle: {
    ca: "🎡 La Ruleta de la Sort (Càstigs i Rols de nit)",
    en: "🎡 The Destiny Wheel (For dares, chores & rounds of drinks)",
    an: "🎡 Er Turulero der Castigo (A quién le toca arramblá o soltá' er gaznate)",
  },
  spinBtn: {
    ca: "⚡ GIRAR LA RULETA!",
    en: "⚡ SPIN THE WHEEL!",
    an: "⚡ ¡DALE UN TAPASSO AR CHISME!",
  },
  spinWinnerHeader: {
    ca: "🎉 Resultat de la Ruleta:",
    en: "🎉 The Wheel Has Spoken:",
    an: "🎉 ¡Tacháaan! Er resultado sentensiaor e':",
  },
  subVotesTitle: {
    ca: "🗳️ Votacions del Grup (Decisions democràtiques)",
    en: "🗳️ Group Democra-trip Votes",
    an: "🗳️ Er Voto Democráticó de la Peñita",
  },
  createVoteBtn: {
    ca: "Proposar Nova Votació",
    en: "Create Poll",
    an: "Lanzá una encuesta pa' reñí",
  },
  pollQuestion: {
    ca: "Pregunta del dia",
    en: "Question",
    an: "La asuntada pa' preguntá",
  },
  pollOption: {
    ca: "Opció",
    en: "Option",
    an: "Un desididero",
  },
  addOption: {
    ca: "Més opcions",
    en: "More options",
    an: "Meté má' opçión'",
  },
  closePoll: {
    ca: "Tancar votació",
    en: "Close poll",
    an: "Finiquitá la votaçión",
  },
  pollStatusClosed: {
    ca: "TANCADA",
    en: "CLOSED",
    an: "CERRÁ",
  },
  votingProgress: {
    ca: "Progrés de vots",
    en: "Status of votes",
    an: "Cómo va la riña",
  },

  // Profiles Tab
  profilesTitle: {
    ca: "Gestió dels Integrants del Viatge",
    en: "Manage Squad & Roles",
    an: "Er Registro de los Compare' y Susharra'",
  },
  profilesSubtitle: {
    ca: "Aquí pots modificar el teu sobrenom, triar el teu avatar d'Alicant i canviar el rol de cadascú.",
    en: "Personalize nicknames, avatars, and select trip specialities for each friend.",
    an: "Aquí te tunea' el apodo, er jeto-avatar y te ponemo' er cargo que te merese' en er viahaço.",
  },
  idCard: {
    ca: "FITXA TÈCNICA",
    en: "ID CARD",
    an: "ER TARHETÓN",
  },
  editProfileBtn: {
    ca: "Editar Perfil",
    en: "Edit Profile",
    an: "Tuná perfil",
  },
  saveChanges: {
    ca: "Desar canvis",
    en: "Save changes",
    an: "Cuardá lo' desarreglo'",
  },
  cancelBtn: {
    ca: "Cancel·lar",
    en: "Cancel",
    an: "Eshá' patrá'",
  },
  nicknameField: {
    ca: "Sobrenom / Apodo",
    en: "Nickname",
    an: "Er mote / Apodo",
  },
  roleField: {
    ca: "Rol Oficial",
    en: "Official Role",
    an: "El cargo o susharra",
  },
} as const;

export const t = (key: keyof typeof translations, lang: Language): string => {
  return translations[key]?.[lang] || translations[key]?.['ca'] || String(key);
};
