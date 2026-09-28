import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCycle } from '../../context/CycleContext';
import { useNavigate } from 'react-router-dom';
import { HeartHandshake, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

import { normalizePartnerCode } from '../../lib/codeUtils';

export const PartnerConnect: React.FC = () => {
  const { user } = useAuth();
  const { redeemPartnerCode, addToast } = useCycle();
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMessage(null);
    const clean = normalizePartnerCode(code);
    if (!clean) {
      addToast('Please enter your partner’s connection code', 'warning');
      return;
    }

    setLoading(true);
    try {
      await redeemPartnerCode(clean);
      setSuccess(true);
      addToast('Connected successfully! 🎉', 'success');
    } catch (err: any) {
      const msg = err?.message || 'This connection code has expired or has already been used by someone else.';
      setErrorMessage(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-12">
      <div className="bg-white rounded-3xl p-6 shadow-soft border border-rose-100">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
          <HeartHandshake className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-bold font-display text-gray-900 text-center mb-1">
          Connect to HerCycle
        </h2>
        <p className="text-xs text-gray-500 text-center mb-6 max-w-xs mx-auto">
          Enter the unique 6-character invite code provided by your partner in her app (e.g. <span className="font-mono font-bold text-rose-500">HER-ABC234</span>).
        </p>

        {success ? (
          <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-rose-500 mx-auto" />
            <h4 className="text-sm font-bold text-gray-900">
              Connected Successfully!
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Your partner account is now linked to her cycle updates. You can view her shared phase, daily status, and empathy tips.
            </p>
            <button
              onClick={() => navigate('/partner/home')}
              className="w-full py-3 rounded-full bg-rose-500 text-white font-bold text-xs shadow-soft hover:bg-rose-600 transition"
            >
              Open Partner Sanctuary →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-rose-900">Connection Rejected</p>
                  <p className="text-[11px] text-rose-700 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5 text-center">
                Pairing Code
              </label>
              <input
                type="text"
                placeholder="e.g. HER-ABC234"
                value={code}
                onChange={e => {
                  setCode(e.target.value.toUpperCase());
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full text-center text-xl font-mono tracking-widest uppercase p-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                maxLength={10}
                required
              />
              <p className="text-[11px] text-gray-400 text-center mt-2">
                Codes are single-use and expire immediately once entered. A code cannot be used again by another person.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-md shadow-rose-200 hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Submitting...' : 'Send Connection Request'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
