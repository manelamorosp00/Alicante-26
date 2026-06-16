import React, { useState } from 'react';
import { Language, SightseeingItem } from '../types';
import { t } from '../translations';
import { MapPin, Compass, ExternalLink, Palmtree, Landmark, Camera, Utensils } from 'lucide-react';

interface SightseeingGridProps {
  language: Language;
  items: SightseeingItem[];
}

export const SightseeingGrid: React.FC<SightseeingGridProps> = ({ language, items }) => {
  const [filter, setFilter] = useState<'all' | 'beach' | 'culture' | 'viewpoint' | 'food'>('all');

  const filteredItems = filter === 'all'
    ? items
    : items.filter(item => item.category === filter);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'beach':
        return <Palmtree className="w-4 h-4 text-sky-500" />;
      case 'culture':
        return <Landmark className="w-4 h-4 text-indigo-500" />;
      case 'viewpoint':
        return <Camera className="w-4 h-4 text-emerald-500" />;
      case 'food':
        return <Utensils className="w-4 h-4 text-amber-500" />;
      default:
        return <Compass className="w-4 h-4 text-slate-500" />;
    }
  };

  const getCategoryName = (category: string) => {
    const translationsCat: Record<Language, Record<string, string>> = {
      ca: { all: 'Tots', beach: 'Platges i Cales', culture: 'Cultura i Història', viewpoint: 'Miradors', food: 'Menjar i tapes' },
      en: { all: 'All', beach: 'Beaches & Coves', culture: 'Culture & History', viewpoint: 'Viewpoints', food: 'Food & Tapas' },
      an: { all: 'To\'', beach: 'Arrebatos de Playa', culture: 'Cultura y Ruinas', viewpoint: 'Sititos pa\' Ve\'', food: 'Rancho y Cervesiya' },
    };
    return translationsCat[language]?.[category] || category;
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 py-2">
      
      {/* Category selector pills */}
      <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
        {(['all', 'beach', 'culture', 'viewpoint', 'food'] as const).map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 border-2 border-[#2d2d2d] text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 select-none cursor-pointer ${filter === cat ? 'bg-art-orange text-white shadow-[2px_2px_0px_0px_#2d2d2d]' : 'bg-white text-art-text hover:bg-art-bg hover:translate-y-[-1px]'}`}
          >
            {getCategoryIcon(cat)}
            <span>{getCategoryName(cat)}</span>
          </button>
        ))}
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white border-2 border-[#2d2d2d] shadow-[6px_6px_0px_0px_#2d2d2d] hover:shadow-[8px_8px_0px_0px_#2d2d2d] hover:translate-y-[-2px] transition-all flex flex-col group animate-fadeIn">
            
            {/* Aspect image frame */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-200 border-b-2 border-[#2d2d2d]">
              <img
                src={item.image}
                alt={item.title[language]}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 bg-white border-2 border-[#2d2d2d] px-2.5 py-1 shadow-[2px_2px_0px_0px_#2d2d2d] flex items-center gap-1.5">
                {getCategoryIcon(item.category)}
                <span className="text-[10px] font-black text-art-text uppercase tracking-wide">
                  {getCategoryName(item.category)}
                </span>
              </div>
            </div>

            {/* details */}
            <div className="p-5 flex-1 flex flex-col justify-between gap-4">
              <div>
                <h4 className="font-display font-black uppercase text-lg text-art-text group-hover:text-art-orange transition-colors">
                  {item.title[language] || item.title['ca']}
                </h4>
                <p className="text-xs sm:text-sm text-art-text/85 leading-relaxed mt-2 line-clamp-4 font-medium">
                  {item.description[language] || item.description['ca']}
                </p>
              </div>

              <div className="border-t border-[#2d2d2d]/10 pt-3 flex flex-col gap-2">
                <span className="text-[10px] uppercase font-mono font-bold text-art-text/50 tracking-wider">
                  {t('addressLabel', language)}
                </span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-art-orange shrink-0" />
                  <span className="text-[11px] font-mono font-bold text-art-text/95 truncate flex-1">
                    {item.location}
                  </span>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.title['ca'] + ', Alicante')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 text-xs font-black uppercase tracking-wider text-art-orange hover:text-art-orange/85 underline decoration-2 decoration-art-orange hover:decoration-[#2d2d2d] underline-offset-4 flex items-center gap-1 self-start cursor-pointer transition-all"
                >
                  <span>{language === 'ca' ? 'Veure a Google Maps' : language === 'en' ? 'Navigate with Maps' : 'Montà er GPS'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
