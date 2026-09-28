import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CycleRing3D } from '../components/3d/CycleRing3D';
import { Heart, Sparkles, ArrowRight, ShieldCheck, Lock, Users, Activity } from 'lucide-react';
import { Disclaimer } from '../components/common/Disclaimer';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F7] via-[#FFF0F4] to-[#FDE8EE] flex flex-col justify-between px-4 py-6 max-w-lg mx-auto">
      {/* Top Brand Logo */}
      <header className="flex items-center justify-between pt-2 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center shadow-sm">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-xl font-extrabold font-display tracking-tight text-gray-900">
            HerCycle
          </span>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="text-xs font-bold text-rose-600 px-3.5 py-1.5 rounded-full border border-rose-200 bg-white/80 backdrop-blur-sm hover:bg-rose-50 transition"
        >
          Sign In
        </button>
      </header>

      {/* Hero 3D Section */}
      <main className="space-y-6 my-auto py-2">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/70 text-rose-700 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Feminine Wellness & Partner Sync</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-gray-900 leading-tight">
            Understand her cycle.<br />
            <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
              Support her better.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-600 max-w-xs mx-auto leading-relaxed">
            A serene sanctuary for her menstrual wellness and a secure, read-only window for her partner.
          </p>
        </div>

        {/* 3D Interactive Cycle Ring with Original Serene Woman Illustration */}
        <div className="py-2">
          <CycleRing3D
            currentCycleDay={12}
            totalCycleLength={28}
            isLandingPage={true}
          />
        </div>

        {/* Phase Color Legend */}
        <div className="grid grid-cols-4 gap-1.5 max-w-xs mx-auto text-center">
          <div className="p-2 rounded-2xl bg-white/80 backdrop-blur-sm border border-rose-100/80 shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-[#F43F5E] mx-auto mb-1" />
            <span className="text-[10px] font-bold text-gray-800 block">Menstrual</span>
            <span className="text-[9px] text-gray-500">Days 1–5</span>
          </div>
          <div className="p-2 rounded-2xl bg-white/80 backdrop-blur-sm border border-pink-100/80 shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-[#EC4899] mx-auto mb-1" />
            <span className="text-[10px] font-bold text-gray-800 block">Follicular</span>
            <span className="text-[9px] text-gray-500">Days 6–13</span>
          </div>
          <div className="p-2 rounded-2xl bg-white/80 backdrop-blur-sm border border-amber-100/80 shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] mx-auto mb-1" />
            <span className="text-[10px] font-bold text-gray-800 block">Ovulation</span>
            <span className="text-[9px] text-gray-500">Days 14–16</span>
          </div>
          <div className="p-2 rounded-2xl bg-white/80 backdrop-blur-sm border border-purple-100/80 shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] mx-auto mb-1" />
            <span className="text-[10px] font-bold text-gray-800 block">Luteal</span>
            <span className="text-[9px] text-gray-500">Days 17–28</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => navigate('/register')}
            className="w-full py-4 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold text-base shadow-float hover:shadow-glow transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate('/login')}
            className="w-full py-3.5 rounded-full bg-white/90 backdrop-blur-md border border-rose-200 text-rose-700 font-bold text-sm shadow-soft hover:bg-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4 text-rose-500" />
            <span>Partner Login</span>
          </button>
        </div>

        {/* Security & Privacy Highlights */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 border border-rose-100 shadow-soft grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2">
            <Lock className="w-4 h-4 text-rose-500 mx-auto mb-1" />
            <span className="font-bold text-gray-800 text-[11px] block">Zero Data Selling</span>
            <span className="text-[10px] text-gray-500">100% private</span>
          </div>
          <div className="p-2 border-x border-rose-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <span className="font-bold text-gray-800 text-[11px] block">Read-Only Partner</span>
            <span className="text-[10px] text-gray-500">Field-level guards</span>
          </div>
          <div className="p-2">
            <Activity className="w-4 h-4 text-purple-500 mx-auto mb-1" />
            <span className="font-bold text-gray-800 text-[11px] block">Cycle Intelligence</span>
            <span className="text-[10px] text-gray-500">Apple x Oura feel</span>
          </div>
        </div>
      </main>

      <footer className="pt-4">
        <Disclaimer compact />
      </footer>
    </div>
  );
};

export default LandingPage;
