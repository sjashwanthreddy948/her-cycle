import React from 'react';
import { PartnerCalendar } from '../../components/partner/PartnerCalendar';
import { Disclaimer } from '../../components/common/Disclaimer';

export const PartnerCalendarPage: React.FC = () => {
  return (
    <div className="p-4 animate-fade-in pb-20">
      <PartnerCalendar />
      <Disclaimer compact />
    </div>
  );
};
