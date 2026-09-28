import React, { useState } from 'react';
import { useCycle } from '../../context/CycleContext';
import { CycleCalendar } from '../../components/calendar/CycleCalendar';
import { DayDetailSheet } from '../../components/calendar/DayDetailSheet';
import { formatDateYMD } from '../../lib/cycleCalculator';
import { Disclaimer } from '../../components/common/Disclaimer';

export const WomanCalendarPage: React.FC = () => {
  const { selectedDate, setSelectedDate } = useCycle();
  const [showDetail, setShowDetail] = useState<boolean>(true);

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setShowDetail(true);
  };

  return (
    <div className="space-y-4 max-w-md mx-auto p-4 pb-20 animate-fade-in">
      {/* Monthly Menstrual Calendar */}
      <CycleCalendar
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
      />

      {/* Selected Day Detail Sheet */}
      {showDetail && (
        <DayDetailSheet
          dateStr={selectedDate}
          onClose={() => setShowDetail(false)}
        />
      )}

      <Disclaimer compact />
    </div>
  );
};
