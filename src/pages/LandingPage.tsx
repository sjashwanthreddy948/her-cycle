import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  CheckCircle2,
  ChevronRight,
  Zap,
  BatteryCharging,
  Smile,
  HeartHandshake,
  ArrowRight
} from 'lucide-react';
import { Disclaimer } from '../components/common/Disclaimer';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-rose-100 selection:text-rose-900 overflow-x-hidden font-sans">
      
      {/* ======================================================== */}
      {/* 1. FLOATING DARK PILL NAVBAR (Inspired by Reference UI)   */}
      {/* ======================================================== */}
      <nav className="fixed top-4 left-0 right-0 z-50 px-4 max-w-5xl mx-auto pointer-events-none">
        <div className="pointer-events-auto bg-black/95 backdrop-blur-xl border border-white/10 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 shadow-2xl flex items-center justify-between transition-all">
          
          {/* Left Brand Badge */}
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 p-0.5 shadow-md shadow-rose-500/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
              </div>
            </div>
            <span className="text-base sm:text-lg font-black font-display tracking-tight text-white flex items-center gap-1">
              Her<span className="text-rose-400">Cycle</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-gray-300">
            <a href="#hero" className="hover:text-white transition text-white font-bold">Home</a>
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#phases" className="hover:text-white transition">Phases</a>
            <a href="#partner" className="hover:text-white transition">Partner Sync</a>
            <a href="#privacy" className="hover:text-white transition">Privacy</a>
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
              className="px-4 sm:px-5 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/25 hover:scale-105 transition-all flex items-center gap-1 active:scale-95"
            >
              <span>Get Started</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* 2. HERO SECTION MATCHING SPECIFICATION & REFERENCE IMAGE */}
      {/* ======================================================== */}
      <section id="hero" className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 overflow-hidden bg-white">
        
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[700px] h-[550px] bg-gradient-to-tr from-rose-100/50 via-orange-50/40 to-pink-100/40 blur-3xl pointer-events-none -z-10 rounded-full" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          
          {/* Small pill: "YOUR PERSONAL CYCLE COMPANION" */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-extrabold tracking-wider uppercase mb-5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>YOUR PERSONAL CYCLE COMPANION</span>
          </div>

          {/* Large heading: "Understand your cycle. Feel more in control." with pink highlight */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight text-gray-950 leading-[1.08] mb-5">
            Understand your <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500">cycle</span>.<br />
            Feel more in <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-500">control</span>.
          </h1>

          {/* Supporting text */}
          <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed mb-8">
            Track your periods, symptoms, mood and cycle patterns privately — and share only what you choose with someone you trust.
          </p>

          {/* Action Buttons: [Start Tracking] [Login] */}
          <div className="flex items-center justify-center gap-3.5 mb-14">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-500/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Start Tracking</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/login')}
              className="px-7 py-3.5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold text-sm border border-gray-200 transition-all active:scale-95 flex items-center gap-2"
            >
              <span>Login</span>
            </button>
          </div>

          {/* ==================================================== */}
          {/* HERO VISUAL: WARM CIRCULAR ARCH + WOMAN PORTRAIT     */}
          {/* WITH FLOATING STAT CARDS (Cycle Day 12, etc.)       */}
          {/* ==================================================== */}
          <div className="relative max-w-2xl mx-auto flex items-end justify-center pt-8">
            
            {/* Large circular pink/orange gradient shape backdrop */}
            <div 
              className="absolute bottom-0 w-[320px] sm:w-[420px] h-[360px] sm:h-[460px] rounded-t-full border-t-2 border-x-2 border-rose-200/60 shadow-2xl -z-10"
              style={{
                background: 'linear-gradient(180deg, rgba(254, 215, 170, 0.45) 0%, rgba(253, 164, 175, 0.5) 50%, rgba(255, 241, 242, 0.8) 100%)',
              }}
            />

            {/* Woman's actual portrait photo naturally integrated */}
            <div className="relative z-10 w-[280px] sm:w-[360px] h-[340px] sm:h-[430px] overflow-hidden rounded-t-full flex items-end justify-center">
              <img
                src="/assets/woman-portrait.png"
                alt="HerCycle Wellness Companion"
                className="w-full h-full object-cover object-top filter contrast-[1.02] drop-shadow-lg"
              />
            </div>

            {/* Floating Card 1 (Top Left): "Cycle Day 12" */}
            <div className="absolute -left-2 sm:-left-8 top-12 sm:top-16 bg-white/95 backdrop-blur-md border border-rose-100/90 px-4 py-3 rounded-2xl shadow-float z-20 text-left hover:scale-105 transition-all">
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cycle Day</span>
              </div>
              <span className="text-2xl font-black font-display text-gray-900 leading-none">12</span>
              <span className="text-[10px] text-rose-500 font-semibold block mt-0.5">Follicular Phase</span>
            </div>

            {/* Floating Card 2 (Bottom Left): "Energy Good" */}
            <div className="absolute -left-4 sm:-left-10 bottom-16 bg-white/95 backdrop-blur-md border border-rose-100/90 px-4 py-3 rounded-2xl shadow-float z-20 text-left hover:scale-105 transition-all">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  <BatteryCharging className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Energy</span>
                  <span className="text-sm font-extrabold text-gray-900">Good ⚡</span>
                </div>
              </div>
            </div>

            {/* Floating Card 3 (Top Right): "Next Period 16 days" */}
            <div className="absolute -right-2 sm:-right-8 top-10 sm:top-14 bg-white/95 backdrop-blur-md border border-rose-100/90 px-4 py-3 rounded-2xl shadow-float z-20 text-left hover:scale-105 transition-all">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Next Period</span>
                  <span className="text-sm font-black font-display text-rose-600">16 days</span>
                </div>
              </div>
            </div>

            {/* Floating Card 4 (Bottom Right): "Partner Sharing Active" */}
            <div className="absolute -right-4 sm:-right-10 bottom-20 bg-white/95 backdrop-blur-md border border-emerald-100 px-4 py-3 rounded-2xl shadow-float z-20 text-left hover:scale-105 transition-all">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Partner Sharing</span>
                  <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Active (Alex)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. FOUR PHASES DEEP DIVE                                 */}
      {/* ======================================================== */}
      <section id="phases" className="py-20 px-4 bg-[#FCF8F8] border-y border-rose-100/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-rose-500 block mb-2">
              Biological Rhythm
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-gray-900 mb-3">
              The Four Phases of Your Rhythm
            </h2>
            <p className="text-sm text-gray-600">
              Your body shifts hormones across 4 distinct phases. Understanding where you are brings peace, clarity, and empowerment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Menstrual */}
            <div className="p-6 rounded-3xl bg-white border border-rose-100 shadow-sm hover:shadow-md transition space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="text-lg font-bold text-gray-900">Menstrual Phase</h3>
              <span className="text-xs font-semibold text-rose-600 block">Days 1–5 · Rest & Reset</span>
              <p className="text-xs text-gray-500 leading-relaxed">
                Estrogen and progesterone drop. Prioritize deep rest, gentle movement, warm nutrition, and cozy boundaries.
              </p>
            </div>

            {/* Follicular */}
            <div className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm hover:shadow-md transition space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-50 border border-pink-200 text-pink-500 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="text-lg font-bold text-gray-900">Follicular Phase</h3>
              <span className="text-xs font-semibold text-pink-600 block">Days 6–13 · Rising Energy</span>
              <p className="text-xs text-gray-500 leading-relaxed">
                FSH and estrogen rise. Mental clarity increases, social openness peaks, and energy levels surge.
              </p>
            </div>

            {/* Ovulation */}
            <div className="p-6 rounded-3xl bg-white border border-amber-100 shadow-sm hover:shadow-md transition space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="text-lg font-bold text-gray-900">Ovulatory Phase</h3>
              <span className="text-xs font-semibold text-amber-600 block">Days 14–16 · Peak Vitality</span>
              <p className="text-xs text-gray-500 leading-relaxed">
                LH surge triggers egg release. Confidence, communication skills, and physical endurance reach maximum capacity.
              </p>
            </div>

            {/* Luteal */}
            <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm hover:shadow-md transition space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 text-purple-500 flex items-center justify-center font-bold text-sm">
                04
              </div>
              <h3 className="text-lg font-bold text-gray-900">Luteal Phase</h3>
              <span className="text-xs font-semibold text-purple-600 block">Days 17–28 · Turning Inward</span>
              <p className="text-xs text-gray-500 leading-relaxed">
                Progesterone dominates. Focus turns toward wrapping up tasks, mindful reflection, calming routines, and hydration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. PARTNER SYNC SECTION                                  */}
      {/* ======================================================== */}
      <section id="partner" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          
          <div className="flex-1 space-y-5">
            <span className="text-xs font-extrabold uppercase tracking-widest text-rose-500 block">
              Empathetic Connection
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-gray-900 leading-tight">
              Share only what you choose with someone you trust.
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              No awkward conversations or misunderstandings. Generate a secure 6-digit connection code in your app. Your partner gets a dedicated read-only dashboard with empathy tips, daily reminders, and phase guidance.
            </p>

            <ul className="space-y-3 pt-2 text-xs text-gray-700 font-medium">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Secure 6-digit expiring pairing code (15-minute validity)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>You approve every connection request with his name & photo</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Fine-grained permissions: private notes and weight remain strictly hidden</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Instant one-tap pause or unlink anytime</span>
              </li>
            </ul>

            <div className="pt-4">
              <button
                onClick={() => navigate('/register')}
                className="px-7 py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-200 transition"
              >
                Set Up Partner Sync
              </button>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md bg-[#FFF5F7] p-6 rounded-4xl border border-rose-100 shadow-float">
            <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/assets/woman-portrait.png"
                    alt="Sarah"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-300"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Sarah's Cycle</h4>
                    <span className="text-[10px] text-emerald-600 font-semibold">● Connected (Read-Only)</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                  Day 12 · Follicular
                </span>
              </div>

              <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-100 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-rose-600">Support Her Tip</span>
                <p className="text-xs text-gray-700 font-medium">
                  "Sarah is entering her high-energy follicular phase. Great time for outdoor activities or planning shared projects!"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 block font-bold">NEXT PERIOD</span>
                  <span className="text-sm font-bold text-gray-900">16 days</span>
                </div>
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 block font-bold">SHARED MOOD</span>
                  <span className="text-sm font-bold text-gray-900">Great 😊</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. PRIVACY & SECURITY FIRST                              */}
      {/* ======================================================== */}
      <section id="privacy" className="py-20 px-4 bg-[#FCF8F8] border-t border-rose-100/60">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex p-3 rounded-3xl bg-rose-100 text-rose-600 mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <h2 className="text-3xl font-black font-display text-gray-900">
              Your Rhythm. Your Data. Your Peace.
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              We believe your intimate menstrual and wellness logs belong exclusively to you. We never sell your data, track you across the web, or display ads.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-xs space-y-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h4 className="text-xs font-bold text-gray-900">Database Row Security</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Database-enforced Row Level Security ensures nobody can query your records without direct authorization.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-xs space-y-2">
              <Lock className="w-5 h-5 text-rose-500" />
              <h4 className="text-xs font-bold text-gray-900">Zero Third-Party Trackers</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                No telemetry tracking your location or browsing behavior. Pure physiological tracking.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-xs space-y-2">
              <ArrowUpRight className="w-5 h-5 text-amber-500" />
              <h4 className="text-xs font-bold text-gray-900">Complete Data Export</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Download your full cycle history in CSV or JSON at any moment, or erase your account permanently with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. CALL TO ACTION & FOOTER                               */}
      {/* ======================================================== */}
      <section className="py-20 px-4 bg-white text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black font-display text-gray-900">
            Ready to find rhythm in your cycle?
          </h2>
          <p className="text-sm text-gray-600">
            Join thousands of women and partners experiencing cycle tracking built on dignity, clarity, and trust.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-200 transition hover:scale-105 active:scale-95"
            >
              Start Free Today
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-7 py-3.5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold text-sm border border-gray-200 transition"
            >
              Partner Login
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100 bg-[#FAF7F7] text-center text-xs text-gray-500 space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span className="font-bold text-gray-900">HerCycle Sanctuary</span>
        </div>
        <p className="text-[11px] text-gray-400 max-w-md mx-auto">
          HerCycle is a physiological wellness companion and is not intended as medical advice or contraception.
        </p>
        <p className="text-[10px] text-gray-400">
          © {new Date().getFullYear()} HerCycle. All rights reserved. Built with privacy & empathy.
        </p>
      </footer>
    </div>
  );
};
