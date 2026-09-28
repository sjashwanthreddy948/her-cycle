import React, { useState } from 'react';
import { CYCLE_PHASES_DATA } from '../../lib/constants';
import { CyclePhase } from '../../types/database';
import { ChevronRight, Sparkles, Utensils, Activity, HeartHandshake } from 'lucide-react';

interface PhaseCardsProps {
  currentPhase?: CyclePhase;
}

export const PhaseCards: React.FC<PhaseCardsProps> = ({ currentPhase = 'follicular' }) => {
  const [selectedPhase, setSelectedPhase] = useState<CyclePhase>(currentPhase);
  const phases: CyclePhase[] = ['menstrual', 'follicular', 'ovulation', 'luteal'];
  const activeData = CYCLE_PHASES_DATA[selectedPhase];

  return (
    <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100/70">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-500 block mb-0.5">
            Biological Rhythm
          </span>
          <h3 className="text-lg font-bold font-display text-gray-900 leading-tight">
            Menstrual Cycle Phases
          </h3>
        </div>
        <span className="text-[11px] text-gray-500 bg-rose-50 px-2 py-0.5 rounded-full font-medium">
          Estimates
        </span>
      </div>

      {/* Horizontal Phase Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {phases.map(p => {
          const info = CYCLE_PHASES_DATA[p];
          const isCurrent = p === currentPhase;
          const isSelected = p === selectedPhase;

          return (
            <button
              key={p}
              onClick={() => setSelectedPhase(p)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                isSelected
                  ? 'bg-rose-500 text-white border-rose-500 shadow-sm shadow-rose-200'
                  : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'
              }`}
            >
              <span>{info.name.replace(' Phase', '')}</span>
              {isCurrent && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase ${isSelected ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'}`}>
                  Now
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Phase Detail Showcase */}
      <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-rose-50/50 to-pink-50/30 border border-rose-100/80">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${activeData.badgeBg} ${activeData.badgeText}`}>
              {activeData.cyclePosition}
            </span>
            <h4 className="font-bold text-gray-900 text-sm">
              {activeData.name}
            </h4>
          </div>
        </div>

        <p className="text-xs font-semibold text-rose-600 mb-2 italic">
          "{activeData.tagline}"
        </p>

        <p className="text-xs text-gray-600 leading-relaxed mb-3">
          {activeData.description}
        </p>

        {/* Suggestions Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white/80 p-2.5 rounded-xl border border-rose-100/60">
            <div className="flex items-center gap-1.5 font-semibold text-gray-800 mb-1">
              <Utensils className="w-3.5 h-3.5 text-amber-500" />
              <span>Nourish</span>
            </div>
            <p className="text-[11px] text-gray-600 leading-snug">
              {activeData.wellnessSuggestions.nutrition}
            </p>
          </div>

          <div className="bg-white/80 p-2.5 rounded-xl border border-rose-100/60">
            <div className="flex items-center gap-1.5 font-semibold text-gray-800 mb-1">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>Movement</span>
            </div>
            <p className="text-[11px] text-gray-600 leading-snug">
              {activeData.wellnessSuggestions.exercise}
            </p>
          </div>
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-rose-100/60 text-[10px] text-gray-600 flex items-center justify-between">
          <span>Hormones: {activeData.hormoneSummary.slice(0, 48)}...</span>
          <span className="font-semibold text-rose-500">Estimates only</span>
        </div>
      </div>
    </div>
  );
};
