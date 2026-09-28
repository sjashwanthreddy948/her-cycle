import React, { useState } from 'react';
import { CYCLE_PHASES_DATA } from '../../lib/constants';
import { CyclePhase } from '../../types/database';
import { HeartHandshake, BookOpen, Coffee, Sun, Smile, ShieldAlert } from 'lucide-react';
import { Disclaimer } from '../common/Disclaimer';

export const PartnerSupportHub: React.FC = () => {
  const [selectedPhase, setSelectedPhase] = useState<CyclePhase>('menstrual');
  const phases: CyclePhase[] = ['menstrual', 'follicular', 'ovulation', 'luteal'];
  const activeInfo = CYCLE_PHASES_DATA[selectedPhase];

  return (
    <div className="space-y-4 max-w-md mx-auto pb-12">
      {/* Intro */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display text-gray-900 leading-tight">
              Partner Support Guide
            </h2>
            <span className="text-[11px] text-gray-400 font-medium">
              Understand her rhythm · Support her better
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          The menstrual cycle is a month-long neurochemical journey. Learn how her energy and needs shift across all 4 phases so you can be a genuinely supportive partner.
        </p>
      </div>

      {/* Phase Selector */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Select Phase to Learn More
        </h3>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {phases.map(p => {
            const info = CYCLE_PHASES_DATA[p];
            const isSelected = selectedPhase === p;

            return (
              <button
                key={p}
                onClick={() => setSelectedPhase(p)}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  isSelected
                    ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                    : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xs font-bold block">{info.name.replace(' Phase', '')}</span>
                <span className={`text-[10px] block ${isSelected ? 'text-rose-100' : 'text-gray-400'}`}>
                  {info.cyclePosition}
                </span>
              </button>
            );
          })}
        </div>

        {/* Phase Deep Dive */}
        <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
          <h4 className="text-sm font-bold text-gray-900 mb-1">
            {activeInfo.name} ({activeInfo.cyclePosition})
          </h4>
          <p className="text-xs text-rose-600 italic font-semibold mb-2">
            "{activeInfo.tagline}"
          </p>

          <p className="text-xs text-gray-600 leading-relaxed mb-4">
            {activeInfo.description}
          </p>

          <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Coffee className="w-3.5 h-3.5 text-rose-500" />
            <span>Actionable Ways to Help Her</span>
          </h5>

          <ul className="space-y-2 text-xs text-gray-700">
            {activeInfo.partnerTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-white/90 p-2.5 rounded-xl border border-rose-100">
                <span className="text-rose-500 font-bold">✓</span>
                <span className="leading-snug">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* General Golden Rules of Cycle Empathy */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100">
        <h3 className="text-sm font-bold font-display text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Golden Principles of Support</span>
        </h3>

        <div className="space-y-2.5 text-xs text-gray-600">
          <div className="p-3 bg-gray-50 rounded-2xl">
            <strong className="text-gray-800 block mb-0.5">1. Never dismiss feelings as "just hormones"</strong>
            <span>Hormones change physical sensation and threshold for stress. What she feels is genuine and real.</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-2xl">
            <strong className="text-gray-800 block mb-0.5">2. Offer comfort proactively</strong>
            <span>Restocking favorite tea, preparing a heating pad, or taking on dinner makes a big difference.</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-2xl">
            <strong className="text-gray-800 block mb-0.5">3. Respect her need for quiet or space</strong>
            <span>During the luteal or menstrual phase, social batteries recharge in solitude. Don't take it personally.</span>
          </div>
        </div>
      </div>

      <Disclaimer />
    </div>
  );
};
