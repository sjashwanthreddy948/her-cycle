import React, { useState, useEffect } from 'react';
import { useCycle } from '../../context/CycleContext';
import { FlowLevel, MoodLevel, EnergyLevel } from '../../types/database';
import { SYMPTOMS_LIST } from '../../lib/constants';
import { Droplet, Moon, GlassWater, Scale, Heart, Sparkles, Check } from 'lucide-react';

export const TodayCheckIn: React.FC = () => {
  const { todayLog, saveTodayCheckIn } = useCycle();

  const [mood, setMood] = useState<MoodLevel | undefined>(todayLog?.mood || 'great');
  const [energy, setEnergy] = useState<EnergyLevel | undefined>(todayLog?.energy || 'high');
  const [flow, setFlow] = useState<FlowLevel>(todayLog?.flow || 'none');
  const [symptoms, setSymptoms] = useState<string[]>(todayLog?.symptoms || []);
  const [sleepHours, setSleepHours] = useState<number>(todayLog?.sleep_hours ?? 8);
  const [waterGlasses, setWaterGlasses] = useState<number>(todayLog?.water_glasses ?? 7);
  const [weight, setWeight] = useState<string>(todayLog?.weight ? String(todayLog.weight) : '');
  const [notes, setNotes] = useState<string>(todayLog?.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (todayLog) {
      if (todayLog.mood) setMood(todayLog.mood);
      if (todayLog.energy) setEnergy(todayLog.energy);
      if (todayLog.flow) setFlow(todayLog.flow);
      if (todayLog.symptoms) setSymptoms(todayLog.symptoms);
      if (todayLog.sleep_hours !== undefined) setSleepHours(todayLog.sleep_hours);
      if (todayLog.water_glasses !== undefined) setWaterGlasses(todayLog.water_glasses);
      if (todayLog.weight !== undefined) setWeight(String(todayLog.weight));
      if (todayLog.notes) setNotes(todayLog.notes);
    }
  }, [todayLog]);

  const toggleSymptom = (id: string) => {
    setSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveTodayCheckIn({
        mood,
        energy,
        flow,
        symptoms,
        sleep_hours: Number(sleepHours),
        water_glasses: Number(waterGlasses),
        weight: weight ? parseFloat(weight) : undefined,
        notes: notes.trim() || undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const moods: { level: MoodLevel; emoji: string; label: string }[] = [
    { level: 'great', emoji: '😊', label: 'Great' },
    { level: 'good', emoji: '🙂', label: 'Good' },
    { level: 'okay', emoji: '😐', label: 'Okay' },
    { level: 'low', emoji: '😔', label: 'Low' },
    { level: 'difficult', emoji: '😣', label: 'Difficult' },
  ];

  const energies: { level: EnergyLevel; label: string; icon: string }[] = [
    { level: 'low', label: 'Low', icon: '🔋' },
    { level: 'medium', label: 'Medium', icon: '⚡' },
    { level: 'high', label: 'High', icon: '🚀' },
  ];

  const flows: { level: FlowLevel; label: string; drops: number }[] = [
    { level: 'none', label: 'None', drops: 0 },
    { level: 'light', label: 'Light', drops: 1 },
    { level: 'medium', label: 'Medium', drops: 2 },
    { level: 'heavy', label: 'Heavy', drops: 3 },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100/70">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-500 block mb-0.5">
            Daily Wellness
          </span>
          <h3 className="text-lg font-bold font-display text-gray-900 leading-tight">
            Today's Check-in
          </h3>
          <p className="text-xs text-gray-500">How are you feeling right now?</p>
        </div>
        <div className="w-9 h-9 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
          <Heart className="w-4 h-4 fill-rose-500/20" />
        </div>
      </div>

      {/* Mood Selector */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-gray-700 block mb-2">
          Mood
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {moods.map(m => {
            const isSelected = mood === m.level;
            return (
              <button
                key={m.level}
                type="button"
                onClick={() => setMood(m.level)}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-150 active:scale-95 border ${
                  isSelected
                    ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-sm scale-105'
                    : 'bg-gray-50/60 border-transparent hover:bg-rose-50/40 text-gray-600'
                }`}
              >
                <span className="text-2xl mb-1">{m.emoji}</span>
                <span className="text-[10px] font-medium leading-none">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Energy Selector */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-gray-700 block mb-2">
          Energy Level
        </label>
        <div className="grid grid-cols-3 gap-2">
          {energies.map(e => {
            const isSelected = energy === e.level;
            return (
              <button
                key={e.level}
                type="button"
                onClick={() => setEnergy(e.level)}
                className={`py-2 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                  isSelected
                    ? 'bg-rose-500 border-rose-500 text-white shadow-sm shadow-rose-200'
                    : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{e.icon}</span>
                <span>{e.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Flow Selector */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-gray-700 block mb-2">
          Period Flow
        </label>
        <div className="grid grid-cols-4 gap-2">
          {flows.map(f => {
            const isSelected = flow === f.level;
            return (
              <button
                key={f.level}
                type="button"
                onClick={() => setFlow(f.level)}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-rose-50 border-rose-400 text-rose-600 shadow-sm'
                    : 'bg-gray-50/70 border-gray-100 text-gray-500 hover:bg-rose-50/30'
                }`}
              >
                <div className="flex items-center justify-center h-6 mb-1">
                  {f.drops === 0 ? (
                    <span className="text-xs font-bold text-gray-400">—</span>
                  ) : (
                    <div className="flex items-center -space-x-1">
                      {Array.from({ length: f.drops }).map((_, i) => (
                        <Droplet
                          key={i}
                          className={`w-4 h-4 ${isSelected ? 'fill-rose-500 text-rose-500' : 'fill-rose-300 text-rose-300'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-medium leading-none">{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Symptoms Chips */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-700">
            Symptoms
          </label>
          <span className="text-[11px] text-gray-400">
            {symptoms.length} selected
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
          {SYMPTOMS_LIST.map(sym => {
            const isSelected = symptoms.includes(sym.id);
            return (
              <button
                key={sym.id}
                type="button"
                onClick={() => toggleSymptom(sym.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 border ${
                  isSelected
                    ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                    : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-rose-200 hover:bg-rose-50/40'
                }`}
              >
                <span>{sym.icon}</span>
                <span>{sym.name}</span>
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sleep & Water Steppers */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Sleep */}
        <div className="bg-gray-50/80 rounded-2xl p-3 border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-2">
            <Moon className="w-3.5 h-3.5 text-indigo-500" />
            <span>Sleep</span>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSleepHours(prev => Math.max(0, Number((prev - 0.5).toFixed(1))))}
              className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-700 font-bold flex items-center justify-center hover:bg-gray-50 active:scale-90"
            >
              -
            </button>
            <span className="text-base font-bold text-gray-900 font-display">
              {sleepHours}h
            </span>
            <button
              type="button"
              onClick={() => setSleepHours(prev => Math.min(24, Number((prev + 0.5).toFixed(1))))}
              className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-700 font-bold flex items-center justify-center hover:bg-gray-50 active:scale-90"
            >
              +
            </button>
          </div>
        </div>

        {/* Water */}
        <div className="bg-gray-50/80 rounded-2xl p-3 border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-2">
            <GlassWater className="w-3.5 h-3.5 text-sky-500" />
            <span>Water</span>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setWaterGlasses(prev => Math.max(0, prev - 1))}
              className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-700 font-bold flex items-center justify-center hover:bg-gray-50 active:scale-90"
            >
              -
            </button>
            <span className="text-base font-bold text-gray-900 font-display">
              {waterGlasses} <span className="text-xs font-normal text-gray-500">gl</span>
            </span>
            <button
              type="button"
              onClick={() => setWaterGlasses(prev => Math.min(20, prev + 1))}
              className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-700 font-bold flex items-center justify-center hover:bg-gray-50 active:scale-90"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        type="button"
        disabled={isSaving}
        onClick={handleSave}
        className="w-full py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-md shadow-rose-200 hover:shadow-lg hover:shadow-rose-300 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4" />
        <span>{isSaving ? 'Saving...' : "Save Today's Check-in"}</span>
      </button>
    </div>
  );
};
