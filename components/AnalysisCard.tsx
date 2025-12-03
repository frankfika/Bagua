import React from 'react';
import { AnalysisSection } from '../types';

interface AnalysisCardProps {
  section: AnalysisSection;
  icon?: React.ReactNode;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ section, icon }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-3">
          {icon && <div className="text-amber-600">{icon}</div>}
          <h4 className="font-serif text-xl text-stone-800 font-semibold">{section.title}</h4>
        </div>
        {section.score !== undefined && (
            <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                section.score >= 80 ? 'bg-green-100 text-green-800' :
                section.score >= 60 ? 'bg-amber-100 text-amber-800' :
                'bg-red-100 text-red-800'
            }`}>
                指数: {section.score}
            </div>
        )}
      </div>
      <div className="prose prose-stone leading-relaxed text-stone-600 text-justify text-sm md:text-base">
        {section.content}
      </div>
    </div>
  );
};

export default AnalysisCard;