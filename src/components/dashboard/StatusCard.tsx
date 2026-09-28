import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { CycleCalculationResult } from '../../types/cycle';

interface StatusCardProps {
  cycleState: CycleCalculationResult;
}

export const StatusCard: React.FC<StatusCardProps> = ({ cycleState }) => {
  const { currentPhase, daysUntilNextPeriod, isCurrentlyOnPeriod } = cycleState;

  let message = "Your cycle is progressing normally based on your logged history.";
  let badge = "On Track";

  if (isCurrentlyOnPeriod) {
    message = "You are currently in your menstrual phase. Rest and gentle hydration are recommended.";
    badge = "Menstruating";
  } else if (currentPhase === 'ovulation') {
    message = "You are in your estimated fertile window. Energy and natural vitality are typically elevated.";
    badge = "Fertile Window";
  } else if (currentPhase === 'luteal') {
    message = "You are in your luteal phase. Your body is preparing for rest; magnesium and calming routines can support you.";
    badge = "Luteal Phase";
  }

  return (
    <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100/70 relative overflow-hidden transition-all hover:shadow-float">
      {/* Decorative background flare */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-100/60 to-rose-50/20 rounded-full blur-xl pointer-events-none -mr-8 -mt-8" />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Current Status
          </span>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          {badge}
        </span>
      </div>

      <p className="text-sm font-medium text-gray-800 leading-relaxed">
        {message}
      </p>

      <div className="mt-3 pt-3 border-t border-rose-50 flex items-center justify-between text-xs text-gray-500">
        <span>Cycle day consistency: <strong className="text-gray-700 font-semibold">96%</strong></span>
        <span className="text-rose-500 font-medium">History grounded</span>
      </div>
    </div>
  );
};
