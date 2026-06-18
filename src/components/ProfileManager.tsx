import React, { useState } from 'react';
import { Language, Member } from '../types';
import { t } from '../translations';
import { Shield, Sparkles, UserCheck, Edit2, Check, UserPlus, X } from 'lucide-react';

interface ProfileManagerProps {
  language: Language;
  members: Member[];
  activeMemberId: string;
  onSelectMember: (id: string) => void;
  onUpdateMember: (id: string, updated: Partial<Member>) => void;
  onAddMember: (member: Omit<Member, 'id'>) => Promise<void>;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  language,
  members,
  activeMemberId,
  onSelectMember,
  onUpdateMember,
  onAddMember,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addSaving, setAddSaving] = useState(false);

  // Edit Form State
  const [editNickname, setEditNickname] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  // Add Form State
  const [addName, setAddName] = useState('');
  const [addNickname, setAddNickname] = useState('');
  const [addAvatar, setAddAvatar] = useState('🌴');
  const [addRole, setAddRole] = useState('rolePlanner');

  const availableRoles = [
    'rolePlanner',
    'roleTreasurer',
    'roleParty',
    'roleChef',
    'roleDriver',
    'roleDormilon',
    'roleFotografo',
    'roleInfiltrado',
  ];

  const cuteEmojis = [
    '🙋‍♀️', '🏄‍♂️', '🍻', '💃', '🍕', '🕶️', '🌴', '🍟', '🚗', '🏖️',
    '🎧', '🎉', '👙', '🔥', '🍹', '🥑', '💰', '📸', '🏊‍♂️', '💅', 
    '🦄', '🔮', '🎯', '🚀', '🍔', '🍦', '🛸', '👻', '👑', '🌮'
  ];

  const handleStartEdit = (member: Member) => {
    setEditingId(member.id);
    setEditNickname(member.nickname || member.name);
    setEditRole(member.role);
    setEditAvatar(member.avatarUrl);
  };

  const handleSave = (id: string) => {
    onUpdateMember(id, {
      nickname: editNickname.trim(),
      role: editRole,
      avatarUrl: editAvatar,
    });
    setEditingId(null);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) return;
    setAddSaving(true);
    try {
      await onAddMember({
        name: addName.trim(),
        nickname: addNickname.trim() || addName.trim(),
        avatarUrl: addAvatar,
        role: addRole,
        color: 'from-art-yellow to-art-orange',
      });
      setShowAddForm(false);
      setAddName('');
      setAddNickname('');
      setAddAvatar('🌴');
      setAddRole('rolePlanner');
    } finally {
      setAddSaving(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 py-2">
      
      {/* Informative Header */}
      <div className="bg-[#2A1A12] border border-[#FFD9B8] rounded-2xl p-5 text-xs sm:text-sm text-white flex gap-3 items-start md:max-w-xl shadow-[0_4px_12px_rgba(255,90,31,0.25)]">
        <Sparkles className="text-art-yellow w-5 h-5 shrink-0 animate-pulse mt-0.5" />
        <div>
          <p className="font-black uppercase tracking-wider text-art-yellow">
            {language === 'ca' ? 'Equip Alacant 2026' : language === 'en' ? 'Alicante 2026 Squad' : 'La Peña d\'Alacant 2026'}
          </p>
          <p className="text-white/80 mt-1 font-medium">
            {language === 'ca'
              ? 'El teu perfil queda vinculat al teu compte Google. El perfil actiu apareix ressaltat.'
              : language === 'en'
              ? 'Your profile is linked to your Google account. Your active profile is highlighted below.'
              : 'Tu perfil e\'tá vinculao a tu Google. Er jeto activo aparece senyalao abajo.'}
          </p>
        </div>
      </div>

      {/* Grid of ID Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => {
          const isCurrentActive = member.id === activeMemberId;
          const isEditing = member.id === editingId;

          return (
            <div
              key={member.id}
              className={`rounded-2xl border border-[#FFD9B8] p-5 flex flex-col gap-4 relative overflow-hidden transition-all duration-300
                ${isCurrentActive
                  ? 'bg-gray-100 shadow-[0_4px_12px_rgba(42,26,18,0.10)]'
                  : 'bg-white shadow-[0_4px_12px_rgba(42,26,18,0.10)] hover:translate-y-[-1px] hover:shadow-[0_4px_16px_rgba(42,26,18,0.12)]'
                }`}
            >
              {/* Header profile background color flare */}
              <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${member.color} ${isCurrentActive ? 'opacity-40' : ''}`}></div>

              {/* Big checkmark overlay when active */}
              {isCurrentActive && (
                <div className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-[#2A1A12] border border-[#FFD9B8] flex items-center justify-center shadow-[0_2px_8px_rgba(42,26,18,0.10)]">
                  <Check className="w-4 h-4 text-white stroke-[3px]" />
                </div>
              )}

              {/* Identity view */}
              <div className={`flex gap-4 items-center ${isCurrentActive ? 'opacity-60' : ''}`}>

                {/* Current Avatar circle */}
                <div className={`w-14 h-14 rounded-full border border-[#FFD9B8] flex items-center justify-center text-2xl select-none shadow-[0_2px_8px_rgba(42,26,18,0.10)] shrink-0 ${isCurrentActive ? 'bg-gray-200' : 'bg-white'}`}>
                  {member.avatarUrl}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-display font-black text-art-text text-sm truncate uppercase">{member.name}</h4>
                    {isCurrentActive && (
                      <span className="bg-[#2A1A12] text-white font-black text-[9px] px-1.5 py-0.5 border border-[#FFD9B8] rounded-2xl uppercase tracking-wider flex items-center gap-0.5">
                        <UserCheck className="w-2.5 h-2.5 shrink-0" />
                        {language === 'ca' ? 'Tu' : language === 'en' ? 'You' : 'Tú'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-art-text/50 font-mono font-medium">@{member.id}</p>
                </div>
              </div>

              {/* editable options or specs */}
              {isEditing ? (
                <div className="flex flex-col gap-3.5 text-xs">
                  {/* Nickname input */}
                  <div>
                    <label htmlFor={`edit-nickname-${member.id}`} className="block font-black uppercase text-art-text/60 mb-1">
                      {t('nicknameField', language)}:
                    </label>
                    <input
                      id={`edit-nickname-${member.id}`}
                      type="text"
                      value={editNickname}
                      onChange={(e) => setEditNickname(e.target.value)}
                      className="w-full px-3 py-2 border border-[#FFD9B8] rounded-2xl bg-slate-50 focus:outline-[#2d2d2d] focus:outline-2 focus:outline-offset-0 font-bold text-art-text"
                    />
                  </div>

                  {/* Avatar Picker */}
                  <div>
                    <span className="block font-black uppercase text-art-text/60 mb-1">
                      {language === 'ca' ? 'Triar Emoticona' : language === 'en' ? 'Select Emoji' : 'Morder Emoticono'}:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-[#FFF4E6] border border-[#FFD9B8] rounded-2xl">
                      {cuteEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setEditAvatar(emoji)}
                          className={`w-8 h-8 flex items-center justify-center text-lg rounded-2xl transition-all border ${editAvatar === emoji ? 'bg-art-orange border border-[#FFD9B8] text-white shadow-none font-bold scale-110' : 'bg-white hover:bg-slate-100 border-slate-150'}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Role dropdown */}
                  <div>
                    <label htmlFor={`edit-role-${member.id}`} className="block font-black uppercase text-art-text/60 mb-1">
                      {t('roleField', language)}:
                    </label>
                    <select
                      id={`edit-role-${member.id}`}
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-full px-2 py-2 border border-[#FFD9B8] rounded-2xl bg-slate-50 focus:outline-[#2d2d2d] focus:outline-2 focus:outline-offset-0 font-bold"
                    >
                      {availableRoles.map(role => (
                        <option key={role} value={role}>
                          {t(role, language)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Save/Cancel actions */}
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 border border-[#FFD9B8] bg-white text-art-text font-black uppercase tracking-wider hover:bg-slate-50 cursor-pointer rounded-2xl"
                    >
                      {t('cancelBtn', language)}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave(member.id)}
                      className="px-4 py-1.5 border border-[#FFD9B8] bg-art-yellow text-art-text font-black uppercase tracking-wider hover:bg-art-yellow/85 shadow-[0_2px_8px_rgba(42,26,18,0.10)] hover:translate-y-[-1px] transition-all flex items-center gap-1 cursor-pointer rounded-2xl"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5px]" />
                      {language === 'ca' ? 'Desar' : language === 'en' ? 'Save' : 'Guardá'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 justify-between flex-1 text-xs">
                  
                  {/* Detailed Specs list */}
                  <div className="flex flex-col gap-2 p-3 bg-[#FFF4E6] border border-[#FFD9B8] rounded-2xl">
                    <div className="flex justify-between items-center">
                      <span className="text-art-text/60 font-black uppercase tracking-wider text-[9px]">{language === 'ca' ? 'Apodo' : language === 'en' ? 'Nickname' : 'Sobrenombre'}:</span>
                      <span className="font-bold text-art-text text-xs sm:text-sm">{member.nickname || member.name}</span>
                    </div>
                    <div className="border-t border-[#FFD9B8]/40 my-1"></div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-art-text/60 font-black uppercase tracking-wider text-[9px]">{language === 'ca' ? 'Rol oficial' : language === 'en' ? 'Role' : 'Cargo d\'ofisio'}:</span>
                      <span className="font-black text-art-text uppercase text-xs flex items-center gap-1.5 mt-0.5">
                        <Shield className="w-3.5 h-3.5 text-art-orange shrink-0" />
                        {t(member.role, language)}
                      </span>
                    </div>
                  </div>

                  {/* Operational triggers */}
                  <div className="flex items-center gap-2 pt-2 border-t-2 border-[#FFD9B8]/40">
                    {isCurrentActive ? (
                      <div className="flex-1 py-1.5 px-3 bg-gray-200 border border-[#FFD9B8]/30 text-[#2A1A12]/50 rounded-2xl font-black uppercase flex items-center justify-center gap-1 cursor-default select-none text-xs">
                        <Check className="w-3.5 h-3.5 stroke-[2.5px]" />
                        <span>{language === 'ca' ? 'Sessió activa' : language === 'en' ? 'Active session' : 'Se\'ión activa'}</span>
                      </div>
                    ) : (
                      <div className="flex-1" />
                    )}

                    {/* Edit Spec button — only for active member */}
                    {isCurrentActive && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(member)}
                        className="p-2 border border-[#FFD9B8] bg-[#FFF4E6] hover:bg-art-yellow hover:text-[#2A1A12] text-art-text rounded-2xl transition-all cursor-pointer shadow-[0_2px_8px_rgba(42,26,18,0.10)] active:shadow-none hover:translate-y-[-1px]"
                        title={language === 'ca' ? 'Editar perfil' : 'Edit profile'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>
              )}

            </div>
          );
        })}

        {/* ── Add Member Card ─────────────────────────────────── */}
        {!showAddForm ? (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="rounded-2xl border-2 border-dashed border-[#FFD9B8]/40 p-5 flex flex-col items-center justify-center gap-3 text-art-text/50 hover:text-art-text hover:border-art-orange hover:bg-[#FFF4E6] transition-all cursor-pointer min-h-[180px] group"
          >
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:bg-art-orange/10 transition-all">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="font-black uppercase text-xs tracking-wider">
              {language === 'ca' ? 'Afegir Membre' : language === 'en' ? 'Add Member' : 'Añadí Miembro'}
            </span>
          </button>
        ) : (
          <form
            onSubmit={handleAddSubmit}
            className="rounded-2xl border border-[#FFD9B8] p-5 flex flex-col gap-3.5 bg-white shadow-[0_4px_12px_rgba(255,90,31,0.25)] relative"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="absolute top-3 right-3 p-1 text-art-text/40 hover:text-art-text cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <p className="font-black uppercase text-xs text-art-orange tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-4 h-4" />
              {language === 'ca' ? 'Nou Membre' : language === 'en' ? 'New Member' : 'Nuevo Miembro'}
            </p>

            {/* Real name */}
            <div>
              <label className="block font-black uppercase text-art-text/60 text-[10px] mb-1">
                {language === 'ca' ? 'Nom real*' : language === 'en' ? 'Real name*' : 'Nombre real*'}
              </label>
              <input
                type="text"
                required
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder={language === 'ca' ? 'ex: Maria' : 'e.g. Maria'}
                className="w-full px-3 py-2 border border-[#FFD9B8] rounded-2xl bg-slate-50 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-art-orange"
              />
            </div>

            {/* Nickname */}
            <div>
              <label className="block font-black uppercase text-art-text/60 text-[10px] mb-1">
                {language === 'ca' ? 'Sobrenom' : language === 'en' ? 'Nickname' : 'Mote'}
              </label>
              <input
                type="text"
                value={addNickname}
                onChange={(e) => setAddNickname(e.target.value)}
                placeholder={language === 'ca' ? 'ex: La Reina del Caos' : 'e.g. Queen of Chaos'}
                className="w-full px-3 py-2 border border-[#FFD9B8] rounded-2xl bg-slate-50 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-art-orange"
              />
            </div>

            {/* Avatar picker */}
            <div>
              <span className="block font-black uppercase text-art-text/60 text-[10px] mb-1">
                {language === 'ca' ? 'Avatar' : language === 'en' ? 'Avatar' : 'Avatar'}:
                <span className="ml-2 text-lg">{addAvatar}</span>
              </span>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-2 bg-[#FFF4E6] border border-[#FFD9B8] rounded-2xl">
                {cuteEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAddAvatar(emoji)}
                    className={`w-7 h-7 flex items-center justify-center text-base rounded-2xl transition-all border ${addAvatar === emoji ? 'bg-art-orange border border-[#FFD9B8] scale-110' : 'bg-white hover:bg-slate-100 border-slate-200'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block font-black uppercase text-art-text/60 text-[10px] mb-1">
                {t('roleField', language)}:
              </label>
              <select
                value={addRole}
                onChange={(e) => setAddRole(e.target.value)}
                className="w-full px-2 py-2 border border-[#FFD9B8] rounded-2xl bg-slate-50 text-xs font-bold focus:outline-none"
              >
                {availableRoles.map(role => (
                  <option key={role} value={role}>{t(role, language)}</option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={addSaving || !addName.trim()}
              className="w-full py-2.5 border border-[#FFD9B8] bg-art-orange text-white font-black uppercase text-xs shadow-[0_4px_12px_rgba(42,26,18,0.10)] hover:translate-y-[-1px] hover:shadow-[3px_5px_0px_0px_#2d2d2d] active:translate-y-0 transition-all cursor-pointer rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
            >
              {addSaving ? '⏳' : <UserPlus className="w-4 h-4" />}
              {addSaving
                ? (language === 'ca' ? 'Guardant...' : language === 'en' ? 'Saving...' : 'Guardando...')
                : (language === 'ca' ? 'Afegir al grup' : language === 'en' ? 'Add to group' : 'Añadí ar grupo')}
            </button>
          </form>
        )}

      </div>

    </div>
  );
};
