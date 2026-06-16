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
}

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

export interface GameProp {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  type: 'card' | 'drinking' | 'challenge' | 'social';
}
