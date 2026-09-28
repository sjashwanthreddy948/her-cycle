import React from 'react';
import { CYCLE_PHASES_DATA } from '../../lib/constants';
import { CyclePhase } from '../../types/database';
import { Sparkles, Utensils, Activity, Heart, ShieldAlert } from 'lucide-react';
import { Disclaimer } from '../../components/common/Disclaimer';

export const WomanPhasesPage: React.FC = () => {
  const phases: CyclePhase[] = ['menstrual', 'follicular', 'ovulation', 'luteal'];

  return (
    <div className="space-y-4 max-w-md mx-auto p-4 pb-20 animate-fade-in">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-100/70 text-rose-700 text-[11px] font-bold mb-1">
          <Sparkles className="w-3 h-3 text-rose-500" />
          <span>Hormonal Wisdom</span>
        </div>
        <h2 className="text-xl font-bold font-display text-gray-900 leading-tight">
          The 4 Cycle Phases
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Align your nutrition, movement, and rest with your natural body clock.
        </p>
      </div>

      <div className="space-y-4">
        {phases.map(phaseKey => {
          const p = CYCLE_PHASES_DATA[phaseKey];
          return (
            <div
              key={phaseKey}
              className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100 transition-all hover:shadow-float"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${p.badgeBg} ${p.badgeText}`}>
                    {p.cyclePosition}
                  </span>
                  <h3 className="text-base font-bold font-display text-gray-900">
                    {p.name}
                  </h3>
                </div>
              </div>

              <p className="text-xs font-semibold text-rose-600 mb-2 italic">
                "{p.tagline}"
              </p>

              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                {p.description}
              </p>

              {/* Hormonal Background */}
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 mb-3 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                  Hormone Activity
                </span>
                <p className="text-gray-700 leading-snug">{p.hormoneSummary}</p>
              </div>

              {/* Wellness Recommendations */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100/80">
                  <div className="flex items-center gap-1.5 font-bold text-gray-800 mb-1">
                    <Utensils className="w-3.5 h-3.5 text-amber-500" />
                    <span>Nutrition</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-snug">
                    {p.wellnessSuggestions.nutrition}
                  </p>
                </div>

                <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100/80">
                  <div className="flex items-center gap-1.5 font-bold text-gray-800 mb-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Movement</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-snug">
                    {p.wellnessSuggestions.exercise}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Disclaimer />
    </div>
  );
};
