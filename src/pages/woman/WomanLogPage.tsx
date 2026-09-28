import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { QuickLogForm } from '../../components/log/QuickLogForm';
import { formatDateYMD } from '../../lib/cycleCalculator';

export const WomanLogPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date') || formatDateYMD(new Date());

  return (
    <div className="max-w-md mx-auto p-4 animate-fade-in">
      <div className="mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 block mb-0.5">
          Health Logging
        </span>
        <h2 className="text-xl font-bold font-display text-gray-900 leading-tight">
          Log Symptoms & Flow
        </h2>
        <p className="text-xs text-gray-500">
          Record your daily sensations to improve cycle estimates.
        </p>
      </div>

      <QuickLogForm initialDate={dateParam} />
    </div>
  );
};
