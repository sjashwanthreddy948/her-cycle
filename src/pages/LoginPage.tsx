import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { Disclaimer } from '../components/common/Disclaimer';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
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
          Welcome Back
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Sign in to access your secure cycle sanctuary
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-3xl p-6 shadow-soft border border-rose-100 my-4">
        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
      </div>

      {/* Footer Register Link */}
      <div className="text-center text-xs text-gray-500">
        Don't have an account yet?{' '}
        <Link to="/register" className="font-bold text-rose-500 hover:underline">
          Create Account
        </Link>
      </div>

      <Disclaimer compact />
    </div>
  );
};
