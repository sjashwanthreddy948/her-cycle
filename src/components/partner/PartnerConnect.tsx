import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCycle } from '../../context/CycleContext';
import { useNavigate } from 'react-router-dom';
import { 
  HeartHandshake, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { normalizePartnerCode } from '../../lib/codeUtils';

export const PartnerConnect: React.FC = () => {
  const { user } = useAuth();
  const { redeemPartnerCode, addToast } = useCycle();
  const navigate = useNavigate();

  // 6 separate digits for the _ _ _ _ _ _ input experience
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const [isPendingSuccess, setIsPendingSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index: number, val: string) => {
    const char = val.replace(/[^0-9a-zA-Z]/g, '').slice(-1).toUpperCase();
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setErrorMessage(null);

    // Auto-advance
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/[^0-9a-zA-Z]/g, '').slice(0, 6).toUpperCase();
    if (!paste) return;
    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = paste[i] || '';
    }
    setDigits(newDigits);
    const nextIdx = Math.min(paste.length, 5);
    inputRefs.current[nextIdx]?.focus();
  };

  const fullCode = digits.join('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMessage(null);

    const clean = normalizePartnerCode(fullCode);
    if (!clean || clean.length < 6) {
      setErrorMessage('Please enter all 6 digits of the connection code.');
      return;
    }

    setLoading(true);
    try {
      await redeemPartnerCode(clean);
      setIsPendingSuccess(true);
      addToast('Connection request sent to your partner! 💌', 'success');
    } catch (err: any) {
      const msg = err?.message || 'Code not found. Please verify the 6-digit code with your partner.';
      setErrorMessage(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-12">
      <div className="bg-white rounded-4xl p-6 sm:p-8 shadow-float border border-rose-100">
        
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <HeartHandshake className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-black font-display text-gray-900 text-center mb-1">
          Connect with your partner
        </h2>
        <p className="text-xs text-gray-500 text-center mb-6 max-w-xs mx-auto leading-relaxed">
          Ask your partner to generate a 6-digit code in her HerCycle app and enter it below.
        </p>

        {isPendingSuccess ? (
          <div className="p-6 rounded-3xl bg-rose-50/70 border border-rose-200 text-center space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-bold text-gray-900">
                Connection Request Sent!
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed mt-1">
                Your connection request has been securely delivered to your partner. Once she taps <strong className="text-rose-600 font-bold">Approve</strong> in her app, her shared cycle sanctuary will unlock for you.
              </p>
            </div>

            <button
              onClick={() => navigate('/partner/home')}
              className="w-full py-3.5 rounded-full bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-200 hover:bg-rose-600 transition"
            >
              Go to Partner Dashboard →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* 6-Digit Inputs: _ _ _ _ _ _ */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-3 text-center">
                Enter 6-Digit Code
              </label>

              <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleDigitChange(idx, e.target.value)}
                    onKeyDown={e => handleKeyDown(idx, e)}
                    className="w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-mono font-black rounded-2xl bg-gray-50 border-2 border-gray-200 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition outline-none"
                    placeholder="·"
                  />
                ))}
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium mt-3">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>Codes expire automatically after 15 minutes</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || fullCode.length < 6}
              className="w-full py-3.5 rounded-full bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold text-sm shadow-md shadow-rose-200 transition flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <span>Connect</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Privacy Guarantee Note */}
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-2.5 text-[11px] text-gray-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Read-only access. Her personal notes and private data remain strictly sealed.</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
