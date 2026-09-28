import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Heart, User } from 'lucide-react';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const isPartner = user.role === 'partner';

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

        {/* User Profile Avatar */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-700 hidden sm:inline">
            {user.full_name}
          </span>
          <button
            onClick={() => navigate(isPartner ? '/partner/profile' : '/woman/profile')}
            className="relative p-0.5 rounded-full ring-2 ring-rose-200 hover:ring-rose-400 transition"
            aria-label="Open profile"
          >
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-semibold">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white"></span>
          </button>
        </div>
      </div>
    </header>
  );
};
