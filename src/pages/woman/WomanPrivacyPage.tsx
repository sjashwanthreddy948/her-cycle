import React from 'react';
import { PrivacyCenter } from '../../components/settings/PrivacyCenter';
import { Disclaimer } from '../../components/common/Disclaimer';

export const WomanPrivacyPage: React.FC = () => {
  return (
    <div className="p-4 animate-fade-in">
      <PrivacyCenter />
      <Disclaimer compact />
    </div>
  );
};
