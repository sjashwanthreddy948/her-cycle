import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  HeartHandshake, 
  Sparkles,
  KeyRound,
  UserCheck
} from 'lucide-react';
import { Disclaimer } from '../components/common/Disclaimer';
import { normalizePartnerCode, looksLikePartnerCode } from '../lib/codeUtils';

export const LoginPage: React.FC = () => {
  const { login, connectWithPartnerCode } = useAuth();
  const navigate = useNavigate();

  // Mode: 'account' = standard email/pass, 'partnerCode' = join with invite code
  const [activeTab, setActiveTab] = useState<'account' | 'partnerCode'>('account');

  // Account login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Partner invite code fields
  const [partnerCode, setPartnerCode] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerPassword, setPartnerPassword] = useState('');
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  // Shared state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Helper to switch to code tab with detected code
  const handleSwitchToCodeTab = (detectedCode: string) => {
    setPartnerCode(normalizePartnerCode(detectedCode));
    setActiveTab('partnerCode');
    setError(null);
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // If the user entered a partner code in the password or email field
    if (looksLikePartnerCode(password)) {
      handleSwitchToCodeTab(password);
      return;
    }
    if (looksLikePartnerCode(email)) {
      handleSwitchToCodeTab(email);
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'partner') {
        navigate('/partner/home');
      } else {
        navigate('/woman/home');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = normalizePartnerCode(partnerCode);
    if (!cleanCode || cleanCode.length < 6) {
      setError('Please enter a valid 6-character connection code (e.g. HER-ABC234).');
      return;
    }

    setLoading(true);
    try {
      await connectWithPartnerCode({
        code: cleanCode,
        fullName: partnerName.trim() || 'Partner',
        email: partnerEmail.trim() || undefined,
        password: partnerPassword || undefined,
      });

      navigate('/partner/home');
    } catch (err: any) {
      setError(err?.message || 'Failed to connect with this invite code. Please check that it matches your partner’s app.');
    } finally {
      setLoading(false);
    }
  };

  const passwordLooksLikeCode = looksLikePartnerCode(password);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F7] to-[#FDE8EE] flex flex-col justify-between px-4 py-8 max-w-md mx-auto">
      {/* Top Header */}
      <div className="text-center pt-4">
        <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center shadow-sm">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-2xl font-bold font-display text-gray-900 tracking-tight">
            HerCycle
          </span>
        </Link>
        <h2 className="text-xl font-bold text-gray-900">
          {activeTab === 'partnerCode' ? 'Partner Connection' : 'Welcome Back'}
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          {activeTab === 'partnerCode' 
            ? 'Connect directly using the invite code from your partner' 
            : 'Sign in to access your secure cycle sanctuary'}
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-6 shadow-soft border border-rose-100 my-4">
        {/* Tab Switcher */}
        <div className="flex bg-rose-50/70 p-1 rounded-2xl mb-5 border border-rose-100">
          <button
            type="button"
            onClick={() => { setActiveTab('account'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'account'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-rose-500" />
            <span>Account Login</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('partnerCode'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'partnerCode'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-gray-500 hover:text-rose-600'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
            <span>Partner Invite Code</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{error}</span>
              {activeTab === 'account' && looksLikePartnerCode(password) && (
                <button
                  type="button"
                  onClick={() => handleSwitchToCodeTab(password)}
                  className="block mt-1 font-bold text-rose-600 hover:underline"
                >
                  Use "{normalizePartnerCode(password)}" in Partner Invite Code →
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: STANDARD ACCOUNT LOGIN */}
        {activeTab === 'account' && (
          <form onSubmit={handleAccountSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Real-time hint if user types a partner code */}
              {passwordLooksLikeCode && (
                <div className="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-700 flex items-center justify-between animate-fade-in">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Entering a Partner Code?</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSwitchToCodeTab(password)}
                    className="font-bold underline text-rose-600 hover:text-rose-700 ml-2 shrink-0"
                  >
                    Connect with Code →
                  </button>
                </div>
              )}
            </div>

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded accent-rose-500 w-3.5 h-3.5"
                />
                <span>Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-rose-500 hover:text-rose-600 font-semibold"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-md shadow-rose-200 hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 2: PARTNER INVITE CODE LOGIN & CONNECT */}
        {activeTab === 'partnerCode' && (
          <form onSubmit={handlePartnerCodeSubmit} className="space-y-4">
            <div className="text-center p-3 rounded-2xl bg-rose-50/60 border border-rose-100 mb-2">
              <span className="text-[11px] text-rose-800 leading-relaxed block">
                Have an invite code from your partner? Enter it here to link directly and open your partner dashboard.
              </span>
            </div>

            {/* Connection Code Input */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Partner Connection Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-rose-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={partnerCode}
                  onChange={e => setPartnerCode(normalizePartnerCode(e.target.value))}
                  placeholder="HER-ABC234"
                  maxLength={10}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 border border-rose-200 font-mono text-base font-bold tracking-wider uppercase text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                e.g. <span className="font-mono font-semibold">HER-ABC234</span> or <span className="font-mono font-semibold">ABC234</span>
              </p>
            </div>

            {/* Partner's Name */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={partnerName}
                onChange={e => setPartnerName(e.target.value)}
                placeholder="e.g. Alex"
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>

            {/* Optional Account Credentials */}
            <div>
              <button
                type="button"
                onClick={() => setShowOptionalFields(prev => !prev)}
                className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1"
              >
                <span>{showOptionalFields ? '− Hide account options' : '+ Set optional email & password (to sign in later)'}</span>
              </button>

              {showOptionalFields && (
                <div className="mt-2.5 space-y-2.5 p-3 rounded-2xl bg-gray-50/80 border border-gray-100 animate-fade-in">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">
                      Your Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={partnerEmail}
                      onChange={e => setPartnerEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-300"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">
                      Choose Password (Optional)
                    </label>
                    <input
                      type="password"
                      value={partnerPassword}
                      onChange={e => setPartnerPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-300"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-md shadow-rose-200 hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>{loading ? 'Connecting...' : 'Connect & Open Sanctuary'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Footer Register Link */}
      <div className="text-center text-xs text-gray-500">
        Don't have an account or code yet?{' '}
        <Link to="/register" className="font-bold text-rose-500 hover:underline">
          Create Account
        </Link>
      </div>

      <Disclaimer compact />
    </div>
  );
};
