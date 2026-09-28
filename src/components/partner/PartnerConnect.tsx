import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCycle } from '../../context/CycleContext';
import { db } from '../../lib/db';
import { useNavigate } from 'react-router-dom';
import { HeartHandshake, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export const PartnerConnect: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useCycle();
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!code.trim()) {
      addToast('Please enter a 6-character connection code', 'warning');
      return;
    }

    setLoading(true);
    try {
      await db.requestConnectionByCode(user.id, code.trim());
      setSuccess(true);
      addToast('Connection request sent! Awaiting your partner’s approval.', 'success');
    } catch (err: any) {
      addToast(err?.message || 'Could not connect with this code', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-12">
      <div className="bg-white rounded-3xl p-6 shadow-soft border border-rose-100">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
          <HeartHandshake className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-bold font-display text-gray-900 text-center mb-1">
          Connect to HerCycle
        </h2>
        <p className="text-xs text-gray-500 text-center mb-6 max-w-xs mx-auto">
          Enter the unique 6-character invite code provided by your partner in her app (e.g. <span className="font-mono font-bold text-rose-500">HER-789</span>).
        </p>

        {success ? (
          <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-rose-500 mx-auto" />
            <h4 className="text-sm font-bold text-gray-900">
              Request Sent Successfully!
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Your partner has received your connection request. Once she clicks <strong>Approve</strong> in her app, your read-only partner dashboard will activate.
            </p>
            <button
              onClick={() => navigate('/partner/home')}
              className="w-full py-2.5 rounded-full bg-rose-500 text-white font-bold text-xs"
            >
              Go to Partner Home
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5 text-center">
                6-Character Pairing Code
              </label>
              <input
                type="text"
                placeholder="e.g. HER-789"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                className="w-full text-center text-xl font-mono tracking-widest uppercase p-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                maxLength={8}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-md shadow-rose-200 hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Submitting...' : 'Send Connection Request'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
