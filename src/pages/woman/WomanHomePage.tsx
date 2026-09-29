import React, { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCycle } from '../../context/CycleContext';
import { CycleProgressCircle } from '../../components/dashboard/CycleProgressCircle';
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
  Plus,
  Users,
  ChevronRight,
  Clock,
  ArrowRight
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

  // Time-based greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

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
      <div className="space-y-4 max-w-xl mx-auto p-4 animate-pulse">
        <div className="h-32 bg-white/70 rounded-4xl" />
        <div className="h-80 bg-white/70 rounded-4xl" />
        <div className="h-48 bg-white/70 rounded-4xl" />
      </div>
    );
  }

  const currentPhase = cycleState.currentPhase;
  const phaseInfo = CYCLE_PHASES_DATA[currentPhase] || CYCLE_PHASES_DATA.follicular;
  const isConnected = partnerLink && (partnerLink.status === 'approved');
  const isPending = partnerLink && partnerLink.status === 'pending';
  const isPaused = partnerLink?.is_paused || partnerLink?.status === 'paused';
  const womanFirstName = user?.full_name?.split(' ')[0] || 'there';
  const avatarUrl = user?.avatar_url || '/assets/woman-portrait.png';

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 space-y-8 animate-in fade-in duration-200">
      
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
      {/* 1. TOP GREETING & PROFILE BAR (Section 14 & 15)          */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-gray-900 tracking-tight">
            {getGreeting()}, {womanFirstName}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Here's your cycle at a glance.
          </p>
        </div>

        {/* Profile Avatar */}
        <div 
          onClick={() => fileInputRef.current?.click()} 
          className="relative cursor-pointer group"
          title="Click to update photo"
        >
          <img
            src={avatarUrl}
            alt={user?.full_name || 'Profile'}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-rose-200 group-hover:ring-rose-400 shadow-sm transition"
          />
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white" />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1B. COMPLETE YOUR PROFILE BANNER (Missing DOB Requirement) */}
      {/* ======================================================== */}
      {!user?.date_of_birth && (
        <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200/80 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-900">Complete your profile</h3>
              <p className="text-[11px] sm:text-xs text-gray-500">
                Add your Date of Birth in Settings for dynamic age calculation and personalized cycle insights.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/woman/profile')}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-full transition shadow-xs shrink-0 self-end sm:self-auto cursor-pointer"
          >
            Update in Profile →
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. PENDING PARTNER APPROVAL CARD (If requested)          */}
      {/* ======================================================== */}
      {isPending && partnerLink && (
        <div className="bg-gradient-to-br from-amber-50 to-rose-50 border-2 border-rose-300 rounded-4xl p-5 sm:p-6 shadow-float animate-in fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">
              Partner Connection Request
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
              Pending
            </span>
          </div>

          <div className="flex items-center gap-3.5 mb-3 bg-white/90 p-3.5 rounded-3xl border border-rose-100">
            {partnerLink.partner_avatar_url ? (
              <img
                src={partnerLink.partner_avatar_url}
                alt={partnerLink.partner_name || 'Partner'}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-rose-200"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm">
                {(partnerLink.partner_name || 'P').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h4 className="text-xs font-bold text-gray-900">
                {partnerLink.partner_name || 'Partner'}
              </h4>
              <p className="text-[11px] text-gray-500">
                {partnerLink.partner_email || 'partner@example.com'}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-700 leading-relaxed mb-4">
            Would you like to connect this account? Once approved, your partner can view only the fields you choose to share.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => declinePartner(partnerLink.id)}
              className="py-2.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition cursor-pointer"
            >
              Decline
            </button>
            <button
              onClick={() => approvePartner(partnerLink.id)}
              className="py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-200 transition cursor-pointer"
            >
              Approve
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. HERO CARD: CIRCULAR CYCLE VISUALIZATION & NEXT PERIOD */}
      {/* ======================================================== */}
      <section className="bg-white rounded-4xl p-6 sm:p-8 shadow-float border border-rose-100/80 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Decorative corner accent badge */}
        <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-bold">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>Natural Rhythm</span>
        </div>

        {/* Circular Visualization */}
        <CycleProgressCircle
          currentDay={cycleState.currentCycleDay}
          totalDays={cycleState.totalCycleLength}
          phase={cycleState.currentPhase}
          daysUntilNextPeriod={cycleState.daysUntilNextPeriod}
          onPeriod={cycleState.isCurrentlyOnPeriod}
          avatarUrl={avatarUrl}
          userName={user?.full_name}
          size={270}
        />

        {/* Pill Button Below Circle: Next Period (Clickable) */}
        <button
          onClick={() => navigate('/woman/calendar')}
          className="w-full mt-4 flex items-center justify-between px-4 sm:px-5 py-3.5 bg-rose-50/70 hover:bg-rose-100/70 border border-rose-100/90 rounded-2xl transition group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-white text-rose-500 flex items-center justify-center shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-gray-800">
              {cycleState.isCurrentlyOnPeriod
                ? 'Period is currently active'
                : `Next period in ${cycleState.daysUntilNextPeriod !== null && cycleState.daysUntilNextPeriod !== undefined ? cycleState.daysUntilNextPeriod : 16} days`}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition" />
        </button>
      </section>

      {/* ======================================================== */}
      {/* 4. TODAY'S VITALS & QUICK LOG BUTTON (Reference Mockup)  */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-black font-display text-gray-900 tracking-tight">
            Today
          </h2>
          <span className="text-xs text-gray-400 font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* 3 Side-by-Side Cards (Mood, Energy, Symptoms) */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {/* Mood Card */}
          <div 
            onClick={() => navigate('/woman/log')} 
            className="bg-white rounded-3xl p-3.5 sm:p-4 text-center border border-rose-100/80 shadow-soft hover:shadow-float hover:border-rose-200 transition cursor-pointer flex flex-col items-center"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg sm:text-xl mb-1.5 shadow-xs">
              {todayLog?.mood === 'great' ? '😊' : todayLog?.mood === 'good' ? '🙂' : todayLog?.mood === 'okay' ? '😐' : todayLog?.mood === 'low' ? '😔' : todayLog?.mood === 'difficult' ? '😣' : '😊'}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Mood
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-gray-900 capitalize mt-0.5 truncate max-w-full">
              {todayLog?.mood || 'Great'}
            </span>
          </div>

          {/* Energy Card */}
          <div 
            onClick={() => navigate('/woman/log')} 
            className="bg-white rounded-3xl p-3.5 sm:p-4 text-center border border-rose-100/80 shadow-soft hover:shadow-float hover:border-rose-200 transition cursor-pointer flex flex-col items-center"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-lg sm:text-xl mb-1.5 shadow-xs">
              ⚡
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Energy
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-gray-900 capitalize mt-0.5 truncate max-w-full">
              {todayLog?.energy || 'Medium'}
            </span>
          </div>

          {/* Symptoms Card */}
          <div 
            onClick={() => navigate('/woman/log')} 
            className="bg-white rounded-3xl p-3.5 sm:p-4 text-center border border-rose-100/80 shadow-soft hover:shadow-float hover:border-rose-200 transition cursor-pointer flex flex-col items-center"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-lg sm:text-xl mb-1.5 shadow-xs">
              🩺
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Symptoms
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-rose-600 capitalize mt-0.5 truncate max-w-full">
              {todayLog?.symptoms?.length ? todayLog.symptoms[0] : (todayLog?.flow && todayLog.flow !== 'none' ? 'Flowing' : 'Cramps')}
            </span>
          </div>
        </div>

        {/* Full-Width Pill Button: + Add Today's Log */}
        <button
          onClick={() => navigate('/woman/log')}
          className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-rose-500 via-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-200 hover:shadow-lg hover:shadow-rose-300 transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add Today's Log</span>
        </button>

        {/* Comprehensive In-Place Check-in */}
        <div className="pt-2">
          <TodayCheckIn />
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. PARTNER SHARING STATUS & QUICK ACCESS                 */}
      {/* ======================================================== */}
      <section className="bg-white rounded-4xl p-6 shadow-float border border-rose-100/80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Partner Sharing</h3>
              <span className="text-[10px] text-gray-400">Encrypted sync</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/woman/partner')}
            className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1"
          >
            <span>Manage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isConnected && partnerLink ? (
          <div className="p-3.5 bg-rose-50/60 rounded-3xl border border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-900">
                Connected with {partnerLink.partner_name || 'Partner'}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-rose-600">
              {isPaused ? 'Paused' : 'Active Sync'}
            </span>
          </div>
        ) : (
          <div className="p-3.5 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-600">No partner connected yet</span>
            <button
              onClick={() => navigate('/woman/partner')}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              Generate Code →
            </button>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 6. FOUR PHASES OVERVIEW CAROUSEL                         */}
      {/* ======================================================== */}
      <section className="space-y-3 pt-2">
        <h3 className="text-base font-bold font-display text-gray-900 px-1">
          Cycle Phases Guidance
        </h3>
        <PhaseCards currentPhase={cycleState.currentPhase} />
      </section>
    </div>
  );
};

export default WomanHomePage;
