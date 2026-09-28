import React, { useState } from 'react';
import { CycleStats } from '../../types/cycle';
import { 
  RotateCcw, 
  Droplet, 
  Smile, 
  Zap, 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface InsightsChartsProps {
  stats: CycleStats;
}

export const InsightsCharts: React.FC<InsightsChartsProps> = ({ stats }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const {
    averageCycleLength,
    shortestCycleLength,
    longestCycleLength,
    averagePeriodLength,
    cycleRegularity,
    history,
    symptomFrequency,
    moodDistribution,
    energyDistribution,
  } = stats;

  // 1. Cycle Length Line Chart Math
  const maxCycle = Math.max(35, ...history.map(h => h.cycleLength));
  const minCycle = Math.min(20, ...history.map(h => h.cycleLength));
  const chartWidth = 320;
  const chartHeight = 120;
  const paddingX = 30;
  const paddingY = 20;

  const points = history.map((h, i) => {
    const x = paddingX + (i / Math.max(1, history.length - 1)) * (chartWidth - 2 * paddingX);
    const y = chartHeight - paddingY - ((h.cycleLength - minCycle) / Math.max(1, maxCycle - minCycle)) * (chartHeight - 2 * paddingY);
    return { x, y, cycleLength: h.cycleLength, periodLength: h.periodLength, cycleNumber: h.cycleNumber };
  });

  const linePath = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x},${chartHeight - paddingY} L ${points[0].x},${chartHeight - paddingY} Z`
    : '';

  // 3. Mood distribution
  const totalMoods = Object.values(moodDistribution).reduce((a, b) => a + b, 0) || 1;
  const moodColors: Record<string, string> = {
    great: 'bg-emerald-400',
    good: 'bg-teal-400',
    okay: 'bg-amber-400',
    low: 'bg-rose-400',
    difficult: 'bg-purple-400',
  };

  // 4. Energy distribution
  const totalEnergy = Object.values(energyDistribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-4">
      {/* SUMMARY STATS GRID */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-3xl p-4 shadow-soft border border-rose-100/70">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
            Average Cycle
          </span>
          <div className="text-2xl font-bold font-display text-gray-900">
            {averageCycleLength} <span className="text-sm font-medium text-gray-500">days</span>
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">
            Range: {shortestCycleLength} – {longestCycleLength} days
          </span>
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-soft border border-rose-100/70">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
            Average Period
          </span>
          <div className="text-2xl font-bold font-display text-rose-600">
            {averagePeriodLength} <span className="text-sm font-medium text-gray-500">days</span>
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">
            Flow duration
          </span>
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-soft border border-rose-100/70 col-span-2 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
              Cycle Consistency
            </span>
            <span className="text-sm font-bold text-gray-800">
              {cycleRegularity}
            </span>
            <p className="text-[11px] text-gray-500">
              Calculated across {stats.totalCyclesLogged} logged cycles
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* CHART 1: CYCLE LENGTH HISTORY (Line Chart) */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-rose-500" />
            <h4 className="text-sm font-bold font-display text-gray-900">
              Cycle Length History
            </h4>
          </div>
          <span className="text-xs font-semibold text-rose-500">
            Last {history.length} cycles
          </span>
        </div>

        <div className="w-full overflow-x-auto no-scrollbar">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-36">
            <defs>
              <linearGradient id="cycleLineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal guidelines */}
            <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#F3F4F6" strokeDasharray="3 3" />
            <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="#F3F4F6" strokeDasharray="3 3" />
            <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#E5E7EB" />

            {/* Area fill */}
            {areaPath && <path d={areaPath} fill="url(#cycleLineGrad)" />}

            {/* Main line */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#F43F5E"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data points */}
            {points.map((pt, idx) => (
              <g key={idx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill="#FFFFFF"
                  stroke="#F43F5E"
                  strokeWidth="2.5"
                  className="hover:r-7 transition-all cursor-pointer"
                />
                <text
                  x={pt.x}
                  y={pt.y - 10}
                  fontSize="10"
                  fontWeight="bold"
                  fill="#4B5563"
                  textAnchor="middle"
                >
                  {pt.cycleLength}d
                </text>
                <text
                  x={pt.x}
                  y={chartHeight - 6}
                  fontSize="9"
                  fill="#9CA3AF"
                  textAnchor="middle"
                >
                  C{pt.cycleNumber}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* CHART 2: PERIOD DURATION (Bar Chart) */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplet className="w-4 h-4 text-rose-500 fill-rose-500" />
            <h4 className="text-sm font-bold font-display text-gray-900">
              Period Duration History
            </h4>
          </div>
          <span className="text-xs text-gray-500 font-medium">Days per period</span>
        </div>

        <div className="flex items-end justify-between h-28 pt-4 px-3 border-b border-gray-100">
          {history.map((h, idx) => {
            const barHeight = Math.min(100, Math.round((h.periodLength / 8) * 100));
            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 max-w-[36px]">
                <span className="text-[10px] font-bold text-rose-600">
                  {h.periodLength}d
                </span>
                <div className="w-full bg-rose-100 rounded-t-xl overflow-hidden flex items-end h-20">
                  <div
                    style={{ height: `${barHeight}%` }}
                    className="w-full bg-gradient-to-t from-rose-500 to-pink-400 rounded-t-xl transition-all duration-700"
                  />
                </div>
                <span className="text-[9px] text-gray-400 font-semibold">
                  C{h.cycleNumber}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CHART 3: SYMPTOMS FREQUENCY (Horizontal Bar Chart) */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-500" />
            <h4 className="text-sm font-bold font-display text-gray-900">
              Symptom Frequency
            </h4>
          </div>
          <span className="text-xs text-gray-400">Total logged occurrences</span>
        </div>

        <div className="space-y-2.5">
          {symptomFrequency.slice(0, 6).map(sym => {
            const widthPercent = Math.min(100, Math.max(15, sym.percentage * 1.5));
            return (
              <div key={sym.id} className="text-xs">
                <div className="flex justify-between font-medium text-gray-700 mb-1">
                  <span>{sym.name}</span>
                  <span className="text-gray-400">{sym.count} times ({sym.percentage}%)</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${widthPercent}%` }}
                    className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full transition-all duration-700"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CHART 4: MOOD & ENERGY PATTERNS */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100">
        <div className="flex items-center gap-2 mb-3">
          <Smile className="w-4 h-4 text-amber-500" />
          <h4 className="text-sm font-bold font-display text-gray-900">
            Mood Distribution
          </h4>
        </div>

        <div className="grid grid-cols-5 gap-2 text-center">
          {Object.entries(moodDistribution).map(([level, count]) => {
            const percent = Math.round((count / totalMoods) * 100);
            return (
              <div key={level} className="bg-gray-50/80 p-2.5 rounded-2xl border border-gray-100">
                <span className="text-lg block mb-0.5">
                  {level === 'great' ? '😊' : level === 'good' ? '🙂' : level === 'okay' ? '😐' : level === 'low' ? '😔' : '😣'}
                </span>
                <span className="text-[10px] font-bold text-gray-700 uppercase block truncate">
                  {level}
                </span>
                <span className="text-[11px] font-semibold text-rose-500">
                  {percent}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
