import React from 'react';
import { Compass, Plus } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Compass,
  title = 'No items found',
  description = 'Get started by creating your first entry.',
  actionText,
  onAction,
}) => {
  return (
    <div className="text-center py-16 px-6 bg-white/60 border-2 border-dashed border-stone-200 rounded-3xl my-6">
      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-600 shadow-soft">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold font-serif text-stone-900 mb-1">{title}</h3>
      <p className="text-sm text-stone-500 max-w-md mx-auto mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
};
