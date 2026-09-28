import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { MEDICAL_DISCLAIMER_TEXT } from '../../lib/constants';

interface DisclaimerProps {
  compact?: boolean;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center justify-center gap-1.5 py-3 text-[11px] text-gray-600 text-center px-4">
        <ShieldAlert className="w-3.5 h-3.5 text-gray-500 shrink-0" />
        <span>Estimates based on logged data. Not a medical device or contraception.</span>
      </div>
    );
  }

  return (
    <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-4 my-6 text-xs text-gray-600 leading-relaxed shadow-sm">
      <div className="flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-gray-700 block mb-0.5">Medical & Health Disclaimer</span>
          <p>{MEDICAL_DISCLAIMER_TEXT}</p>
        </div>
      </div>
    </div>
  );
};
