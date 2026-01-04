
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  color: string;
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, unit, icon: Icon, color, trend }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-colors group">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{title}</span>
          <div className="flex items-baseline gap-1">
            <h3 className="text-2xl font-bold text-white mono">{value}</h3>
            <span className="text-slate-400 text-[10px] font-medium">{unit}</span>
          </div>
        </div>
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1">
          <span className={`text-[10px] font-bold ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-[10px] text-slate-600">vs prev hour</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
