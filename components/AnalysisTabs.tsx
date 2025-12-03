import React, { useState, useRef, useEffect } from 'react';
import { BaziResult } from '../types';

interface AnalysisTabsProps {
    analysis: BaziResult['analysis'];
    luckyElements: string[];
    unluckyElements: string[];
    luckyColors: string[];
    luckyNumbers: string[];
    luckyDirections: string[];
}

const AnalysisTabs: React.FC<AnalysisTabsProps> = ({ 
    analysis, 
    luckyElements, 
    luckyColors,
    luckyNumbers,
    luckyDirections
}) => {
    const tabs = [
        { key: 'personality', label: '性情', data: analysis.personality },
        { key: 'career', label: '事业', data: analysis.career },
        { key: 'wealth', label: '财运', data: analysis.wealth },
        { key: 'relationships', label: '情感', data: analysis.relationships },
        { key: 'health', label: '健康', data: analysis.health },
        { key: 'fortune', label: '大运', data: analysis.globalFortune },
    ];

    const [activeTab, setActiveTab] = useState(tabs[0].key);
    const activeData = tabs.find(t => t.key === activeTab)?.data;
    const tabContainerRef = useRef<HTMLDivElement>(null);

    // Scroll active tab into view on mobile
    useEffect(() => {
        if (tabContainerRef.current) {
             const activeEl = tabContainerRef.current.querySelector(`[data-key="${activeTab}"]`);
             if (activeEl) {
                 activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
             }
        }
    }, [activeTab]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden flex flex-col h-full min-h-[500px] md:min-h-[600px]">
            {/* Tab Header */}
            <div ref={tabContainerRef} className="flex overflow-x-auto border-b border-stone-200 bg-stone-50 scrollbar-hide touch-pan-x">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        data-key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 min-w-[90px] sm:min-w-[100px] py-3 sm:py-4 text-xs sm:text-sm font-serif font-bold tracking-wide transition-all whitespace-nowrap relative px-4
                        ${activeTab === tab.key 
                            ? 'bg-white text-ink' 
                            : 'text-stone-400 hover:bg-stone-100 hover:text-stone-600'}`}
                    >
                        {tab.label}
                        {activeTab === tab.key && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-800"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto bg-paper/30">
                {activeData && (
                    <div className="animate-fade-in space-y-6 sm:space-y-8">
                        {/* Header Section */}
                        <div className="flex flex-col sm:flex-row items-start justify-between border-b border-stone-200 pb-4 gap-4">
                            <div>
                                <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-800 mb-2">
                                    {activeData.title}
                                </h3>
                                <p className="text-stone-600 font-serif italic text-sm leading-relaxed max-w-2xl">
                                    "{activeData.summary}"
                                </p>
                            </div>
                            {activeData.score !== undefined && (
                                <div className="self-start sm:self-auto flex items-center gap-2 sm:flex-col bg-stone-100 px-3 py-1 sm:py-2 rounded-lg border border-stone-200 shrink-0">
                                    <span className="text-[10px] text-stone-400 uppercase tracking-widest">指数</span>
                                    <span className={`text-xl sm:text-2xl font-display font-bold ${
                                        activeData.score >= 80 ? 'text-green-700' : 
                                        activeData.score >= 60 ? 'text-amber-600' : 'text-red-700'
                                    }`}>
                                        {activeData.score}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Detailed Analysis Lists */}
                        {activeData.details && activeData.details.length > 0 && (
                            <div>
                                <h4 className="font-serif font-bold text-stone-800 mb-3 flex items-center gap-2">
                                    <span className="w-1 h-4 bg-ink"></span>
                                    深度解析
                                </h4>
                                <ul className="grid grid-cols-1 gap-2 sm:gap-3">
                                    {activeData.details.map((item, i) => (
                                        <li key={i} className="flex gap-2 sm:gap-3 text-stone-700 font-serif text-sm md:text-base bg-white p-3 rounded border border-stone-100 shadow-sm">
                                            <span className="text-amber-600 mt-0.5 sm:mt-1 text-xs">✦</span>
                                            <span className="leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Predictions Section (If available) */}
                        {activeData.predictions && activeData.predictions.length > 0 && (
                            <div>
                                <h4 className="font-serif font-bold text-stone-800 mb-3 flex items-center gap-2">
                                    <span className="w-1 h-4 bg-red-700"></span>
                                    流年运势
                                </h4>
                                <div className="space-y-3">
                                    {activeData.predictions.map((pred, i) => (
                                        <div key={i} className="bg-red-50/50 p-3 sm:p-4 rounded-lg border border-red-100 flex flex-col sm:flex-row gap-2 sm:gap-4 items-start">
                                            <div className="bg-white text-red-800 text-[10px] sm:text-xs font-bold px-2 py-1 rounded border border-red-100 whitespace-nowrap">
                                                {pred.match(/^\d{4}/) ? pred.substring(0, 4) : '未来'}
                                            </div>
                                            <p className="text-stone-700 font-serif text-sm leading-relaxed">
                                                {pred.replace(/^\d{4}[：:]?\s*/, '')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Advice Section */}
                        {activeData.advice && activeData.advice.length > 0 && (
                            <div>
                                <h4 className="font-serif font-bold text-stone-800 mb-3 flex items-center gap-2">
                                    <span className="w-1 h-4 bg-green-600"></span>
                                    趋吉避凶
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {activeData.advice.map((adv, i) => (
                                        <div key={i} className="flex items-center gap-3 text-stone-600 font-serif text-sm bg-stone-50 p-3 rounded border-l-2 border-green-500 shadow-sm">
                                            <span>{adv}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Global Lucky Elements (Only on Personality Tab) */}
                        {activeTab === 'personality' && (
                             <div className="mt-8 pt-6 border-t border-stone-200">
                                <h4 className="font-serif font-bold text-stone-800 mb-4 text-center">命理锦囊</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                    <div className="bg-white p-3 rounded text-center border border-stone-100 shadow-sm">
                                        <span className="block text-[10px] sm:text-xs text-stone-400 mb-1">喜用神</span>
                                        <span className="font-bold text-green-700 text-sm">{luckyElements.join(' ')}</span>
                                    </div>
                                    <div className="bg-white p-3 rounded text-center border border-stone-100 shadow-sm">
                                        <span className="block text-[10px] sm:text-xs text-stone-400 mb-1">幸运色</span>
                                        <span className="font-bold text-stone-700 text-sm">{luckyColors.join(', ') || '-'}</span>
                                    </div>
                                    <div className="bg-white p-3 rounded text-center border border-stone-100 shadow-sm">
                                        <span className="block text-[10px] sm:text-xs text-stone-400 mb-1">幸运数字</span>
                                        <span className="font-bold text-stone-700 text-sm">{luckyNumbers.join(', ') || '-'}</span>
                                    </div>
                                    <div className="bg-white p-3 rounded text-center border border-stone-100 shadow-sm">
                                        <span className="block text-[10px] sm:text-xs text-stone-400 mb-1">吉利方位</span>
                                        <span className="font-bold text-stone-700 text-sm">{luckyDirections.join(', ') || '-'}</span>
                                    </div>
                                </div>
                             </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalysisTabs;