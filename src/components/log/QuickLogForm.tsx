import React, { useState, useEffect } from 'react';
import { useCycle } from '../../context/CycleContext';
import { 
  formatDateYMD, 
  parseDateYMD, 
  addDays 
} from '../../lib/cycleCalculator';
import { FlowLevel, MoodLevel, EnergyLevel } from '../../types/database';
import { SYMPTOMS_LIST } from '../../lib/constants';
import { 
  ChevronLeft, 
  ChevronRight, 
  Droplet, 
  Moon, 
  GlassWater, 
  Scale, 
  FileText, 
  Sparkles, 
  Check, 
  Calendar 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickLogFormProps {
  initialDate?: string;
  onSaved?: () => void;
}

export const QuickLogForm: React.FC<QuickLogFormProps> = ({ initialDate, onSaved }) => {
  const { dailyLogs, periodLogs, saveLogForDate, addPeriodLog, cycleProfile } = useCycle();
  const navigate = useNavigate();

  const [currentDateStr, setCurrentDateStr] = useState<string>(
    initialDate || formatDateYMD(new Date())
  );

  const isToday = currentDateStr === formatDateYMD(new Date());

  // Existing log for this day
  const existingDaily = dailyLogs.find(d => d.log_date === currentDateStr);
  const existingPeriod = periodLogs.find(p => {
    const start = p.start_date;
    const end = p.end_date || start;
    return currentDateStr >= start && currentDateStr <= end;
  });

  // State
  const [flow, setFlow] = useState<FlowLevel>(existingPeriod?.flow || existingDaily?.flow || 'none');
  const [periodStarted, setPeriodStarted] = useState<boolean>(
    Boolean(existingPeriod && existingPeriod.start_date === currentDateStr)
  );
  const [periodEnded, setPeriodEnded] = useState<boolean>(
    Boolean(existingPeriod && existingPeriod.end_date === currentDateStr)
  );
  const [mood, setMood] = useState<MoodLevel | undefined>(existingDaily?.mood || 'good');
  const [energy, setEnergy] = useState<EnergyLevel | undefined>(existingDaily?.energy || 'medium');
  const [symptoms, setSymptoms] = useState<string[]>(existingDaily?.symptoms || []);
  const [sleepHours, setSleepHours] = useState<number>(existingDaily?.sleep_hours ?? 7.5);
  const [waterGlasses, setWaterGlasses] = useState<number>(existingDaily?.water_glasses ?? 8);
  const [weight, setWeight] = useState<string>(existingDaily?.weight ? String(existingDaily.weight) : '');
  const [notes, setNotes] = useState<string>(existingDaily?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state whenever date changes
  useEffect(() => {
    const daily = dailyLogs.find(d => d.log_date === currentDateStr);
    const period = periodLogs.find(p => {
      const start = p.start_date;
      const end = p.end_date || start;
      return currentDateStr >= start && currentDateStr <= end;
    });

    setFlow(period?.flow || daily?.flow || 'none');
    setPeriodStarted(Boolean(period && period.start_date === currentDateStr));
    setPeriodEnded(Boolean(period && period.end_date === currentDateStr));
    setMood(daily?.mood || 'good');
    setEnergy(daily?.energy || 'medium');
    setSymptoms(daily?.symptoms || []);
    setSleepHours(daily?.sleep_hours ?? 7.5);
    setWaterGlasses(daily?.water_glasses ?? 8);
    setWeight(daily?.weight ? String(daily.weight) : '');
    setNotes(daily?.notes || '');
  }, [currentDateStr, dailyLogs, periodLogs]);

  // Date steppers
  const handlePrevDay = () => {
    const prev = addDays(parseDateYMD(currentDateStr), -1);
    setCurrentDateStr(formatDateYMD(prev));
  };

  const handleNextDay = () => {
    const next = addDays(parseDateYMD(currentDateStr), 1);
    setCurrentDateStr(formatDateYMD(next));
  };

  const handleJumpToday = () => {
    setCurrentDateStr(formatDateYMD(new Date()));
  };

  const toggleSymptom = (id: string) => {
    setSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Save daily log
      await saveLogForDate(currentDateStr, {
        flow,
        mood,
        energy,
        symptoms,
        sleep_hours: Number(sleepHours),
        water_glasses: Number(waterGlasses),
        weight: weight ? parseFloat(weight) : undefined,
        notes: notes.trim() || undefined,
      });

      // 2. If period started toggle is on, record period log
      if (periodStarted) {
        await addPeriodLog({
          start_date: currentDateStr,
          flow: flow === 'none' ? 'medium' : flow,
          notes: notes.trim() || undefined,
        });
      }

      if (onSaved) {
        onSaved();
      } else {
        navigate('/woman/home');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const dateObj = parseDateYMD(currentDateStr);
  const readableDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <form onSubmit={handleSave} className="space-y-4 max-w-md mx-auto pb-12">
      {/* Top Date Stepper Header */}
      <div className="bg-white rounded-3xl p-4 shadow-soft border border-rose-100 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrevDay}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-rose-50 text-xs font-semibold text-gray-600 transition"
        >
          <ChevronLeft className="w-4 h-4 text-rose-500" />
          <span>Prev</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-sm font-bold font-display text-gray-900">
              {readableDate}
            </span>
            {isToday && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-extrabold uppercase">
                Today
              </span>
            )}
          </div>
          {!isToday && (
            <button
              type="button"
              onClick={handleJumpToday}
              className="text-[11px] text-rose-500 font-semibold hover:underline mt-0.5"
            >
              Jump to Today
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleNextDay}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-rose-50 text-xs font-semibold text-gray-600 transition"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4 text-rose-500" />
        </button>
      </div>

      {/* 1. PERIOD SECTION */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
            <Droplet className="w-4 h-4 fill-rose-500" />
          </div>
          <h3 className="text-sm font-bold font-display text-gray-900 uppercase tracking-wide">
            Period & Flow
          </h3>
        </div>

        {/* Start / End Toggles */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <button
            type="button"
            onClick={() => {
              setPeriodStarted(prev => !prev);
              if (!periodStarted && flow === 'none') setFlow('medium');
            }}
            className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
              periodStarted
                ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-rose-50/50'
            }`}
          >
            <span>Period Started</span>
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${periodStarted ? 'border-white bg-white text-rose-500' : 'border-gray-300'}`}>
              {periodStarted && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPeriodEnded(prev => !prev)}
            className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
              periodEnded
                ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-rose-50/50'
            }`}
          >
            <span>Period Ended</span>
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${periodEnded ? 'border-white bg-white text-pink-500' : 'border-gray-300'}`}>
              {periodEnded && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </button>
        </div>

        {/* Flow Level */}
        <label className="text-xs font-semibold text-gray-700 block mb-2">
          Flow Intensity
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'none', label: 'None', count: 0 },
            { id: 'light', label: 'Light', count: 1 },
            { id: 'medium', label: 'Medium', count: 2 },
            { id: 'heavy', label: 'Heavy', count: 3 },
          ].map(item => {
            const isSelected = flow === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFlow(item.id as FlowLevel)}
                className={`py-3 px-1 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-xs'
                    : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-rose-50/30'
                }`}
              >
                <div className="h-6 flex items-center mb-1">
                  {item.count === 0 ? (
                    <span className="text-xs text-gray-400">—</span>
                  ) : (
                    <div className="flex -space-x-1">
                      {Array.from({ length: item.count }).map((_, i) => (
                        <Droplet
                          key={i}
                          className={`w-4 h-4 ${isSelected ? 'fill-rose-500 text-rose-500' : 'fill-rose-300 text-rose-300'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SYMPTOMS SECTION (Circular icon buttons) */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
              <Sparkles className="w-4 h-4 text-rose-500" />
            </div>
            <h3 className="text-sm font-bold font-display text-gray-900 uppercase tracking-wide">
              Symptoms
            </h3>
          </div>
          <span className="text-[11px] text-gray-400 font-medium">
            {symptoms.length} selected
          </span>
        </div>

        {/* Circular symptom avatar buttons inspired by reference */}
        <div className="grid grid-cols-4 gap-2.5">
          {SYMPTOMS_LIST.map(sym => {
            const isSelected = symptoms.includes(sym.id);
            return (
              <button
                key={sym.id}
                type="button"
                onClick={() => toggleSymptom(sym.id)}
                className={`flex flex-col items-center text-center p-2 rounded-2xl border transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-xs'
                    : 'bg-gray-50/60 border-transparent hover:bg-rose-50/40 text-gray-600'
                }`}
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl mb-1.5 transition-transform ${
                  isSelected ? 'bg-rose-500 text-white shadow-xs scale-105' : 'bg-white shadow-xs'
                }`}>
                  {sym.icon}
                </div>
                <span className="text-[10px] font-medium leading-tight line-clamp-1">
                  {sym.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MOOD & ENERGY SECTION */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100">
        <h3 className="text-sm font-bold font-display text-gray-900 uppercase tracking-wide mb-3">
          Mood & Energy
        </h3>

        {/* Mood */}
        <div className="grid grid-cols-5 gap-1.5 mb-4">
          {[
            { id: 'great', emoji: '😊', label: 'Great' },
            { id: 'good', emoji: '🙂', label: 'Good' },
            { id: 'okay', emoji: '😐', label: 'Okay' },
            { id: 'low', emoji: '😔', label: 'Low' },
            { id: 'difficult', emoji: '😣', label: 'Difficult' },
          ].map(m => {
            const isSelected = mood === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMood(m.id as MoodLevel)}
                className={`py-2 px-1 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-xs scale-105'
                    : 'bg-gray-50/60 border-transparent text-gray-600'
                }`}
              >
                <span className="text-2xl mb-1">{m.emoji}</span>
                <span className="text-[10px] font-medium">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Energy */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'low', label: 'Low', icon: '🔋' },
            { id: 'medium', label: 'Medium', icon: '⚡' },
            { id: 'high', label: 'High', icon: '🚀' },
          ].map(e => {
            const isSelected = energy === e.id;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => setEnergy(e.id as EnergyLevel)}
                className={`py-2 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                  isSelected
                    ? 'bg-rose-500 border-rose-500 text-white shadow-xs'
                    : 'bg-gray-50 border-gray-100 text-gray-600'
                }`}
              >
                <span>{e.icon}</span>
                <span>{e.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. SLEEP, WATER & WEIGHT */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100 space-y-4">
        <h3 className="text-sm font-bold font-display text-gray-900 uppercase tracking-wide">
          Vitals & Habits
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Sleep */}
          <div className="bg-gray-50/80 rounded-2xl p-3 border border-gray-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-2">
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
              <span>Sleep (hours)</span>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSleepHours(prev => Math.max(0, Number((prev - 0.5).toFixed(1))))}
                className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-700 font-bold flex items-center justify-center hover:bg-gray-50"
              >
                -
              </button>
              <span className="text-base font-bold text-gray-900 font-display">
                {sleepHours}h
              </span>
              <button
                type="button"
                onClick={() => setSleepHours(prev => Math.min(24, Number((prev + 0.5).toFixed(1))))}
                className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-700 font-bold flex items-center justify-center hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          {/* Water */}
          <div className="bg-gray-50/80 rounded-2xl p-3 border border-gray-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-2">
              <GlassWater className="w-3.5 h-3.5 text-sky-500" />
              <span>Water (glasses)</span>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setWaterGlasses(prev => Math.max(0, prev - 1))}
                className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-700 font-bold flex items-center justify-center hover:bg-gray-50"
              >
                -
              </button>
              <span className="text-base font-bold text-gray-900 font-display">
                {waterGlasses}
              </span>
              <button
                type="button"
                onClick={() => setWaterGlasses(prev => Math.min(20, prev + 1))}
                className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-700 font-bold flex items-center justify-center hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Weight */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
            <Scale className="w-3.5 h-3.5 text-emerald-500" />
            <span>Weight (kg, optional)</span>
          </div>
          <input
            type="number"
            step="0.1"
            placeholder="e.g. 58.5"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>
      </div>

      {/* 5. NOTES */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold font-display text-gray-900 uppercase tracking-wide">
            Private Notes
          </h3>
        </div>
        <p className="text-[11px] text-gray-400 mb-2">
          Always private unless you explicitly enable note sharing.
        </p>
        <textarea
          rows={3}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="How did your body feel today? What brought you joy or calm?"
          className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
        />
      </div>

      {/* SUBMIT BUTTON */}
      <div className="sticky bottom-20 z-20">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-float hover:shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving...' : 'Save Log'}</span>
        </button>
      </div>
    </form>
  );
};
