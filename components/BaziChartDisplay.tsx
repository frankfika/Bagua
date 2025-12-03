import React from 'react';
import { BaziChartData, Pillar } from '../types';

interface BaziChartDisplayProps {
  chart: BaziChartData;
  solarTime: string;
  solarTerm?: string;
}

const TraditionalPillar: React.FC<{ title: string; pillar: Pillar; isDayMaster?: boolean }> = ({ title, pillar, isDayMaster }) => (
  <div className="flex flex-col items-center group shrink-0 w-20 md:w-24 lg:w-28">
    {/* Header */}
    <div className="writing-vertical-rl text-[10px] md:text-xs font-serif text-stone-400 mb-2 tracking-widest h-12 flex items-center justify-center opacity-70">
        {title}
    </div>

    {/* The Pillar Container */}
    <div className={`
        relative w-full py-4 md:py-6 rounded-sm border-x border-t border-b-4 shadow-lg flex flex-col items-center gap-4 md:gap-6 transition-all duration-500 hover:-translate-y-1
        ${isDayMaster 
            ? 'bg-gradient-to-b from-[#c53b3b] to-[#a01c1c] border-[#8b1a1a] text-amber-50 shadow-red-900/30' 
            : 'bg-[#f5f4f0] border-stone-300 text-stone-800 shadow-stone-400/20'}
    `}>
        {/* Heavenly Stem */}
        <div className="flex flex-col items-center gap-1 w-full">
             {/* Ten God of Stem */}
            <span className={`text-[9px] md:text-[10px] scale-90 font-serif tracking-tighter truncate w-full text-center ${isDayMaster ? 'text-white/60' : 'text-stone-400'}`}>
                {isDayMaster ? '日主' : pillar.gods[0]}
            </span>
            <span className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-none mt-1">
                {pillar.stem}
            </span>
        </div>
      
        {/* Divider */}
        <div className={`w-8 md:w-10 h-px ${isDayMaster ? 'bg-white/20' : 'bg-stone-300'}`}></div>

        {/* Earthly Branch */}
        <div className="flex flex-col items-center gap-1 w-full">
             <span className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-none">
                {pillar.branch}
            </span>
             {/* Hidden Stems / Cang Gan */}
            <div className="flex flex-col gap-0.5 mt-2 md:mt-3 items-center w-full px-1 md:px-2">
                {pillar.hiddenStems && pillar.hiddenStems.map((stem, idx) => (
                    <div key={idx} className={`flex items-center justify-between w-full text-[9px] font-serif ${isDayMaster ? 'text-white/60' : 'text-stone-400'}`}>
                         <span className="w-full text-center">{stem.charAt(0)}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Na Yin (Melodic Element) - Footer */}
        <div className={`absolute -bottom-6 md:-bottom-8 w-full text-center text-[9px] md:text-[10px] font-serif font-bold whitespace-nowrap ${isDayMaster ? 'text-[#c53b3b]' : 'text-stone-600'}`}>
            {pillar.element}
        </div>
    </div>

    {/* Shen Sha (Symbolic Stars) Display */}
    <div className="mt-8 md:mt-10 flex flex-col gap-1 items-center w-full px-1">
        {pillar.shenSha && pillar.shenSha.length > 0 ? (
            pillar.shenSha.slice(0, 4).map((star, idx) => ( // Limit to 4 to prevent clutter
                <span key={idx} className="text-[9px] md:text-[10px] px-1 md:px-2 py-0.5 rounded-sm bg-stone-100/50 text-stone-500 font-serif border border-stone-200/60 w-full text-center truncate">
                    {star}
                </span>
            ))
        ) : (
            <span className="text-[10px] text-stone-300 font-serif">-</span>
        )}
    </div>
  </div>
);

const BaziChartDisplay: React.FC<BaziChartDisplayProps> = ({ chart, solarTime, solarTerm }) => {
  return (
    <div className="w-full relative">
        {/* Solar Time & Term Badge */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1 z-10 w-full pointer-events-none">
             <div className="bg-stone-800 text-gold px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-serif shadow-md whitespace-nowrap border border-gold/30">
                真太阳时: {solarTime}
            </div>
            {solarTerm && (
                <div className="bg-stone-100/90 text-stone-500 px-2 py-0.5 rounded-sm text-[9px] font-serif border border-stone-200 shadow-sm">
                    {solarTerm}
                </div>
            )}
        </div>

        {/* Chart Container - Scrollable on mobile */}
        <div className="pt-10 sm:pt-14 pb-4 sm:pb-8 px-0 sm:px-4 rounded-lg flex justify-start sm:justify-center gap-3 sm:gap-6 overflow-x-auto scrollbar-hide w-full">
            <TraditionalPillar title="年柱" pillar={chart.year} />
            <TraditionalPillar title="月柱" pillar={chart.month} />
            <TraditionalPillar title="日柱" pillar={chart.day} isDayMaster />
            <TraditionalPillar title="时柱" pillar={chart.hour} />
        </div>
    </div>
  );
};

export default BaziChartDisplay;