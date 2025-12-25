import React, { useState } from 'react';
import { DaYunInfo, LiuNianInfo } from '../types';

interface DaYunDisplayProps {
  daYun: DaYunInfo[];
  daYunStartAge: number;
  currentDaYun?: DaYunInfo;
  birthYear: number;
}

// 天干五行颜色映射
const STEM_COLORS: Record<string, string> = {
  '甲': 'text-green-700', '乙': 'text-green-600',
  '丙': 'text-red-700', '丁': 'text-red-600',
  '戊': 'text-yellow-700', '己': 'text-yellow-600',
  '庚': 'text-gray-600', '辛': 'text-gray-500',
  '壬': 'text-blue-700', '癸': 'text-blue-600'
};

// 地支五行颜色映射
const BRANCH_COLORS: Record<string, string> = {
  '子': 'text-blue-600', '丑': 'text-yellow-600', '寅': 'text-green-600', '卯': 'text-green-700',
  '辰': 'text-yellow-700', '巳': 'text-red-600', '午': 'text-red-700', '未': 'text-yellow-600',
  '申': 'text-gray-600', '酉': 'text-gray-500', '戌': 'text-yellow-700', '亥': 'text-blue-700'
};

const DaYunDisplay: React.FC<DaYunDisplayProps> = ({
  daYun,
  daYunStartAge,
  currentDaYun,
  birthYear
}) => {
  const [selectedDaYun, setSelectedDaYun] = useState<DaYunInfo | null>(currentDaYun || null);
  const currentYear = new Date().getFullYear();

  if (!daYun || daYun.length === 0) {
    return (
      <div className="text-center text-stone-500 py-4">
        大运信息计算中...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 起运信息 */}
      <div className="text-center text-sm text-stone-600 mb-4">
        <span className="font-semibold text-red-800">{daYunStartAge}</span> 岁起运
        <span className="mx-2">|</span>
        起运年份：<span className="font-semibold">{birthYear + daYunStartAge}</span> 年
      </div>

      {/* 大运时间线 */}
      <div className="relative">
        {/* 时间线 */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-stone-200 via-red-200 to-stone-200" />

        {/* 大运节点 */}
        <div className="flex overflow-x-auto pb-4 scrollbar-hide snap-x">
          <div className="flex gap-1 sm:gap-2 min-w-max px-2">
            {daYun.map((dy, index) => {
              const isCurrent = currentDaYun?.ganZhi === dy.ganZhi;
              const isSelected = selectedDaYun?.ganZhi === dy.ganZhi;
              const stem = dy.ganZhi[0];
              const branch = dy.ganZhi[1];

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDaYun(isSelected ? null : dy)}
                  className={`flex flex-col items-center snap-center transition-all ${
                    isSelected ? 'transform scale-105' : ''
                  }`}
                >
                  {/* 大运干支 */}
                  <div className={`flex flex-col items-center p-2 sm:p-3 rounded-lg border-2 transition-all
                    ${isCurrent
                      ? 'bg-red-800 text-white border-red-800 shadow-lg'
                      : isSelected
                        ? 'bg-red-50 border-red-500 shadow-md'
                        : 'bg-white border-stone-200 hover:border-red-300'
                    }`}
                  >
                    <span className={`text-xl sm:text-2xl font-serif ${
                      isCurrent ? 'text-white' : STEM_COLORS[stem]
                    }`}>
                      {stem}
                    </span>
                    <span className={`text-xl sm:text-2xl font-serif ${
                      isCurrent ? 'text-white' : BRANCH_COLORS[branch]
                    }`}>
                      {branch}
                    </span>
                  </div>

                  {/* 年龄范围 */}
                  <div className={`text-xs mt-1 ${
                    isCurrent ? 'text-red-800 font-semibold' : 'text-stone-500'
                  }`}>
                    {dy.startAge}-{dy.endAge}岁
                  </div>

                  {/* 年份范围 */}
                  <div className="text-xs text-stone-400">
                    {dy.startYear}-{dy.endYear}
                  </div>

                  {/* 当前大运标记 */}
                  {isCurrent && (
                    <div className="text-xs text-red-600 font-semibold mt-1">
                      当前
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 选中大运的流年详情 */}
      {selectedDaYun && selectedDaYun.liuNian && selectedDaYun.liuNian.length > 0 && (
        <div className="mt-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
          <h4 className="text-sm font-semibold text-stone-700 mb-3">
            {selectedDaYun.ganZhi}大运 流年详情
            <span className="font-normal text-stone-500 ml-2">
              ({selectedDaYun.startAge}-{selectedDaYun.endAge}岁)
            </span>
          </h4>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {selectedDaYun.liuNian.map((ln, idx) => {
              const isCurrentYear = ln.year === currentYear;
              const stem = ln.ganZhi[0];
              const branch = ln.ganZhi[1];

              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center p-2 rounded transition-all ${
                    isCurrentYear
                      ? 'bg-red-100 border-2 border-red-500'
                      : 'bg-white border border-stone-200'
                  }`}
                >
                  <div className="flex">
                    <span className={`text-sm font-serif ${STEM_COLORS[stem]}`}>{stem}</span>
                    <span className={`text-sm font-serif ${BRANCH_COLORS[branch]}`}>{branch}</span>
                  </div>
                  <div className={`text-xs ${isCurrentYear ? 'text-red-700 font-semibold' : 'text-stone-500'}`}>
                    {ln.year}
                  </div>
                  <div className="text-xs text-stone-400">
                    {ln.age}岁
                  </div>
                  {isCurrentYear && (
                    <div className="text-xs text-red-600 font-bold">今年</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 提示 */}
      <div className="text-xs text-stone-400 text-center">
        点击大运查看该运期内的流年详情
      </div>
    </div>
  );
};

export default DaYunDisplay;
