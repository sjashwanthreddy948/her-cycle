import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CycleRing3D } from '../components/3d/CycleRing3D';
import { 
  Heart, 
  Sparkles, 
  ArrowUpRight, 
  ShieldCheck, 
  Lock, 
  Users, 
  Activity, 
  Star, 
  Calendar, 
  ChevronRight,
  Zap,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { Disclaimer } from '../components/common/Disclaimer';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'home' | 'phases' | 'partner' | 'privacy'>('home');

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F6] text-gray-900 selection:bg-rose-200 selection:text-rose-900 overflow-x-hidden font-sans">
      
      {/* ======================================================== */}
      {/* 1. FLOATING DARK PILL NAVBAR (Inspired by Reference UI)   */}
      {/* ======================================================== */}
      <nav className="fixed top-4 left-0 right-0 z-50 px-4 max-w-5xl mx-auto pointer-events-none">
        <div className="pointer-events-auto bg-[#1A151A]/90 backdrop-blur-xl border border-white/10 rounded-full px-3.5 sm:px-6 py-2.5 sm:py-3 shadow-2xl flex items-center justify-between transition-all">
          
          {/* Left Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-gray-300">
            <button
              onClick={() => { setActiveTab('home'); scrollToSection('hero'); }}
              className={`hover:text-white transition ${activeTab === 'home' ? 'text-white font-bold' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => { setActiveTab('phases'); scrollToSection('phases-section'); }}
              className={`hover:text-white transition ${activeTab === 'phases' ? 'text-white font-bold' : ''}`}
            >
              Phases
            </button>
            <button
              onClick={() => { setActiveTab('partner'); scrollToSection('partner-section'); }}
              className={`hover:text-white transition ${activeTab === 'partner' ? 'text-white font-bold' : ''}`}
            >
              Partner Sync
            </button>
          </div>

          {/* Center Brand Pill Badge */}
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 p-0.5 shadow-md shadow-rose-500/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-[#1A151A] rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
              </div>
            </div>
            <span className="text-base sm:text-lg font-black font-display tracking-tight text-white flex items-center gap-1">
              Her<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-400">Cycle</span>
            </span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-bold text-gray-300 hover:text-white px-3 py-1.5 transition"
            >
              Sign In
            </button>

            <button
              onClick={() => navigate('/register')}
              className="px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-105 transition-all flex items-center gap-1 active:scale-95"
            >
              <span>Get Started</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* 2. HERO SECTION WITH ARCHED PORTRAIT & 3D CYCLE RING      */}
      {/* ======================================================== */}
      <header id="hero" className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 overflow-hidden">
        
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-gradient-to-tr from-rose-200/40 via-amber-100/30 to-pink-200/40 blur-3xl pointer-events-none -z-10 rounded-full" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          
          {/* Playful Greeting Badge (Inspired by "Hello!" in Jenny UI) */}
          <div className="relative inline-block mb-3">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-rose-200/80 text-rose-600 text-xs font-bold shadow-soft animate-bounce-subtle">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>Hello! Meet HerCycle</span>
            </div>
            
            {/* Playful Hand-Drawn Sketch Accent Lines */}
            <svg className="absolute -top-3 -right-6 w-6 h-6 text-rose-400 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round">
              <path d="M4 12c4-6 10-6 16 0" />
              <path d="M12 4v4" />
            </svg>
            <svg className="absolute -bottom-2 -left-6 w-5 h-5 text-amber-400 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 15c4 4 10 4 14 0" />
            </svg>
          </div>

          {/* Hero Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-gray-900 leading-[1.1] mb-4">
            I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500">HerCycle</span>,<br />
            Your Rhythm Sanctuary
          </h1>

          <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto leading-relaxed mb-8">
            Understand her cycle. Support her better. A serene personal tracking space for her and an empathetic, read-only window for her partner.
          </p>

          {/* ==================================================== */}
          {/* ARCHED STAGE WITH 3D CYCLE RING & FLANKING CARDS     */}
          {/* ==================================================== */}
          <div className="relative max-w-2xl mx-auto mt-4 sm:mt-8 flex items-center justify-center">
            
            {/* The Signature Terracotta/Peach Arched Backdrop (Inspired by Reference) */}
            <div className="absolute bottom-0 w-[300px] sm:w-[380px] h-[340px] sm:h-[420px] rounded-t-full bg-gradient-to-t from-[#FFA785]/30 via-[#FFC3AD]/25 to-[#FFF0EB]/80 border-t-2 border-x-2 border-rose-200/60 shadow-float -z-10" />

            {/* Left Flanking Floating Card: 4.9 Rating (Matching Reference Layout) */}
            <div className="hidden sm:flex flex-col items-start gap-1 absolute -left-6 top-1/4 bg-white/90 backdrop-blur-xl border border-rose-100 p-4 rounded-3xl shadow-float max-w-[190px] text-left z-20 hover:scale-105 transition">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-extrabold text-gray-900 mt-1">4.9 / 5 Rating</span>
              <p className="text-[11px] text-gray-500 leading-tight">
                "Finally, empathetic cycle tracking backed by physiology."
              </p>
            </div>

            {/* Right Flanking Floating Card: 100% Privacy (Matching Reference Layout) */}
            <div className="hidden sm:flex flex-col items-start gap-1 absolute -right-6 top-1/3 bg-white/90 backdrop-blur-xl border border-rose-100 p-4 rounded-3xl shadow-float max-w-[190px] text-left z-20 hover:scale-105 transition">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold text-gray-900 mt-1">100% Private</span>
              <p className="text-[11px] text-gray-500 leading-tight">
                Zero cloud data selling. Single-use partner pairing.
              </p>
            </div>

            {/* Central 3D Cycle Ring + Serene Woman Illustration */}
            <div className="relative z-10 w-full py-4 flex flex-col items-center">
              <CycleRing3D
                currentCycleDay={12}
                totalCycleLength={28}
                isLandingPage={true}
              />

              {/* Overlaid Dual Action Pills at Base of Arch (Matching Reference Button Style) */}
              <div className="mt-3 p-1.5 bg-white/90 backdrop-blur-xl border border-rose-200/80 rounded-full shadow-float flex items-center gap-2 z-20">
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-sm shadow-rose-200 flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <span>Get Started</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="px-5 py-2.5 rounded-full bg-rose-50/70 hover:bg-rose-100/70 text-rose-700 font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5 text-rose-500" />
                  <span>Partner Portal</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Phase Pill Chips */}
          <div id="phases-section" className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-xl mx-auto">
            <div className="p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-rose-100 shadow-xs flex items-center gap-2.5 text-left">
              <div className="w-3 h-3 rounded-full bg-[#F43F5E] shrink-0 ring-4 ring-rose-100" />
              <div>
                <span className="text-xs font-bold text-gray-900 block">Menstrual</span>
                <span className="text-[10px] text-gray-500">Days 1–5 · Rest & Renew</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-pink-100 shadow-xs flex items-center gap-2.5 text-left">
              <div className="w-3 h-3 rounded-full bg-[#EC4899] shrink-0 ring-4 ring-pink-100" />
              <div>
                <span className="text-xs font-bold text-gray-900 block">Follicular</span>
                <span className="text-[10px] text-gray-500">Days 6–13 · Rising Energy</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-amber-100 shadow-xs flex items-center gap-2.5 text-left">
              <div className="w-3 h-3 rounded-full bg-[#F59E0B] shrink-0 ring-4 ring-amber-100" />
              <div>
                <span className="text-xs font-bold text-gray-900 block">Ovulation</span>
                <span className="text-[10px] text-gray-500">Days 14–16 · Peak Vitality</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-purple-100 shadow-xs flex items-center gap-2.5 text-left">
              <div className="w-3 h-3 rounded-full bg-[#8B5CF6] shrink-0 ring-4 ring-purple-100" />
              <div>
                <span className="text-xs font-bold text-gray-900 block">Luteal</span>
                <span className="text-[10px] text-gray-500">Days 17–28 · Gentle Care</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 3. SLEEK DARK GLASSMORPHISM SECTION ("Services / Tech")   */}
      {/* ======================================================== */}
      <section id="partner-section" className="bg-[#141015] text-white pt-20 pb-24 px-4 relative overflow-hidden">
        
        {/* Ambient Dark Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-600/15 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 blur-[140px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto relative z-10">
          
          {/* Header with Badges (Inspired by Reference Pill Cards) */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-rose-400 text-xs font-bold mb-3">
                <Zap className="w-3.5 h-3.5" />
                <span>Next-Generation Wellness Engine</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
                Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-amber-400">Empathy & Privacy</span>
              </h2>
            </div>

            {/* Prototype & Feature Badges (Matching Reference Right Column) */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-semibold text-gray-300">
                ✨ 3D Three.js Ring
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-semibold text-gray-300">
                🔒 Zero Cloud Leakage
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-semibold text-gray-300">
                🤝 1:1 Partner Sync
              </span>
            </div>
          </div>

          {/* 3 Frosted Glassmorphic Feature Cards (Inspired by the Reference Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Cycle Rhythm */}
            <div className="group bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-2xl border border-white/10 hover:border-rose-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-5 group-hover:scale-110 transition">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-display text-white mb-2">
                  Physiological Rhythm
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Real-time phase tracking with an interactive 3D cycle ring. Calculates ovulation windows, follicular energy shifts, and period predictions.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-rose-400 font-semibold">
                <span>Explore Phases</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Card 2: Partner Sanctuary */}
            <div className="group bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-2xl border border-white/10 hover:border-pink-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-5 group-hover:scale-110 transition">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-display text-white mb-2">
                  Partner Sanctuary
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Cryptographic 6-character invite codes that expire immediately upon redemption. A read-only dashboard that shows how to best support her without medical intrusion.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-pink-400 font-semibold">
                <span>Single-Use Pairing</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Card 3: Privacy & Zero Leakage */}
            <div className="group bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-2xl border border-white/10 hover:border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-display text-white mb-2">
                  Zero Data Selling
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Your intimate health logs, symptoms, and cycle notes are never sold or shared with third parties. Private journal notes and weight remain strictly hidden from partners.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-emerald-400 font-semibold">
                <span>Encrypted Security</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </div>

          {/* Bottom Call to Action Card in Dark Section */}
          <div className="mt-14 rounded-3xl bg-gradient-to-r from-rose-950/60 via-pink-950/40 to-neutral-900 border border-rose-500/30 p-8 sm:p-10 text-center relative overflow-hidden shadow-2xl">
            <div className="max-w-xl mx-auto relative z-10 space-y-4">
              <h3 className="text-2xl sm:text-3xl font-bold font-display text-white">
                Start Your Rhythm Journey Today
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                HerCycle is ready to use immediately. No credit cards, no demo accounts, and 100% control over what you share.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-105 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>Create Free Account</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm transition-all"
                >
                  Log In
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0E0B0E] border-t border-white/5 py-8 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span className="text-sm font-bold text-gray-300 font-display">HerCycle</span>
          </div>
          <p className="text-[11px] text-gray-500">
            Understand her cycle. Support her better. · Designed with Apple Health x Oura aesthetics
          </p>
          <div className="pt-2 max-w-md mx-auto">
            <Disclaimer compact />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
