import React from 'react';
import { HistoryRecord } from '../hooks/useHistory';

interface HistoryPanelProps {
  history: HistoryRecord[];
  onSelect: (record: HistoryRecord) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onSelect,
  onRemove,
  onClear,
  onClose
}) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-stone-50">
          <h3 className="text-lg font-serif font-bold text-stone-800 flex items-center gap-2">
            <span className="w-1 h-5 bg-red-800 rounded-sm"></span>
            历史记录
          </h3>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-stone-400 hover:text-red-600 transition-colors"
              >
                清空
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-200 transition-colors text-stone-500"
            >
              ×
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            <div className="p-8 text-center text-stone-400 font-serif">
              暂无历史记录
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {history.map(record => (
                <div
                  key={record.id}
                  className="flex items-center gap-3 p-4 hover:bg-stone-50 transition-colors cursor-pointer group"
                  onClick={() => onSelect(record)}
                >
                  {/* Avatar / Day Master */}
                  <div className="w-10 h-10 rounded-full bg-stone-800 text-gold flex items-center justify-center font-serif font-bold text-lg shrink-0">
                    {record.result.dayMaster}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-800 truncate">
                        {record.input.name}
                      </span>
                      <span className="text-xs text-stone-400">
                        {record.input.gender === 'Male' ? '乾造' : '坤造'}
                      </span>
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      {record.input.birthDate} {record.input.birthTime}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded">
                        {record.result.dayMasterElement}
                      </span>
                      {record.result.pattern && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded">
                          {record.result.pattern.mainPattern}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Timestamp & Delete */}
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-stone-400">
                      {formatDate(record.timestamp)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(record.id);
                      }}
                      className="text-xs text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-100 bg-stone-50 text-center">
          <span className="text-xs text-stone-400">
            最多保存 20 条记录
          </span>
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;
