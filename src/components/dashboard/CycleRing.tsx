import React from 'react';
import { CycleCalculationResult } from '../../types/cycle';
import { Droplet, Sparkles, Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CycleRingProps {
  cycleState: CycleCalculationResult;
  onEditPeriod?: () => void;
}

export const CycleRing: React.FC<CycleRingProps> = ({ cycleState, onEditPeriod }) => {
  const navigate = useNavigate();

  const {
    currentCycleDay,
    totalCycleLength,
    periodLength,
    currentPhase,
    phaseDisplayName,
    daysUntilNextPeriod,
    isCurrentlyOnPeriod,
    progressPercent,
  } = cycleState;

  // SVG parameters
  const size = 280;
  const strokeWidth = 14;
  const center = size / 2;
  const radius = center - strokeWidth - 14;
  const circumference = 2 * Math.PI * radius;

  // Degrees
  // Start at -90deg (top / 12 o'clock)
  const angle = (currentCycleDay / totalCycleLength) * 360;
  const progressOffset = circumference - (currentCycleDay / totalCycleLength) * circumference;

  // Ticks calculation around the circle (totalCycleLength ticks)
  const ticks = Array.from({ length: totalCycleLength }, (_, i) => {
    const tickAngle = (i / totalCycleLength) * 360 - 90;
    const rad = (tickAngle * Math.PI) / 180;
    const innerR = radius - 16;
    const outerR = radius - 8;
    const x1 = center + innerR * Math.cos(rad);
    const y1 = center + innerR * Math.sin(rad);
    const x2 = center + outerR * Math.cos(rad);
    const y2 = center + outerR * Math.sin(rad);
    const isCurrent = i + 1 === currentCycleDay;
    const isPeriod = i + 1 <= periodLength;

    return { x1, y1, x2, y2, isCurrent, isPeriod, dayNumber: i + 1 };
  });

  // Calculate indicator dot position on the outer arc
  const indicatorAngle = (currentCycleDay / totalCycleLength) * 360 - 90;
  const indicatorRad = (indicatorAngle * Math.PI) / 180;
  const dotX = center + radius * Math.cos(indicatorRad);
  const dotY = center + radius * Math.sin(indicatorRad);

  // Phase color theme
  let phaseAccent = '#F43F5E';
  let phaseBgGrad = 'from-rose-500 to-pink-500';
  let badgeColor = 'bg-rose-50 text-rose-600 border-rose-200';

  if (currentPhase === 'follicular') {
    phaseAccent = '#EC4899';
    phaseBgGrad = 'from-pink-500 to-rose-400';
    badgeColor = 'bg-pink-50 text-pink-600 border-pink-200';
  } else if (currentPhase === 'ovulation') {
    phaseAccent = '#F59E0B';
    phaseBgGrad = 'from-amber-400 to-orange-500';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (currentPhase === 'luteal') {
    phaseAccent = '#8B5CF6';
    phaseBgGrad = 'from-purple-500 to-pink-500';
    badgeColor = 'bg-purple-50 text-purple-600 border-purple-200';
  }

  return (
    <div className="flex flex-col items-center">
      {/* Outer White Card Frame with Subtle Glow */}
      <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
        {/* Ambient background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-rose-100/50 to-pink-100/30 rounded-full blur-2xl transform scale-90 -z-10" />

        {/* SVG Visualization */}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <defs>
            <linearGradient id="ringTrackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFE4E8" />
              <stop offset="100%" stop-color="#FFF0F5" />
            </linearGradient>

            <linearGradient id="activeArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FF3B6C" />
              <stop offset="50%" stop-color="#F43F5E" />
              <stop offset="100%" stop-color="#FDA4AF" />
            </linearGradient>

            <filter id="glowFilter" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#F43F5E" flood-opacity="0.35" />
            </filter>
          </defs>

          {/* Background Track Circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#ringTrackGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Period Arc Segment (Days 1 to periodLength) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#FECDD6"
            strokeWidth={strokeWidth}
            strokeDasharray={`${(periodLength / totalCycleLength) * circumference} ${circumference}`}
            strokeDashoffset="0"
            strokeLinecap="round"
          />

          {/* Active Progress Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#activeArcGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            filter="url(#glowFilter)"
            className="transition-all duration-1000 ease-out"
          />

          {/* Clock Ticks on Inner Perimeter */}
          {ticks.map((t, idx) => (
            <line
              key={idx}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.isCurrent ? '#F43F5E' : t.isPeriod ? '#FDA4AF' : '#E5E7EB'}
              strokeWidth={t.isCurrent ? 2.5 : 1.5}
              strokeLinecap="round"
              opacity={t.isCurrent ? 1 : 0.6}
            />
          ))}

          {/* Indicator Dot on the Arc */}
          <circle
            cx={dotX}
            cy={dotY}
            r={8}
            fill="#FFFFFF"
            stroke="#F43F5E"
            strokeWidth={3.5}
            filter="url(#glowFilter)"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Card Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 select-none pointer-events-none">
          {/* Phase Badge */}
          <div className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide border uppercase mb-1 flex items-center gap-1.5 ${badgeColor}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            {phaseDisplayName}
          </div>

          {/* Main Day Text */}
          <div className="flex items-baseline justify-center gap-1 mt-1">
            <span className="text-4xl font-extrabold font-display tracking-tight text-gray-900">
              Day {currentCycleDay}
            </span>
            <span className="text-sm font-semibold text-gray-500">
              of {totalCycleLength}
            </span>
          </div>

          {/* Period Status or Days Away Subtitle */}
          <div className="mt-1 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600">
            {isCurrentlyOnPeriod ? (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                Period · Day {currentCycleDay} of {periodLength}
              </span>
            ) : (
              <span className="text-gray-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                Estimated period: <strong className="text-gray-700">{daysUntilNextPeriod} days</strong> away
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pill action button: Edit Period / Quick Log */}
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={onEditPeriod || (() => navigate('/woman/log'))}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold text-sm shadow-md shadow-rose-200 hover:shadow-lg hover:shadow-rose-300 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <Droplet className="w-4 h-4 fill-white text-white" />
          <span>{isCurrentlyOnPeriod ? 'Edit Period Flow' : 'Log Period / Symptoms'}</span>
          <ChevronRight className="w-4 h-4 opacity-80" />
        </button>
      </div>
    </div>
  );
};
