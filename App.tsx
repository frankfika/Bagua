import React, { useState, useEffect } from 'react';
import { UserInput, BaziResult } from './types';
import InputForm from './components/InputForm';
import BaziChartDisplay from './components/BaziChartDisplay';
import { generateBaziAnalysis } from './services/geminiService';
import ElementChart from './components/ElementChart';
import AnalysisTabs from './components/AnalysisTabs';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BaziResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load saved state on startup
  useEffect(() => {
    const savedResult = localStorage.getItem('zen_bazi_result');
    if (savedResult) {
      try {
        setResult(JSON.parse(savedResult));
      } catch (e) {
        console.error("Failed to load saved state", e);
        localStorage.removeItem('zen_bazi_result');
      }
    }
  }, []);

  // Persist result whenever it changes
  useEffect(() => {
    if (result) {
      localStorage.setItem('zen_bazi_result', JSON.stringify(result));
    }
  }, [result]);

  const handleAnalyze = async (data: UserInput) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const analysis = await generateBaziAnalysis(data);
      setResult(analysis);
    } catch (e: any) {
      setError("排盘失败，请重试。" + (e.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    localStorage.removeItem('zen_bazi_result');
  };

  return (
    <div className="min-h-screen bg-[#f0f0eb] font-sans selection:bg-red-900 selection:text-white pb-12 sm:pb-20" 
        style={{
            backgroundImage: `
                radial-gradient(#d6d3d1 1px, transparent 1px), 
                radial-gradient(#d6d3d1 1px, transparent 1px)
            `,
            backgroundPosition: '0 0, 20px 20px',
            backgroundSize: '40px 40px',
            // Handle iPhone X+ safe areas (notch and home bar)
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)',
        }}
    >
      {/* Header */}
      <header className="bg-stone-900/95 backdrop-blur text-stone-200 py-3 sm:py-4 shadow-xl border-b border-gold sticky top-0 z-50 transition-all pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3 select-none cursor-pointer" onClick={reset}>
             <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-800 rounded-sm flex items-center justify-center border border-red-900 shadow-inner shrink-0">
                 <span className="font-serif font-bold text-amber-50 text-xs sm:text-sm">禅</span>
             </div>
             <div className="flex flex-col">
                <h1 className="text-sm sm:text-xl font-display font-bold tracking-[0.15em] sm:tracking-[0.2em] text-stone-200 leading-none">
                    禅 · 八字
                </h1>
                <span className="text-[10px] text-stone-500 uppercase tracking-widest hidden sm:block">专业智能排盘</span>
             </div>
          </div>
          {result && (
              <button onClick={reset} className="text-xs sm:text-sm text-stone-400 hover:text-white border border-stone-700 hover:border-stone-500 px-3 py-1.5 rounded hover:bg-stone-800 transition-all font-serif flex items-center gap-1">
                  <span>↺</span> 重排
              </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {!result && (
           <div className="flex flex-col items-center justify-center min-h-[60vh] py-8 animate-fade-in-up">
              <InputForm onSubmit={handleAnalyze} isLoading={loading} />
              {error && (
                <div className="mt-6 p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg max-w-lg w-full text-center font-serif shadow-sm">
                    {error}
                </div>
              )}
           </div>
        )}

        {result && (
            <div className="animate-fade-in space-y-6 sm:space-y-8">
                
                {/* Top Section: Chart & Elements */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* Left: The Four Pillars (Centerpiece) */}
                    <div className="xl:col-span-8 space-y-4">
                         <div className="bg-[#fdfbf7] rounded-lg shadow-sm border border-stone-300 p-4 sm:p-6 relative overflow-hidden">
                             {/* Paper Texture Overlay */}
                             <div className="absolute inset-0 opacity-40 pointer-events-none" 
                                  style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper.png")' }}>
                             </div>

                             {/* Watermark */}
                             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[120px] sm:text-[180px] text-stone-900/5 font-serif font-bold select-none pointer-events-none z-0">
                                {result.dayMasterElement.charAt(0)}
                             </div>
                             
                             <div className="relative z-10">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 border-b border-stone-200 pb-4 gap-4">
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-serif text-stone-800 font-bold flex items-center gap-2">
                                            <span className="w-1.5 h-6 bg-red-800 block rounded-sm"></span>
                                            八字命盘
                                        </h2>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded border border-stone-200">
                                                五行: {result.dayMasterElement}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded border font-bold ${
                                                result.strength.includes('Strong') || result.strength.includes('强') || result.strength.includes('旺') 
                                                ? 'bg-red-50 text-red-800 border-red-100' 
                                                : 'bg-blue-50 text-blue-800 border-blue-100'
                                            }`}>
                                                {result.strength}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <div className="text-4xl font-serif text-stone-800">{result.dayMaster}</div>
                                        <div className="text-[10px] text-stone-400 uppercase tracking-widest">日元 (Day Master)</div>
                                    </div>
                                </div>
                                <BaziChartDisplay 
                                    chart={result.chart} 
                                    solarTime={result.solarTimeAdjusted} 
                                    solarTerm={result.solarTerm}
                                />
                             </div>
                         </div>
                    </div>

                    {/* Right: Five Elements */}
                    <div className="xl:col-span-4 h-full min-h-[300px]">
                        <ElementChart elements={result.fiveElements} />
                    </div>
                </div>

                {/* Bottom Section: Analysis Tabs & Chat */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    {/* Analysis Report */}
                    {/* Changed order: Default natural order is Analysis first. Removed mobile 'order' classes. */}
                    <div className="xl:col-span-8">
                        <AnalysisTabs 
                            analysis={result.analysis} 
                            luckyElements={result.luckyElements} 
                            unluckyElements={result.unluckyElements}
                            luckyColors={result.luckyColors}
                            luckyNumbers={result.luckyNumbers}
                            luckyDirections={result.luckyDirections}
                        />
                    </div>

                    {/* Chat Interface */}
                    {/* Only sticky on XL screens. Default is normal flow (bottom) on mobile. */}
                    <div className="xl:col-span-4 xl:sticky xl:top-24 z-30">
                        <ChatInterface />
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;