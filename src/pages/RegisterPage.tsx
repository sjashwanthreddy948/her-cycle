import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/database';
import { calculateAge } from '../lib/cycleCalculator';
import { 
  Heart, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  AlertCircle,
  Upload,
  ShieldCheck,
  Calendar,
  Lock,
  User,
  HeartHandshake
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [role, setRole] = useState<UserRole>('woman');
  
  // Step 1: Credentials
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('2000-01-01');

  // Step 3: Cycle Setup (for Woman)
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [periodLength, setPeriodLength] = useState<number>(5);
  const [lastPeriodStart, setLastPeriodStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 11);
    return d.toISOString().split('T')[0];
  });

  // Step 4: Profile Photo
  const [avatarUrl, setAvatarUrl] = useState<string>('/assets/woman-portrait.png');

  // Shared state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const calculatedAge = calculateAge(dateOfBirth);

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!dateOfBirth) {
      setError('Date of birth is required.');
      return;
    }
    const ageFromDob = calculateAge(dateOfBirth);
    if (ageFromDob === null || ageFromDob < 10 || ageFromDob > 100) {
      setError('Please enter a valid Date of Birth (age must be between 10 and 100).');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setStep(2);
  };

  const handleStep2Next = () => {
    setError(null);
    if (role === 'partner') {
      // Skip cycle length setup for partner
      setAvatarUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');
      setStep(4);
    } else {
      setAvatarUrl('/assets/woman-portrait.png');
      setStep(3);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Image file must be under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
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
        dateOfBirth: role === 'woman' ? dateOfBirth : undefined,
        age: calculatedAge ?? undefined,
        avatarUrl,
        cycleLength: role === 'woman' ? cycleLength : undefined,
        periodLength: role === 'woman' ? periodLength : undefined,
        lastPeriodStart: role === 'woman' ? lastPeriodStart : undefined,
      });

      if (created.role === 'partner') {
        navigate('/partner/home');
      } else {
        navigate('/woman/home');
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F7] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl w-full bg-white rounded-4xl shadow-float border border-rose-100/80 p-6 sm:p-10">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-8">
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shadow-xs">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-lg font-black font-display text-gray-900">
              Her<span className="text-rose-500">Cycle</span>
            </span>
          </div>

          {/* Step indicator */}
          <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
            Step {step} of 5
          </span>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full h-1.5 bg-rose-50 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-300 rounded-full"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 1: CREDENTIALS                                      */}
        {/* ======================================================== */}
        {step === 1 && (
          <form onSubmit={handleStep1Next} className="space-y-4">
            <div>
              <h2 className="text-2xl font-black font-display text-gray-900 tracking-tight">
                Create your sanctuary
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Enter your details to create your secure private account.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Sarah Miller"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-rose-400 text-sm outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="sarah@example.com"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-rose-400 text-sm outline-none transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-700">Date of Birth</label>
                {calculatedAge !== null && (
                  <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/80">
                    Age: {calculatedAge} years
                  </span>
                )}
              </div>
              <input
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-rose-400 text-sm outline-none transition"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Required for health tracking. Your current age is computed dynamically from your birth date.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-rose-400 text-sm outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-rose-400 text-sm outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md shadow-rose-200 transition flex items-center justify-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ======================================================== */}
        {/* STEP 2: ACCOUNT TYPE (Woman / Partner)                    */}
        {/* ======================================================== */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black font-display text-gray-900 tracking-tight">
                Choose account type
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                HerCycle provides tailored interfaces for personal tracking and partner support.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setRole('woman')}
                className={`p-5 rounded-3xl border-2 cursor-pointer transition text-left space-y-2 select-none ${
                  role === 'woman'
                    ? 'border-rose-500 bg-rose-50/60 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Woman</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Track your cycle, logs, moods, symptoms, and choose what to share.
                </p>
              </div>

              <div
                onClick={() => setRole('partner')}
                className={`p-5 rounded-3xl border-2 cursor-pointer transition text-left space-y-2 select-none ${
                  role === 'partner'
                    ? 'border-rose-500 bg-rose-50/60 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Partner</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Enter her connection code to view her shared cycle rhythm and empathy tips.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleStep2Next}
                className="flex-1 py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-200 transition"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: CYCLE INFO (For Woman)                            */}
        {/* ======================================================== */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black font-display text-gray-900 tracking-tight">
                Your cycle baseline
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                We use these baseline numbers to estimate your phase and upcoming periods.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                  <span>Average Cycle Length</span>
                  <span className="text-rose-600">{cycleLength} days</span>
                </div>
                <input
                  type="range"
                  min={21}
                  max={45}
                  value={cycleLength}
                  onChange={e => setCycleLength(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
                <span className="text-[10px] text-gray-400">Typical range: 24 to 35 days</span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                  <span>Average Period Length</span>
                  <span className="text-rose-600">{periodLength} days</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={10}
                  value={periodLength}
                  onChange={e => setPeriodLength(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
                <span className="text-[10px] text-gray-400">Typical range: 3 to 7 days</span>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Last Period Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={lastPeriodStart}
                    onChange={e => setLastPeriodStart(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-rose-400 text-sm outline-none"
                  />
                  <Calendar className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-3 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex-1 py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-200 transition"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 4: PROFILE PHOTO (Upload or Choose Avatar)          */}
        {/* ======================================================== */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black font-display text-gray-900 tracking-tight">
                Profile photo
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Choose an avatar or upload your photo for your profile and partner connection.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Current Selected Avatar Preview */}
            <div className="flex flex-col items-center justify-center p-4">
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt="Profile Preview"
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-rose-200 shadow-md"
                />
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 px-4 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Custom Photo</span>
              </button>
            </div>

            {/* Preset Avatars */}
            <div>
              <span className="text-xs font-bold text-gray-700 block mb-2 text-center">
                Or choose an avatar
              </span>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setAvatarUrl('/assets/woman-portrait.png')}
                  className={`w-12 h-12 rounded-full overflow-hidden border-2 transition ${
                    avatarUrl === '/assets/woman-portrait.png' ? 'border-rose-500 ring-2 ring-rose-300' : 'border-gray-200'
                  }`}
                >
                  <img src="/assets/woman-portrait.png" alt="Avatar option" className="w-full h-full object-cover" />
                </button>

                <button
                  type="button"
                  onClick={() => setAvatarUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80')}
                  className={`w-12 h-12 rounded-full overflow-hidden border-2 transition ${
                    avatarUrl.includes('photo-1534528741775') ? 'border-rose-500 ring-2 ring-rose-300' : 'border-gray-200'
                  }`}
                >
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" alt="Partner" className="w-full h-full object-cover" />
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(role === 'woman' ? 3 : 2)}
                className="px-5 py-3 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="flex-1 py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-200 transition"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 5: PRIVACY SETUP                                    */}
        {/* ======================================================== */}
        {step === 5 && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-black font-display text-gray-900 tracking-tight">
                Your information is private by default.
              </h2>
              <p className="text-xs text-gray-600 mt-2 max-w-sm mx-auto leading-relaxed">
                HerCycle is designed with strict database security. Even if you link a partner in the future, your personal notes and weight will never be shared unless you explicitly turn them on.
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-rose-50/60 border border-rose-100 text-xs text-gray-700 text-left space-y-2">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero third-party trackers or advertisements</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Database row-level security isolates all data</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>One-click export and account deletion anytime</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-5 py-3 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition"
              >
                Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleFinish}
                className="flex-1 py-3.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md shadow-rose-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <span>Enter Sanctuary</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Existing account prompt */}
        <div className="mt-8 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-rose-600 hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};
