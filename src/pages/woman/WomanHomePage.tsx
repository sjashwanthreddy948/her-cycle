import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCycle } from '../../context/CycleContext';
import { CycleRing } from '../../components/dashboard/CycleRing';
import { StatusCard } from '../../components/dashboard/StatusCard';
import { QuickStats } from '../../components/dashboard/QuickStats';
import { TodayCheckIn } from '../../components/dashboard/TodayCheckIn';
import { PhaseCards } from '../../components/dashboard/PhaseCards';
import { PartnerStatusPill } from '../../components/dashboard/PartnerStatusPill';
import { Disclaimer } from '../../components/common/Disclaimer';
import { Sparkles } from 'lucide-react';

export const WomanHomePage: React.FC = () => {
  const { user } = useAuth();
  const { cycleState, stats, isLoading } = useCycle();

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-md mx-auto p-4 animate-pulse">
        <div className="h-16 bg-white/60 rounded-3xl" />
        <div className="h-80 bg-white/60 rounded-3xl" />
        <div className="h-44 bg-white/60 rounded-3xl" />
      </div>
    );
  }

  const firstName = user?.full_name?.split(' ')[0] || 'Sarah';

  return (
    <div className="space-y-5 max-w-md mx-auto p-4 pb-20 animate-fade-in">
      {/* Personalized Greeting Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-100/70 text-rose-700 text-[11px] font-bold mb-1">
          <Sparkles className="w-3 h-3 text-rose-500" />
          <span>Feminine Rhythm</span>
        </div>
        <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight leading-tight">
          Good morning, {firstName}
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Here's your cycle today.
        </p>
      </div>

      {/* 1. Circular Cycle Visualization inspired by the reference */}
      <div className="bg-white rounded-4xl p-6 shadow-soft border border-rose-100/70">
        <CycleRing cycleState={cycleState} />
      </div>

      {/* 2. Current Status Card */}
      <StatusCard cycleState={cycleState} />

      {/* 3. Quick Stats Grid */}
      <QuickStats cycleState={cycleState} stats={stats} />

      {/* 4. Partner Sharing Status Card */}
      <PartnerStatusPill />

      {/* 5. Today's Check-in Card */}
      <TodayCheckIn />

      {/* 6. Menstrual Cycle Phases Carousel / Cards */}
      <PhaseCards currentPhase={cycleState.currentPhase} />

      {/* Medical Disclaimer */}
      <Disclaimer />
    </div>
  );
};
