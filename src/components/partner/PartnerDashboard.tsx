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
  PauseCircle,
  Clock,
  Sparkles,
  Heart,
  MessageCircle,
  Coffee,
  Moon,
  Smile,
  BatteryCharging,
  ArrowRight,
  Droplet,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PartnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [partnerData, setPartnerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    async function load(showLoading = true) {
      if (user) {
        if (showLoading) setLoading(true);
        const data = await db.getPartnerViewData(user.id);
        setPartnerData(data);
        setLoading(false);

        // If pending approval, poll every 4 seconds so approval is detected without refresh
        if (data?.isPending) {
          timer = setTimeout(() => load(false), 4000);
        }
      }
    }
    load(true);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4 max-w-xl mx-auto p-4 animate-pulse">
        <div className="h-28 bg-white/70 rounded-4xl" />
        <div className="h-64 bg-white/70 rounded-4xl" />
        <div className="h-44 bg-white/70 rounded-4xl" />
      </div>
    );
  }

  const partnerFirstName = user?.full_name?.split(' ')[0] || 'Partner';

  // 1. Not connected state
  if (!partnerData || (!partnerData.isConnected && !partnerData.isPending)) {
    return (
      <div className="max-w-md mx-auto p-4 text-center">
        <div className="bg-white rounded-4xl p-8 shadow-float border border-rose-100">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black font-display text-gray-900 mb-2">
            Connect with your partner
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed mb-6">
            Ask your partner for her 6-digit HerCycle connection code to start viewing her shared cycle rhythm and empathy suggestions.
          </p>
          <button
            onClick={() => navigate('/partner/connect')}
            className="w-full py-3.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-200 transition"
          >
            Enter Connection Code
          </button>
        </div>
      </div>
    );
  }

  // 2. Pending Approval State
  if (partnerData.isPending) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="bg-gradient-to-br from-amber-50 to-rose-50 border-2 border-rose-200 rounded-4xl p-8 text-center shadow-float space-y-4">
          <div className="w-14 h-14 rounded-3xl bg-white shadow-xs text-amber-500 flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7" />
          </div>
          
          <div>
            <h3 className="text-xl font-black font-display text-gray-900">
              Connection Pending Approval
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mt-2">
              You entered the connection code for <strong className="text-rose-600">{partnerData.womanName || 'your partner'}</strong>. Once she taps <strong className="font-semibold text-gray-900">Approve</strong> in her HerCycle app, her shared cycle insights will appear here.
            </p>
          </div>

          <div className="p-3 bg-white/80 rounded-2xl border border-rose-100 text-[11px] text-gray-500">
            Waiting for approval · Check back shortly
          </div>
        </div>
      </div>
    );
  }

  // 3. Paused state
  if (partnerData.isPaused) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="bg-amber-50 border border-amber-200 rounded-4xl p-8 text-center shadow-float space-y-3">
          <PauseCircle className="w-14 h-14 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-gray-900">
            Sharing Paused
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
            {partnerData.womanName || 'Your partner'} has temporarily paused partner sharing. Her health details will reappear when she resumes sharing.
          </p>
        </div>
      </div>
    );
  }

  const { womanName, womanAvatarUrl, permissions, cycleData, todayLog } = partnerData;
  const currentPhase: CyclePhase = cycleData?.currentPhase || 'follicular';
  const phaseInfo = CYCLE_PHASES_DATA[currentPhase] || CYCLE_PHASES_DATA.follicular;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-16">
      
      {/* ======================================================== */}
      {/* 1. HEADER (Section 9 & 16: [Her Name]'s Cycle)            */}
      {/* ======================================================== */}
      <div className="px-2">
        <h1 className="text-2xl sm:text-3xl font-black font-display text-gray-900 tracking-tight">
          {womanName}'s Cycle
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Read-only view of cycle rhythms and daily wellness shared with you.
        </p>
      </div>

      {/* ======================================================== */}
      {/* 2. LARGE PROFILE CARD WITH HER PHOTO (Section 15 & 16)   */}
      {/* ======================================================== */}
      <div className="bg-white rounded-4xl p-6 sm:p-8 shadow-float border border-rose-100 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative shrink-0">
          <img
            src={womanAvatarUrl || '/assets/woman-portrait.png'}
            alt={womanName}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-rose-200 shadow-md"
          />
          <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>

        <div className="text-center sm:text-left space-y-1.5 flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-2xl font-black font-display text-gray-900">
              {womanName}
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Connected
            </span>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            Read-only partner sync enabled. You'll receive timely empathy tips to support her natural rhythm.
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. CURRENT CYCLE CARD (Section 16)                       */}
      {/* ======================================================== */}
      <div className="bg-white rounded-4xl p-6 sm:p-8 shadow-float border border-rose-100 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <span className="text-xs font-black uppercase tracking-widest text-rose-500">
            CURRENT CYCLE
          </span>
          <span className="text-[11px] font-semibold text-gray-400">
            Read-Only Sync
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Day X (if permitted) */}
          {permissions.cycle_day ? (
            <div className="p-4 rounded-3xl bg-rose-50/60 border border-rose-100 text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Cycle Day</span>
              <span className="text-3xl font-black font-display text-rose-600 mt-1 block">
                Day {cycleData?.currentCycleDay || 12}
              </span>
              <span className="text-[10px] text-gray-400">of {cycleData?.totalCycleLength || 28} days</span>
            </div>
          ) : (
            <div className="p-4 rounded-3xl bg-gray-50 border border-gray-100 text-center flex flex-col items-center justify-center text-gray-400 text-xs">
              <Lock className="w-4 h-4 mb-1" />
              <span>Cycle Day Hidden</span>
            </div>
          )}

          {/* Current Phase (if permitted) */}
          {permissions.cycle_phase ? (
            <div className="p-4 rounded-3xl bg-orange-50/60 border border-orange-100 text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Phase</span>
              <span className="text-lg font-black font-display text-gray-900 mt-2 block">
                {phaseInfo.name}
              </span>
              <span className="text-[10px] text-orange-600 font-semibold">{phaseInfo.tagline}</span>
            </div>
          ) : (
            <div className="p-4 rounded-3xl bg-gray-50 border border-gray-100 text-center flex flex-col items-center justify-center text-gray-400 text-xs">
              <Lock className="w-4 h-4 mb-1" />
              <span>Phase Hidden</span>
            </div>
          )}

          {/* Next expected period (if permitted) */}
          {permissions.estimated_next_period ? (
            <div className="p-4 rounded-3xl bg-purple-50/60 border border-purple-100 text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Next Expected Period</span>
              <span className="text-3xl font-black font-display text-purple-700 mt-1 block">
                {cycleData?.daysUntilNextPeriod !== null && cycleData?.daysUntilNextPeriod !== undefined
                  ? `${cycleData.daysUntilNextPeriod} days`
                  : '16 days'}
              </span>
              <span className="text-[10px] text-gray-400">Estimated window</span>
            </div>
          ) : (
            <div className="p-4 rounded-3xl bg-gray-50 border border-gray-100 text-center flex flex-col items-center justify-center text-gray-400 text-xs">
              <Lock className="w-4 h-4 mb-1" />
              <span>Prediction Hidden</span>
            </div>
          )}
        </div>

        {/* Phase Guidance for Partner */}
        {permissions.cycle_phase && (
          <div className="p-4 rounded-3xl bg-[#FFF5F7] border border-rose-100 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-gray-900">What this phase means for {womanName}:</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {phaseInfo.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 4. TODAY'S SHARED VITALS                                 */}
      {/* ======================================================== */}
      {(permissions.mood || permissions.energy || permissions.sleep || permissions.symptoms || permissions.water || permissions.flow || permissions.notes) ? (
        <div className="bg-white rounded-4xl p-6 shadow-soft border border-rose-100 space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-rose-500 block">
            TODAY'S SHARED LOGS
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {permissions.mood && (
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                <Smile className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Mood</span>
                <span className="text-sm font-bold text-gray-900 capitalize">
                  {todayLog?.mood || 'Good'}
                </span>
              </div>
            )}

            {permissions.energy && (
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                <BatteryCharging className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Energy</span>
                <span className="text-sm font-bold text-gray-900 capitalize">
                  {todayLog?.energy || 'Medium'}
                </span>
              </div>
            )}

            {permissions.symptoms && (
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                <Sparkles className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Symptoms</span>
                <span className="text-xs font-bold text-gray-900 truncate block">
                  {todayLog?.symptoms?.length ? todayLog.symptoms.join(', ') : 'None'}
                </span>
              </div>
            )}

            {permissions.flow && (
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                <Droplet className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Period Flow</span>
                <span className="text-sm font-bold text-gray-900 capitalize">
                  {todayLog?.flow && todayLog.flow !== 'none' ? todayLog.flow : 'None'}
                </span>
              </div>
            )}

            {permissions.sleep && (
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                <Moon className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Sleep</span>
                <span className="text-sm font-bold text-gray-900">
                  {todayLog?.sleep_hours ? `${todayLog.sleep_hours}h` : '7.5h'}
                </span>
              </div>
            )}

            {permissions.water && (
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                <Droplet className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Water</span>
                <span className="text-sm font-bold text-gray-900">
                  {todayLog?.water_glasses ? `${todayLog.water_glasses} glasses` : '4 glasses'}
                </span>
              </div>
            )}

            {permissions.notes && todayLog?.notes && (
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 col-span-2 text-left">
                <div className="flex items-center gap-1.5 mb-1 text-gray-400">
                  <FileText className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-[10px] uppercase font-bold">Shared Note</span>
                </div>
                <p className="text-xs text-gray-700 italic">"{todayLog.notes}"</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-4xl p-6 shadow-soft border border-rose-100 text-center py-6 text-gray-400 text-xs flex items-center justify-center gap-2">
          <Lock className="w-4 h-4 text-gray-400" />
          <span>Daily wellness details are currently kept private by {womanName}.</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. SUPPORT HER (Section 17)                              */}
      {/* ======================================================== */}
      <div className="bg-white rounded-4xl p-6 sm:p-8 shadow-float border border-rose-100 space-y-4">
        <div>
          <h3 className="text-lg font-black font-display text-gray-900">
            Support Her
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Thoughtful suggestions tailored to {womanName}'s current cycle phase.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          
          {/* Card 1: Check in */}
          <div className="p-4 rounded-3xl bg-rose-50/70 border border-rose-100 space-y-1 hover:shadow-xs transition">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-rose-500" />
              <h4 className="text-xs font-bold text-gray-900">Check in</h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Ask how she's feeling today without assuming she needs fixing.
            </p>
          </div>

          {/* Card 2: Be thoughtful */}
          <div className="p-4 rounded-3xl bg-orange-50/70 border border-orange-100 space-y-1 hover:shadow-xs transition">
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-orange-500" />
              <h4 className="text-xs font-bold text-gray-900">Be thoughtful</h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Offer support and gentle assistance without making assumptions.
            </p>
          </div>

          {/* Card 3: Give space */}
          <div className="p-4 rounded-3xl bg-purple-50/70 border border-purple-100 space-y-1 hover:shadow-xs transition">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-purple-500" />
              <h4 className="text-xs font-bold text-gray-900">Give space</h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Respect what she needs, whether that's quiet downtime or companionship.
            </p>
          </div>

          {/* Card 4: Stay connected */}
          <div className="p-4 rounded-3xl bg-emerald-50/70 border border-emerald-100 space-y-1 hover:shadow-xs transition">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-bold text-gray-900">Stay connected</h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Small gestures — a warm tea or an affectionate note — mean a lot.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
