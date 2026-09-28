import React, { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCycle } from '../../context/CycleContext';
import { CycleRing3D } from '../../components/3d/CycleRing3D';
import { TodayCheckIn } from '../../components/dashboard/TodayCheckIn';
import { PhaseCards } from '../../components/dashboard/PhaseCards';
import { CYCLE_PHASES_DATA } from '../../lib/constants';
import { 
  Calendar, 
  Sparkles, 
  Heart, 
  Copy, 
  Check, 
  Pause, 
  Play, 
  UserMinus, 
  Moon, 
  Droplet, 
  Smile, 
  BatteryCharging,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WomanHomePage: React.FC = () => {
  const { user, updateCurrentUserProfile } = useAuth();
  const { 
    cycleState, 
    stats, 
    todayLog, 
    partnerLink, 
    partnerCode, 
    generatePartnerCode, 
    approvePartner, 
    declinePartner, 
    togglePauseSharing, 
    disconnectPartner,
    addToast,
    isLoading 
  } = useCycle();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Handle profile photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast('Please select an image under 2MB', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Url = reader.result as string;
        await updateCurrentUserProfile({ avatar_url: base64Url });
        addToast('Profile photo updated!', 'success');
      } catch {
        addToast('Could not save photo. Please try again.', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    addToast('Connection code copied to clipboard!', 'info');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-md mx-auto p-4 animate-pulse">
        <div className="h-96 bg-white/60 rounded-3xl" />
        <div className="h-64 bg-white/60 rounded-3xl" />
        <div className="h-64 bg-white/60 rounded-3xl" />
      </div>
    );
  }

  const currentPhase = cycleState.currentPhase;
  const phaseInfo = CYCLE_PHASES_DATA[currentPhase] || CYCLE_PHASES_DATA.follicular;
  const isConnected = partnerLink && (partnerLink.status === 'approved');
  const isPending = partnerLink && partnerLink.status === 'pending';
  const isPaused = partnerLink?.is_paused || partnerLink?.status === 'paused';

  // Compute confidence level based on cycles recorded
  const cyclesCount = stats.totalCyclesLogged || 0;
  const confidenceText = cyclesCount >= 3
    ? `High confidence · Calibrated over ${cyclesCount} recorded cycles`
    : cyclesCount >= 1
    ? `Moderate confidence · Refining estimates (${cyclesCount} cycle recorded)`
    : `Initial baseline prediction · Calibrates with each logged period`;

  return (
    <div className="max-w-md mx-auto px-4 pb-24 space-y-12">
      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
        aria-hidden="true"
      />

      {/* ======================================================== */}
      {/* SECTION A: HERO (Full view with 3D Ring & Woman Portrait) */}
      {/* ======================================================== */}
      <section className="min-h-[85vh] flex flex-col items-center justify-between py-6 text-center">
        {/* Top welcome chip */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-rose-200/60 shadow-xs text-rose-700 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>Feminine Sanctuary</span>
        </div>

        {/* 3D Ring with Her Circular Portrait in Center */}
        <div className="my-auto py-2">
          <CycleRing3D
            currentCycleDay={cycleState.currentCycleDay}
            totalCycleLength={cycleState.totalCycleLength}
            userAvatarUrl={user?.avatar_url}
            userName={user?.full_name}
            isLandingPage={false}
            onAddPhotoClick={() => fileInputRef.current?.click()}
          />
        </div>

        {/* Beneath Ring: Name, Age, Phase & Day Chips */}
        <div className="w-full space-y-3 pt-2">
          <div>
            <h1 className="text-3xl font-extrabold font-display text-gray-900 tracking-tight leading-tight">
              {user?.full_name || 'HerCycle Member'}
            </h1>
            {user?.age && (
              <p className="text-xs font-semibold text-rose-600 tracking-wide mt-0.5">
                {user.age} years old
              </p>
            )}
          </div>

          {/* Small Status Chips: Current Phase & Cycle Day */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-xs ${phaseInfo.badgeBg} ${phaseInfo.badgeText}`}>
              {phaseInfo.name}
            </span>

            {cycleState.hasLoggedCycle ? (
              <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-rose-200 text-gray-800 text-xs font-bold shadow-xs">
                Day {cycleState.currentCycleDay} of {cycleState.totalCycleLength}
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                No logs recorded yet
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 max-w-xs mx-auto italic">
            "{phaseInfo.tagline}"
          </p>
        </div>

        {/* Smooth scroll cue indicator */}
        <div className="pt-4 text-gray-400 flex flex-col items-center animate-bounce">
          <ChevronDown className="w-4 h-4 text-rose-400" />
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION B: NEXT PERIOD PREDICTION CARD                   */}
      {/* ======================================================== */}
      <section className="py-2">
        <div className="bg-white/90 backdrop-blur-md rounded-4xl p-6 shadow-float border border-rose-100/80 relative overflow-hidden">
          {/* Subtle soft ambient glow in card */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-rose-100/60 to-transparent rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                Next Period Prediction
              </h2>
            </div>
            {cycleState.isCurrentlyOnPeriod && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold animate-pulse">
                Active Period
              </span>
            )}
          </div>

          {cycleState.hasLoggedCycle ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold font-display text-gray-900 tracking-tight">
                    {cycleState.daysUntilNextPeriod === 0
                      ? 'Expected Today'
                      : cycleState.daysUntilNextPeriod === 1
                      ? 'In 1 day'
                      : `In ${cycleState.daysUntilNextPeriod} days`}
                  </span>
                </div>
                <p className="text-sm font-semibold text-rose-600 mt-1">
                  Estimated start: {cycleState.estimatedNextPeriodStart}
                </p>
              </div>

              {/* Progress bar across cycle */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-gray-400 mb-1">
                  <span>Cycle Day {cycleState.currentCycleDay}</span>
                  <span>{cycleState.totalCycleLength} Days Total</span>
                </div>
                <div className="w-full h-2 rounded-full bg-rose-50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-700"
                    style={{ width: `${cycleState.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Confidence note */}
              <div className="p-3 bg-rose-50/60 rounded-2xl border border-rose-100 text-[11px] text-gray-600 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{confidenceText}</span>
              </div>
            </div>
          ) : (
            /* Empty State for Brand-New User */
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-800">
                Log your last period to see your prediction
              </h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                HerCycle needs just one period date to begin calculating your personalized rhythm and phases.
              </p>
              <button
                onClick={() => navigate('/woman/log')}
                className="px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-soft transition"
              >
                Log Period Now
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION C: HEALTH CONDITION TODAY CARD                   */}
      {/* ======================================================== */}
      <section className="py-2">
        <div className="bg-white/90 backdrop-blur-md rounded-4xl p-6 shadow-float border border-rose-100/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-rose-50">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block">
                Daily Wellness
              </span>
              <h2 className="text-lg font-bold font-display text-gray-900">
                Health Condition Today
              </h2>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${phaseInfo.badgeBg} ${phaseInfo.badgeText}`}>
              {phaseInfo.name}
            </span>
          </div>

          {/* Energy, Mood, Sleep, Water grid */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-center gap-2.5">
              <Smile className="w-5 h-5 text-rose-500" />
              <div>
                <span className="text-[10px] text-gray-400 block font-semibold">MOOD</span>
                <span className="font-bold text-gray-800 capitalize">
                  {todayLog?.mood || 'Not logged yet'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-center gap-2.5">
              <BatteryCharging className="w-5 h-5 text-amber-500" />
              <div>
                <span className="text-[10px] text-gray-400 block font-semibold">ENERGY</span>
                <span className="font-bold text-gray-800 capitalize">
                  {todayLog?.energy || 'Not logged yet'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-center gap-2.5">
              <Moon className="w-5 h-5 text-indigo-500" />
              <div>
                <span className="text-[10px] text-gray-400 block font-semibold">SLEEP</span>
                <span className="font-bold text-gray-800">
                  {todayLog?.sleep_hours ? `${todayLog.sleep_hours} hrs` : 'Resting well'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-center gap-2.5">
              <Droplet className="w-5 h-5 text-sky-500" />
              <div>
                <span className="text-[10px] text-gray-400 block font-semibold">HYDRATION</span>
                <span className="font-bold text-gray-800">
                  {todayLog?.water_glasses ? `${todayLog.water_glasses} glasses` : 'Stay hydrated'}
                </span>
              </div>
            </div>
          </div>

          {/* 2–3 Gentle Non-Medical Care Tips for the Phase */}
          <div className="p-4 bg-gradient-to-tr from-rose-50/60 to-pink-50/40 rounded-3xl border border-rose-100/80 space-y-2">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Gentle Care for {phaseInfo.name}
            </span>
            <ul className="space-y-1.5 text-xs text-gray-700 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Self-Care:</strong> {phaseInfo.wellnessSuggestions.selfCare}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Nutrition:</strong> {phaseInfo.wellnessSuggestions.nutrition}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Movement:</strong> {phaseInfo.wellnessSuggestions.exercise}</span>
              </li>
            </ul>
          </div>

          {/* Mandatory Non-Medical Disclaimer */}
          <p className="text-[10px] text-gray-400 text-center italic">
            Estimates only — not a medical device or contraception.
          </p>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION D: PARTNER SHARING SECTION                       */}
      {/* ======================================================== */}
      <section className="py-2">
        <div className="bg-white/90 backdrop-blur-md rounded-4xl p-6 shadow-float border border-rose-100/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-rose-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              </div>
              <div>
                <h2 className="text-sm font-bold font-display text-gray-900">
                  Partner Sharing Sanctuary
                </h2>
                <span className="text-[10px] text-gray-500">
                  Encrypted · Read-only access for partner
                </span>
              </div>
            </div>

            {isConnected && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {isPaused ? 'Paused' : 'Active'}
              </span>
            )}
          </div>

          {/* Pending Connection Alert */}
          {isPending && partnerLink && (
            <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-xs space-y-3">
              <div>
                <span className="font-bold text-gray-900 block">Pending Connection Request</span>
                <p className="text-gray-600 mt-0.5">
                  <strong className="text-rose-600">{partnerLink.partner_name || 'Your partner'}</strong> ({partnerLink.partner_email || 'partner'}) has entered your code and requested access.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => declinePartner(partnerLink.id)}
                  className="flex-1 py-2 rounded-full bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 text-xs"
                >
                  Decline
                </button>
                <button
                  onClick={() => approvePartner(partnerLink.id)}
                  className="flex-1 py-2 rounded-full bg-rose-500 text-white font-bold hover:bg-rose-600 text-xs shadow-xs"
                >
                  Approve Connection
                </button>
              </div>
            </div>
          )}

          {/* Active Connection Controls */}
          {isConnected && partnerLink ? (
            <div className="space-y-3">
              <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-900 text-xs block">
                    Paired with {partnerLink.partner_name || 'Partner'}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {isPaused ? 'Sharing is paused' : 'Real-time read-only sync'}
                  </span>
                </div>

                <button
                  onClick={() => togglePauseSharing(!isPaused)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition ${
                    isPaused
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  {isPaused ? <Play className="w-3 h-3 fill-emerald-600 text-emerald-600" /> : <Pause className="w-3 h-3 fill-amber-600 text-amber-600" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  onClick={() => navigate('/woman/partner')}
                  className="text-rose-600 font-bold hover:underline"
                >
                  Customize Shared Fields →
                </button>
                <button
                  onClick={disconnectPartner}
                  className="text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                  <span>Unlink</span>
                </button>
              </div>
            </div>
          ) : (
            /* Invite Code Display when not connected */
            <div className="text-center space-y-3">
              <p className="text-xs text-gray-600 leading-relaxed max-w-xs mx-auto">
                Share this unique 6-character code with your partner to enable synced support.
              </p>

              {partnerCode?.code ? (
                <div className="space-y-2">
                  <div className="p-4 bg-rose-50/80 rounded-2xl border border-rose-200 flex items-center justify-between max-w-xs mx-auto">
                    <span className="font-mono text-xl font-extrabold tracking-widest text-rose-600">
                      {partnerCode.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(partnerCode.code)}
                      className="p-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 active:scale-95 transition"
                      title="Copy code"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-gray-400 block font-medium">
                    Expires in 24 hours · Single use only (expires immediately once entered)
                  </span>
                  <button
                    type="button"
                    onClick={generatePartnerCode}
                    className="text-xs text-rose-600 font-semibold hover:underline"
                  >
                    Regenerate Code
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={generatePartnerCode}
                  className="px-6 py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-soft transition"
                >
                  Generate Connection Code
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION E: TODAY'S CHECK-IN & DETAILED INSIGHTS          */}
      {/* ======================================================== */}
      <section className="space-y-6 pt-2">
        <div>
          <h2 className="text-lg font-bold font-display text-gray-900 mb-1">
            Today's Check-in
          </h2>
          <p className="text-xs text-gray-500">
            Log physical sensations, mood, sleep, and symptoms.
          </p>
        </div>

        {/* Existing Interactive Check-in Component */}
        <TodayCheckIn />

        {/* 4 Cycle Phases Overview Carousel */}
        <PhaseCards currentPhase={cycleState.currentPhase} />
      </section>
    </div>
  );
};

export default WomanHomePage;
