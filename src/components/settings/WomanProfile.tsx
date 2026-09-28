import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCycle } from '../../context/CycleContext';
import { 
  Heart, 
  ShieldCheck, 
  LogOut, 
  ChevronRight, 
  Sparkles 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Disclaimer } from '../common/Disclaimer';

export const WomanProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const { cycleProfile, updateCycleProfile, partnerConnection } = useCycle();
  const navigate = useNavigate();

  const [cycleLength, setCycleLength] = useState<number>(cycleProfile.average_cycle_length || 28);
  const [periodLength, setPeriodLength] = useState<number>(cycleProfile.average_period_length || 5);
  const [isEditingCycle, setIsEditingCycle] = useState(false);

  const handleSaveCycle = async () => {
    await updateCycleProfile({
      average_cycle_length: Number(cycleLength),
      average_period_length: Number(periodLength),
    });
    setIsEditingCycle(false);
  };

  return (
    <div className="space-y-4 max-w-md mx-auto pb-12">
      {/* User Card */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100 flex items-center gap-4">
        <div className="relative">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-16 h-16 rounded-full object-cover ring-4 ring-rose-100"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xl font-bold ring-4 ring-rose-100">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>
        <div>
          <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wide block">
            Account Profile
          </span>
          <h2 className="text-lg font-bold font-display text-gray-900 leading-tight">
            {user?.full_name || 'HerCycle Member'}
          </h2>
          <p className="text-xs text-gray-500">{user?.email || ''}</p>
          {user?.age && <p className="text-[11px] text-gray-400 mt-0.5">Age: {user.age}</p>}
        </div>
      </div>

      {/* Cycle Parameters */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Cycle Configuration
          </h3>
          <button
            onClick={() => {
              if (isEditingCycle) handleSaveCycle();
              else setIsEditingCycle(true);
            }}
            className="text-xs font-bold text-rose-500 hover:text-rose-600"
          >
            {isEditingCycle ? 'Save Changes' : 'Edit Lengths'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-semibold text-gray-400 block mb-1">AVG CYCLE</span>
            {isEditingCycle ? (
              <input
                type="number"
                value={cycleLength}
                onChange={e => setCycleLength(Number(e.target.value))}
                className="w-full p-1 text-sm font-bold bg-white border border-gray-200 rounded-lg text-gray-900"
              />
            ) : (
              <span className="text-base font-bold text-gray-900">{cycleLength} days</span>
            )}
          </div>

          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-semibold text-gray-400 block mb-1">AVG PERIOD</span>
            {isEditingCycle ? (
              <input
                type="number"
                value={periodLength}
                onChange={e => setPeriodLength(Number(e.target.value))}
                className="w-full p-1 text-sm font-bold bg-white border border-gray-200 rounded-lg text-gray-900"
              />
            ) : (
              <span className="text-base font-bold text-gray-900">{periodLength} days</span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100 space-y-2">
        <button
          onClick={() => navigate('/woman/partner')}
          className="w-full p-3 rounded-2xl bg-gray-50 hover:bg-rose-50 border border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-800 transition"
        >
          <div className="flex items-center gap-2.5">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Partner Sharing Settings</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <span className="text-[11px] text-emerald-600 font-bold">
              {partnerConnection?.status === 'approved' ? 'Connected' : 'Configure'}
            </span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>

        <button
          onClick={() => navigate('/woman/privacy')}
          className="w-full p-3 rounded-2xl bg-gray-50 hover:bg-rose-50 border border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-800 transition"
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-rose-500" />
            <span>Privacy & Data Export</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        <button
          onClick={() => navigate('/woman/phases')}
          className="w-full p-3 rounded-2xl bg-gray-50 hover:bg-rose-50 border border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-800 transition"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Explore 4 Cycle Phases</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        <button
          onClick={() => logout()}
          className="w-full p-3 rounded-2xl bg-gray-50 hover:bg-rose-50 border border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-800 transition"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4 text-gray-600" />
            <span>Log Out</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <Disclaimer />
    </div>
  );
};
