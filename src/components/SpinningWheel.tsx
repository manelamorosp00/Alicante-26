import React, { useRef, useState, useEffect } from 'react';
import { Language, Member, WheelConfig } from '../types';
import { Plus, Pencil, Trash2, Check, X, GripVertical } from 'lucide-react';

interface SpinningWheelProps {
  language: Language;
  members: Member[];
  punishments: string[];
  customWheels: WheelConfig[];
  activeMemberId: string;
  onSaveWheel: (wheel: Omit<WheelConfig, 'id'>) => Promise<void>;
  onUpdateWheel: (id: string, wheel: Partial<WheelConfig>) => Promise<void>;
  onDeleteWheel: (id: string) => void;
}

const WHEEL_EMOJIS = ['🎡','⚡','🎯','🎲','🍺','🏖️','🔥','💰','🎉','🌴','🕶️','🚀','🦈','🎸','🍕'];

const COLORS = [
  '#FF6321','#0077B6','#2d2d2d','#FFB703',
  '#e65c00','#0096c7','#4a4a4a','#f7a072',
  '#c77dff','#2dc653','#e63946','#457b9d',
];

export const SpinningWheel: React.FC<SpinningWheelProps> = ({
  language,
  members,
  punishments,
  customWheels,
  activeMemberId,
  onSaveWheel,
  onUpdateWheel,
  onDeleteWheel,
}) => {
  const lbl = (ca: string, en: string, an: string) =>
    language === 'ca' ? ca : language === 'en' ? en : an;

  const builtInWheels = [
    { id: '__punishments', name: lbl('Càstigs', 'Penalties', 'Castig\''), emoji: '⚡', items: punishments },
    { id: '__members',     name: lbl('La Colla', 'Squad', 'La Peña'),    emoji: '👥', items: members.map(m => `${m.avatarUrl} ${m.nickname || m.name}`) },
  ];
  const allWheels = [...builtInWheels, ...customWheels];

  const [activeWheelId, setActiveWheelId] = useState<string>('__punishments');
  const [isSpinning, setIsSpinning]       = useState(false);
  const [winner, setWinner]               = useState<string | null>(null);

  // Editor state
  const [editorMode, setEditorMode]   = useState<'none' | 'create' | 'edit'>('none');
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [editorName, setEditorName]   = useState('');
  const [editorEmoji, setEditorEmoji] = useState('🎡');
  const [editorItems, setEditorItems] = useState<string[]>(['', '']);
  const [isSaving, setIsSaving]       = useState(false);

  const activeWheel = allWheels.find(w => w.id === activeWheelId) ?? allWheels[0];
  const items    = activeWheel?.items ?? [];
  const isBuiltIn = activeWheelId.startsWith('__');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef  = useRef(0);

  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || items.length === 0) return;

    const size   = canvas.width;
    const center = size / 2;
    const radius = center - 15;
    const arcSize = (2 * Math.PI) / items.length;

    ctx.clearRect(0, 0, size, size);

    ctx.beginPath();
    ctx.arc(center, center, radius + 8, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(45,45,45,0.15)';
    ctx.fill();

    items.forEach((item, i) => {
      const startAngle = angle + i * arcSize;
      const endAngle   = startAngle + arcSize;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = '#2d2d2d';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      const maxW = radius - 36;
      let text = item;
      while (ctx.measureText(text).width > maxW && text.length > 3) {
        text = text.slice(0, -1);
      }
      if (text !== item) text = text.slice(0, -2) + '…';
      ctx.fillText(text, radius - 18, 0);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#2d2d2d';
    ctx.lineWidth = 6;
    ctx.stroke();

    items.forEach((_, i) => {
      const da = angle + i * arcSize;
      const dx = center + (radius - 2) * Math.cos(da);
      const dy = center + (radius - 2) * Math.sin(da);
      ctx.beginPath();
      ctx.arc(dx, dy, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#fdfaf2';
      ctx.fill();
      ctx.strokeStyle = '#2d2d2d';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    ctx.beginPath();
    ctx.arc(center, center, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#2d2d2d';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(center - 5, center - 5, 6, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fill();
  };

  useEffect(() => {
    drawWheel(angleRef.current);
  }, [items, activeWheelId]);

  const spin = () => {
    if (isSpinning || items.length < 2) return;
    setIsSpinning(true);
    setWinner(null);

    const spinDuration = 3000 + Math.random() * 2000;
    let speed = 0.3 + Math.random() * 0.2;
    const friction = 0.985;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      angleRef.current = (angleRef.current + speed) % (2 * Math.PI);
      drawWheel(angleRef.current);
      if (elapsed < spinDuration && speed > 0.005) {
        speed *= friction;
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const arcSize = (2 * Math.PI) / items.length;
        const norm = (angleRef.current % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const rel  = ((3 / 2) * Math.PI - norm + 4 * Math.PI) % (2 * Math.PI);
        const idx  = Math.floor((2 * Math.PI - rel) / arcSize) % items.length;
        setWinner(items[idx]);
      }
    };
    requestAnimationFrame(animate);
  };

  // Editor
  const openCreate = () => {
    setEditorName(''); setEditorEmoji('🎡'); setEditorItems(['', '']);
    setEditingId(null); setEditorMode('create');
  };
  const openEdit = (w: WheelConfig) => {
    setEditorName(w.name); setEditorEmoji(w.emoji);
    setEditorItems([...w.items, '']);
    setEditingId(w.id); setEditorMode('edit');
  };
  const closeEditor = () => { setEditorMode('none'); setEditingId(null); };

  const handleEditorItemChange = (idx: number, val: string) => {
    const next = [...editorItems];
    next[idx] = val;
    if (idx === next.length - 1 && val.trim() !== '') next.push('');
    setEditorItems(next);
  };
  const handleRemoveItem = (idx: number) => {
    const next = editorItems.filter((_, i) => i !== idx);
    if (next.length === 0 || next[next.length - 1].trim() !== '') next.push('');
    setEditorItems(next);
  };

  const handleSave = async () => {
    const validItems = editorItems.map(s => s.trim()).filter(Boolean);
    if (!editorName.trim() || validItems.length < 2) return;
    setIsSaving(true);
    try {
      if (editorMode === 'create') {
        await onSaveWheel({ name: editorName.trim(), emoji: editorEmoji, items: validItems, createdBy: activeMemberId });
      } else if (editingId) {
        await onUpdateWheel(editingId, { name: editorName.trim(), emoji: editorEmoji, items: validItems });
      }
      closeEditor();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm(lbl('Eliminar aquesta ruleta?', 'Delete this wheel?', '¿Borrar esta ruleta?'))) return;
    onDeleteWheel(id);
    if (activeWheelId === id) setActiveWheelId('__punishments');
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Wheel selector */}
      <div className="flex flex-wrap gap-2 items-center">
        {allWheels.map(w => (
          <button
            key={w.id}
            type="button"
            onClick={() => { setActiveWheelId(w.id); setWinner(null); closeEditor(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-2 font-black uppercase text-xs transition-all cursor-pointer rounded-none select-none
              ${activeWheelId === w.id
                ? 'bg-[#2d2d2d] text-white border-[#2d2d2d] shadow-[2px_2px_0px_0px_#FF6321]'
                : 'bg-white text-art-text border-[#2d2d2d] hover:bg-[#fdfaf2]'}`}
          >
            <span>{w.emoji}</span>
            <span>{w.name}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-1 px-3 py-1.5 border-2 border-dashed border-[#2d2d2d]/40 font-black uppercase text-xs text-art-text/50 hover:border-[#2d2d2d] hover:text-art-text transition-all cursor-pointer rounded-none"
        >
          <Plus className="w-3.5 h-3.5" />
          {lbl('Nova', 'New', 'Nueva')}
        </button>
      </div>

      {/* Edit / Delete buttons for custom wheels */}
      {!isBuiltIn && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              const w = customWheels.find(w => w.id === activeWheelId);
              if (w) openEdit(w);
            }}
            className="flex items-center gap-1 px-2.5 py-1 border-2 border-[#2d2d2d] bg-white font-black uppercase text-[10px] text-art-text hover:bg-art-bg transition-all cursor-pointer shadow-[2px_2px_0px_0px_#2d2d2d]"
          >
            <Pencil className="w-3 h-3" /> {lbl('Editar', 'Edit', 'Editar')}
          </button>
          <button
            type="button"
            onClick={() => handleDelete(activeWheelId)}
            className="flex items-center gap-1 px-2.5 py-1 border-2 border-rose-500 bg-rose-50 font-black uppercase text-[10px] text-rose-500 hover:bg-rose-100 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#f43f5e]"
          >
            <Trash2 className="w-3 h-3" /> {lbl('Eliminar', 'Delete', 'Borrar')}
          </button>
        </div>
      )}

      {/* Editor panel */}
      {editorMode !== 'none' && (
        <div className="bg-white border-2 border-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-black uppercase text-sm text-art-text">
              {editorMode === 'create'
                ? lbl('Nova Ruleta', 'New Wheel', 'Nueva Ruleta')
                : lbl('Editar Ruleta', 'Edit Wheel', 'Editar Ruleta')}
            </h3>
            <button type="button" onClick={closeEditor} className="text-art-text/40 hover:text-art-text cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Name + emoji */}
          <div className="flex gap-2">
            <select
              value={editorEmoji}
              onChange={e => setEditorEmoji(e.target.value)}
              className="border-2 border-[#2d2d2d] bg-white text-base px-2 py-2 focus:outline-none cursor-pointer"
            >
              {WHEEL_EMOJIS.map(em => <option key={em} value={em}>{em}</option>)}
            </select>
            <input
              type="text"
              placeholder={lbl('Nom de la ruleta...', 'Wheel name...', 'Nombre de la ruleta...')}
              value={editorName}
              onChange={e => setEditorName(e.target.value)}
              maxLength={24}
              className="flex-1 px-3 py-2 border-2 border-[#2d2d2d] font-bold text-sm text-art-text bg-white focus:outline-none focus:border-art-orange"
            />
          </div>

          {/* Items list */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-art-text/50 mb-2">
              {lbl('Opcions (mínim 2)', 'Options (min 2)', 'Opciones (mín 2)')}
            </label>
            <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
              {editorItems.map((item, idx) => (
                <div key={idx} className="flex gap-1.5 items-center group">
                  <GripVertical className="w-3.5 h-3.5 text-art-text/20 shrink-0" />
                  <input
                    type="text"
                    placeholder={`${lbl('Opció', 'Option', 'Opción')} ${idx + 1}`}
                    value={item}
                    onChange={e => handleEditorItemChange(idx, e.target.value)}
                    className="flex-1 px-2.5 py-1.5 border-2 border-[#2d2d2d]/30 focus:border-[#2d2d2d] font-medium text-xs text-art-text bg-white focus:outline-none"
                  />
                  {editorItems.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-art-text/20 hover:text-rose-500 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !editorName.trim() || editorItems.filter(s => s.trim()).length < 2}
            className="flex items-center justify-center gap-2 py-2.5 border-2 border-[#2d2d2d] bg-art-orange text-white font-black uppercase text-xs shadow-[3px_3px_0px_0px_#2d2d2d] hover:translate-y-[-1px] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <Check className="w-4 h-4" />
            {isSaving
              ? lbl('Desant...', 'Saving...', 'Guardando...')
              : lbl('Desar Ruleta', 'Save Wheel', 'Guardar Ruleta')}
          </button>
        </div>
      )}

      {/* Wheel canvas */}
      <div className="flex flex-col items-center gap-6 py-4 bg-white border-2 border-[#2d2d2d] shadow-[6px_6px_0px_0px_#2d2d2d] max-w-md mx-auto relative overflow-hidden w-full">
        <div className="absolute top-[24px] z-10 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-[#2d2d2d]" />

        <div className="relative flex items-center justify-center p-4">
          {items.length < 2 ? (
            <div className="w-80 h-80 max-w-full flex items-center justify-center border-4 border-dashed border-[#2d2d2d]/20">
              <p className="text-center text-xs text-art-text/40 font-bold uppercase px-8">
                {lbl('Afegeix almenys 2 opcions', 'Add at least 2 options', 'Añade al menos 2 opciones')}
              </p>
            </div>
          ) : (
            <canvas ref={canvasRef} width={320} height={320} className="w-80 h-80 max-w-full" />
          )}
        </div>

        <button
          type="button"
          disabled={isSpinning || items.length < 2}
          onClick={spin}
          className={`w-full max-w-xs py-4 px-6 border-2 border-[#2d2d2d] font-display text-sm font-black text-art-text shadow-[4px_4px_0px_0px_#2d2d2d] hover:shadow-[5px_5px_0px_0px_#2d2d2d] hover:translate-y-[-1px] transition-all uppercase tracking-wider select-none
            ${isSpinning || items.length < 2
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none hover:translate-y-0'
              : 'bg-art-yellow cursor-pointer'}`}
        >
          {isSpinning
            ? lbl('Girant...', 'Spinning...', 'Girando...')
            : lbl('⚡ GIRAR RULETA!', '⚡ SPIN WHEEL!', '⚡ ¡DALE UN VOLANTE!')}
        </button>

        {winner && (
          <div className="mt-2 text-center px-6 py-4 bg-art-orange/10 border-2 border-[#2d2d2d] shadow-[3px_3px_0px_0px_#2d2d2d] w-[90%] animate-bounce">
            <p className="text-xs font-black text-art-orange tracking-wide uppercase">
              {lbl('La deessa de la sort dictamina:', 'The Goddess of Luck declares:', 'La diosa der fango dize:')}
            </p>
            <h3 className="text-xl font-black font-display text-art-text uppercase mt-1 break-words">
              {winner}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};
