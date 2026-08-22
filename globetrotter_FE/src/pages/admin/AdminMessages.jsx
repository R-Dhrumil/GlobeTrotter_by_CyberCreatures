import React, { useState, useEffect } from 'react';
import { contactAPI } from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import {
  MessageSquare,
  Mail,
  Trash2,
  CheckCircle,
  Clock,
  User,
} from 'lucide-react';

export const AdminMessages = () => {
  const { showSuccess, showError } = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await contactAPI.getMessages();
      if (res.data?.messages) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error('Failed to load contact messages', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await contactAPI.markRead(id);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isRead: true } : m))
      );
      showSuccess('Message marked as read');
    } catch (err) {
      showError(err.message || 'Failed to mark as read');
    }
  };

  const handleDeleteMessage = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Message?',
      message: 'Are you sure you want to delete this inquiry message?',
      confirmText: 'Delete Message',
      type: 'danger',
      onConfirm: async () => {
        try {
          await contactAPI.deleteMessage(id);
          setMessages((prev) => prev.filter((m) => m.id !== id));
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          showSuccess('Message deleted');
        } catch (err) {
          showError(err.message || 'Failed to delete message');
        }
      },
    });
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading traveler inquiries..." />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
          Inbound Communications
        </span>
        <h1 className="text-3xl font-bold font-serif text-stone-900 mt-0.5">
          Traveler Contact Inquiries ({messages.length})
        </h1>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200/80 text-center text-xs text-stone-400">
          No contact submissions received yet.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-6 rounded-3xl border transition flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                msg.isRead ? 'bg-white border-stone-200/80' : 'bg-amber-50/40 border-amber-300 shadow-soft'
              }`}
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-base font-bold font-serif text-stone-900">{msg.subject || 'Inquiry'}</h3>
                  {!msg.isRead && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white">
                      New
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-stone-500">
                  <span className="font-semibold text-stone-800 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    {msg.name}
                  </span>
                  <span>•</span>
                  <a href={`mailto:${msg.email}`} className="text-amber-700 hover:underline flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {msg.email}
                  </a>
                  <span>•</span>
                  <span>{new Date(msg.createdAt).toLocaleString()}</span>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed bg-white/70 p-4 rounded-2xl border border-stone-200/60 mt-3 whitespace-pre-line">
                  {msg.message}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                {!msg.isRead && (
                  <button
                    onClick={() => handleMarkRead(msg.id)}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Mark Read
                  </button>
                )}

                <button
                  onClick={() => handleDeleteMessage(msg.id)}
                  className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
      />
    </div>
  );
};
