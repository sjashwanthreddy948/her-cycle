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
  Sparkles,
  ShieldCheck,
  User,
  HeartHandshake
} from 'lucide-react';
import { normalizePartnerCode, looksLikePartnerCode } from '../lib/codeUtils';

export const LoginPage: React.FC = () => {
  const { login, connectWithPartnerCode } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const authenticatedUser = await login(email, password);
      // Strict role enforcement: destination is 100% determined by authenticated profile from database
      if (authenticatedUser.role === 'partner') {
        navigate('/partner/home');
      } else {
        navigate('/woman/home');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Access Fillers (Role strictly validated by database authentication)
  const handleQuickLogin = (role: 'woman' | 'partner') => {
    setError(null);
    if (role === 'woman') {
      setEmail('demo.woman@hercycle.app');
      setPassword('Demo@12345');
    } else {
      setEmail('demo.partner@hercycle.app');
      setPassword('Demo@12345');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F7] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-white rounded-4xl shadow-float border border-rose-100/80 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        
        {/* Left Side: Desktop Branding & Woman Composition */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-[#FFF0EB] via-[#FFE5E8] to-[#FFF5F7] border-r border-rose-100 relative overflow-hidden">
          {/* Subtle warm glow background */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-rose-200/50 rounded-full blur-3xl pointer-events-none" />

          {/* Top Logo */}
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer z-10"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 p-0.5 shadow-md shadow-rose-500/20">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
              </div>
            </div>
            <span className="text-xl font-black font-display tracking-tight text-gray-950">
              Her<span className="text-rose-500">Cycle</span>
            </span>
          </div>

          {/* Center Visual: Woman Portrait with Peach Arch Backdrop */}
          <div className="relative my-auto py-4 flex flex-col items-center justify-center z-10">
            <div className="relative w-56 h-64 rounded-t-full overflow-hidden border-2 border-rose-200 shadow-xl bg-gradient-to-b from-orange-100 to-rose-100">
              <img
                src="/assets/woman-portrait.png"
                alt="HerCycle"
                className="w-full h-full object-cover object-top"
              />
            </div>

            <div className="mt-4 text-center space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-widest text-rose-600 block">
                Feminine Health Sanctuary
              </span>
              <p className="text-xs text-gray-600 max-w-xs italic">
                "Cycle tracking with physiological precision and uncompromised privacy."
              </p>
            </div>
          </div>

          {/* Bottom Security Badge */}
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 z-10">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted database storage · Zero ads</span>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="p-6 sm:p-10 flex flex-col justify-center">
          
          {/* Mobile Brand Header */}
          <div 
            onClick={() => navigate('/')}
            className="lg:hidden flex items-center gap-2 cursor-pointer mb-6"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shadow-xs">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-lg font-black font-display text-gray-900">
              Her<span className="text-rose-500">Cycle</span>
            </span>
          </div>

          {/* Title & Subtitle */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-black font-display text-gray-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Your cycle, your data, your privacy.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-200 text-sm transition outline-none"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-rose-600 font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-200 text-sm transition outline-none"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Options: Remember me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400 border-gray-300"
                />
                <span className="text-xs text-gray-600">Remember me</span>
              </label>
            </div>

            {/* Button: [Login] */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold text-sm shadow-md shadow-rose-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Switchers */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block text-center mb-2.5">
              Quick Test Accounts
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('woman')}
                className="py-2 px-3 rounded-2xl bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 text-rose-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Continue as Woman</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('partner')}
                className="py-2 px-3 rounded-2xl bg-gray-100 hover:bg-gray-200/80 border border-gray-200 text-gray-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Continue as Partner</span>
              </button>
            </div>
            <span className="text-[10px] text-gray-400 block text-center mt-1.5 italic">
              Role is strictly verified from the database upon authentication.
            </span>
          </div>

          {/* Below: Don't have an account? Create account */}
          <div className="mt-6 text-center text-xs text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-rose-600 hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
