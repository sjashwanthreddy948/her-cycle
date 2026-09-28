import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/db';
import { CYCLE_PHASES_DATA } from '../../lib/constants';
import { CyclePhase } from '../../types/database';
import { 
  Calendar, 
  ShieldCheck, 
  Lock, 
  HeartHandshake,
  PauseCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PartnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [partnerData, setPartnerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (user) {
        setLoading(true);
        const data = await db.getPartnerViewData(user.id);
        setPartnerData(data);
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4 max-w-md mx-auto p-4 animate-pulse">
        <div className="h-24 bg-white/70 rounded-3xl" />
        <div className="h-64 bg-white/70 rounded-3xl" />
        <div className="h-40 bg-white/70 rounded-3xl" />
      </div>
    );
  }

  // Not connected state
  if (!partnerData || !partnerData.isConnected) {
    return (
      <div className="max-w-md mx-auto p-4 text-center">
        <div className="bg-white rounded-3xl p-8 shadow-soft border border-rose-100">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-display text-gray-900 mb-2">
            No Partner Connected Yet
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed mb-6">
            Ask your partner for her 6-character HerCycle connection code to start viewing her shared cycle updates.
          </p>
          <button
            onClick={() => navigate('/partner/connect')}
            className="w-full py-3.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md shadow-rose-200 transition"
          >
            Enter Connection Code
          </button>
        </div>
      </div>
    );
  }

  // Paused state
  if (partnerData.isPaused) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-center shadow-soft">
          <PauseCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 mb-1">
            Sharing Paused
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            {partnerData.womanName || 'Your partner'} has temporarily paused partner sharing. Her health details will reappear when she resumes sharing.
          </p>
        </div>
      </div>
    );
  }

  const { womanName, permissions, cycleData, todayLog } = partnerData;
  const currentPhase: CyclePhase = cycleData?.currentPhase || 'follicular';
  const phaseInfo = CYCLE_PHASES_DATA[currentPhase] || CYCLE_PHASES_DATA.follicular;

  return (
    <div className="space-y-4 max-w-md mx-auto pb-12">
      {/* HEADER */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100/70">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider block">
            Partner Overview
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Read-Only Sync
          </span>
        </div>
        <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">
          Hi {user?.full_name?.split(' ')[0] || 'Partner'}
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Here is what {womanName || 'she'} has chosen to share with you.
        </p>
      </div>

      {/* PARTNER CURRENT CYCLE CARD */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100/70 relative overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-pink-100/70 to-rose-50/30 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {(womanName || 'PARTNER').toUpperCase()}'S CURRENT CYCLE
          </span>
          {permissions.cycle_phase && cycleData?.phaseDisplayName && (
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${phaseInfo.badgeBg} ${phaseInfo.badgeText}`}>
              {cycleData.phaseDisplayName}
            </span>
          )}
        </div>

        {/* Big Cycle Day / Status Display */}
        {permissions.cycle_day && cycleData?.currentCycleDay ? (
          <div className="mb-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold font-display text-gray-900 tracking-tight">
                Day {cycleData.currentCycleDay}
              </span>
              <span className="text-sm font-semibold text-gray-500">
                of {cycleData.totalCycleLength || 28}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {phaseInfo.tagline}
            </p>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-2xl text-xs text-gray-400 italic mb-4 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>She hasn't shared this</span>
          </div>
        )}

        {/* Sub-metrics: Period & Next Period */}
        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-rose-50 text-xs">
          {/* Period Status */}
          <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-semibold text-gray-400 block mb-1">
              PERIOD STATUS
            </span>
            {permissions.period_status ? (
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${cycleData?.isCurrentlyOnPeriod ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="font-bold text-gray-800 text-xs">
                  {cycleData?.isCurrentlyOnPeriod ? 'On Period' : 'Not on period'}
                </span>
              </div>
            ) : (
              <span className="text-gray-400 italic text-[11px]">She hasn't shared this</span>
            )}
          </div>

          {/* Next Period */}
          <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-semibold text-gray-400 block mb-1">
              ESTIMATED NEXT
            </span>
            {permissions.estimated_next_period && cycleData?.daysUntilNextPeriod !== null ? (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span className="font-bold text-gray-800 text-xs">
                  In {cycleData.daysUntilNextPeriod} days
                </span>
              </div>
            ) : (
              <span className="text-gray-400 italic text-[11px]">She hasn't shared this</span>
            )}
          </div>
        </div>
      </div>

      {/* HOW CAN YOU SUPPORT HER? (Partner Support Card) */}
      <div className="bg-gradient-to-br from-rose-50/80 to-pink-50/60 rounded-3xl p-5 border border-rose-200/80 shadow-soft">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-display text-gray-900 leading-tight">
              How can you support {womanName}?
            </h3>
            <span className="text-[10px] text-rose-600 font-semibold uppercase">
              Phase-specific empathy tips
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed mb-3">
          Supportive ideas tailored for her current phase ({phaseInfo.name}):
        </p>

        <ul className="space-y-2 text-xs text-gray-700">
          {phaseInfo.partnerTips.slice(0, 3).map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-2xl border border-rose-100/60">
              <span className="text-rose-500 font-bold shrink-0">✦</span>
              <span className="leading-snug">{tip}</span>
            </li>
          ))}
        </ul>

        <div className="mt-3 pt-2 text-[10px] text-gray-400 italic text-center">
          General empathy & wellness suggestions. Not medical advice.
        </div>
      </div>

      {/* TODAY'S MOOD & ENERGY (If permitted) */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100/70">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Today's Check-in
          </h3>
          <span className="text-[10px] font-semibold text-rose-500">
            Shared by {womanName}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Mood */}
          <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-semibold text-gray-400 block mb-1">
              MOOD
            </span>
            {permissions.mood && todayLog?.mood ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {todayLog.mood === 'great' ? '😊' : todayLog.mood === 'good' ? '🙂' : todayLog.mood === 'okay' ? '😐' : todayLog.mood === 'low' ? '😔' : '😣'}
                </span>
                <span className="font-bold text-gray-800 text-xs capitalize">
                  {todayLog.mood}
                </span>
              </div>
            ) : (
              <div className="text-[11px] text-gray-400 italic flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>{permissions.mood ? 'Not logged yet' : "She hasn't shared this"}</span>
              </div>
            )}
          </div>

          {/* Energy */}
          <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-semibold text-gray-400 block mb-1">
              ENERGY
            </span>
            {permissions.energy && todayLog?.energy ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xl">
                  {todayLog.energy === 'high' ? '🚀' : todayLog.energy === 'medium' ? '⚡' : '🔋'}
                </span>
                <span className="font-bold text-gray-800 text-xs capitalize">
                  {todayLog.energy}
                </span>
              </div>
            ) : (
              <div className="text-[11px] text-gray-400 italic flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>{permissions.energy ? 'Not logged yet' : "She hasn't shared this"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Symptoms if permitted */}
        {permissions.symptoms && todayLog?.symptoms && todayLog.symptoms.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-[10px] font-semibold text-gray-400 block mb-1.5">
              SHARED SYMPTOMS
            </span>
            <div className="flex flex-wrap gap-1">
              {todayLog.symptoms.map((s: string) => (
                <span key={s} className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-semibold capitalize">
                  {s.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* QUICK LINK TO PARTNER CALENDAR */}
      <div 
        onClick={() => navigate('/partner/calendar')}
        className="bg-white rounded-3xl p-4 shadow-soft border border-rose-100/70 flex items-center justify-between cursor-pointer hover:shadow-float transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">
              View Shared Calendar
            </h4>
            <p className="text-[11px] text-gray-500">
              See upcoming period estimates & shared milestones
            </p>
          </div>
        </div>
        <span className="text-xs text-rose-500 font-bold">Open →</span>
      </div>
    </div>
  );
};
