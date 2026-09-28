import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/database';
import { 
  Heart, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import { Disclaimer } from '../components/common/Disclaimer';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<UserRole>('woman');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<number>(26);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2 (Woman specific)
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [periodLength, setPeriodLength] = useState<number>(5);
  const [lastPeriodStart, setLastPeriodStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 11);
    return d.toISOString().split('T')[0];
  });

  // Step 3 Goals
  const [goals, setGoals] = useState<string[]>([
    'Cycle tracking',
    'Understanding my symptoms',
  ]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const goalOptions = [
    'Cycle tracking',
    'Understanding my symptoms',
    'Wellness tracking',
    'Trying to understand my cycle patterns',
  ];

  const toggleGoal = (g: string) => {
    setGoals(prev =>
      prev.includes(g) ? prev.filter(item => item !== g) : [...prev, g]
    );
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === 1) {
      if (!fullName.trim() || !email.trim() || !password) {
        setError('Please fill in all required fields.');
        return;
      }
      if (age < 10 || age > 100) {
        setError('Age must be between 10 and 100.');
        return;
      }
      if (password.length < 10) {
        setError('Password must be at least 10 characters for security.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      if (role === 'partner') {
        // Partners don't need cycle length setup, skip to finish
        handleFinish();
        return;
      }

      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleFinish = async () => {
    setError(null);
    setLoading(true);

    try {
      const created = await register({
        email,
        password,
        fullName,
        role,
        age,
        cycleLength,
        periodLength,
        lastPeriodStart,
        goals,
      });

      if (created.role === 'partner') {
        navigate('/partner/connect');
      } else {
        navigate('/woman/home');
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F7] to-[#FDE8EE] flex flex-col justify-between px-4 py-8 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center pt-2">
        <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center shadow-sm">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-2xl font-bold font-display text-gray-900 tracking-tight">
            HerCycle
          </span>
        </Link>
        <h2 className="text-xl font-bold text-gray-900">
          Create Account
        </h2>
        <p className="text-xs text-gray-500">
          Step {step} of {role === 'partner' ? 1 : 3}
        </p>

        {/* Step Indicator Progress Bar */}
        <div className="flex gap-1.5 max-w-[160px] mx-auto mt-2">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-rose-500' : 'bg-gray-200'}`} />
          {role === 'woman' && (
            <>
              <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-rose-500' : 'bg-gray-200'}`} />
              <div className={`h-1 flex-1 rounded-full ${step >= 3 ? 'bg-rose-500' : 'bg-gray-200'}`} />
            </>
          )}
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-6 shadow-soft border border-rose-100 my-4">
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: ACCOUNT & ROLE */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-4">
            {/* Role Toggle */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Who are you creating this account for?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('woman')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    role === 'woman'
                      ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  <span className="text-xs font-bold block mb-0.5">I'm Tracking</span>
                  <span className="text-[10px] text-gray-500 leading-tight block">
                    My own cycle & wellness
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('partner')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    role === 'partner'
                      ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  <span className="text-xs font-bold block mb-0.5">I'm a Partner</span>
                  <span className="text-[10px] text-gray-500 leading-tight block">
                    Supporting my partner
                  </span>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Elena Vance"
                required
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>

            {/* Age */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-gray-700 mb-1">
                <span>Age</span>
                <span className="text-rose-600 font-bold">{age} years old</span>
              </div>
              <input
                type="number"
                min="10"
                max="100"
                value={age}
                onChange={e => setAge(Number(e.target.value))}
                required
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@domain.com"
                required
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 10 characters"
                required
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md shadow-rose-200 transition flex items-center justify-center gap-2"
            >
              <span>{role === 'partner' ? 'Create Partner Account' : 'Continue to Cycle Details'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: CYCLE BASELINE (Woman only) */}
        {step === 2 && (
          <form onSubmit={handleNext} className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900">
              Your Baseline Rhythm
            </h3>
            <p className="text-xs text-gray-500">
              These initial estimates help HerCycle calibrate your cycle ring and phases.
            </p>

            {/* Cycle Length Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-gray-700 mb-1">
                <span>Average Cycle Length</span>
                <span className="text-rose-600 font-bold">{cycleLength} days</span>
              </div>
              <input
                type="range"
                min="20"
                max="45"
                value={cycleLength}
                onChange={e => setCycleLength(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                <span>20 days</span>
                <span>Typical: 28</span>
                <span>45 days</span>
              </div>
            </div>

            {/* Period Length Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-gray-700 mb-1">
                <span>Average Period Duration</span>
                <span className="text-rose-600 font-bold">{periodLength} days</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                value={periodLength}
                onChange={e => setPeriodLength(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                <span>2 days</span>
                <span>Typical: 5</span>
                <span>10 days</span>
              </div>
            </div>

            {/* Last Period Start */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                When did your last period start?
              </label>
              <input
                type="date"
                value={lastPeriodStart}
                onChange={e => setLastPeriodStart(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-full border border-gray-200 text-gray-600 text-xs font-semibold flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md shadow-rose-200 transition flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: GOALS (Woman only) */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                What would you like to use HerCycle for?
              </h3>
              <p className="text-xs text-gray-500">
                Choose all goals that align with your health journey.
              </p>
            </div>

            <div className="space-y-2">
              {goalOptions.map(g => {
                const isSelected = goals.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGoal(g)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{g}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-rose-500 bg-rose-500 text-white' : 'border-gray-300'}`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-3 rounded-full border border-gray-200 text-gray-600 text-xs font-semibold flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleFinish}
                className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-md shadow-rose-200 hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Setting up...' : 'Complete Registration'}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-rose-500 hover:underline">
          Sign In
        </Link>
      </div>

      <Disclaimer compact />
    </div>
  );
};
