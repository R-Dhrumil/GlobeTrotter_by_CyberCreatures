import React, { useState } from 'react';
import { Compass, MapPin, Image as ImageIcon } from 'lucide-react';

/**
 * Image component with automatic error handling and sleek fallback placeholder.
 * Prevents broken image icons and overflowing alt text across the UI.
 */
export const ImageWithFallback = ({
  src,
  alt = '',
  className = '',
  fallbackIcon: FallbackIcon = Compass,
  fallbackBg = 'bg-gradient-to-br from-stone-100 to-amber-50/60',
  iconClassName = 'w-6 h-6 text-amber-600/70',
  ...props
}) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={`flex items-center justify-center ${fallbackBg} border border-stone-200/60 ${className}`}
        title={alt || 'Image unavailable'}
      >
        <FallbackIcon className={iconClassName} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
};

export default ImageWithFallback;
