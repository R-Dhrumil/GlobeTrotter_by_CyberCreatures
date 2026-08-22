import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Heart, Share2, MapPin, Tag } from 'lucide-react';
import { copyToClipboard } from '../../utils/clipboard';

export const Lightbox = ({ isOpen, onClose, item }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fade-in"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition backdrop-blur-md"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        className="relative max-w-5xl w-full bg-stone-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Large Media Image */}
        <div className="md:w-3/5 bg-black flex items-center justify-center min-h-[320px] md:min-h-[500px]">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover max-h-[75vh]"
          />
        </div>

        {/* Details Sidebar */}
        <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-between text-white bg-stone-900/95">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Tag className="w-3 h-3" />
                {item.tag || item.category || 'Travel'}
              </span>
              <span className="text-xs text-stone-400 font-medium">Curated Shot</span>
            </div>

            <h2 className="text-2xl font-bold font-serif mb-2 text-stone-100">{item.title}</h2>
            {item.subtitle && (
              <p className="flex items-center gap-1.5 text-sm text-stone-400 mb-4">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                {item.subtitle}
              </p>
            )}

            <p className="text-sm text-stone-300 leading-relaxed line-clamp-6">
              {item.description || 'Captured during an authentic GlobeTrotter exploration journey.'}
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-300 text-sm">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span>{item.likesCount || 142} explorers inspired</span>
            </div>
            <button
              onClick={async () => {
                const ok = await copyToClipboard(window.location.href);
                if (ok) alert('Photo link copied to clipboard!');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium text-white transition"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

