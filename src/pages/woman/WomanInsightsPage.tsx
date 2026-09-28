import React from 'react';
import { useCycle } from '../../context/CycleContext';
import { InsightsCharts } from '../../components/insights/InsightsCharts';
import { Sparkles } from 'lucide-react';
import { Disclaimer } from '../../components/common/Disclaimer';

export const WomanInsightsPage: React.FC = () => {
  const { stats, isLoading } = useCycle();

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-md mx-auto p-4 animate-pulse">
        <div className="h-28 bg-white/70 rounded-3xl" />
        <div className="h-64 bg-white/70 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-md mx-auto p-4 pb-20 animate-fade-in">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-100/70 text-rose-700 text-[11px] font-bold mb-1">
          <Sparkles className="w-3 h-3 text-rose-500" />
          <span>Biometric Intelligence</span>
        </div>
        <h2 className="text-xl font-bold font-display text-gray-900 leading-tight">
          Cycle Insights & Trends
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Data visualizations computed from your logged history.
        </p>
      </div>

      <InsightsCharts stats={stats} />

      <Disclaimer />
    </div>
  );
};
