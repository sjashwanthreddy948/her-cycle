import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/db';
import { 
  User, 
  Heart, 
  ShieldCheck, 
  Bell, 
  LogOut, 
  UserMinus, 
  ExternalLink 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Disclaimer } from '../common/Disclaimer';

export const PartnerProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [partnerData, setPartnerData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      if (user) {
        const data = await db.getPartnerViewData(user.id);
        setPartnerData(data);
      }
    }
    load();
  }, [user]);

  const womanName = partnerData?.womanName || 'Sarah';
  const isConnected = partnerData?.isConnected;
  const isPaused = partnerData?.isPaused;
  const permissions = partnerData?.permissions || {};
  const activeCount = Object.values(permissions).filter(Boolean).length;

  return (
    <div className="space-y-4 max-w-md mx-auto pb-12">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100 flex items-center gap-4">
        <div className="relative">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
            alt={user?.full_name}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-rose-100"
          />
          <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>
        <div>
          <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wide block">
            Partner Account
          </span>
          <h2 className="text-lg font-bold font-display text-gray-900 leading-tight">
            {user?.full_name || 'Alex Miller'}
          </h2>
          <p className="text-xs text-gray-500">{user?.email || 'demo.partner@hercycle.app'}</p>
        </div>
      </div>

      {/* Connection Status Card */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Partner Sync
        </h3>

        {isConnected ? (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/70 border border-rose-100">
              <div className="flex items-center gap-2.5">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <div>
                  <span className="font-bold text-gray-800 block text-xs">
                    Connected to {womanName}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {isPaused ? 'Sharing is currently paused by her' : `${activeCount} fields permitted`}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {isPaused ? 'Paused' : 'Active'}
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="font-semibold text-gray-700 block mb-1">
                Permission Safeguards:
              </span>
              <p className="text-gray-500 leading-relaxed text-[11px]">
                Your account holds read-only access. You can view only the items {womanName} has toggled ON in her private settings.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-gray-500 mb-3">You are not paired to any account yet.</p>
            <button
              onClick={() => navigate('/partner/connect')}
              className="px-5 py-2.5 rounded-full bg-rose-500 text-white font-bold text-xs"
            >
              Enter Pairing Code
            </button>
          </div>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100 space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Notification Preferences
        </h3>

        <div className="space-y-2 text-xs">
          <label className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 cursor-pointer">
            <div>
              <span className="font-semibold text-gray-800 block">Upcoming period alert</span>
              <span className="text-[11px] text-gray-500">Discreet heads-up 2 days before</span>
            </div>
            <input type="checkbox" defaultChecked className="accent-rose-500 w-4 h-4 rounded" />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 cursor-pointer">
            <div>
              <span className="font-semibold text-gray-800 block">Mood update</span>
              <span className="text-[11px] text-gray-500">When she shares a new daily check-in</span>
            </div>
            <input type="checkbox" defaultChecked className="accent-rose-500 w-4 h-4 rounded" />
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100 space-y-2">
        <button
          onClick={() => navigate('/partner/support')}
          className="w-full p-3 rounded-2xl bg-gray-50 hover:bg-rose-50 border border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-800 transition"
        >
          <span>Support Education Guide</span>
          <span className="text-rose-500 font-bold">Read →</span>
        </button>

        <button
          onClick={logout}
          className="w-full p-3 rounded-2xl bg-gray-50 hover:bg-rose-50 border border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-800 transition"
        >
          <div className="flex items-center gap-2 text-gray-600">
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </div>
        </button>
      </div>

      <Disclaimer />
    </div>
  );
};
