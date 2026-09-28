import React from 'react';
import { PartnerDashboard } from '../../components/partner/PartnerDashboard';
import { Disclaimer } from '../../components/common/Disclaimer';

export const PartnerHomePage: React.FC = () => {
  return (
    <div className="p-4 animate-fade-in pb-20">
      <PartnerDashboard />
      <Disclaimer />
    </div>
  );
};
