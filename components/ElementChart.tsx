import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ElementData {
  name: string;
  value: number;
  color: string;
}

interface ElementChartProps {
  elements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
}

const ElementChart: React.FC<ElementChartProps> = ({ elements }) => {
  const data: ElementData[] = [
    { name: '木', value: elements.wood, color: '#4ade80' }, // Green
    { name: '火', value: elements.fire, color: '#f87171' }, // Red
    { name: '土', value: elements.earth, color: '#fbbf24' }, // Yellow/Earth
    { name: '金', value: elements.metal, color: '#94a3b8' }, // Gray/Silver
    { name: '水', value: elements.water, color: '#60a5fa' }, // Blue
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-full flex flex-col">
      <h4 className="text-center font-serif text-lg text-stone-800 mb-4">五行能量分布</h4>
      <div className="flex-1 w-full min-h-[250px]" style={{ minWidth: 0 }}>
        <ResponsiveContainer width="100%" height={250} minWidth={200}>
          <PieChart>
            <Pie
              data={data as any}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
                formatter={(value: number) => `${value}%`}
                contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e5e5', borderRadius: '8px', fontFamily: 'serif' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle"/>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center text-xs text-stone-400 mt-2 italic">
        数值仅代表五行相对强弱比例
      </div>
    </div>
  );
};

export default ElementChart;