import React, { useState, useEffect } from 'react';
import { useCycle } from '../../context/CycleContext';
import { PermissionKey } from '../../types/database';
import { 
  Users, 
  Copy, 
  Check, 
  ShieldCheck, 
  Pause, 
  Play, 
  UserMinus, 
  Lock, 
  Share2,
  RefreshCw,
  Clock
} from 'lucide-react';

export const PartnerSharing: React.FC = () => {
  const {
    partnerLink,
    partnerCode,
    sharingPermissions,
    generatePartnerCode,
    approvePartner,
    declinePartner,
    togglePauseSharing,
    disconnectPartner,
    updateSharingPermission,
    applyPreset,
    addToast,
    refresh,
  } = useCycle();

  const [copied, setCopied] = useState(false);
  const [activePreset, setActivePreset] = useState<'basic' | 'standard' | 'custom'>('standard');
  const [timeLeft, setTimeLeft] = useState<string>('15:00');
  const [isGenerating, setIsGenerating] = useState(false);

  const isConnected = partnerLink && (partnerLink.status === 'approved');
  const isPending = partnerLink && partnerLink.status === 'pending';
  const isPaused = partnerLink?.is_paused || partnerLink?.status === 'paused';
  const partnerName = partnerLink?.partner_name || 'Partner';

  // Poll for incoming partner connection requests every 4s when a code is active or pending
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (partnerCode?.code || isPending) {
      timer = setInterval(() => {
        refresh();
      }, 4000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [partnerCode, isPending, refresh]);

  // Calculate countdown for partner code (15-minute expiration)
  useEffect(() => {
    if (!partnerCode?.expires_at) return;

    const timer = setInterval(() => {
      const remainingMs = new Date(partnerCode.expires_at).getTime() - Date.now();
      if (remainingMs <= 0) {
        setTimeLeft('Expired');
        clearInterval(timer);
      } else {
        const mins = Math.floor(remainingMs / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [partnerCode]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    addToast('Connection code copied! Share with your partner.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (!partnerCode?.code) return;
    const shareText = `Hi! Let's connect on HerCycle so you can support my cycle rhythm. My 6-digit connection code is: ${partnerCode.code}. It expires in 15 minutes!`;
    if (navigator.share) {
      navigator.share({
        title: 'HerCycle Partner Code',
        text: shareText,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      addToast('Invite text copied to clipboard!', 'info');
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generatePartnerCode();
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePresetSelect = (id: 'basic' | 'standard' | 'custom') => {
    setActivePreset(id);
    applyPreset(id);
  };

  // Toggle switch helper
  const handleToggle = (key: PermissionKey) => {
    const current = sharingPermissions[key] ?? false;
    updateSharingPermission(key, !current);
    setActivePreset('custom');
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-16">
      
      {/* Intro Header */}
      <div className="bg-white rounded-4xl p-6 shadow-soft border border-rose-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
            <ShieldCheck className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-gray-900 leading-tight">
              Partner Sharing
            </h2>
            <span className="text-xs text-rose-500 font-semibold">
              Encrypted · Read-Only Access
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed mt-1">
          Share your cycle status with someone you trust. Your partner only sees what you explicitly choose to share.
        </p>
      </div>

      {/* ======================================================== */}
      {/* 1. APPROVAL FLOW: PENDING PARTNER REQUEST                */}
      {/* ======================================================== */}
      {isPending && partnerLink && (
        <div className="bg-gradient-to-br from-amber-50 to-rose-50 border-2 border-rose-300 rounded-4xl p-6 shadow-float animate-in fade-in">
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 block mb-2">
            Incoming Partner Request
          </span>
          <h3 className="text-lg font-black font-display text-gray-900 mb-3">
            Partner connection request
          </h3>

          <div className="p-4 rounded-3xl bg-white/90 backdrop-blur-md border border-rose-100 flex items-center gap-3.5 mb-4 shadow-xs">
            {partnerLink.partner_avatar_url ? (
              <img
                src={partnerLink.partner_avatar_url}
                alt={partnerLink.partner_name || 'Partner'}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-rose-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-base">
                {(partnerLink.partner_name || 'P').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-gray-900 truncate">
                {partnerLink.partner_name || 'Partner'}
              </h4>
              <p className="text-xs text-gray-500 truncate">
                {partnerLink.partner_email || 'partner@example.com'}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-700 leading-relaxed mb-4">
            Would you like to connect this account?
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => declinePartner(partnerLink.id)}
              className="py-3 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition"
            >
              Decline
            </button>
            <button
              onClick={() => approvePartner(partnerLink.id)}
              className="py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-200 transition"
            >
              Approve
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. CONNECTED STATE & GRANULAR SHARING CONTROLS           */}
      {/* ======================================================== */}
      {isConnected && partnerLink ? (
        <div className="space-y-6">
          {/* Connected Status Card */}
          <div className="bg-white rounded-4xl p-6 shadow-soft border border-rose-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-3">
                {partnerLink.partner_avatar_url ? (
                  <img
                    src={partnerLink.partner_avatar_url}
                    alt={partnerName}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-rose-200"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    {partnerName.charAt(0)}
                  </div>
                )}
                <div>
                  <span className="text-[11px] text-gray-400 font-semibold block">Connected to:</span>
                  <h4 className="text-base font-bold text-gray-900 leading-none mt-0.5">
                    {partnerName}
                  </h4>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Status: {isPaused ? 'Paused' : 'Connected'}
                  </span>
                </div>
              </div>

              {/* Pause / Resume Button */}
              <button
                onClick={() => togglePauseSharing(!isPaused)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 border transition ${
                  isPaused
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                }`}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Read-Only Sync Enabled</span>
              <button
                onClick={disconnectPartner}
                className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 transition"
              >
                <UserMinus className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>

          {/* Section: "What can {partnerName} see?" */}
          <div className="bg-white rounded-4xl p-6 shadow-soft border border-rose-100 space-y-5">
            <div>
              <h3 className="text-base font-black font-display text-gray-900">
                What can {partnerName} see?
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Toggle exact data points available to your partner in real time.
              </p>
            </div>

            {/* Presets: [BASIC SHARING] [STANDARD SHARING] [CUSTOM] */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handlePresetSelect('basic')}
                className={`py-2 px-1 text-center rounded-2xl font-bold text-xs uppercase tracking-wider transition ${
                  activePreset === 'basic'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200'
                }`}
              >
                Basic
              </button>
              <button
                onClick={() => handlePresetSelect('standard')}
                className={`py-2 px-1 text-center rounded-2xl font-bold text-xs uppercase tracking-wider transition ${
                  activePreset === 'standard'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => handlePresetSelect('custom')}
                className={`py-2 px-1 text-center rounded-2xl font-bold text-xs uppercase tracking-wider transition ${
                  activePreset === 'custom'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200'
                }`}
              >
                Custom
              </button>
            </div>

            {/* Switches List */}
            <div className="divide-y divide-gray-100 text-xs">
              
              {/* Cycle Day */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="font-bold text-gray-900 block">Cycle Day</span>
                  <span className="text-[11px] text-gray-400">Shows current day of your cycle (e.g. Day 12)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('cycle_day')}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    sharingPermissions.cycle_day ? 'bg-rose-500' : 'bg-gray-200'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full bg-white block shadow-sm transform transition-transform ${
                    sharingPermissions.cycle_day ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Current Phase */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="font-bold text-gray-900 block">Current Phase</span>
                  <span className="text-[11px] text-gray-400">Follicular, Ovulatory, Luteal, or Menstrual</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('cycle_phase')}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    sharingPermissions.cycle_phase ? 'bg-rose-500' : 'bg-gray-200'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full bg-white block shadow-sm transform transition-transform ${
                    sharingPermissions.cycle_phase ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Period Status */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="font-bold text-gray-900 block">Period Status</span>
                  <span className="text-[11px] text-gray-400">Whether your period is active today</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('period_status')}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    sharingPermissions.period_status ? 'bg-rose-500' : 'bg-gray-200'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full bg-white block shadow-sm transform transition-transform ${
                    sharingPermissions.period_status ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Estimated Next Period */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="font-bold text-gray-900 block">Estimated Next Period</span>
                  <span className="text-[11px] text-gray-400">Estimated days until your next period</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('estimated_next_period')}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    sharingPermissions.estimated_next_period ? 'bg-rose-500' : 'bg-gray-200'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full bg-white block shadow-sm transform transition-transform ${
                    sharingPermissions.estimated_next_period ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Mood */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="font-bold text-gray-900 block">Mood</span>
                  <span className="text-[11px] text-gray-400">Daily mood check-in (e.g. Great, Okay)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('mood')}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    sharingPermissions.mood ? 'bg-rose-500' : 'bg-gray-200'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full bg-white block shadow-sm transform transition-transform ${
                    sharingPermissions.mood ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Energy */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="font-bold text-gray-900 block">Energy</span>
                  <span className="text-[11px] text-gray-400">Daily energy level (High, Medium, Low)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('energy')}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    sharingPermissions.energy ? 'bg-rose-500' : 'bg-gray-200'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full bg-white block shadow-sm transform transition-transform ${
                    sharingPermissions.energy ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Symptoms */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="font-bold text-gray-900 block">Symptoms</span>
                  <span className="text-[11px] text-gray-400">Physical sensation tags (e.g. Cramps, Headache)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('symptoms')}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    sharingPermissions.symptoms ? 'bg-rose-500' : 'bg-gray-200'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full bg-white block shadow-sm transform transition-transform ${
                    sharingPermissions.symptoms ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Flow */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="font-bold text-gray-900 block">Flow</span>
                  <span className="text-[11px] text-gray-400">Light, Medium, or Heavy indicators</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('flow')}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    sharingPermissions.flow ? 'bg-rose-500' : 'bg-gray-200'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full bg-white block shadow-sm transform transition-transform ${
                    sharingPermissions.flow ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Sleep */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="font-bold text-gray-900 block">Sleep</span>
                  <span className="text-[11px] text-gray-400">Logged hours of sleep</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('sleep')}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    sharingPermissions.sleep ? 'bg-rose-500' : 'bg-gray-200'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full bg-white block shadow-sm transform transition-transform ${
                    sharingPermissions.sleep ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Weight */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-900">Weight</span>
                    <Lock className="w-3 h-3 text-rose-500" />
                  </div>
                  <span className="text-[11px] text-gray-400">Strictly private by default</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('weight')}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    sharingPermissions.weight ? 'bg-rose-500' : 'bg-gray-200'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full bg-white block shadow-sm transform transition-transform ${
                    sharingPermissions.weight ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Notes */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-900">Notes</span>
                    <Lock className="w-3 h-3 text-rose-500" />
                  </div>
                  <span className="text-[11px] text-gray-400">Personal journal entries</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('notes')}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    sharingPermissions.notes ? 'bg-rose-500' : 'bg-gray-200'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full bg-white block shadow-sm transform transition-transform ${
                    sharingPermissions.notes ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* 3. NOT CONNECTED: 6-DIGIT CODE GENERATOR (Section 7)     */
        /* ======================================================== */
        <div className="bg-white rounded-4xl p-6 shadow-soft border border-rose-100 text-center space-y-6">
          <div className="w-14 h-14 rounded-3xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mx-auto shadow-xs">
            <Users className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-xl font-black font-display text-gray-900">
              Connect Partner
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Generate a secure 6-digit code to pair with your partner. You will review and approve their connection before any data is visible.
            </p>
          </div>

          {partnerCode?.code ? (
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-rose-50/70 border-2 border-rose-200 max-w-xs mx-auto space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 block">
                  Your 6-Digit Connection Code
                </span>
                
                {/* 6-Digit Code Display e.g. 739214 */}
                <div className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-gray-900 py-1">
                  {partnerCode.code}
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 font-semibold pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Expires in: {timeLeft}</span>
                </div>
              </div>

              <p className="text-xs text-gray-600 font-medium max-w-xs mx-auto">
                Share this code with your partner.
              </p>

              {/* Action Buttons: [Copy Code] [Share] [Generate New Code] */}
              <div className="flex items-center justify-center gap-2 max-w-xs mx-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => handleCopyCode(partnerCode.code)}
                  className="flex-1 py-3 px-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-200 transition flex items-center justify-center gap-1.5 active:scale-95"
                >
                  {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="py-3 px-4 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="text-xs text-rose-600 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Generate New Code</span>
                </button>
                <p className="text-[10px] text-gray-400 mt-1">
                  Old unused codes become immediately invalid when a new code is generated.
                </p>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="px-8 py-3.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md shadow-rose-200 transition hover:scale-105 active:scale-95"
            >
              {isGenerating ? 'Generating...' : 'Generate Connection Code'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
