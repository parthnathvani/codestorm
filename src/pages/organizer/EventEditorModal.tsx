import React, { useState } from 'react';
import { CollegeEvent, EventCategory } from '../../types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Calendar,
  MapPin,
  Users,
  Image as ImageIcon,
  Sparkles,
  Award,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';

interface EventEditorModalProps {
  initialEvent?: CollegeEvent | null;
  onClose: () => void;
  onSuccess: (event: CollegeEvent) => void;
}

const CATEGORIES: EventCategory[] = [
  'Tech & Coding',
  'Cultural & Arts',
  'Sports & Fitness',
  'Academic & Seminar',
  'Workshop & Bootcamp',
  'Career & Networking',
  'Social & Community'
];

const PRESET_IMAGES = [
  { label: 'Hackathon / Tech', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Auditorium Keynote', url: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Cultural Gala / Concert', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Robotics Workshop', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Career Fair & Networking', url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80' }
];

export const EventEditorModal: React.FC<EventEditorModalProps> = ({
  initialEvent,
  onClose,
  onSuccess
}) => {
  const { user, addToast } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const defaultStart = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const defaultEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const defaultRegClose = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    title: initialEvent?.title || '',
    description: initialEvent?.description || '',
    category: initialEvent?.category || 'Tech & Coding',
    department: initialEvent?.department || user?.department || 'Computer Science & Engineering',
    venue: initialEvent?.venue || 'Campus Main Auditorium',
    room: initialEvent?.room || 'Hall A',
    startDate: initialEvent?.startDate ? new Date(initialEvent.startDate).toISOString().slice(0, 16) : defaultStart,
    endDate: initialEvent?.endDate ? new Date(initialEvent.endDate).toISOString().slice(0, 16) : defaultEnd,
    regCloseDate: initialEvent?.regCloseDate ? new Date(initialEvent.regCloseDate).toISOString().slice(0, 16) : defaultRegClose,
    capacity: initialEvent?.capacity || 100,
    waitlistEnabled: initialEvent?.waitlistEnabled ?? true,
    maxWaitlistCapacity: initialEvent?.maxWaitlistCapacity || 25,
    image: initialEvent?.image || PRESET_IMAGES[0].url,
    feedbackEnabled: initialEvent?.feedbackEnabled ?? true,
    certificateEnabled: initialEvent?.certificateEnabled ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      let saved: CollegeEvent;
      if (initialEvent) {
        saved = await api.updateEvent(initialEvent.id, formData);
        addToast('success', 'Event Updated', `"${saved.title}" was updated successfully.`);
      } else {
        saved = await api.createEvent(formData);
        addToast('success', 'Event Published', `"${saved.title}" is now open for campus registrations!`);
      }
      onSuccess(saved);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
              Organizer Console
            </span>
            <h2 className="text-xl font-extrabold text-white mt-1">
              {initialEvent ? 'Edit College Event' : 'Create New College Event'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Event Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Annual Campus Hackathon 2026"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Host Department
              </label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description & Highlights
            </label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide event overview, requirements, speaker information, or rules..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Venue Location
              </label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. Science Complex Atrium"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Room / Gate Designation
              </label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="e.g. Auditorium Hall 101"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Reg Deadline
              </label>
              <input
                type="datetime-local"
                required
                value={formData.regCloseDate}
                onChange={(e) => setFormData({ ...formData, regCloseDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Seat Capacity
              </label>
              <input
                type="number"
                min={1}
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 1 })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-bold"
              />
            </div>

            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.waitlistEnabled}
                  onChange={(e) => setFormData({ ...formData, waitlistEnabled: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                />
                Enable Waitlist
              </label>
              <p className="text-[10px] text-slate-500 mt-1">Auto-promotes when capacity frees up</p>
            </div>

            {formData.waitlistEnabled && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Max Waitlist Queue
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.maxWaitlistCapacity}
                  onChange={(e) => setFormData({ ...formData, maxWaitlistCapacity: parseInt(e.target.value, 10) || 10 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}
          </div>

          {/* Banner Image Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Event Banner Image
            </label>
            <div className="grid grid-cols-5 gap-2 mb-2">
              {PRESET_IMAGES.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => setFormData({ ...formData, image: preset.url })}
                  className={`relative rounded-xl overflow-hidden aspect-video border transition-all ${
                    formData.image === preset.url ? 'border-cyan-400 ring-2 ring-cyan-400/40' : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="Or enter custom image URL"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Features Toggles */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.certificateEnabled}
                onChange={(e) => setFormData({ ...formData, certificateEnabled: e.target.checked })}
                className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
              />
              <div>
                <span className="text-xs font-semibold text-white block">Participation Certificates</span>
                <span className="text-[10px] text-slate-400">Verifiable credentials for attendees</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.feedbackEnabled}
                onChange={(e) => setFormData({ ...formData, feedbackEnabled: e.target.checked })}
                className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
              />
              <div>
                <span className="text-xs font-semibold text-white block">Post-Event Feedback</span>
                <span className="text-[10px] text-slate-400">Auto-trigger NPS survey after event</span>
              </div>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? 'Saving...' : initialEvent ? 'Update Event' : 'Publish College Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
