import React, { useState } from 'react';
import { Language, Recipe, MealType } from '../types';
import { Clock, Users, ShoppingCart, Plus, X, ChefHat } from 'lucide-react';

const RECOMANADES: Recipe[] = [
  { id: 'r_paella', name: 'Paella valenciana', emoji: '🥘', dayLabel: 'Dissabte', mealType: 'dinar', servings: 10, timeMinutes: 60, author: 'La tradicio', ingredients: ['Arros bomba', 'Pollastre', 'Conill', 'Bajoqueta', 'Garrofo', 'Tomaquets', 'Pimento roig', 'Safra', 'Oli', 'Sal', 'Pebre'] },
  { id: 'r_fideua', name: 'Fideua de marisc', emoji: '🦐', dayLabel: 'Diumenge', mealType: 'dinar', servings: 10, timeMinutes: 45, author: 'La tradicio', ingredients: ['Fideus gruixuts', 'Sipia', 'Gambes', 'Cloises', 'Ceba', 'Tomaquets', 'All', 'Caldo de peix', 'Allioli', 'Oli'] },
  { id: 'r_gazpacho', name: 'Gazpacho andaluz', emoji: '🍅', dayLabel: 'Qualsevol', mealType: 'sopar', servings: 10, timeMinutes: 15, author: 'La tradicio', ingredients: ['Tomaquets madurs', 'Cogombre', 'Pimento verd', 'All', 'Pa dur', 'Vinagre de Xeres', 'Oli', 'Sal'] },
  { id: 'r_bocatas', name: 'Bocadillos de cami', emoji: '🥖', dayLabel: 'Platja', mealType: 'picnic', servings: 10, timeMinutes: 20, author: 'La colla', ingredients: ['Pa de baguette', 'Pernil serrano', 'Formatge manchego', 'Tomaquets', 'Oli', 'Sal', 'Fuet', 'Anxoves'] },
  { id: 'r_sangria', name: 'Sangria de la colla', emoji: '🍷', dayLabel: 'Vespre', mealType: 'sopar', servings: 10, timeMinutes: 10, author: 'La colla', ingredients: ['Vi negre 2L', 'Conyac', 'Sucre', 'Taronja', 'Llimona', 'Poma', 'Canyella', 'Sifon'] },
  { id: 'r_tapas', name: 'Tapes variades', emoji: '🫙', dayLabel: 'Aperitiu', mealType: 'picnic', servings: 10, timeMinutes: 30, author: 'La colla', ingredients: ['Patates braves', 'Croquetes', 'Pernil iberic', 'Formatge', 'Olives', 'Anxoves', 'Truita de patata', 'Pa amb tomaquet'] },
  { id: 'r_arroz_banda', name: 'Arros a banda', emoji: '🍚', dayLabel: 'Dilluns', mealType: 'dinar', servings: 10, timeMinutes: 50, author: 'La tradicio', ingredients: ['Arros bomba', 'Peix de roca', 'Sipia', 'Gambetes', 'All', 'Tomaquets', 'Nyora', 'Oli', 'Sal', 'Allioli'] },
  { id: 'r_ensalada', name: 'Amanida de estiu', emoji: '🥗', dayLabel: 'Qualsevol', mealType: 'sopar', servings: 10, timeMinutes: 10, author: 'La colla', ingredients: ['Enciam', 'Tomaquets cirera', 'Ceba morada', 'Olives negres', 'Atun', 'Ou dur', 'Vinagreta'] },
];

const MEAL_TABS: { id: MealType | 'tot'; emoji: string; label: Record<string, string> }[] = [
  { id: 'tot',    emoji: '🍽️', label: { ca: 'Tot', en: 'All', an: 'Too' } },
  { id: 'dinar',  emoji: '🌞', label: { ca: 'Dinars', en: 'Lunch', an: 'Comias' } },
  { id: 'sopar',  emoji: '🌙', label: { ca: 'Sopars', en: 'Dinner', an: 'Cenas' } },
  { id: 'picnic', emoji: '🧺', label: { ca: 'Picnic', en: 'Picnic', an: 'Picnic' } },
];

const HERO_GRAD: Record<MealType, string> = {
  dinar:  'from-[#FF5A1F] via-[#E0290B] to-[#2A1A12]',
  sopar:  'from-[#2A1A12] via-[#3D1F0A] to-[#E0290B]',
  picnic: 'from-[#FFD23F] via-[#FF5A1F] to-[#E0290B]',
};

interface ReceptesProps {
  language: Language;
  customRecipes: Recipe[];
  onAddToShopping: (ingredients: string[], recipeName: string) => void;
  onAddRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  onDeleteRecipe: (id: string) => void;
}

export const Receptes: React.FC<ReceptesProps> = ({
  language, customRecipes, onAddToShopping, onAddRecipe, onDeleteRecipe,
}) => {
  const [activeTab, setActiveTab]   = useState<MealType | 'tot'>('tot');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addedFlash, setAddedFlash] = useState<string | null>(null);
  const [showAdd, setShowAdd]       = useState(false);
  const [search, setSearch]         = useState('');

  const [fName, setFName]         = useState('');
  const [fEmoji, setFEmoji]       = useState('🍽️');
  const [fMeal, setFMeal]         = useState<MealType>('dinar');
  const [fDay, setFDay]           = useState('');
  const [fServings, setFServings] = useState(10);
  const [fTime, setFTime]         = useState(30);
  const [fIngr, setFIngr]         = useState('');

  const t = (ca: string, en: string, an: string) =>
    language === 'ca' ? ca : language === 'en' ? en : an;

  const allRecipes = [...customRecipes, ...RECOMANADES];

  const filtered = allRecipes.filter(r => {
    const matchTab    = activeTab === 'tot' || r.mealType === activeTab;
    const q           = search.toLowerCase();
    const matchSearch = !search || r.name.toLowerCase().includes(q) ||
      r.ingredients.some(i => i.toLowerCase().includes(q));
    return matchTab && matchSearch;
  });

  const hero = filtered[0] ?? null;

  const handleAddToShopping = (recipe: Recipe) => {
    onAddToShopping(recipe.ingredients, recipe.name);
    setAddedFlash(recipe.id);
    setTimeout(() => setAddedFlash(null), 2000);
  };

  const handleSubmitRecipe = () => {
    if (!fName.trim()) return;
    onAddRecipe({
      name: fName.trim(),
      emoji: fEmoji,
      mealType: fMeal,
      dayLabel: fDay.trim() || t('Qualsevol dia', 'Any day', 'Cualquier dia'),
      servings: fServings,
      timeMinutes: fTime,
      author: t('La colla', 'The crew', 'La pandilla'),
      ingredients: fIngr.split('\n').map(s => s.trim()).filter(Boolean),
    });
    setFName(''); setFEmoji('🍽️'); setFMeal('dinar'); setFDay('');
    setFServings(10); setFTime(30); setFIngr('');
    setShowAdd(false);
  };

  const isCustom = (id: string) => customRecipes.some(r => r.id === id);

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">

      <div className="flex items-end justify-between pb-1">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[3px] text-art-text/35">
            {t('Menjar de la colla', 'Group meals', 'Comida del grupo')} · {allRecipes.length}
          </p>
          <h2 className="font-display text-3xl text-art-text uppercase leading-none mt-1">
            {t('Receptes', 'Recipes', 'Recetas')}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl font-black text-xs uppercase transition-all cursor-pointer ${
            showAdd
              ? 'bg-art-garnet text-white'
              : 'bg-art-orange text-white hover:bg-art-garnet shadow-[0_2px_8px_rgba(255,90,31,0.30)]'
          }`}
        >
          {showAdd ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showAdd ? t('Tancar', 'Close', 'Cerrar') : t('Afegir', 'Add', 'Anadir')}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white border border-[#FFD9B8] rounded-2xl p-4 flex flex-col gap-3 shadow-[0_4px_16px_rgba(42,26,18,0.10)] animate-fadeIn">
          <p className="font-mono text-[9px] uppercase tracking-widest text-art-text/35">
            {t('Nova recepta', 'New recipe', 'Nueva receta')}
          </p>
          <div className="flex gap-2">
            <input type="text" value={fEmoji} onChange={e => setFEmoji(e.target.value)}
              className="w-12 text-center text-xl border border-[#FFD9B8] rounded-xl px-1 py-2 focus:outline-none focus:border-art-orange" maxLength={2} />
            <input type="text" value={fName} onChange={e => setFName(e.target.value)}
              placeholder={t('Nom del plat', 'Dish name', 'Nombre del plato')}
              className="flex-1 border border-[#FFD9B8] rounded-xl px-3 py-2 text-sm font-medium text-art-text focus:outline-none focus:border-art-orange bg-[#FFF4E6]" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select value={fMeal} onChange={e => setFMeal(e.target.value as MealType)}
              className="border border-[#FFD9B8] rounded-xl px-3 py-2 text-sm text-art-text bg-[#FFF4E6] focus:outline-none focus:border-art-orange cursor-pointer">
              <option value="dinar">🌞 {t('Dinar', 'Lunch', 'Comida')}</option>
              <option value="sopar">🌙 {t('Sopar', 'Dinner', 'Cena')}</option>
              <option value="picnic">🧺 Picnic</option>
            </select>
            <input type="text" value={fDay} onChange={e => setFDay(e.target.value)}
              placeholder={t('Dia (opcional)', 'Day (opt.)', 'Dia (opc.)')}
              className="border border-[#FFD9B8] rounded-xl px-3 py-2 text-sm text-art-text focus:outline-none focus:border-art-orange bg-[#FFF4E6]" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 border border-[#FFD9B8] rounded-xl px-3 py-2 bg-[#FFF4E6]">
              <Users className="w-3.5 h-3.5 text-art-text/40" />
              <input type="number" value={fServings} onChange={e => setFServings(Number(e.target.value))} min={1} max={50}
                className="w-full text-sm text-art-text bg-transparent focus:outline-none" />
            </div>
            <div className="flex items-center gap-2 border border-[#FFD9B8] rounded-xl px-3 py-2 bg-[#FFF4E6]">
              <Clock className="w-3.5 h-3.5 text-art-text/40" />
              <input type="number" value={fTime} onChange={e => setFTime(Number(e.target.value))} min={5} max={300}
                className="w-full text-sm text-art-text bg-transparent focus:outline-none" />
              <span className="text-xs text-art-text/40">min</span>
            </div>
          </div>
          <textarea value={fIngr} onChange={e => setFIngr(e.target.value)}
            placeholder={t('Ingredients (un per linia)', 'Ingredients (one per line)', 'Ingredientes (uno por linea)')}
            rows={4}
            className="w-full border border-[#FFD9B8] rounded-xl px-3 py-2 text-sm text-art-text focus:outline-none focus:border-art-orange bg-[#FFF4E6] resize-none" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowAdd(false)}
              className="flex-1 py-2 border border-[#FFD9B8] bg-white text-art-text/60 font-black text-xs uppercase rounded-xl cursor-pointer hover:bg-[#FFF4E6] transition-colors">
              {t('Cancel·lar', 'Cancel', 'Cancelar')}
            </button>
            <button type="button" onClick={handleSubmitRecipe}
              className="flex-1 py-2 bg-art-orange text-white font-black text-xs uppercase rounded-xl cursor-pointer hover:bg-art-garnet transition-colors shadow-[0_2px_8px_rgba(255,90,31,0.30)]">
              {t('Guardar', 'Save', 'Guardar')}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 bg-white border border-[#FFD9B8] rounded-2xl px-4 py-2.5 shadow-[0_1px_4px_rgba(42,26,18,0.06)]">
        <ChefHat className="w-4 h-4 text-art-text/30 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('Cerca receptes o ingredients', 'Search recipes or ingredients', 'Busca recetas o ingredientes')}
          className="flex-1 text-sm text-art-text bg-transparent focus:outline-none placeholder:text-art-text/30"
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} className="text-art-text/30 hover:text-art-text cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {MEAL_TABS.map(tab => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black uppercase whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              activeTab === tab.id
                ? 'bg-art-garnet text-white shadow-[0_4px_12px_rgba(224,41,11,0.30)]'
                : 'bg-white border border-[#FFD9B8] text-art-text/60 hover:border-art-orange'
            }`}>
            <span>{tab.emoji}</span>
            <span>{tab.label[language] ?? tab.label['ca']}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-art-text/30">
          <span className="text-5xl">🍽️</span>
          <p className="font-mono text-xs uppercase tracking-wider">
            {search ? t('Cap resultat', 'No results', 'Sin resultados') : t('Sense receptes', 'No recipes here', 'Sin recetas')}
          </p>
        </div>
      )}

      {hero && (
        <div
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${HERO_GRAD[hero.mealType]} p-5 shadow-[0_8px_24px_rgba(224,41,11,0.25)] cursor-pointer`}
          onClick={() => setExpandedId(expandedId === hero.id ? null : hero.id)}
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#FFD23F]/20 blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[9px] text-white/50 uppercase tracking-widest mb-1">
                {hero.dayLabel} · {hero.mealType}
                {isCustom(hero.id) && (
                  <span className="ml-2 bg-[#FFD23F] text-[#2A1A12] px-1.5 py-0.5 rounded-full text-[7px] font-black">
                    {t('propia', 'custom', 'propia')}
                  </span>
                )}
              </p>
              <h3 className="font-display text-3xl text-white uppercase leading-none tracking-tight">{hero.name}</h3>
              <p className="font-mono text-[10px] text-white/50 mt-1 uppercase tracking-wider">{t('per', 'by', 'de')} {hero.author}</p>
            </div>
            <span className="text-5xl leading-none shrink-0">{hero.emoji}</span>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-white/60" /><span className="font-mono text-xs text-white/80">{hero.timeMinutes} min</span></div>
            <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-white/60" /><span className="font-mono text-xs text-white/80">{hero.servings} persones</span></div>
          </div>
          {expandedId === hero.id && (
            <div className="mt-4 pt-4 border-t border-white/15 flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {hero.ingredients.map((ing, i) => (
                  <span key={i} className="px-2.5 py-1 bg-white/15 rounded-xl text-white text-xs font-semibold backdrop-blur-sm">{ing}</span>
                ))}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={e => { e.stopPropagation(); handleAddToShopping(hero); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl font-black text-xs uppercase transition-all cursor-pointer ${addedFlash === hero.id ? 'bg-[#FFD23F] text-[#2A1A12]' : 'bg-white text-art-garnet hover:bg-[#FFF4E6]'}`}>
                  <ShoppingCart className="w-4 h-4" />
                  {addedFlash === hero.id ? t('Afegit!', 'Added!', 'Anadido!') : t('Afegir a la compra', 'Add to cart', 'Al carro')}
                </button>
                {isCustom(hero.id) && (
                  <button type="button" onClick={e => { e.stopPropagation(); onDeleteRecipe(hero.id); }}
                    className="px-4 py-2.5 rounded-2xl bg-white/20 text-white font-black text-xs uppercase cursor-pointer hover:bg-white/30 transition-all">
                    🗑
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {filtered.slice(1).map(recipe => (
        <div key={recipe.id}
          className="bg-white border border-[#FFD9B8] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(42,26,18,0.06)] cursor-pointer"
          onClick={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}>
          <div className="flex items-center gap-3 p-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF5A1F] to-[#E0290B] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(255,90,31,0.25)]">
              <span className="text-xl">{recipe.emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-[9px] text-art-text/40 uppercase tracking-widest">{recipe.dayLabel}</span>
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${recipe.mealType === 'dinar' ? 'bg-[#FFF4E6] text-art-orange' : recipe.mealType === 'sopar' ? 'bg-[#2A1A12] text-white' : 'bg-[#FFD23F] text-[#2A1A12]'}`}>
                  {recipe.mealType}
                </span>
                {isCustom(recipe.id) && (
                  <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FFD23F] text-[#2A1A12]">
                    {t('propia', 'custom', 'propia')}
                  </span>
                )}
              </div>
              <p className="font-display text-xl text-art-text uppercase leading-tight mt-0.5">{recipe.name}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="font-mono text-[9px] text-art-text/35">⏱ {recipe.timeMinutes} min</span>
                <span className="font-mono text-[9px] text-art-text/35">👥 {recipe.servings}</span>
              </div>
            </div>
            <span className={`text-art-text/30 transition-transform duration-200 text-xs ${expandedId === recipe.id ? 'rotate-180' : ''}`}>▼</span>
          </div>
          {expandedId === recipe.id && (
            <div className="px-4 pb-4 border-t border-[#FFD9B8]/50 flex flex-col gap-3 pt-3">
              <div className="flex flex-wrap gap-1.5">
                {recipe.ingredients.map((ing, i) => (
                  <span key={i} className="px-2 py-0.5 bg-[#FFF4E6] border border-[#FFD9B8] rounded-xl text-art-text text-xs font-semibold">{ing}</span>
                ))}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={e => { e.stopPropagation(); handleAddToShopping(recipe); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-black text-xs uppercase cursor-pointer transition-all border ${addedFlash === recipe.id ? 'bg-[#FFD23F] border-[#FFD23F] text-[#2A1A12]' : 'bg-[#FFF4E6] border-[#FFD9B8] text-art-orange hover:bg-art-orange hover:text-white hover:border-art-orange'}`}>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  {addedFlash === recipe.id ? t('Afegit!', 'Added!', 'Anadido!') : t('Afegir a la compra', 'Add to cart', 'Al carro')}
                </button>
                {isCustom(recipe.id) && (
                  <button type="button" onClick={e => { e.stopPropagation(); onDeleteRecipe(recipe.id); }}
                    className="px-3 py-2 rounded-xl border border-[#FFD9B8] text-art-text/40 hover:text-art-garnet hover:border-art-garnet font-black text-xs cursor-pointer transition-all">
                    🗑
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

    </div>
  );
};
