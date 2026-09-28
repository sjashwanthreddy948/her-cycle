import React from 'react';
import { PartnerSharing } from '../../components/settings/PartnerSharing';
import { Disclaimer } from '../../components/common/Disclaimer';

export const WomanPartnerPage: React.FC = () => {
  return (
    <div className="p-4 animate-fade-in">
      <PartnerSharing />
      <Disclaimer compact />
    </div>
  );
};
