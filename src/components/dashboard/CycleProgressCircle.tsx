import React from 'react';
import { Sparkles, Calendar, Droplets } from 'lucide-react';
import { CyclePhase } from '../../types/database';
import { CYCLE_PHASES_DATA } from '../../lib/constants';

interface CycleProgressCircleProps {
  currentDay: number;
  totalDays: number;
  phase: CyclePhase;
  daysUntilNextPeriod: number | null;
  onPeriod: boolean;
  avatarUrl?: string;
  userName?: string;
  size?: number;
}

export const CycleProgressCircle: React.FC<CycleProgressCircleProps> = ({
  currentDay,
  totalDays = 28,
  phase,
  daysUntilNextPeriod,
  onPeriod,
  avatarUrl,
  userName,
  size = 320,
}) => {
  const phaseInfo = CYCLE_PHASES_DATA[phase] || CYCLE_PHASES_DATA.follicular;

  // SVG parameters
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedDay = Math.max(1, Math.min(currentDay, totalDays));
  const progressPercent = (clampedDay / totalDays) * 100;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-2">
      {/* Soft warm ambient gradient behind visualization */}
      <div 
        className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full blur-3xl pointer-events-none -z-10 opacity-70 animate-pulse-glow"
        style={{
          background: 'radial-gradient(circle, rgba(254,205,211,0.8) 0%, rgba(254,215,170,0.5) 50%, rgba(255,255,255,0) 80%)'
        }}
      />

      {/* Circular Progress Meter Container */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          <defs>
            {/* Signature Pink to Coral/Orange Gradient */}
            <linearGradient id="cycleProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="50%" stopColor="#FB7185" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>

            {/* Track subtle glow filter */}
            <filter id="progressGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#F43F5E" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Background Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#FFE4E6"
            strokeWidth={strokeWidth}
            className="opacity-50"
          />

          {/* Active Gradient Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#cycleProgressGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#progressGlow)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Content Inside Circle Matching Reference Mockup */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 select-none">
          <span className="text-xs uppercase font-extrabold tracking-widest text-gray-400">
            Day
          </span>
          
          <span className="text-5xl sm:text-6xl font-black font-display tracking-tight text-gray-900 leading-none my-1">
            {currentDay}
          </span>

          <span className="text-xs font-semibold text-gray-400">
            of {totalDays}
          </span>

          <div className="mt-2.5">
            <span className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-2xs ${phaseInfo.badgeBg} ${phaseInfo.badgeText}`}>
              {phaseInfo.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
