import React, { useState } from 'react';
import { Language, PackingItem, Member } from '../types';
import { personalPackingTips } from '../data';

interface PackingListProps {
  language: Language;
  items: PackingItem[];
  members: Member[];
  activeMemberId: string;
  onToggle: (id: string) => void;
}

type PackingTab = 'shared' | 'personal';

export const PackingList: React.FC<PackingListProps> = ({
  language, items, members, activeMemberId, onToggle,
}) => {
  const [activeTab, setActiveTab] = useState<PackingTab>('shared');

  const t = (ca: string, en: string, an: string) =>
    language === 'ca' ? ca : language === 'en' ? en : an;

  const sharedItems   = items.filter(i => i.type === 'shared');
  const personalItems = items.filter(i => i.type === 'personal');

  const sharedDone   = sharedItems.filter(i => i.isChecked).length;
  const personalDone = personalItems.filter(i => i.isChecked).length;

  const getMemberName = (assignedTo: string) => {
    const m = members.find(m => m.id === assignedTo || m.nickname.toLowerCase() === assignedTo.toLowerCase());
    return m?.nickname ?? assignedTo;
  };

  const getMemberColor = (assignedTo: string) => {
    const m = members.find(m => m.id === assignedTo || m.nickname.toLowerCase() === assignedTo.toLowerCase());
    return m?.color ?? 'bg-art-orange';
  };

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">

      {/* ── Title ── */}
      <div className="pb-1">
        <p className="font-mono text-[10px] uppercase tracking-[3px] text-art-text/35">
          {t('Preparatius de viatge', 'Travel prep', 'Preparativos del viaje')}
        </p>
        <h2 className="font-display text-3xl text-art-text uppercase leading-none mt-1">
          {t('Què cal portar', 'What to bring', 'Qué llevar')}
        </h2>
      </div>

      {/* ── Tab toggle ── */}
      <div className="flex bg-[#FFEAD2] rounded-2xl p-1 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('shared')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
            activeTab === 'shared'
              ? 'bg-white shadow-[0_2px_8px_rgba(42,26,18,0.10)] text-art-text'
              : 'text-art-text/50 hover:text-art-text'
          }`}
        >
          <span>🤝</span>
          <span>{t('En comú', 'Shared', 'En común')}</span>
          <span className="font-mono text-[10px] opacity-60">{sharedDone}/{sharedItems.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
            activeTab === 'personal'
              ? 'bg-white shadow-[0_2px_8px_rgba(42,26,18,0.10)] text-art-text'
              : 'text-art-text/50 hover:text-art-text'
          }`}
        >
          <span>🎒</span>
          <span>{t('El meu sac', 'My bag', 'Mi mochila')}</span>
          <span className="font-mono text-[10px] opacity-60">{personalDone}/{personalItems.length}</span>
        </button>
      </div>

      {/* ── Shared items ── */}
      {activeTab === 'shared' && (
        <div className="flex flex-col gap-2">
          <div className="bg-gradient-to-br from-[#FF5A1F] to-[#E0290B] rounded-3xl p-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-[9px] text-white/50 uppercase tracking-widest">{t('Articles compartits', 'Shared items', 'Artículos compartidos')}</p>
              <p className="font-display text-3xl text-[#FFD23F] leading-none mt-1">
                {sharedDone}<span className="text-xl text-white/40">/{sharedItems.length}</span>
              </p>
            </div>
            <span className="text-5xl">🤝</span>
          </div>

          {sharedItems.map(item => {
            const memberName  = getMemberName(item.assignedTo);
            const memberColor = getMemberColor(item.assignedTo);
            return (
              <div
                key={item.id}
                onClick={() => onToggle(item.id)}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition-all ${
                  item.isChecked
                    ? 'bg-[#FFF8EE] border-[#FFE3C9] opacity-65'
                    : 'bg-white border-[#FFD9B8] shadow-[0_2px_8px_rgba(42,26,18,0.06)] hover:border-art-orange'
                }`}
              >
                {/* Checkbox */}
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                  item.isChecked
                    ? 'bg-art-orange border-art-orange'
                    : 'border-[#FFB57A]'
                }`}>
                  {item.isChecked && <span className="text-white font-black text-xs leading-none">✓</span>}
                </div>

                <span className="text-xl shrink-0">{item.emoji}</span>

                <span className={`flex-1 text-sm font-semibold ${
                  item.isChecked ? 'line-through text-art-text/40' : 'text-art-text'
                }`}>
                  {item.text}
                </span>

                {/* Assignee badge */}
                {item.assignedTo && (
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${memberColor} bg-opacity-15 shrink-0`}>
                    <span className="text-[10px] font-black text-art-text/70">{memberName}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Personal items (tips chips) ── */}
      {activeTab === 'personal' && (
        <div className="flex flex-col gap-4">
          <div className="bg-[#2A1A12] rounded-3xl p-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest">{t('La teva llista', 'Your checklist', 'Tu lista')}</p>
              <p className="font-display text-3xl text-[#FFD23F] leading-none mt-1">🎒</p>
            </div>
            <p className="font-mono text-[10px] text-white/40 text-right max-w-[140px] uppercase tracking-wide leading-relaxed">
              {t('Recorda aquests essencials', 'Remember these essentials', 'Recuerda lo esencial')}
            </p>
          </div>

          {/* Personal items from Firestore (if any) */}
          {personalItems.length > 0 && (
            <div className="flex flex-col gap-2">
              {personalItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => onToggle(item.id)}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition-all ${
                    item.isChecked
                      ? 'bg-[#FFF8EE] border-[#FFE3C9] opacity-65'
                      : 'bg-white border-[#FFD9B8] shadow-[0_2px_8px_rgba(42,26,18,0.06)] hover:border-art-orange'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                    item.isChecked ? 'bg-art-orange border-art-orange' : 'border-[#FFB57A]'
                  }`}>
                    {item.isChecked && <span className="text-white font-black text-xs leading-none">✓</span>}
                  </div>
                  <span className="text-xl shrink-0">{item.emoji}</span>
                  <span className={`flex-1 text-sm font-semibold ${item.isChecked ? 'line-through text-art-text/40' : 'text-art-text'}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Tips chips */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-art-text/30 mb-3">
              {t('Consells habituals', 'Common essentials', 'Cosas típicas')}
            </p>
            <div className="flex flex-wrap gap-2">
              {personalPackingTips.map((tip, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-white border border-[#FFD9B8] rounded-2xl text-sm font-semibold text-art-text shadow-[0_1px_4px_rgba(42,26,18,0.06)]"
                >
                  {tip}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#FFF4E6] border border-[#FFD9B8] rounded-2xl p-4 flex gap-3">
            <span className="text-xl shrink-0">💡</span>
            <p className="text-xs text-art-text/60 font-medium leading-relaxed">
              {t(
                'Els articles personals els gestiones localment. Marca el que ja tens posat a la maleta.',
                'Personal items are managed locally. Check off what you\'ve already packed.',
                'Los artículos personales son locales. Marca lo que ya tienes en la maleta.'
              )}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
