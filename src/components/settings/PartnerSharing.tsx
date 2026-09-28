import React, { useState } from 'react';
import { useCycle } from '../../context/CycleContext';
import { SHARING_PRESETS, PERMISSION_DESCRIPTIONS } from '../../lib/constants';
import { PermissionKey } from '../../types/database';
import { 
  Users, 
  QrCode, 
  Copy, 
  Check, 
  ShieldCheck, 
  Pause, 
  Play, 
  UserMinus, 
  Sliders, 
  Bell, 
  Lock, 
  Sparkles,
  AlertCircle
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
  } = useCycle();

  const [copied, setCopied] = useState(false);
  const [activePreset, setActivePreset] = useState<'basic' | 'standard' | 'custom'>('standard');
  const [showQr, setShowQr] = useState(false);

  const isConnected = partnerLink && (partnerLink.status === 'approved');
  const isPending = partnerLink && partnerLink.status === 'pending';
  const isPaused = partnerLink?.is_paused || partnerLink?.status === 'paused';

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    addToast('Connection code copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePresetSelect = (id: 'basic' | 'standard' | 'custom') => {
    setActivePreset(id);
    applyPreset(id);
  };

  return (
    <div className="space-y-4 max-w-md mx-auto pb-12">
      {/* Intro Header */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
            <ShieldCheck className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display text-gray-900 leading-tight">
              Partner Sharing
            </h2>
            <span className="text-[11px] text-gray-400 font-medium">
              Zero-leakage privacy controls
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          Choose what your partner can see. Your private health information stays private unless you explicitly share it. Partner access is strictly <strong>read-only</strong>.
        </p>
      </div>

      {/* PENDING APPROVAL ALERT (If partner requested connection) */}
      {isPending && (
        <div className="bg-gradient-to-r from-amber-50 to-rose-50 border-2 border-rose-300 rounded-3xl p-5 shadow-float animate-pulse-glow">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                Connection Request Received
              </h4>
              <p className="text-xs text-gray-600 mt-0.5">
                <strong className="text-rose-600">{partnerLink?.partner_name || 'Your partner'}</strong> ({partnerLink?.partner_email || 'partner'}) wants to connect with your HerCycle account.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-rose-200/60">
            <button
              onClick={() => partnerLink && declinePartner(partnerLink.id)}
              className="py-2.5 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Decline
            </button>
            <button
              onClick={() => partnerLink && approvePartner(partnerLink.id)}
              className="py-2.5 rounded-full bg-rose-500 text-white text-xs font-bold shadow-sm shadow-rose-200 hover:bg-rose-600 transition"
            >
              Approve Connection
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE CONNECTION CARD */}
      {isConnected && partnerLink ? (
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100">
          <div className="flex items-center justify-between pb-3 border-b border-rose-50 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {(partnerLink.partner_name || 'P')[0]}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  Connected with {partnerLink.partner_name || 'Partner'}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    {isPaused ? 'Sharing is currently paused' : 'Active sync'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => togglePauseSharing(!isPaused)}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition ${
                isPaused
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
              }`}
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
            <span>Access level: <strong>Read-Only</strong></span>
            <button
              onClick={disconnectPartner}
              className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
            >
              <UserMinus className="w-3.5 h-3.5" />
              <span>Remove Partner</span>
            </button>
          </div>
        </div>
      ) : (
        /* NOT CONNECTED: GENERATE CODE & QR */
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100">
          <div className="text-center py-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-display text-gray-900">
              Invite Your Partner
            </h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">
              Give this 6-character connection code to your partner. You will approve the connection before any data is visible.
            </p>

            {/* Connection Code Display */}
            {partnerCode?.code ? (
              <>
                <div className="my-4 p-4 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-center justify-between max-w-xs mx-auto">
                  <span className="font-mono text-xl font-extrabold tracking-widest text-rose-600">
                    {partnerCode.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(partnerCode.code)}
                    className="p-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 active:scale-95 transition"
                    title="Copy code"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 mb-1 font-medium">
                  Your partner can enter this code at <strong>Login → Partner Invite Code</strong>
                </p>
                <p className="text-[10px] text-gray-400 mb-3">Expires in 24h · Single use (expires immediately once entered)</p>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={generatePartnerCode}
                    className="text-xs text-rose-600 font-semibold hover:underline"
                  >
                    Regenerate Code
                  </button>
                  <span className="text-gray-300">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      const msg = `Hey! Connect with me on HerCycle using code: ${partnerCode.code}. Visit the app and select 'Partner Invite Code' to connect directly!`;
                      navigator.clipboard.writeText(msg);
                      handleCopyCode(msg);
                    }}
                    className="text-xs text-rose-600 font-semibold hover:underline"
                  >
                    Copy Full Invite
                  </button>
                  <span className="text-gray-300">•</span>
                  <button
                    type="button"
                    onClick={() => setShowQr(prev => !prev)}
                    className="text-xs text-gray-600 font-semibold hover:text-gray-900 flex items-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5 text-rose-500" />
                    <span>{showQr ? 'Hide QR' : 'Show QR Code'}</span>
                  </button>
                </div>

                {/* QR Code graphic */}
                {showQr && (
                  <div className="mt-4 p-4 bg-white rounded-2xl border border-rose-100 max-w-[200px] mx-auto shadow-sm animate-fade-in flex flex-col items-center">
                    <div className="w-36 h-36 bg-gray-900 p-2 rounded-xl flex items-center justify-center text-white">
                      <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
                        <rect x="10" y="10" width="25" height="25" fill="none" stroke="white" strokeWidth="6" />
                        <rect x="18" y="18" width="9" height="9" fill="white" />
                        <rect x="65" y="10" width="25" height="25" fill="none" stroke="white" strokeWidth="6" />
                        <rect x="73" y="18" width="9" height="9" fill="white" />
                        <rect x="10" y="65" width="25" height="25" fill="none" stroke="white" strokeWidth="6" />
                        <rect x="18" y="73" width="9" height="9" fill="white" />
                        <rect x="45" y="15" width="8" height="20" fill="white" />
                        <rect x="45" y="45" width="12" height="12" fill="#F43F5E" />
                        <rect x="65" y="45" width="20" height="8" fill="white" />
                        <rect x="45" y="70" width="8" height="15" fill="white" />
                        <rect x="65" y="65" width="22" height="22" fill="white" />
                      </svg>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-2 font-mono">
                      {partnerCode.code}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="my-4">
                <button
                  type="button"
                  onClick={generatePartnerCode}
                  className="px-6 py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm shadow-rose-200 transition"
                >
                  Generate Invite Code
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SHARING PRESETS */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100">
        <h3 className="text-sm font-bold font-display text-gray-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-rose-500" />
          <span>Sharing Presets</span>
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          Quickly select a standard privacy profile or customize each field individually.
        </p>

        <div className="grid grid-cols-3 gap-2">
          {SHARING_PRESETS.map(preset => {
            const isSelected = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  isSelected
                    ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                    : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xs font-bold block mb-0.5">{preset.name}</span>
                <span className={`text-[10px] line-clamp-2 leading-tight ${isSelected ? 'text-rose-100' : 'text-gray-400'}`}>
                  {preset.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* INDIVIDUAL SHARING CONTROLS */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold font-display text-gray-900 uppercase tracking-wide">
            Granular Permissions
          </h3>
          <span className="text-[11px] text-gray-400 font-medium">
            Toggle on/off
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {(Object.keys(PERMISSION_DESCRIPTIONS) as PermissionKey[]).map(key => {
            const info = PERMISSION_DESCRIPTIONS[key];
            const isEnabled = Boolean(sharingPermissions[key]);

            return (
              <div key={key} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-xl mt-0.5">{info.icon}</span>
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">
                      {info.title}
                    </span>
                    <span className="text-[11px] text-gray-500 leading-snug">
                      {info.desc}
                    </span>
                  </div>
                </div>

                {/* Switch toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setActivePreset('custom');
                    updateSharingPermission(key, !isEnabled);
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                    isEnabled ? 'bg-rose-500' : 'bg-gray-200'
                  }`}
                  aria-label={`Toggle ${info.title}`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}

          {/* Explicit NEVER SHARED row for journal / medical */}
          <div className="py-3 flex items-center justify-between gap-3 opacity-60">
            <div className="flex items-start gap-2.5">
              <span className="text-xl mt-0.5">🔒</span>
              <div>
                <span className="text-xs font-bold text-gray-800 block">
                  Private Diary & Medical Notes
                </span>
                <span className="text-[11px] text-gray-500">
                  Permanently sealed. Never shared under any preset.
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              LOCKED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
