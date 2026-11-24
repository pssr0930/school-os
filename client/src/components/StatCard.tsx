import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'indigo';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue'
}) => {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-[#22C55E] border-emerald-500/20',
    amber: 'bg-amber-500/10 text-[#F59E0B] border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
  };

  return (
    <div className="bg-[#1F2937] rounded-lg border border-[#303B4D] p-5 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[#9CA3AF]">{title}</p>
          <h3 className="text-2xl font-semibold text-[#F3F4F6] font-mono tabular-nums mt-1.5">{value}</h3>
          {subtitle && <p className="text-xs text-[#9CA3AF] mt-1">{subtitle}</p>}
          {trend && <span className="text-[11px] font-medium text-[#22C55E] mt-1 block">{trend}</span>}
        </div>
        <div className={`p-2.5 rounded-lg border shrink-0 ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
