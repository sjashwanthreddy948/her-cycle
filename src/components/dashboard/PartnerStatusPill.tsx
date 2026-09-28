import React from 'react';
import { useCycle } from '../../context/CycleContext';
import { useNavigate } from 'react-router-dom';
import { Users, Heart, ChevronRight, Pause, ShieldCheck } from 'lucide-react';

export const PartnerStatusPill: React.FC = () => {
  const { partnerConnection, sharingPermissions } = useCycle();
  const navigate = useNavigate();

  const isConnected = partnerConnection && partnerConnection.status === 'active';
  const isPaused = partnerConnection?.is_paused;
  const isPending = partnerConnection && partnerConnection.status === 'pending';

  const sharedCount = Object.values(sharingPermissions).filter(Boolean).length;

  return (
    <div
      onClick={() => navigate('/woman/partner')}
      className="bg-gradient-to-r from-rose-50/80 to-pink-50/80 border border-rose-200/60 rounded-3xl p-4 flex items-center justify-between cursor-pointer hover:shadow-soft transition-all active:scale-[0.99] group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-rose-500 shadow-sm border border-rose-100 group-hover:scale-105 transition-transform">
          <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-900 font-display">
              {isConnected
                ? `Sharing with ${partnerConnection.partner_name || 'Alex'}`
                : isPending
                ? 'Partner Connection Pending'
                : 'Partner Sharing'}
            </span>
            {isPaused && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center gap-0.5">
                <Pause className="w-2.5 h-2.5" /> Paused
              </span>
            )}
            {isConnected && !isPaused && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5" /> Protected
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {isConnected
              ? `${sharedCount} health fields shared · Read-only for partner`
              : 'Keep partner informed with safe read-only controls'}
          </p>
        </div>
      </div>

      <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-gray-400 group-hover:text-rose-500 group-hover:bg-white transition-all shadow-xs">
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
};
