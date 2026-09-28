import React from 'react';
import { useCycle } from '../../context/CycleContext';
import { parseDateYMD, diffDays, formatDateYMD } from '../../lib/cycleCalculator';
import { Droplet, Moon, GlassWater, Scale, Edit3, X, Sparkles, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DayDetailSheetProps {
  dateStr: string;
  onClose: () => void;
}

export const DayDetailSheet: React.FC<DayDetailSheetProps> = ({ dateStr, onClose }) => {
  const { dailyLogs, periodLogs, cycleProfile } = useCycle();
  const navigate = useNavigate();

  const log = dailyLogs.find(d => d.log_date === dateStr);
  const targetDate = parseDateYMD(dateStr);
  const formattedDate = targetDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate cycle day for this date
  const lastPeriod = cycleProfile.last_period_start ? parseDateYMD(cycleProfile.last_period_start) : new Date();
  const rawDiff = diffDays(targetDate, lastPeriod);
  const cycleLength = cycleProfile.average_cycle_length || 28;
  const cycleDay = ((rawDiff % cycleLength) + cycleLength) % cycleLength + 1;

  // Check period status on this date
  const periodMatch = periodLogs.find(p => {
    const start = p.start_date;
    const end = p.end_date || start;
    return dateStr >= start && dateStr <= end;
  });

  const isPeriod = Boolean(periodMatch || (log && log.flow && log.flow !== 'none'));
  const flowLevel = periodMatch?.flow || log?.flow || 'none';

  return (
    <div className="bg-white rounded-3xl p-5 shadow-float border border-rose-100 animate-fade-in">
      <div className="flex items-center justify-between pb-3 border-b border-rose-50 mb-3">
        <div>
          <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider block">
            Cycle Day {cycleDay} of {cycleLength}
          </span>
          <h3 className="text-base font-bold font-display text-gray-900 leading-tight">
            {formattedDate}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
          aria-label="Close day details"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Details Grid */}
      <div className="space-y-3 text-xs">
        {/* Period Status */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/70 border border-rose-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center">
              <Droplet className="w-4 h-4 fill-white" />
            </div>
            <div>
              <span className="font-bold text-gray-800 block text-xs">
                {isPeriod ? 'Period Logged' : 'No Period'}
              </span>
              <span className="text-[11px] text-gray-500 capitalize">
                Flow: {flowLevel}
              </span>
            </div>
          </div>
          {isPeriod && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">
              Active
            </span>
          )}
        </div>

        {/* Mood & Energy */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] font-semibold text-gray-400 block mb-0.5">MOOD</span>
            <span className="text-sm font-bold text-gray-800 capitalize">
              {log?.mood ? `${log.mood}` : '— Not logged'}
            </span>
          </div>
          <div className="p-2.5 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] font-semibold text-gray-400 block mb-0.5">ENERGY</span>
            <span className="text-sm font-bold text-gray-800 capitalize">
              {log?.energy ? `${log.energy}` : '— Not logged'}
            </span>
          </div>
        </div>

        {/* Symptoms */}
        {log?.symptoms && log.symptoms.length > 0 && (
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] font-semibold text-gray-400 block mb-1.5">SYMPTOMS</span>
            <div className="flex flex-wrap gap-1">
              {log.symptoms.map(s => (
                <span
                  key={s}
                  className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-medium capitalize"
                >
                  {s.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sleep & Water */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-2xl bg-gray-50 border border-gray-100 text-center">
            <span className="text-[10px] font-semibold text-gray-400 block">SLEEP</span>
            <span className="text-xs font-bold text-gray-800">
              {log?.sleep_hours ? `${log.sleep_hours} hrs` : '—'}
            </span>
          </div>
          <div className="p-2 rounded-2xl bg-gray-50 border border-gray-100 text-center">
            <span className="text-[10px] font-semibold text-gray-400 block">WATER</span>
            <span className="text-xs font-bold text-gray-800">
              {log?.water_glasses ? `${log.water_glasses} glasses` : '—'}
            </span>
          </div>
          <div className="p-2 rounded-2xl bg-gray-50 border border-gray-100 text-center">
            <span className="text-[10px] font-semibold text-gray-400 block">WEIGHT</span>
            <span className="text-xs font-bold text-gray-800">
              {log?.weight ? `${log.weight} kg` : '—'}
            </span>
          </div>
        </div>

        {/* Notes */}
        {log?.notes && (
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] font-semibold text-gray-400 block mb-1">NOTES</span>
            <p className="text-xs text-gray-700 italic">"{log.notes}"</p>
          </div>
        )}
      </div>

      {/* Action button: Edit Log */}
      <button
        onClick={() => navigate(`/woman/log?date=${dateStr}`)}
        className="w-full mt-4 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm shadow-rose-200 transition flex items-center justify-center gap-1.5"
      >
        <Edit3 className="w-3.5 h-3.5" />
        <span>Edit Log for this Day</span>
      </button>
    </div>
  );
};
