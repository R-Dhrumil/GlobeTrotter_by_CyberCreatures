import React from 'react';
import { Compass } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = false, text = 'Loading GlobeTrotter...' }) => {
  if (fullScreen) {
    return (
      <div className="min-h-screen bg-[#fbf9f6] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin"></div>
          <Compass className="w-8 h-8 text-amber-600 absolute animate-pulse" />
        </div>
        <p className="mt-4 text-stone-600 font-medium tracking-wide text-sm">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-8 h-8 rounded-full border-3 border-amber-200 border-t-amber-600 animate-spin"></div>
      {text && <p className="mt-2 text-xs text-stone-500 font-medium">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
