import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'warning' | 'info'
  loading = false,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200/80 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                type === 'danger'
                  ? 'bg-red-100 text-red-600'
                  : type === 'warning'
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-stone-100 text-stone-700'
              }`}
            >
              {type === 'danger' ? (
                <Trash2 className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-stone-900 leading-snug">{title}</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Confirmation Required</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-stone-600 leading-relaxed font-sans">{message}</p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition flex items-center gap-2 disabled:opacity-50 ${
              type === 'danger'
                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
            }`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

