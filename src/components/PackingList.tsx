import React, { useState } from 'react';
import { Language, PackingItem, Member } from '../types';
import { Plus, Trash2 } from 'lucide-react';

interface PackingListProps {
  language: Language;
  items: PackingItem[];
  members: Member[];
  activeMemberId: string;
  onToggle: (id: string) => void;
  onAdd: (item: Omit<PackingItem, 'id'>) => void;
  onDelete: (id: string) => void;
}

type PackingTab = 'shared' | 'personal';

const PERSONAL_TIPS = [
  '🧴 Crema solar', '🕶️ Ulleres de sol', '🔌 Carregador', '🩴 Xancletes',
  '💊 Medicació', '🛂 DNI', '🩱 Banyador', '📱 Mòbil carregat',
  '🎧 Auriculars', '💸 Efectiu', '🪥 Necesser', '🧢 Gorra',
  '🌂 Paraigua plegable', '🔑 Claus de casa',
];

export const PackingList: React.FC<PackingListProps> = ({
  language, items, members, activeMemberId, onToggle, onAdd, onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<PackingTab>('shared');
  const [showAdd, setShowAdd]     = useState(false);
  const [newText, setNewText]     = useState('');
  const [newEmoji, setNewEmoji]   = useState('📦');
  const [newAssignee, setNewAssignee] = useState(activeMemberId);

  const t = (ca: string, en: string, an: string) =>
    language === 'ca' ? ca : language === 'en' ? en : an;

  const sharedItems   = items.filter(i => i.type === 'shared');
  const personalItems = items.filter(i => i.type === 'personal' && i.assignedTo === activeMemberId);
  const sharedDone    = sharedItems.filter(i => i.isChecked).length;
  const personalDone  = personalItems.filter(i => i.isChecked).length;

  const handleAdd = () => {
    if (!newText.trim()) return;
    onAdd({
      text: newText.trim(),
      emoji: newEmoji,
      type: activeTab,
      assignedTo: activeTab === 'shared' ? newAssignee : activeMemberId,
      isChecked: false,
    });
    setNewText('');
    setNewEmoji('📦');
    setNewAssignee(activeMemberId);
    setShowAdd(false);
  };

  const getMember = (id: string) =>
    members.find(m => m.id === id || m.nickname?.toLowerCase() === id.toLowerCase());

  const currentItems = activeTab === 'shared' ? sharedItems : personalItems;
  const currentDone  = activeTab === 'shared' ? sharedDone  : personalDone;

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">

      <div className="pb-1">
        <p className="font-mono text-[10px] uppercase tracking-[3px] text-art-text/35">
          {t('Preparatius de viatge', 'Travel prep', 'Preparativos')}
        </p>
        <h2 className="font-display text-3xl text-art-text uppercase leading-none mt-1">
          {t('Que cal portar', 'What to bring', 'Que llevar')}
        </h2>
      </div>

      <div className="flex bg-[#FFEAD2] rounded-2xl p-1 gap-1">
        {([
          { id: 'shared'   as const, emoji: '🤝', label: t('En comu', 'Shared', 'En comun'), count: `${sharedDone}/${sharedItems.length}` },
          { id: 'personal' as const, emoji: '🎒', label: t('El meu sac', 'My bag', 'Mi mochila'), count: `${personalDone}/${personalItems.length}` },
        ]).map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => { setActiveTab(tab.id); setShowAdd(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white shadow-[0_2px_8px_rgba(42,26,18,0.10)] text-art-text'
                : 'text-art-text/50 hover:text-art-text'
            }`}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
            <span className="font-mono text-[10px] opacity-50">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className={`rounded-3xl p-4 flex items-center justify-between ${
        activeTab === 'shared'
          ? 'bg-gradient-to-br from-[#FF5A1F] to-[#E0290B]'
          : 'bg-[#2A1A12]'
      }`}>
        <div>
          <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest">
            {activeTab === 'shared'
              ? t('Articles per a tothom', 'Items for everyone', 'Para todos')
              : t('La teva llista personal', 'Your personal list', 'Tu lista personal')}
          </p>
          <p className="font-display text-3xl text-[#FFD23F] leading-none mt-1">
            {currentDone}<span className="text-xl text-white/30">/{currentItems.length}</span>
          </p>
          <p className="font-mono text-[8px] text-white/30 uppercase tracking-widest mt-1">
            {t('preparats', 'ready', 'listos')}
          </p>
        </div>
        <span className="text-5xl select-none">{activeTab === 'shared' ? '🤝' : '🎒'}</span>
      </div>

      {currentItems.length === 0 && !showAdd && (
        <div className="flex flex-col items-center gap-3 py-8 text-art-text/30">
          <span className="text-4xl">{activeTab === 'shared' ? '🤝' : '🎒'}</span>
          <p className="font-mono text-[10px] uppercase tracking-wider text-center">
            {activeTab === 'shared'
              ? t('Cap article en comu encara', 'No shared items yet', 'Sin articulos comunes')
              : t('La teva llista es buida', 'Your list is empty', 'Tu lista esta vacia')}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {currentItems.map(item => {
          const assigneeMember = getMember(item.assignedTo);
          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                item.isChecked
                  ? 'bg-[#FFF8EE] border-[#FFE3C9] opacity-60'
                  : 'bg-white border-[#FFD9B8] shadow-[0_2px_8px_rgba(42,26,18,0.06)]'
              }`}
            >
              <button
                type="button"
                onClick={() => onToggle(item.id)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                  item.isChecked ? 'bg-art-orange border-art-orange' : 'border-[#FFB57A] hover:border-art-orange'
                }`}
              >
                {item.isChecked && <span className="text-white font-black text-xs leading-none">✓</span>}
              </button>
              <span className="text-xl shrink-0">{item.emoji}</span>
              <span className={`flex-1 text-sm font-semibold ${item.isChecked ? 'line-through text-art-text/40' : 'text-art-text'}`}>
                {item.text}
              </span>
              {activeTab === 'shared' && item.assignedTo && (
                <span className="text-[10px] font-black bg-[#FFF4E6] border border-[#FFD9B8] px-2 py-0.5 rounded-full text-art-text/60 shrink-0">
                  {assigneeMember
                    ? (assigneeMember.avatarUrl + ' ' + (assigneeMember.nickname || assigneeMember.name).split(' ')[0])
                    : item.assignedTo}
                </span>
              )}
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="text-art-text/20 hover:text-art-garnet transition-colors cursor-pointer shrink-0 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {showAdd ? (
        <div className="bg-white border border-[#FFD9B8] rounded-2xl p-4 shadow-[0_4px_16px_rgba(42,26,18,0.10)] flex flex-col gap-3 animate-fadeIn">
          <p className="font-mono text-[9px] uppercase tracking-widest text-art-text/35">
            {t('Afegir article', 'Add item', 'Anadir articulo')} · {activeTab === 'shared' ? '🤝' : '🎒'}
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
              placeholder={t("Nom de l'article", 'Item name', 'Nombre del articulo')}
              className="flex-1 border border-[#FFD9B8] rounded-xl px-3 py-2 text-sm font-medium text-art-text focus:outline-none focus:border-art-orange bg-[#FFF4E6]"
              autoFocus
            />
          </div>
          {activeTab === 'shared' && (
            <select
              value={newAssignee}
              onChange={e => setNewAssignee(e.target.value)}
              className="w-full border border-[#FFD9B8] rounded-xl px-3 py-2 text-sm text-art-text bg-[#FFF4E6] focus:outline-none focus:border-art-orange cursor-pointer"
            >
              <option value="">{t('Sense assignar', 'Unassigned', 'Sin asignar')}</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.avatarUrl} {m.nickname || m.name}</option>
              ))}
            </select>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowAdd(false)}
              className="flex-1 py-2 border border-[#FFD9B8] bg-white text-art-text/60 font-black text-xs uppercase rounded-xl cursor-pointer hover:bg-[#FFF4E6] transition-colors">
              {t('Cancel·lar', 'Cancel', 'Cancelar')}
            </button>
            <button type="button" onClick={handleAdd}
              className="flex-1 py-2 bg-art-orange text-white font-black text-xs uppercase rounded-xl cursor-pointer hover:bg-art-garnet transition-colors shadow-[0_2px_8px_rgba(255,90,31,0.30)]">
              {t('Afegir', 'Add', 'Anadir')}
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
            {t('Afegir article', 'Add item', 'Anadir articulo')}
          </span>
        </button>
      )}

      {activeTab === 'personal' && (
        <div className="mt-2">
          <p className="font-mono text-[9px] uppercase tracking-widest text-art-text/30 mb-3">
            {t('Suggeriments', 'Suggestions', 'Sugerencias')}
          </p>
          <div className="flex flex-wrap gap-2">
            {PERSONAL_TIPS.map((tip, i) => {
              const parts = tip.split(' ');
              const emoji = parts[0];
              const text = parts.slice(1).join(' ');
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onAdd({ text, emoji, type: 'personal', assignedTo: activeMemberId, isChecked: false })}
                  className="px-3 py-1.5 bg-white border border-[#FFD9B8] rounded-2xl text-sm font-semibold text-art-text shadow-[0_1px_4px_rgba(42,26,18,0.06)] hover:border-art-orange hover:bg-[#FFF4E6] transition-all cursor-pointer"
                >
                  {tip}
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
