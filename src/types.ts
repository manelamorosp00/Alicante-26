export type Language = 'ca' | 'en' | 'an';

export interface Member {
  id: string;
  name: string;
  nickname: string;
  avatarUrl: string;
  role: string;
  color: string; // Tailwind bg class for avatar accent (e.g., 'bg-orange-500')
  googleUid?: string; // Firebase Auth UID linked to this member
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string; // Member ID
  splitBetween: string[]; // Member IDs
  date: string;
}

export interface PlanItem {
  id: string;
  title: string;
  description: string;
  date: string; // 2026-06-22 to 2026-06-26
  time: string;
  location: string;
  votes: string[]; // Member IDs who liked it
  favorites?: string[]; // Member IDs who favorited it
  isHogueraEvent?: boolean; // Indicates if the plan is an official Hogueras event
  category?: string;          // e.g. '🍺 Birres', '🥘 Tapes', '⛵ Barca'...
  estimatedPrice?: string;    // e.g. '15€/persona' (free text)
  requiresReservation?: boolean;
}

export const PLAN_CATEGORIES = [
  { id: 'hogueres', label: '🔥 Fogueres' },
  { id: 'birres',   label: '🍺 Birres'   },
  { id: 'tapes',    label: '🥘 Tapes'    },
  { id: 'barca',    label: '⛵ Barca'    },
  { id: 'excursio', label: '🏄 Excursió' },
  { id: 'platja',   label: '🏖️ Platja'  },
  { id: 'festa',    label: '🎉 Festa'    },
  { id: 'sopar',    label: '🍽️ Sopar'   },
  { id: 'cultura',  label: '🏛️ Cultura' },
  { id: 'altres',   label: '🎰 Altres'   },
] as const;

export interface SightseeingItem {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  location: string;
  image: string;
  category: 'beach' | 'culture' | 'viewpoint' | 'food';
}

export interface VoteItem {
  id: string;
  question: Record<Language, string>;
  options: {
    id: string;
    text: Record<Language, string>;
    votes: string[]; // Member IDs
  }[];
  createdBy: string;
  closed: boolean;
}

export interface WheelConfig {
  id: string;
  name: string;
  emoji: string;
  items: string[];
  createdBy: string;
}

export interface GameProp {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  type: 'card' | 'drinking' | 'challenge' | 'social';
}

// Drink counter per member
export interface DrinkCount {
  memberId: string;
  birres: number;
  sangries: number;
  cubates: number;
}

// Bingo de Fogueres
export interface BingoCell {
  id: string;
  text: string;
  checkedBy: string[]; // Member IDs who checked this cell
  custom?: boolean;    // true if added by a user
}

// Night rating (one per night date)
export interface NightRating {
  id: string;       // date string e.g. '2026-06-22'
  date: string;
  ratings: { memberId: string; score: number }[];
}

// Playlist song entry
export interface PlaylistSong {
  id: string;
  spotifyUrl: string;
  title: string;
  addedBy: string;     // Member ID
  addedAt: string;     // ISO timestamp
}
