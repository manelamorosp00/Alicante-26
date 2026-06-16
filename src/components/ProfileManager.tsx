import React, { useState } from 'react';
import { Language, Member } from '../types';
import { t } from '../translations';
import { Shield, Sparkles, UserCheck, Edit2, Check } from 'lucide-react';

interface ProfileManagerProps {
  language: Language;
  members: Member[];
  activeMemberId: string;
  onSelectMember: (id: string) => void;
  onUpdateMember: (id: string, updated: Partial<Member>) => void;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  language,
  members,
  activeMemberId,
  onSelectMember,
  onUpdateMember,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Edit Form State
  const [editNickname, setEditNickname] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

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

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 py-2">
      
      {/* Informative Header */}
      <div className="bg-[#2d2d2d] border-2 border-[#2d2d2d] rounded-none p-5 text-xs sm:text-sm text-white flex gap-3 items-start md:max-w-xl shadow-[4px_4px_0px_0px_#FF6321]">
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
              className={`rounded-none border-2 border-[#2d2d2d] p-5 flex flex-col gap-4 relative overflow-hidden transition-all duration-300
                ${isCurrentActive
                  ? 'bg-gray-100 shadow-[3px_3px_0px_0px_#2d2d2d]'
                  : 'bg-white shadow-[3px_3px_0px_0px_#2d2d2d] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#2d2d2d]'
                }`}
            >
              {/* Header profile background color flare */}
              <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${member.color} ${isCurrentActive ? 'opacity-40' : ''}`}></div>

              {/* Big checkmark overlay when active */}
              {isCurrentActive && (
                <div className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-[#2d2d2d] border-2 border-[#2d2d2d] flex items-center justify-center shadow-[2px_2px_0px_0px_#2d2d2d]">
                  <Check className="w-4 h-4 text-white stroke-[3px]" />
                </div>
              )}

              {/* Identity view */}
              <div className={`flex gap-4 items-center ${isCurrentActive ? 'opacity-60' : ''}`}>

                {/* Current Avatar circle */}
                <div className={`w-14 h-14 rounded-full border-2 border-[#2d2d2d] flex items-center justify-center text-2xl select-none shadow-[2px_2px_0px_0px_#2d2d2d] shrink-0 ${isCurrentActive ? 'bg-gray-200' : 'bg-white'}`}>
                  {member.avatarUrl}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-display font-black text-art-text text-sm truncate uppercase">{member.name}</h4>
                    {isCurrentActive && (
                      <span className="bg-[#2d2d2d] text-white font-black text-[9px] px-1.5 py-0.5 border border-[#2d2d2d] rounded-none uppercase tracking-wider flex items-center gap-0.5">
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
                      className="w-full px-3 py-2 border-2 border-[#2d2d2d] rounded-none bg-slate-50 focus:outline-[#2d2d2d] focus:outline-2 focus:outline-offset-0 font-bold text-art-text"
                    />
                  </div>

                  {/* Avatar Picker */}
                  <div>
                    <span className="block font-black uppercase text-art-text/60 mb-1">
                      {language === 'ca' ? 'Triar Emoticona' : language === 'en' ? 'Select Emoji' : 'Morder Emoticono'}:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-[#fdfaf2] border-2 border-[#2d2d2d] rounded-none">
                      {cuteEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setEditAvatar(emoji)}
                          className={`w-8 h-8 flex items-center justify-center text-lg rounded-none transition-all border ${editAvatar === emoji ? 'bg-art-orange border-2 border-[#2d2d2d] text-white shadow-none font-bold scale-110' : 'bg-white hover:bg-slate-100 border-slate-150'}`}
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
                      className="w-full px-2 py-2 border-2 border-[#2d2d2d] rounded-none bg-slate-50 focus:outline-[#2d2d2d] focus:outline-2 focus:outline-offset-0 font-bold"
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
                      className="px-3 py-1.5 border-2 border-[#2d2d2d] bg-white text-art-text font-black uppercase tracking-wider hover:bg-slate-50 cursor-pointer rounded-none"
                    >
                      {t('cancelBtn', language)}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave(member.id)}
                      className="px-4 py-1.5 border-2 border-[#2d2d2d] bg-art-yellow text-art-text font-black uppercase tracking-wider hover:bg-art-yellow/85 shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-y-[-1px] transition-all flex items-center gap-1 cursor-pointer rounded-none"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5px]" />
                      {language === 'ca' ? 'Desar' : language === 'en' ? 'Save' : 'Guardá'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 justify-between flex-1 text-xs">
                  
                  {/* Detailed Specs list */}
                  <div className="flex flex-col gap-2 p-3 bg-[#fdfaf2] border-2 border-[#2d2d2d] rounded-none">
                    <div className="flex justify-between items-center">
                      <span className="text-art-text/60 font-black uppercase tracking-wider text-[9px]">{language === 'ca' ? 'Apodo' : language === 'en' ? 'Nickname' : 'Sobrenombre'}:</span>
                      <span className="font-bold text-art-text text-xs sm:text-sm">{member.nickname || member.name}</span>
                    </div>
                    <div className="border-t border-[#2d2d2d]/10 my-1"></div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-art-text/60 font-black uppercase tracking-wider text-[9px]">{language === 'ca' ? 'Rol oficial' : language === 'en' ? 'Role' : 'Cargo d\'ofisio'}:</span>
                      <span className="font-black text-art-text uppercase text-xs flex items-center gap-1.5 mt-0.5">
                        <Shield className="w-3.5 h-3.5 text-art-orange shrink-0" />
                        {t(member.role, language)}
                      </span>
                    </div>
                  </div>

                  {/* Operational triggers */}
                  <div className="flex items-center gap-2 pt-2 border-t-2 border-[#2d2d2d]/10">
                    {isCurrentActive ? (
                      <div className="flex-1 py-1.5 px-3 bg-gray-200 border-2 border-[#2d2d2d]/30 text-[#2d2d2d]/50 rounded-none font-black uppercase flex items-center justify-center gap-1 cursor-default select-none text-xs">
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
                        className="p-2 border-2 border-[#2d2d2d] bg-[#fdfaf2] hover:bg-art-yellow hover:text-[#2d2d2d] text-art-text rounded-none transition-all cursor-pointer shadow-[2px_2px_0px_0px_#2d2d2d] active:shadow-none hover:translate-y-[-1px]"
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
      </div>

    </div>
  );
};
