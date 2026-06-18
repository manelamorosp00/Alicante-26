import React, { useState } from 'react';
import { Language, Recipe, MealType } from '../types';
import { Clock, Users, ChefHat, ShoppingCart } from 'lucide-react';

interface ReceptesProps {
  language: Language;
  recipes: Recipe[];
  onAddToShopping: (ingredients: string[], recipeName: string) => void;
}

const MEAL_TABS: { id: MealType | 'tot'; label: Record<string, string>; emoji: string }[] = [
  { id: 'tot',    label: { ca: 'Tot', en: 'All', an: 'Too' },        emoji: '🍽️' },
  { id: 'dinar',  label: { ca: 'Dinars', en: 'Lunch', an: 'Comías' }, emoji: '🌞' },
  { id: 'sopar',  label: { ca: 'Sopars', en: 'Dinner', an: 'Cenas' }, emoji: '🌙' },
  { id: 'picnic', label: { ca: 'Picnic', en: 'Picnic', an: 'Picnic' }, emoji: '🧺' },
];

const MEAL_GRADIENT: Record<MealType, string> = {
  dinar:  'from-[#FF5A1F] via-[#E0290B] to-[#2A1A12]',
  sopar:  'from-[#2A1A12] via-[#3D1F0A] to-[#E0290B]',
  picnic: 'from-[#FFD23F] via-[#FF5A1F] to-[#E0290B]',
};

export const Receptes: React.FC<ReceptesProps> = ({ language, recipes, onAddToShopping }) => {
  const [activeTab, setActiveTab]       = useState<MealType | 'tot'>('tot');
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [addedFlash, setAddedFlash]     = useState<string | null>(null);

  const t = (ca: string, en: string, an: string) =>
    language === 'ca' ? ca : language === 'en' ? en : an;

  const filtered = activeTab === 'tot'
    ? recipes
    : recipes.filter(r => r.mealType === activeTab);

  const hero = filtered[0] ?? null;

  const handleAddToShopping = (recipe: Recipe) => {
    onAddToShopping(recipe.ingredients, recipe.name);
    setAddedFlash(recipe.id);
    setTimeout(() => setAddedFlash(null), 2000);
  };

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">

      {/* ── Title ── */}
      <div className="pb-1">
        <p className="font-mono text-[10px] uppercase tracking-[3px] text-art-text/35">
          {t('Menjar de la colla', 'Group meals', 'Comida del grupo')} · {recipes.length} {t('receptes', 'recipes', 'recetas')}
        </p>
        <h2 className="font-display text-3xl text-art-text uppercase leading-none mt-1">
          {t('Receptes', 'Recipes', 'Recetas')}
        </h2>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {MEAL_TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black uppercase whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              activeTab === tab.id
                ? 'bg-art-garnet text-white shadow-[0_4px_12px_rgba(224,41,11,0.30)]'
                : 'bg-white border border-[#FFD9B8] text-art-text/60 hover:border-art-orange'
            }`}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label[language] ?? tab.label['ca']}</span>
          </button>
        ))}
      </div>

      {/* ── Hero card (first recipe) ── */}
      {hero && (
        <div
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${MEAL_GRADIENT[hero.mealType]} p-5 shadow-[0_8px_24px_rgba(224,41,11,0.25)] cursor-pointer`}
          onClick={() => setExpandedId(expandedId === hero.id ? null : hero.id)}
        >
          {/* Glow */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#FFD23F]/20 blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[9px] text-white/50 uppercase tracking-widest mb-1">
                {hero.emoji} {hero.dayLabel} · {hero.mealType}
              </p>
              <h3 className="font-display text-3xl text-white uppercase leading-none tracking-tight">
                {hero.name}
              </h3>
              <p className="font-mono text-[10px] text-white/50 mt-1 uppercase tracking-wider">
                {t('per', 'by', 'de')} {hero.author}
              </p>
            </div>
            <span className="text-5xl leading-none shrink-0">{hero.emoji}</span>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-white/60" />
              <span className="font-mono text-xs text-white/80">{hero.timeMinutes}'</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-white/60" />
              <span className="font-mono text-xs text-white/80">{hero.servings} {t('persones', 'people', 'personas')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5 text-white/60" />
              <span className="font-mono text-xs text-white/80">{hero.ingredients.length} {t('ingredients', 'ingredients', 'ingredientes')}</span>
            </div>
          </div>

          {/* Expanded ingredients */}
          {expandedId === hero.id && (
            <div className="mt-4 pt-4 border-t border-white/15 flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {hero.ingredients.map((ing, i) => (
                  <span key={i} className="px-2.5 py-1 bg-white/15 rounded-xl text-white text-xs font-semibold backdrop-blur-sm">
                    {ing}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); handleAddToShopping(hero); }}
                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl font-black text-xs uppercase transition-all cursor-pointer ${
                  addedFlash === hero.id
                    ? 'bg-[#FFD23F] text-[#2A1A12]'
                    : 'bg-white text-art-garnet hover:bg-[#FFF4E6]'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {addedFlash === hero.id
                  ? t('✓ Afegit a la compra!', '✓ Added to cart!', '✓ Añadido!')
                  : t('Afegir ingredients a la compra', 'Add ingredients to cart', 'Añadir ingredientes')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Rest of recipes ── */}
      {filtered.slice(1).map(recipe => (
        <div
          key={recipe.id}
          className="bg-white border border-[#FFD9B8] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(42,26,18,0.06)] cursor-pointer"
          onClick={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}
        >
          <div className="flex items-center gap-3 p-4">
            {/* Day tag */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF5A1F] to-[#E0290B] flex flex-col items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(255,90,31,0.25)]">
              <span className="font-display text-white text-xl leading-none">{recipe.emoji}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[9px] text-art-text/40 uppercase tracking-widest">{recipe.dayLabel}</span>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                  recipe.mealType === 'dinar' ? 'bg-[#FFF4E6] text-art-orange' :
                  recipe.mealType === 'sopar' ? 'bg-[#2A1A12] text-white' :
                  'bg-[#FFD23F] text-[#2A1A12]'
                }`}>
                  {recipe.mealType}
                </span>
              </div>
              <p className="font-display text-xl text-art-text uppercase leading-tight mt-0.5">{recipe.name}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-mono text-[9px] text-art-text/35">⏱ {recipe.timeMinutes}'</span>
                <span className="font-mono text-[9px] text-art-text/35">👥 {recipe.servings}</span>
                <span className="font-mono text-[9px] text-art-text/35 truncate">{t('per', 'by', 'de')} {recipe.author}</span>
              </div>
            </div>

            <div className={`text-art-text/30 transition-transform duration-200 ${expandedId === recipe.id ? 'rotate-180' : ''}`}>
              ▼
            </div>
          </div>

          {/* Expandable details */}
          {expandedId === recipe.id && (
            <div className="px-4 pb-4 pt-0 border-t border-[#FFD9B8]/50 flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5 pt-3">
                {recipe.ingredients.map((ing, i) => (
                  <span key={i} className="px-2 py-0.5 bg-[#FFF4E6] border border-[#FFD9B8] rounded-xl text-art-text text-xs font-semibold">
                    {ing}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); handleAddToShopping(recipe); }}
                className={`flex items-center justify-center gap-2 w-full py-2 rounded-xl font-black text-xs uppercase cursor-pointer transition-all border ${
                  addedFlash === recipe.id
                    ? 'bg-[#FFD23F] border-[#FFD23F] text-[#2A1A12]'
                    : 'bg-[#FFF4E6] border-[#FFD9B8] text-art-orange hover:bg-art-orange hover:text-white hover:border-art-orange'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                {addedFlash === recipe.id
                  ? t('✓ Afegit!', '✓ Added!', '✓ Añadido!')
                  : t('Afegir ingredients a la compra', 'Add to cart', 'Añadir ingredientes')}
              </button>
            </div>
          )}
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-art-text/30">
          <span className="text-5xl">🍽️</span>
          <p className="font-mono text-xs uppercase tracking-wider">
            {t('Sense receptes en aquesta categoria', 'No recipes in this category', 'Sin recetas aquí')}
          </p>
        </div>
      )}

    </div>
  );
};
