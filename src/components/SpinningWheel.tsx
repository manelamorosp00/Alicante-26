import React, { useRef, useState, useEffect } from 'react';
import { Language, Member } from '../types';

interface SpinningWheelProps {
  language: Language;
  members: Member[];
  punishments: string[];
}

export const SpinningWheel: React.FC<SpinningWheelProps> = ({ language, members, punishments }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wheelType, setWheelType] = useState<'members' | 'punishments'>('punishments');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const items = wheelType === 'members' 
    ? members.map(m => m.nickname || m.name) 
    : punishments;

  const colors = [
    '#FF6321', // art-orange
    '#0077B6', // art-blue
    '#2d2d2d', // charcoal
    '#FFB703', // art-yellow
    '#e65c00', // fallback orange
    '#0096c7', // fallback blue
    '#4a4a4a', // fallback charcoal
    '#f7a072', // fallback salmon
  ];

  // Draw the wheel
  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 15;

    ctx.clearRect(0, 0, size, size);

    const arcSize = (2 * Math.PI) / items.length;

    // Draw shadow circle
    ctx.beginPath();
    ctx.arc(center, center, radius + 8, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(45, 45, 45, 0.15)';
    ctx.fill();

    // Draw slices
    items.forEach((item, index) => {
      const startAngle = angle + index * arcSize;
      const endAngle = startAngle + arcSize;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();

      // Alternate colors
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();

      // Border lines
      ctx.strokeStyle = '#2d2d2d';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Text inside slices
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';

      // Clip long text
      const maxTextWidth = radius - 40;
      let textToDraw = item;
      if (ctx.measureText(textToDraw).width > maxTextWidth) {
        textToDraw = item.substring(0, 11) + '...';
      }

      ctx.fillText(textToDraw, radius - 20, 0);
      ctx.restore();
    });

    // Outer border ring
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#2d2d2d';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Center pin cap
    ctx.beginPath();
    ctx.arc(center, center, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#2d2d2d';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Small glossy dot in middle
    ctx.beginPath();
    ctx.arc(center - 5, center - 5, 6, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();

    // Outer indicators/decorations
    items.forEach((_, index) => {
      const dotAngle = angle + index * arcSize;
      const dotX = center + (radius - 2) * Math.cos(dotAngle);
      const dotY = center + (radius - 2) * Math.sin(dotAngle);

      ctx.beginPath();
      ctx.arc(dotX, dotY, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#fdfaf2';
      ctx.fill();
      ctx.strokeStyle = '#2d2d2d';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  };

  const angleRef = useRef(0);
  useEffect(() => {
    drawWheel(angleRef.current);
  }, [items, wheelType]);

  const spin = () => {
    if (isSpinning || items.length === 0) return;
    setIsSpinning(true);
    setWinner(null);

    const spinDuration = 3000 + Math.random() * 2000; // 3 to 5 seconds
    const startSpeed = 0.3 + Math.random() * 0.2; // Radians per frame
    let speed = startSpeed;
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
        // Stop spinning and calculate index
        setIsSpinning(false);

        // Indicator is at 12 o'clock, which is -Math.PI / 2 radians (or 3/2 * Math.PI)
        const indicatorAngle = (3 / 2) * Math.PI;
        
        // Find which sector contains the indicator Angle.
        // Slice angle ranges from: (angleRef.current + index * arcSize) to (angleRef.current + (index+1) * arcSize)
        const arcSize = (2 * Math.PI) / items.length;
        
        // Standardize current angle to be between 0 and 2*PI
        const normalizedWheelStart = (angleRef.current % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        
        // Relative angle from start of item 0 to the 12 o'clock pointer
        let relativePointerAngle = (indicatorAngle - normalizedWheelStart + 4 * Math.PI) % (2 * Math.PI);
        
        const winningIndex = Math.floor((2 * Math.PI - relativePointerAngle) / arcSize) % items.length;
        
        setWinner(items[winningIndex]);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col items-center gap-6 py-4 bg-white border-2 border-[#2d2d2d] shadow-[6px_6px_0px_0px_#2d2d2d] rounded-none max-w-md mx-auto relative overflow-hidden" id="spinning-wheel-section">
      <div className="flex bg-[#fdfaf2] border-2 border-[#2d2d2d] rounded-none p-1 w-full max-w-xs justify-between font-display text-xs mb-2">
        <button
          type="button"
          onClick={() => { setWheelType('punishments'); setWinner(null); }}
          className={`flex-1 px-4 py-2 font-black uppercase text-center transition-all cursor-pointer ${wheelType === 'punishments' ? 'bg-[#2d2d2d] text-white shadow-xs' : 'text-art-text/60 hover:text-art-text'}`}
        >
          {language === 'ca' ? 'Càstigs' : language === 'en' ? 'Penalties' : 'Castig\''}
        </button>
        <button
          type="button"
          onClick={() => { setWheelType('members'); setWinner(null); }}
          className={`flex-1 px-4 py-2 font-black uppercase text-center transition-all cursor-pointer ${wheelType === 'members' ? 'bg-[#2d2d2d] text-white shadow-xs' : 'text-art-text/60 hover:text-art-text'}`}
        >
          {language === 'ca' ? 'La Colla' : language === 'en' ? 'Friends List' : 'La peñita'}
        </button>
      </div>

      <div className="relative flex items-center justify-center p-4">
        {/* Triangle Indicator at Top */}
        <div className="absolute top-[0px] z-10 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-[#2d2d2d] filter drop-shadow-md"></div>
        
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="w-80 h-80 max-w-full"
        />
      </div>

      <button
        type="button"
        disabled={isSpinning}
        onClick={spin}
        className={`w-full max-w-xs py-4 px-6 border-2 border-[#2d2d2d] font-display text-sm font-black text-art-text shadow-[4px_4px_0px_0px_#2d2d2d] hover:shadow-[5px_5px_0px_0px_#2d2d2d] hover:translate-y-[-1px] transition-all uppercase tracking-wider select-none ${
          isSpinning 
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none hover:translate-y-0' 
            : 'bg-art-yellow cursor-pointer'
        }`}
      >
        {isSpinning 
          ? (language === 'ca' ? 'Girant...' : language === 'en' ? 'Spinning...' : 'Girando...') 
          : (language === 'ca' ? '⚡ GIRAR RULETA!' : language === 'en' ? '⚡ SPIN WHEEL!' : '⚡ ¡DALE UN VOLANTE!')
        }
      </button>

      {winner && (
        <div className="mt-2 text-center px-6 py-4 bg-art-orange/10 border-2 border-[#2d2d2d] shadow-[3px_3px_0px_0px_#2d2d2d] rounded-none w-[90%] animate-bounce">
          <p className="text-xs font-black text-art-orange tracking-wide uppercase">
            {language === 'ca' ? 'La deessa de la sort dictamina :' : language === 'en' ? 'The Goddess of Luck declares :' : 'La diosa der fango dize :'}
          </p>
          <h3 className="text-xl font-black font-display text-art-text uppercase mt-1">
            {winner}
          </h3>
        </div>
      )}
    </div>
  );
};
