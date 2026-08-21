import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { formatBytes } from '../../data/mockData';

const storageCategoryData = [
  { name: 'Videos', sizeGB: 114, color: '#38bdf8' },
  { name: 'Downloads', sizeGB: 88, color: '#818cf8' },
  { name: 'Projects', sizeGB: 76, color: '#34d399' },
  { name: '.cache', sizeGB: 54, color: '#fbbf24' },
  { name: 'Pictures', sizeGB: 38, color: '#f472b6' },
  { name: 'System /usr', sizeGB: 96, color: '#94a3b8' },
  { name: 'Other', sizeGB: 172, color: '#64748b' },
];

export const ActivityChart: React.FC = () => {
  return (
    <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-100">Storage Consumption by Category</h4>
          <p className="text-xs text-slate-400 mt-0.5">Categorized breakdown across root filesystem</p>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          638 GB Total
        </span>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={storageCategoryData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
            <XAxis type="number" hide domain={[0, 200]} />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
              width={80}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg shadow-xl text-xs">
                      <span className="font-semibold text-slate-200">{data.name}</span>
                      <p className="text-sky-400 font-mono font-medium mt-0.5">
                        {data.sizeGB} GB (~{Math.round((data.sizeGB / 638) * 100)}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="sizeGB" radius={[0, 4, 4, 0]} barSize={12}>
              {storageCategoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
