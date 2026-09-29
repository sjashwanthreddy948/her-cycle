import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCycle } from '../../context/CycleContext';
import { useNavigate } from 'react-router-dom';
import { 
  HeartHandshake, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Check
} from 'lucide-react';
import { normalizeSixDigitCode, normalizePartnerCode } from '../../lib/codeUtils';

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
    // Strictly numeric 0-9
    const char = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setErrorMessage(null);

    // Auto-advance to next box
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move back and clear previous
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!paste) return;
    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = paste[i] || '';
    }
    setDigits(newDigits);
    setErrorMessage(null);
    const nextIdx = Math.min(paste.length, 5);
    inputRefs.current[nextIdx]?.focus();
  };

  const fullCode = digits.join('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMessage('Your session has expired. Please log in again.');
      return;
    }
    setErrorMessage(null);

    const clean = normalizeSixDigitCode(fullCode) || normalizePartnerCode(fullCode);
    if (!clean || clean.length < 6) {
      setErrorMessage('Please enter all 6 digits of the connection code.');
      inputRefs.current[0]?.focus();
      return;
    }

    setLoading(true);
    try {
      await redeemPartnerCode(clean);
      setIsPendingSuccess(true);
      addToast('Connection request sent to your partner! 💌', 'success');
    } catch (err: any) {
      const msg = err?.message || "That connection code isn't valid. Please check the code and try again.";
      // Clean display of the single inline error card — DO NOT trigger duplicate toast
      setErrorMessage(msg);
      // Focus first input and visually highlight error
      inputRefs.current[0]?.focus();
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
          <div className="p-6 rounded-3xl bg-rose-50/70 border border-rose-200 text-center space-y-5 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-base font-bold text-gray-900">
                Connection Request Sent!
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed mt-1">
                Your connection request has been securely delivered to your partner. Once she taps <strong className="text-rose-600 font-bold">Approve</strong> in her app, her shared cycle rhythm will unlock for you.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/partner/home')}
              className="w-full py-3.5 rounded-full bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-200 hover:bg-rose-600 transition flex items-center justify-center gap-1.5"
            >
              <span>Done · Go to Partner Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Single clean error box (Section 16: No duplicate toast) */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200/80 text-rose-900 text-xs flex items-start gap-2.5 animate-in fade-in">
                <div className="w-5 h-5 rounded-full bg-rose-200/70 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  !
                </div>
                <div className="flex-1">
                  <div className="font-bold text-rose-800">Connection code invalid</div>
                  <div className="text-rose-600 text-[11px] mt-0.5 leading-relaxed">{errorMessage}</div>
                </div>
              </div>
            )}

            {/* 6-Digit Inputs: [ 2 ][ 8 ][ 3 ][ 8 ][ 3 ][ 8 ] */}
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
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleDigitChange(idx, e.target.value)}
                    onKeyDown={e => handleKeyDown(idx, e)}
                    className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-mono font-black rounded-2xl transition outline-none ${
                      errorMessage 
                        ? 'bg-rose-50/50 border-2 border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200' 
                        : 'bg-gray-50 border-2 border-gray-200 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-gray-900'
                    }`}
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
