import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, RefreshCw, UserCheck, Shield } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, loginAsDemoWoman, loginAsDemoPartner } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const isPartner = user.role === 'partner';

  const handleSwitchRole = async () => {
    if (isPartner) {
      await loginAsDemoWoman();
      navigate('/woman/home');
    } else {
      await loginAsDemoPartner();
      navigate('/partner/home');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFF5F7]/90 backdrop-blur-md border-b border-rose-100/60 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand logo & tagline */}
        <div 
          onClick={() => navigate(isPartner ? '/partner/home' : '/woman/home')}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center shadow-sm shadow-rose-200 group-hover:scale-105 transition-transform">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-display tracking-tight text-gray-900 leading-none">
              HerCycle
            </h1>
            <span className="text-[10px] text-rose-500 font-medium tracking-wide">
              {isPartner ? 'Partner Portal' : 'Cycle Tracker'}
            </span>
          </div>
        </div>

        {/* Action controls & demo switcher */}
        <div className="flex items-center gap-2">
          {/* Quick Demo Switcher Pill */}
          <button
            onClick={handleSwitchRole}
            title={`Switch to ${isPartner ? 'Sarah (Woman)' : 'Alex (Partner)'}`}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-white border border-rose-200/80 text-rose-600 shadow-sm hover:bg-rose-50 transition active:scale-95"
          >
            <RefreshCw className="w-3 h-3 text-rose-500" />
            <span className="hidden sm:inline">Switch to</span>
            <span className="font-semibold">{isPartner ? 'Sarah' : 'Alex'}</span>
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={() => navigate(isPartner ? '/partner/profile' : '/woman/profile')}
            className="relative p-0.5 rounded-full ring-2 ring-rose-200 hover:ring-rose-400 transition"
            aria-label="Open profile"
          >
            <img
              src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user.full_name}
              className="w-7 h-7 rounded-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white"></span>
          </button>
        </div>
      </div>
    </header>
  );
};
