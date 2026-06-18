import React, { useState } from 'react';
import { Language, Member } from '../types';
import { t } from '../translations';
import { Edit2, Check, X, LogOut, Shield, Globe } from 'lucide-react';

interface MyProfileProps {
  me: Member;
  language: Language;
  cuteEmojis: string[];
  availableRoles: string[];
  onUpdate: (fields: Partial<Member>) => void;
  onLanguageChange: (lang: Language) => void;
  onLogout: () => void;
}

export const MyProfile: React.FC<MyProfileProps> = ({
  me,
  language,
  cuteEmojis,
  availableRoles,
  onUpdate,
  onLanguageChange,
  onLogout,
}) => {
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(me.nickname || me.name);
  const [avatar, setAvatar] = useState(me.avatarUrl);
  const [role, setRole] = useState(me.role);

  const handleSave = () => {
    onUpdate({ nickname: nickname.trim(), avatarUrl: avatar, role });
    setEditing(false);
  };

  const handleCancel = () => {
    setNickname(me.nickname || me.name);
    setAvatar(me.avatarUrl);
    setRole(me.role);
    setEditing(false);
  };

  return (
    <div className="animate-fadeIn max-w-lg mx-auto flex flex-col gap-5">

      {/* ── Profile card ────────────────────────────────────────── */}
      <div className="bg-white border border-[#FFD9B8] shadow-[0_4px_16px_rgba(42,26,18,0.12)]">
        {/* Color bar */}
        <div className={`h-2 bg-gradient-to-r ${me.color}`} />

        <div className="p-5 flex flex-col gap-5">

          {/* Avatar + name row */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-art-orange bg-[#FFF4E6] flex items-center justify-center text-3xl shadow-[0_4px_12px_rgba(255,90,31,0.20)] shrink-0 select-none">
              {editing ? avatar : me.avatarUrl}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] uppercase font-black text-art-text/40 tracking-widest font-mono">@{me.id}</p>
              <h2 className="font-display font-black text-art-text text-xl uppercase tracking-tight leading-tight mt-0.5">
                {me.nickname || me.name}
              </h2>
              <div className="flex items-center gap-1 mt-1">
                <Shield className="w-3 h-3 text-art-orange shrink-0" />
                <span className="text-[10px] font-black text-art-text/60 uppercase tracking-wide">{t(me.role, language)}</span>
              </div>
            </div>
            {!editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="p-2.5 border border-[#FFD9B8] bg-[#FFF4E6] hover:bg-art-yellow text-art-text rounded-2xl transition-all cursor-pointer shadow-[0_2px_8px_rgba(42,26,18,0.10)] hover:translate-y-[-1px] shrink-0"
                title={language === 'ca' ? 'Editar perfil' : language === 'en' ? 'Edit profile' : 'Editar perfil'}
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Edit form */}
          {editing && (
            <div className="flex flex-col gap-4 pt-1 border-t-2 border-[#FFD9B8]/40">

              {/* Nickname */}
              <div>
                <label className="block font-black uppercase text-art-text/60 text-[10px] mb-1 tracking-wider">
                  {language === 'ca' ? 'Apodo' : language === 'en' ? 'Nickname' : 'Mote'}
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#FFD9B8] bg-[#FFF4E6] font-bold text-sm text-art-text outline-none focus:border-art-orange transition-colors"
                />
              </div>

              {/* Avatar picker */}
              <div>
                <span className="block font-black uppercase text-art-text/60 text-[10px] mb-2 tracking-wider">
                  {language === 'ca' ? 'Avatar' : language === 'en' ? 'Avatar' : 'Avatar'}
                  <span className="ml-2 text-lg">{avatar}</span>
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2.5 bg-[#FFF4E6] border border-[#FFD9B8]">
                  {cuteEmojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAvatar(emoji)}
                      className={`w-9 h-9 flex items-center justify-center text-xl rounded-2xl border-2 transition-all cursor-pointer ${
                        avatar === emoji
                          ? 'bg-art-orange border-[#FFD9B8] shadow-none scale-110'
                          : 'bg-white border-transparent hover:border-[#FFD9B8]/60 hover:bg-slate-50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block font-black uppercase text-art-text/60 text-[10px] mb-1 tracking-wider">
                  {t('roleField', language)}
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#FFD9B8] bg-[#FFF4E6] font-bold text-sm outline-none focus:border-art-orange transition-colors cursor-pointer"
                >
                  {availableRoles.map(r => (
                    <option key={r} value={r}>{t(r, language)}</option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 px-4 py-2 border border-[#FFD9B8] bg-white text-art-text font-black uppercase text-xs tracking-wider cursor-pointer hover:bg-slate-50 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                  {t('cancelBtn', language)}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-2 border border-[#FFD9B8] bg-art-yellow text-art-text font-black uppercase text-xs tracking-wider shadow-[0_2px_8px_rgba(42,26,18,0.10)] hover:translate-y-[-1px] hover:shadow-[0_4px_10px_rgba(42,26,18,0.10)] transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5px]" />
                  {language === 'ca' ? 'Desar' : language === 'en' ? 'Save' : 'Guardar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Language ─────────────────────────────────────────────── */}
      <div className="bg-white border border-[#FFD9B8] shadow-[0_4px_16px_rgba(42,26,18,0.12)] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="text-white bg-art-orange p-2 w-9 h-9 border border-[#FFD9B8] shrink-0" />
          <span className="text-[10px] uppercase font-black text-art-text/40 tracking-wider">
            {language === 'ca' ? 'Idioma' : language === 'en' ? 'Language' : 'Idioma'}
          </span>
        </div>
        <div className="flex gap-2">
          {([
            { code: 'ca' as Language, label: 'Català 🗳️' },
            { code: 'en' as Language, label: 'English 🇬🇧' },
            { code: 'an' as Language, label: 'Andaluz 💃' },
          ]).map(({ code, label }) => (
            <button
              key={code}
              type="button"
              onClick={() => onLanguageChange(code)}
              className={`flex-1 py-2.5 border-2 font-black uppercase text-xs tracking-wide transition-all cursor-pointer ${
                language === code
                  ? 'bg-[#2A1A12] border-[#FFD9B8] text-white shadow-[0_2px_8px_rgba(255,90,31,0.25)]'
                  : 'bg-white border-[#FFD9B8] text-art-text/60 hover:text-art-text hover:bg-[#FFF4E6]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Logout ───────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 py-3 border border-[#FFD9B8] bg-white text-art-text font-black uppercase text-xs tracking-wider shadow-[0_4px_16px_rgba(42,26,18,0.12)] hover:bg-red-50 hover:border-red-400 hover:text-red-600 hover:shadow-[4px_4px_0px_0px_#f87171] transition-all cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        {language === 'ca' ? 'Tancar sessió' : language === 'en' ? 'Sign out' : 'Cerrar sesión'}
      </button>

    </div>
  );
};
