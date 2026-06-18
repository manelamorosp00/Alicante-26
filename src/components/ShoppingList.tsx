import React, { useState } from 'react';
import { Language } from '../types';
import { ShoppingItem } from '../types';
import { defaultShoppingCategories } from '../data';
import { Plus, Trash2 } from 'lucide-react';

interface ShoppingListProps {
  language: Language;
  items: ShoppingItem[];
  activeMemberId: string;
  onToggle: (id: string) => void;
  onAdd: (item: Omit<ShoppingItem, 'id'>) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  fruita: '🥬', begudes: '🧃', proteines: '🥩',
  lactis: '🥛', congelats: '🧊', altres: '🛒',
};

export const ShoppingList: React.FC<ShoppingListProps> = ({
  language, items, activeMemberId, onToggle, onAdd, onDelete,
}) => {
  const [newText, setNewText]     = useState('');
  const [newEmoji, setNewEmoji]   = useState('🛒');
  const [newCat, setNewCat]       = useState('altres');
  const [showAdd, setShowAdd]     = useState(false);

  const checked   = items.filter(i => i.isChecked).length;
  const total     = items.length;
  const pct       = total > 0 ? Math.round((checked / total) * 100) : 0;

  const categories = defaultShoppingCategories.filter(cat =>
    items.some(i => i.category === cat.id)
  );
  // Also include 'altres' if any uncategorised
  const allCatIds = new Set<string>(categories.map(c => c.id));
  const extraCats: string[] = [...new Set<string>(items.map(i => i.category))].filter(c => !allCatIds.has(c));

  const handleAdd = () => {
    if (!newText.trim()) return;
    onAdd({ text: newText.trim(), emoji: newEmoji, category: newCat, isChecked: false, addedBy: activeMemberId });
    setNewText('');
    setNewEmoji('🛒');
    setNewCat('altres');
    setShowAdd(false);
  };

  const label = (ca: string, en: string, an: string) =>
    language === 'ca' ? ca : language === 'en' ? en : an;

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">

      {/* ── Title ── */}
      <div className="pb-1">
        <p className="font-mono text-[10px] uppercase tracking-[3px] text-art-text/35">
          {label('Compartida', 'Shared list', 'Compartía')} · {total} {label('ítems', 'items', 'artículos')}
        </p>
        <h2 className="font-display text-3xl text-art-text uppercase leading-none mt-1">
          {label('La compra', 'Shopping', 'La compra')}
        </h2>
      </div>

      {/* ── Progress bar ── */}
      <div className="relative bg-[#FFEAD2] rounded-2xl h-10 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#FF5A1F] to-[#E0290B] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
        <div className="relative flex items-center h-full px-4">
          <span className="text-white font-black text-xs">
            {checked} {label('de', 'of', 'de')} {total} {label('al carro', 'in cart', 'en el carro')} 🛒
          </span>
          <span className="ml-auto font-mono text-[10px] text-white/70">{pct}%</span>
        </div>
      </div>

      {/* ── Items grouped by category ── */}
      {[...defaultShoppingCategories, ...extraCats.map(id => ({ id, label: id, emoji: '🛒' }))].map(cat => {
        const catItems = items.filter(i => i.category === cat.id);
        if (catItems.length === 0) return null;
        return (
          <div key={cat.id}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{CATEGORY_EMOJIS[cat.id as string] || cat.emoji || '🛒'}</span>
              <span className="font-black uppercase text-xs text-art-text/50 tracking-wider">
                {cat.label}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {catItems.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                    item.isChecked
                      ? 'bg-[#FFF8EE] border-[#FFE3C9] opacity-65'
                      : 'bg-white border-[#FFD9B8] shadow-[0_2px_8px_rgba(42,26,18,0.06)]'
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => onToggle(item.id)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      item.isChecked
                        ? 'bg-art-orange border-art-orange'
                        : 'border-[#FFB57A] hover:border-art-orange'
                    }`}
                  >
                    {item.isChecked && <span className="text-white font-black text-xs leading-none">✓</span>}
                  </button>

                  <span className="text-lg leading-none shrink-0">{item.emoji}</span>

                  <span className={`flex-1 text-sm font-semibold ${
                    item.isChecked ? 'line-through text-art-text/40' : 'text-art-text'
                  }`}>
                    {item.text}
                  </span>

                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="text-art-text/20 hover:text-art-garnet transition-colors cursor-pointer shrink-0 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* ── Add item form ── */}
      {showAdd ? (
        <div className="bg-white border border-[#FFD9B8] rounded-2xl p-4 shadow-[0_4px_16px_rgba(42,26,18,0.10)] flex flex-col gap-3 animate-fadeIn">
          <p className="font-mono text-[9px] uppercase tracking-widest text-art-text/35">
            {label('Afegir producte', 'Add product', 'Añadir producto')}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newEmoji}
              onChange={e => setNewEmoji(e.target.value)}
              className="w-12 text-center text-xl border border-[#FFD9B8] rounded-xl px-1 py-2 focus:outline-none focus:border-art-orange"
              maxLength={2}
            />
            <input
              type="text"
              value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder={label('Nom del producte…', 'Product name…', 'Nombre del producto…')}
              className="flex-1 border border-[#FFD9B8] rounded-xl px-3 py-2 text-sm font-medium text-art-text focus:outline-none focus:border-art-orange bg-[#FFF4E6]"
              autoFocus
            />
          </div>
          <select
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            className="w-full border border-[#FFD9B8] rounded-xl px-3 py-2 text-sm text-art-text bg-[#FFF4E6] focus:outline-none focus:border-art-orange cursor-pointer"
          >
            {defaultShoppingCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="flex-1 py-2 border border-[#FFD9B8] bg-white text-art-text/60 font-black text-xs uppercase rounded-xl cursor-pointer hover:bg-[#FFF4E6] transition-colors"
            >
              {label('Cancel·lar', 'Cancel', 'Cancelar')}
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 py-2 bg-art-orange text-white font-black text-xs uppercase rounded-xl cursor-pointer hover:bg-art-garnet transition-colors shadow-[0_2px_8px_rgba(255,90,31,0.30)]"
            >
              {label('Afegir', 'Add', 'Añadir')}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-3 w-full bg-white border border-dashed border-[#FFD9B8] rounded-2xl px-4 py-3 text-art-text/40 hover:text-art-orange hover:border-art-orange transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-[#FFF4E6] group-hover:bg-art-orange flex items-center justify-center transition-colors">
            <Plus className="w-4 h-4 text-art-text/40 group-hover:text-white transition-colors" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider">
            {label('Afegir producte…', 'Add product…', 'Añadir producto…')}
          </span>
        </button>
      )}

    </div>
  );
};
