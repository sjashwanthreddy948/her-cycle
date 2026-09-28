import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Sparkles, ShieldCheck, HeartHandshake, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';
import { Disclaimer } from '../components/common/Disclaimer';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsDemoWoman, loginAsDemoPartner } = useAuth();

  const handleDemoWoman = async () => {
    await loginAsDemoWoman();
    navigate('/woman/home');
  };

  const handleDemoPartner = async () => {
    await loginAsDemoPartner();
    navigate('/partner/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F7] via-[#FFF0F4] to-[#FDE8EE] flex flex-col justify-between px-4 py-8 max-w-md mx-auto">
      {/* Top Brand Logo */}
      <div className="pt-6 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center mx-auto shadow-glow mb-4">
          <Heart className="w-8 h-8 text-white fill-white" />
        </div>
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-gray-900 leading-tight">
          HerCycle
        </h1>
        <p className="text-xs font-semibold text-rose-500 uppercase tracking-widest mt-1">
          Understand her cycle. Support her better.
        </p>
      </div>

      {/* Hero Visual Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-float border border-rose-100 my-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Feminine Wellness & Partner Sync</span>
        </div>

        <h2 className="text-xl font-bold font-display text-gray-900 mb-2">
          Your cycle. Your health. Your privacy.
        </h2>

        <p className="text-xs text-gray-600 leading-relaxed max-w-xs mx-auto mb-6">
          Track your menstrual rhythm, discover phase-based wellness patterns, and safely share only what you choose with your partner with zero leakage.
        </p>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 gap-2 text-left text-xs mb-6">
          <div className="p-2.5 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="font-medium text-gray-700">Circular Cycle Ring</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="font-medium text-gray-700">4 Cycle Phases</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="font-medium text-gray-700">Read-Only Partner</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="font-medium text-gray-700">100% Private Data</span>
          </div>
        </div>

        {/* Main CTA Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => navigate('/register')}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-md shadow-rose-200 hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 rounded-full bg-white border border-rose-200 text-rose-600 font-bold text-sm hover:bg-rose-50 transition"
          >
            Log In
          </button>
        </div>
      </div>

      {/* Instant Demo Accounts Banner */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 border border-rose-100 shadow-soft text-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
          Instant Interactive Demo Testing
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleDemoWoman}
            className="p-2.5 rounded-2xl bg-gradient-to-tr from-rose-50 to-pink-50 border border-rose-200 text-left hover:scale-[1.02] transition"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Sarah (Woman)</span>
            </div>
            <span className="text-[10px] text-gray-500 block mt-0.5">
              Day 12 · 5 months history
            </span>
          </button>

          <button
            onClick={handleDemoPartner}
            className="p-2.5 rounded-2xl bg-gradient-to-tr from-rose-50 to-pink-50 border border-rose-200 text-left hover:scale-[1.02] transition"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Alex (Partner)</span>
            </div>
            <span className="text-[10px] text-gray-500 block mt-0.5">
              Read-only synced view
            </span>
          </button>
        </div>
      </div>

      <Disclaimer compact />
    </div>
  );
};
