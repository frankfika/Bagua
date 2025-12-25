import React, { useState } from 'react';

interface ShichenPickerProps {
  value: string;          // HH:mm 格式
  onChange: (value: string) => void;
  className?: string;
}

// 十二时辰定义
const SHICHEN = [
  { name: '子', alias: '子时', range: '23:00-01:00', value: '00:00', emoji: '🐀' },
  { name: '丑', alias: '丑时', range: '01:00-03:00', value: '02:00', emoji: '🐂' },
  { name: '寅', alias: '寅时', range: '03:00-05:00', value: '04:00', emoji: '🐅' },
  { name: '卯', alias: '卯时', range: '05:00-07:00', value: '06:00', emoji: '🐇' },
  { name: '辰', alias: '辰时', range: '07:00-09:00', value: '08:00', emoji: '🐉' },
  { name: '巳', alias: '巳时', range: '09:00-11:00', value: '10:00', emoji: '🐍' },
  { name: '午', alias: '午时', range: '11:00-13:00', value: '12:00', emoji: '🐴' },
  { name: '未', alias: '未时', range: '13:00-15:00', value: '14:00', emoji: '🐑' },
  { name: '申', alias: '申时', range: '15:00-17:00', value: '16:00', emoji: '🐵' },
  { name: '酉', alias: '酉时', range: '17:00-19:00', value: '18:00', emoji: '🐔' },
  { name: '戌', alias: '戌时', range: '19:00-21:00', value: '20:00', emoji: '🐕' },
  { name: '亥', alias: '亥时', range: '21:00-23:00', value: '22:00', emoji: '🐷' },
];

// 根据时间获取对应的时辰
function getShichenFromTime(time: string): string | null {
  if (!time) return null;
  const [hour] = time.split(':').map(Number);

  // 子时特殊处理（23:00-01:00）
  if (hour >= 23 || hour < 1) return '00:00';
  if (hour >= 1 && hour < 3) return '02:00';
  if (hour >= 3 && hour < 5) return '04:00';
  if (hour >= 5 && hour < 7) return '06:00';
  if (hour >= 7 && hour < 9) return '08:00';
  if (hour >= 9 && hour < 11) return '10:00';
  if (hour >= 11 && hour < 13) return '12:00';
  if (hour >= 13 && hour < 15) return '14:00';
  if (hour >= 15 && hour < 17) return '16:00';
  if (hour >= 17 && hour < 19) return '18:00';
  if (hour >= 19 && hour < 21) return '20:00';
  if (hour >= 21 && hour < 23) return '22:00';

  return null;
}

const ShichenPicker: React.FC<ShichenPickerProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const [mode, setMode] = useState<'shichen' | 'precise'>('shichen');
  const currentShichen = getShichenFromTime(value);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 模式切换 */}
      <div className="flex gap-2 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => setMode('shichen')}
          className={`px-3 py-1 text-sm rounded-t transition-colors ${
            mode === 'shichen'
              ? 'bg-red-800 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          时辰选择
        </button>
        <button
          type="button"
          onClick={() => setMode('precise')}
          className={`px-3 py-1 text-sm rounded-t transition-colors ${
            mode === 'precise'
              ? 'bg-red-800 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          精确时间
        </button>
      </div>

      {mode === 'shichen' ? (
        <>
          {/* 时辰网格 */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {SHICHEN.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => onChange(s.value)}
                className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                  currentShichen === s.value
                    ? 'bg-red-800 text-white border-red-800 shadow-md'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-red-300 hover:bg-red-50'
                }`}
              >
                <span className="text-lg font-serif">{s.name}</span>
                <span className="text-xs opacity-75">{s.range}</span>
              </button>
            ))}
          </div>

          {/* 当前选中提示 */}
          {currentShichen && (
            <div className="text-center text-sm text-stone-500">
              已选择：{SHICHEN.find(s => s.value === currentShichen)?.alias}
              （{SHICHEN.find(s => s.value === currentShichen)?.range}）
            </div>
          )}

          {/* 不确定时间提示 */}
          <div className="text-xs text-stone-400 text-center mt-2">
            若不确定具体时间，可选择时辰中点。时辰误差可能影响排盘结果。
          </div>
        </>
      ) : (
        /* 精确时间输入 */
        <div className="flex flex-col items-center gap-3">
          <input
            type="time"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full max-w-xs px-4 py-3 text-center text-xl border border-stone-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />

          {/* 时辰对照 */}
          {currentShichen && (
            <div className="text-sm text-stone-600">
              对应时辰：
              <span className="font-semibold text-red-800">
                {SHICHEN.find(s => s.value === currentShichen)?.alias}
              </span>
              （{SHICHEN.find(s => s.value === currentShichen)?.range}）
            </div>
          )}

          {/* 快速选择常用时间 */}
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => onChange(t)}
                className={`px-3 py-1 text-sm rounded border transition-colors ${
                  value === t
                    ? 'bg-red-800 text-white border-red-800'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-red-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShichenPicker;
