import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Disclaimer } from '../components/common/Disclaimer';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F7] to-[#FDE8EE] flex flex-col justify-between px-4 py-8 max-w-md mx-auto">
      <div className="text-center pt-6">
        <Link to="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center shadow-sm">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-2xl font-bold font-display text-gray-900 tracking-tight">
            HerCycle
          </span>
        </Link>
        <h2 className="text-xl font-bold text-gray-900">
          Reset Password
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Enter your email to receive recovery instructions
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-soft border border-rose-100 my-4">
        {submitted ? (
          <div className="text-center py-4 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">
              Check Your Inbox
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              If an account exists for <span className="font-semibold">{email}</span>, we have sent password reset instructions.
            </p>
            <Link
              to="/login"
              className="inline-block mt-2 px-6 py-2.5 rounded-full bg-rose-500 text-white font-bold text-xs shadow-sm hover:bg-rose-600"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Your Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="demo.woman@hercycle.app"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-md shadow-rose-200 hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              <span>Send Reset Link</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      <div className="text-center text-xs text-gray-500">
        Remembered your password?{' '}
        <Link to="/login" className="font-bold text-rose-500 hover:underline">
          Sign In
        </Link>
      </div>

      <Disclaimer compact />
    </div>
  );
};
