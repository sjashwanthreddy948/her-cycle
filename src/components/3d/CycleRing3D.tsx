import React, { Suspense, useState, useEffect } from 'react';
import { SereneWomanIllustration } from '../common/SereneWomanIllustration';
import { Camera } from 'lucide-react';

interface CycleRing3DProps {
  currentCycleDay?: number;
  totalCycleLength?: number;
  userAvatarUrl?: string | null;
  userName?: string;
  isLandingPage?: boolean;
  onAddPhotoClick?: () => void;
}

// Lazy load the Three.js Canvas scene to ensure lightning-fast first paint
const Lazy3DScene = React.lazy(() => import('./CycleRing3DScene'));

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

// Static Fallback with Conic Gradient Cycle Ring
const StaticGradientFallback: React.FC<{
  currentCycleDay: number;
  totalCycleLength: number;
}> = ({ currentCycleDay, totalCycleLength }) => {
  const dayFraction = totalCycleLength > 0 ? (Math.max(1, currentCycleDay) - 0.5) / totalCycleLength : 0;
  const markerAngle = dayFraction * 360;

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {/* Conic Ring */}
      <div
        className="w-64 h-64 sm:w-72 sm:h-72 rounded-full p-3.5 shadow-float relative animate-pulse-glow"
        style={{
          background: `conic-gradient(
            from -90deg,
            #F43F5E 0% 18%,
            #EC4899 18% 46%,
            #F59E0B 46% 57%,
            #8B5CF6 57% 100%
          )`,
        }}
      >
        {/* Inner white mask */}
        <div className="w-full h-full rounded-full bg-[#FFF5F7] flex items-center justify-center relative" />

        {/* Day Marker Dot */}
        {currentCycleDay > 0 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ transform: `rotate(${markerAngle - 90}deg)` }}
          >
            <div className="w-4 h-4 rounded-full bg-white ring-4 ring-rose-500 shadow-glow absolute top-1 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        )}
      </div>
    </div>
  );
};

export const CycleRing3D: React.FC<CycleRing3DProps> = ({
  currentCycleDay = 12,
  totalCycleLength = 28,
  userAvatarUrl,
  userName,
  isLandingPage = false,
  onAddPhotoClick,
}) => {
  const [canUse3D, setCanUse3D] = useState<boolean>(true);

  useEffect(() => {
    const hasWebGL = checkWebGLSupport();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setCanUse3D(hasWebGL && !prefersReducedMotion);
  }, []);

  return (
    <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto select-none flex items-center justify-center">
      {/* Background Soft Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-rose-200/40 via-pink-100/30 to-purple-200/30 rounded-full blur-2xl pointer-events-none scale-110" />

      {/* 3D Canvas OR Static Fallback */}
      <div className="absolute inset-0 z-0">
        {canUse3D ? (
          <Suspense
            fallback={
              <StaticGradientFallback
                currentCycleDay={currentCycleDay}
                totalCycleLength={totalCycleLength}
              />
            }
          >
            <Lazy3DScene
              currentCycleDay={currentCycleDay}
              totalCycleLength={totalCycleLength}
            />
          </Suspense>
        ) : (
          <StaticGradientFallback
            currentCycleDay={currentCycleDay}
            totalCycleLength={totalCycleLength}
          />
        )}
      </div>

      {/* Center Hero Portrait / Illustration Overlay */}
      <div className="relative z-10 w-36 h-36 sm:w-40 sm:h-40 rounded-full p-1 bg-white/90 backdrop-blur-md shadow-soft border border-rose-100 flex items-center justify-center group overflow-hidden">
        {isLandingPage ? (
          /* Public Landing Page: Original Serene Woman Vector Illustration */
          <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center p-0.5">
            <SereneWomanIllustration className="w-full h-full transform scale-105" />
          </div>
        ) : userAvatarUrl ? (
          /* Logged-in Woman Profile Photo */
          <img
            src={userAvatarUrl}
            alt={userName || 'Profile'}
            className="w-full h-full rounded-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* No Photo: Serene Avatar with Prompt to Add Photo */
          <div className="w-full h-full rounded-full relative overflow-hidden flex items-center justify-center bg-rose-50/70">
            <SereneWomanIllustration className="w-full h-full transform scale-105" />
            <button
              type="button"
              onClick={onAddPhotoClick}
              className="absolute inset-0 bg-rose-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2"
              title="Add your photo"
              aria-label="Add your photo"
            >
              <Camera className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold text-center leading-tight">Add Photo</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CycleRing3D;
