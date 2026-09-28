import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/db';
import { formatDateYMD, parseDateYMD } from '../../lib/cycleCalculator';
import { ChevronLeft, ChevronRight, Lock, ShieldCheck } from 'lucide-react';

export const PartnerCalendar: React.FC = () => {
  const { user } = useAuth();
  const [partnerData, setPartnerData] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDayInfo, setSelectedDayInfo] = useState<any>(null);

  useEffect(() => {
    async function load() {
      if (user) {
        const data = await db.getPartnerViewData(user.id);
        setPartnerData(data);
      }
    }
    load();
  }, [user]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  if (!partnerData || !partnerData.isConnected) {
    return (
      <div className="max-w-md mx-auto p-4 text-center">
        <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-soft">
          <p className="text-xs text-gray-500">No partner connected.</p>
        </div>
      </div>
    );
  }

  const { womanName, permissions, calendarDays, cycleData } = partnerData;
  const daysMap = new Map<string, any>();
  (calendarDays || []).forEach((cd: any) => daysMap.set(cd.date, cd));

  return (
    <div className="space-y-4 max-w-md mx-auto pb-12">
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider block">
              Read-Only Calendar
            </span>
            <h2 className="text-xl font-bold font-display text-gray-900 leading-tight">
              {monthName}
            </h2>
            <span className="text-[11px] text-gray-400">
              Shared by {womanName}
            </span>
          </div>

          <div className="flex items-center gap-1">
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
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-xs font-bold text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = formatDateYMD(new Date(year, month, dayNum));
            const dayData = daysMap.get(dateStr);
            const isPeriod = permissions.period_status && dayData?.hasPeriod;
            const hasMood = permissions.mood && dayData?.mood;

            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDayInfo({ date: dateStr, dayNum, dayData })}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-1 border transition-all ${
                  isPeriod
                    ? 'bg-rose-500 text-white font-bold'
                    : 'bg-gray-50/70 border-gray-100 text-gray-700 hover:bg-rose-50/50'
                }`}
              >
                <span className="text-xs">{dayNum}</span>
                <div className="flex items-center gap-0.5 mt-0.5 h-1.5">
                  {isPeriod && <span className="w-1 h-1 rounded-full bg-white opacity-80" />}
                  {hasMood && <span className="w-1 h-1 rounded-full bg-amber-400" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-rose-50 flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span>Shared Period</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            <span>Shared Mood</span>
          </div>
          <span className="text-gray-400 italic">Private notes hidden</span>
        </div>
      </div>

      {/* Selected Date Modal or Card */}
      {selectedDayInfo && (
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100 animate-fade-in">
          <h4 className="text-sm font-bold text-gray-900 mb-2">
            Details for {selectedDayInfo.date}
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Period Status:</span>
              <span className="font-semibold text-gray-800">
                {permissions.period_status
                  ? selectedDayInfo.dayData?.hasPeriod ? 'Period Logged' : 'None'
                  : 'Hidden by partner'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Shared Mood:</span>
              <span className="font-semibold text-gray-800 capitalize">
                {permissions.mood
                  ? selectedDayInfo.dayData?.mood || 'Not logged'
                  : 'Hidden by partner'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Personal Notes:</span>
              <span className="text-gray-400 italic flex items-center gap-1">
                <Lock className="w-3 h-3" /> Sealed & Private
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
