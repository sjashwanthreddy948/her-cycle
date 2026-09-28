import React from 'react';

export const SereneWomanIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Illustration of a serene woman"
    >
      <defs>
        {/* Soft blush background circle gradient */}
        <linearGradient id="bgGlow" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF1F2" />
          <stop offset="0.5" stopColor="#FFE4E8" />
          <stop offset="1" stopColor="#FECDD3" />
        </linearGradient>

        {/* Hair flow gradient */}
        <linearGradient id="hairGrad" x1="50" y1="40" x2="160" y2="160" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9F1239" />
          <stop offset="0.6" stopColor="#BE123C" />
          <stop offset="1" stopColor="#E11D48" />
        </linearGradient>

        {/* Skin warmth gradient */}
        <linearGradient id="skinGrad" x1="80" y1="60" x2="120" y2="130" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FED7AA" />
          <stop offset="1" stopColor="#FDBA74" />
        </linearGradient>

        {/* Top/apparel gradient */}
        <linearGradient id="topGrad" x1="70" y1="140" x2="130" y2="190" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FB7185" />
          <stop offset="1" stopColor="#E11D48" />
        </linearGradient>

        {/* Golden flower halo */}
        <linearGradient id="haloGold" x1="120" y1="40" x2="160" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Background circle */}
      <circle cx="100" cy="100" r="95" fill="url(#bgGlow)" />

      {/* Halo botanical leaf / curve */}
      <path
        d="M130 50 C145 60, 160 85, 155 110 C150 135, 135 155, 120 165"
        stroke="url(#haloGold)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="4 6"
        opacity="0.8"
      />

      {/* Hair back volume */}
      <path
        d="M65 85 C60 55, 80 40, 100 40 C130 40, 145 65, 145 95 C145 130, 135 155, 125 168 C115 150, 120 120, 115 105 C110 90, 85 95, 65 85 Z"
        fill="url(#hairGrad)"
      />

      {/* Shoulders & Upper Body */}
      <path
        d="M55 185 C60 155, 80 142, 100 142 C120 142, 140 155, 145 185 Z"
        fill="url(#topGrad)"
      />

      {/* Neck */}
      <path
        d="M91 118 L91 145 C91 146, 109 146, 109 145 L109 118 Z"
        fill="#FED7AA"
      />

      {/* Face profile / angled front */}
      <path
        d="M82 85 C82 68, 93 62, 100 62 C108 62, 118 68, 118 85 C118 102, 110 122, 100 122 C90 122, 82 102, 82 85 Z"
        fill="url(#skinGrad)"
      />

      {/* Soft Cheek Blush */}
      <ellipse cx="88" cy="94" rx="4.5" ry="3" fill="#F43F5E" opacity="0.35" />
      <ellipse cx="112" cy="94" rx="4.5" ry="3" fill="#F43F5E" opacity="0.35" />

      {/* Gentle Closed Eyes (serenity / mindfulness) */}
      <path
        d="M85 88 Q89 91, 93 88"
        stroke="#881337"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M107 88 Q111 91, 115 88"
        stroke="#881337"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Calm subtle smile */}
      <path
        d="M96 106 Q100 109, 104 106"
        stroke="#E11D48"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Hair front locks */}
      <path
        d="M85 65 C95 72, 115 72, 125 65 C130 75, 125 90, 120 100 C116 85, 110 75, 100 75 C88 75, 82 85, 78 95 C76 80, 80 70, 85 65 Z"
        fill="url(#hairGrad)"
      />

      {/* Small golden star / sparkle accent */}
      <g transform="translate(138, 70) scale(0.65)">
        <path
          d="M0 -10 Q0 0, 10 0 Q0 0, 0 10 Q0 0, -10 0 Q0 0, 0 -10 Z"
          fill="#F59E0B"
        />
      </g>
    </svg>
  );
};
