import React from 'react';
import { Calendar, Clock, RotateCcw, Droplets } from 'lucide-react';
import { CycleCalculationResult, CycleStats } from '../../types/cycle';

interface QuickStatsProps {
  cycleState: CycleCalculationResult;
  stats: CycleStats;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ cycleState, stats }) => {
  const items = [
    {
      label: 'Next Period',
      value: cycleState.isCurrentlyOnPeriod 
        ? 'Active Now' 
        : `In ${cycleState.daysUntilNextPeriod} days`,
      sub: cycleState.estimatedNextPeriodStart,
      icon: Calendar,
      color: 'text-rose-500 bg-rose-50 border-rose-100',
    },
    {
      label: 'Cycle Day',
      value: `Day ${cycleState.currentCycleDay}`,
      sub: `of ${cycleState.totalCycleLength} days`,
      icon: Clock,
      color: 'text-pink-500 bg-pink-50 border-pink-100',
    },
    {
      label: 'Cycle Length',
      value: `${stats.averageCycleLength} days`,
      sub: 'Historical average',
      icon: RotateCcw,
      color: 'text-purple-500 bg-purple-50 border-purple-100',
    },
    {
      label: 'Period Length',
      value: `${stats.averagePeriodLength} days`,
      sub: 'Historical average',
      icon: Droplets,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-3xl p-4 shadow-soft border border-rose-100/70 flex flex-col justify-between hover:shadow-float transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {item.label}
              </span>
              <div className={`w-7 h-7 rounded-2xl flex items-center justify-center border ${item.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="text-lg font-bold font-display text-gray-900 leading-tight">
                {item.value}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5 truncate">
                {item.sub}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
