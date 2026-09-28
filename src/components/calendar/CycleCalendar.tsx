import React, { useState } from 'react';
import { useCycle } from '../../context/CycleContext';
import { 
  formatDateYMD, 
  parseDateYMD, 
  addDays, 
  diffDays 
} from '../../lib/cycleCalculator';
import { ChevronLeft, ChevronRight, Droplet, Sparkles, Smile, Info } from 'lucide-react';

interface CycleCalendarProps {
  onSelectDate: (dateStr: string) => void;
  selectedDate: string;
}

export const CycleCalendar: React.FC<CycleCalendarProps> = ({ onSelectDate, selectedDate }) => {
  const { periodLogs, dailyLogs, cycleProfile, cycleState } = useCycle();

  // Current viewing month
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    return parseDateYMD(selectedDate) || new Date();
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Month navigation
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const jumpToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    onSelectDate(formatDateYMD(today));
  };

  // Month title
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Grid calculation: days of current month + padding
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Maps for quick day lookup
  const dailyLogMap = new Map<string, typeof dailyLogs[0]>();
  dailyLogs.forEach(dl => dailyLogMap.set(dl.log_date, dl));

  // Determine period ranges
  const isPeriodDay = (dateStr: string) => {
    return periodLogs.some(p => {
      const start = p.start_date;
      const end = p.end_date || formatDateYMD(addDays(parseDateYMD(start), (cycleProfile.average_period_length || 5) - 1));
      return dateStr >= start && dateStr <= end;
    });
  };

  // Check predicted period days based on cycle length
  const isPredictedPeriodDay = (dateStr: string) => {
    const target = parseDateYMD(dateStr);
    const today = new Date();
    // Only future dates are "predicted"
    if (target < today) return false;

    // Check future cycles up to 3 cycles ahead
    const cycleLength = cycleProfile.average_cycle_length || 28;
    const periodLength = cycleProfile.average_period_length || 5;
    const lastStart = parseDateYMD(cycleProfile.last_period_start || formatDateYMD(addDays(today, -11)));

    for (let c = 1; c <= 3; c++) {
      const predStart = addDays(lastStart, c * cycleLength);
      const predEnd = addDays(predStart, periodLength - 1);
      if (dateStr >= formatDateYMD(predStart) && dateStr <= formatDateYMD(predEnd)) {
        return true;
      }
    }
    return false;
  };

  // Fertile / Ovulation window estimation
  const isFertileDay = (dateStr: string) => {
    const cycleLength = cycleProfile.average_cycle_length || 28;
    const ovulationDay = Math.max(12, cycleLength - 14);
    const lastStart = parseDateYMD(cycleProfile.last_period_start || formatDateYMD(new Date()));
    const rawDiff = diffDays(parseDateYMD(dateStr), lastStart);
    const dayInCycle = (rawDiff % cycleLength) + 1;
    return dayInCycle >= ovulationDay - 5 && dayInCycle <= ovulationDay + 1;
  };

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100/70">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-500 block">
            Cycle Calendar
          </span>
          <h2 className="text-xl font-bold font-display text-gray-900 leading-tight">
            {monthName}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={jumpToToday}
            className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition mr-1"
          >
            Today
          </button>
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {daysOfWeek.map((day, idx) => (
          <div key={idx} className="text-xs font-bold text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {/* Leading empty days */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const date = new Date(year, month, dayNum);
          const dateStr = formatDateYMD(date);
          const isSelected = selectedDate === dateStr;
          const isToday = formatDateYMD(new Date()) === dateStr;

          const isPeriod = isPeriodDay(dateStr);
          const isPredicted = !isPeriod && isPredictedPeriodDay(dateStr);
          const isFertile = !isPeriod && !isPredicted && isFertileDay(dateStr);

          const log = dailyLogMap.get(dateStr);
          const hasSymptoms = log && log.symptoms && log.symptoms.length > 0;
          const hasMood = log && log.mood;
          const hasNotes = log && log.notes;

          // Styling logic
          let cellBg = 'hover:bg-rose-50/50 text-gray-700';
          let borderStyle = 'border-transparent';

          if (isPeriod) {
            cellBg = 'bg-rose-500 text-white font-bold shadow-xs';
          } else if (isPredicted) {
            cellBg = 'bg-rose-100/70 text-rose-700 font-semibold border-dashed border-rose-300';
          } else if (isFertile) {
            cellBg = 'bg-purple-50 text-purple-800 font-medium border border-purple-200/60';
          }

          if (isSelected) {
            borderStyle = isPeriod 
              ? 'ring-2 ring-offset-2 ring-rose-500' 
              : 'ring-2 ring-offset-2 ring-rose-400 border-rose-400 bg-rose-50';
          }

          return (
            <button
              key={dayNum}
              onClick={() => onSelectDate(dateStr)}
              className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center p-1 transition-all active:scale-90 border ${cellBg} ${borderStyle}`}
            >
              {/* Day number */}
              <span className={`text-xs ${isToday && !isPeriod ? 'font-extrabold text-rose-600 underline' : ''}`}>
                {dayNum}
              </span>

              {/* Indicator dots (Mood, Symptoms, Notes) */}
              <div className="flex items-center gap-0.5 mt-0.5 h-1.5">
                {isPeriod && <span className="w-1 h-1 rounded-full bg-white opacity-80" />}
                {!isPeriod && hasSymptoms && <span className="w-1 h-1 rounded-full bg-rose-400" />}
                {!isPeriod && hasMood && <span className="w-1 h-1 rounded-full bg-amber-400" />}
                {!isPeriod && hasNotes && <span className="w-1 h-1 rounded-full bg-indigo-400" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-rose-100/80 flex flex-wrap items-center justify-between text-[11px] text-gray-500 gap-y-1.5">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
          <span>Period</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-100 border border-dashed border-rose-300 inline-block" />
          <span>Predicted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-purple-100 border border-purple-300 inline-block" />
          <span>Fertile Window</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
          <span>Log Entry</span>
        </div>
      </div>
    </div>
  );
};
