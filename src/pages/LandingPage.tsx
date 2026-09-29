import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Menu, 
  X, 
  Calendar, 
  Activity, 
  Smile, 
  Moon, 
  BarChart3, 
  Users, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-rose-100 selection:text-rose-900 overflow-x-hidden font-sans">
      
      {/* ======================================================== */}
      {/* 1. TOP HEADER MATCHING REFERENCE DESIGN                  */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-rose-100/70 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shadow-sm shadow-rose-200 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-xl sm:text-2xl font-black font-display tracking-tight text-gray-950">
              Her<span className="text-rose-500">Cycle</span>
            </span>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:inline-flex px-5 py-2 rounded-full border border-gray-200 hover:border-gray-300 text-gray-800 font-bold text-xs transition active:scale-95 cursor-pointer"
            >
              Login
            </button>

            <button
              onClick={() => navigate('/register')}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-md shadow-rose-200 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-full bg-rose-50/80 hover:bg-rose-100 border border-rose-100 text-rose-600 flex items-center justify-center transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="max-w-6xl mx-auto mt-3 pt-3 border-t border-rose-100 flex flex-col gap-2 pb-2 animate-in fade-in">
            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
              className="w-full text-left px-4 py-2.5 rounded-2xl hover:bg-rose-50 font-bold text-sm text-gray-800 transition"
            >
              Sign In to Your Account
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}
              className="w-full text-left px-4 py-2.5 rounded-2xl bg-rose-50 text-rose-600 font-bold text-sm transition"
            >
              Create Account (Woman or Partner)
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
              className="w-full text-left px-4 py-2.5 rounded-2xl hover:bg-rose-50 font-medium text-xs text-gray-600 transition"
            >
              Partner Connection Portal
            </button>
          </div>
        )}
      </header>

      {/* ======================================================== */}
      {/* 2. EXACT HERO VISUAL DISPLAY (The User Requested Image)   */}
      {/* ======================================================== */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-12 flex flex-col items-center">
        
        {/* Main Reference Image Showcase */}
        <div className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-rose-100/80 bg-[#FFF9FA] group">
          <img
            src="/assets/hercycle-landing.jpg"
            alt="HerCycle: Understand your cycle. Feel more in control."
            className="w-full h-auto block select-none"
          />

          {/* Interactive Overlay Over the Left Buttons on the image */}
          <div className="absolute top-[37%] left-[6%] w-[25%] sm:w-[22%] h-[6%] flex items-center gap-2 z-20">
            <button
              onClick={() => navigate('/register')}
              title="Get Started with HerCycle"
              className="w-1/2 h-full rounded-full cursor-pointer transition bg-transparent hover:bg-rose-500/10 active:scale-95"
              aria-label="Get Started"
            />
            <button
              onClick={() => navigate('/login')}
              title="Login to HerCycle"
              className="w-1/2 h-full rounded-full cursor-pointer transition bg-transparent hover:bg-black/5 active:scale-95"
              aria-label="Login"
            />
          </div>

          {/* Interactive Overlay Over the Center Phone Mockup */}
          <div 
            onClick={() => navigate('/register')}
            className="absolute top-[34%] left-[33%] w-[34%] h-[50%] cursor-pointer hover:ring-2 hover:ring-rose-400/40 rounded-3xl transition"
            title="Open HerCycle App"
            aria-label="HerCycle Mobile App Preview"
          />
        </div>

        {/* Quick Action Companion Bar */}
        <div className="w-full max-w-2xl mt-6 p-4 rounded-3xl bg-gradient-to-r from-rose-50 via-pink-50 to-orange-50 border border-rose-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-rose-500 flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Start Tracking Today</h3>
              <p className="text-xs text-gray-500">Private, secure, and ready for you and your partner.</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold text-xs transition cursor-pointer text-center"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-200 transition cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. SIX PILLARS OF HERCYCLE (Matching Bottom Image Row)    */}
        {/* ======================================================== */}
        <section className="w-full max-w-4xl mt-12">
          <div className="p-6 sm:p-8 rounded-4xl bg-rose-50/50 border border-rose-100 shadow-soft">
            <div className="text-center mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 block mb-1">
                EVERYTHING IN ONE SANCTUARY
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-display text-gray-900">
                Designed for Rhythm, Privacy & Empathy
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 text-center">
              {/* Feature 1 */}
              <div 
                onClick={() => navigate('/register')}
                className="p-4 rounded-3xl bg-white border border-rose-100/80 shadow-xs hover:shadow-float hover:border-rose-300 transition cursor-pointer flex flex-col items-center justify-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6 stroke-[2]" />
                </div>
                <h4 className="text-xs font-bold text-gray-900 leading-snug">Track Your Periods</h4>
              </div>

              {/* Feature 2 */}
              <div 
                onClick={() => navigate('/register')}
                className="p-4 rounded-3xl bg-white border border-rose-100/80 shadow-xs hover:shadow-float hover:border-rose-300 transition cursor-pointer flex flex-col items-center justify-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6 stroke-[2]" />
                </div>
                <h4 className="text-xs font-bold text-gray-900 leading-snug">Monitor Symptoms</h4>
              </div>

              {/* Feature 3 */}
              <div 
                onClick={() => navigate('/register')}
                className="p-4 rounded-3xl bg-white border border-rose-100/80 shadow-xs hover:shadow-float hover:border-rose-300 transition cursor-pointer flex flex-col items-center justify-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Smile className="w-6 h-6 stroke-[2]" />
                </div>
                <h4 className="text-xs font-bold text-gray-900 leading-snug">Track Mood & Energy</h4>
              </div>

              {/* Feature 4 */}
              <div 
                onClick={() => navigate('/register')}
                className="p-4 rounded-3xl bg-white border border-rose-100/80 shadow-xs hover:shadow-float hover:border-rose-300 transition cursor-pointer flex flex-col items-center justify-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Moon className="w-6 h-6 stroke-[2]" />
                </div>
                <h4 className="text-xs font-bold text-gray-900 leading-snug">See Your Cycle Phases</h4>
              </div>

              {/* Feature 5 */}
              <div 
                onClick={() => navigate('/register')}
                className="p-4 rounded-3xl bg-white border border-rose-100/80 shadow-xs hover:shadow-float hover:border-rose-300 transition cursor-pointer flex flex-col items-center justify-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6 stroke-[2]" />
                </div>
                <h4 className="text-xs font-bold text-gray-900 leading-snug">Get Personal Insights</h4>
              </div>

              {/* Feature 6 */}
              <div 
                onClick={() => navigate('/register')}
                className="p-4 rounded-3xl bg-white border border-rose-100/80 shadow-xs hover:shadow-float hover:border-rose-300 transition cursor-pointer flex flex-col items-center justify-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 stroke-[2]" />
                </div>
                <h4 className="text-xs font-bold text-gray-900 leading-snug">Share with Your Partner</h4>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 4. MEDICAL DISCLAIMER (Matching Bottom of Reference)     */}
        {/* ======================================================== */}
        <footer className="w-full max-w-3xl mt-12 pt-6 border-t border-gray-100 text-center flex flex-col items-center">
          <div className="inline-flex items-start gap-2.5 text-left bg-gray-50/70 p-4 rounded-2xl border border-gray-200/70 text-gray-500 text-[11px] leading-relaxed">
            <ShieldCheck className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
            <p>
              HerCycle provides tracking and estimates based on information you enter. It is not a medical device and should not be used to diagnose conditions or as a method of contraception. For medical concerns, consult a qualified healthcare professional.
            </p>
          </div>
          <p className="text-[11px] text-gray-400 mt-4">
            © {new Date().getFullYear()} HerCycle. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
