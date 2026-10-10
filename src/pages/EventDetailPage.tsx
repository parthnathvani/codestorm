import React, { useState, useEffect } from 'react';
import { CollegeEvent, Registration, WaitlistEntry, Feedback } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Award,
  Star,
  Share2,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  QrCode
} from 'lucide-react';

interface EventDetailPageProps {
  event: CollegeEvent;
  onBack: () => void;
  onRegisterClick: (event: CollegeEvent) => void;
  onViewTicketClick: (reg: Registration) => void;
  userRegistration?: Registration;
  userWaitlist?: WaitlistEntry;
}

export const EventDetailPage: React.FC<EventDetailPageProps> = ({
  event,
  onBack,
  onRegisterClick,
  onViewTicketClick,
  userRegistration,
  userWaitlist
}) => {
  const { addToast } = useAuth();
  const [feedbackData, setFeedbackData] = useState<{ feedback: Feedback[]; averageRating: string; npsScore: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number }>({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    // Load feedback reviews
    api.getEventFeedback(event.id).then(setFeedbackData).catch(console.error);

    // Compute countdown
    const calcTime = () => {
      const diff = new Date(event.startDate).getTime() - Date.now();
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        setTimeLeft({ days, hours, minutes });
      }
    };
    calcTime();
    const interval = setInterval(calcTime, 60000);
    return () => clearInterval(interval);
  }, [event.id, event.startDate]);

  const isFull = event.registeredCount >= event.capacity;
  const fillPercentage = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: event.title, text: event.description, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('info', 'Link Copied', 'Event link copied to clipboard.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Back button & Action header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events Directory
        </button>

        <button
          onClick={handleShare}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Share Event"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Event Showcase Hero */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="relative h-72 sm:h-96 w-full">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-slate-800">
              {event.category}
            </span>
          </div>

          {/* Title & Info on bottom of image */}
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              {event.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 flex flex-wrap items-center gap-3">
              <span>Organized by <strong className="text-white">{event.organizerName}</strong></span>
              <span>•</span>
              <span className="text-cyan-400">{event.department}</span>
            </p>
          </div>
        </div>

        {/* Content Body & Registration Sticky Aside */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Details, Countdown & Agenda */}
          <div className="lg:col-span-8 space-y-6">
            {/* Countdown widget */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" /> Event Countdown
              </span>
              <div className="flex gap-3 text-center">
                <div>
                  <span className="text-base font-extrabold text-white">{timeLeft.days}</span>
                  <span className="text-[10px] text-slate-500 block uppercase">Days</span>
                </div>
                <span className="text-slate-700 font-bold">:</span>
                <div>
                  <span className="text-base font-extrabold text-white">{timeLeft.hours}</span>
                  <span className="text-[10px] text-slate-500 block uppercase">Hours</span>
                </div>
                <span className="text-slate-700 font-bold">:</span>
                <div>
                  <span className="text-base font-extrabold text-white">{timeLeft.minutes}</span>
                  <span className="text-[10px] text-slate-500 block uppercase">Mins</span>
                </div>
              </div>
            </div>

            {/* Event Overview */}
            <div>
              <h2 className="text-lg font-bold text-white mb-2">About This Event</h2>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Meta Badges / Tags */}
            {event.tags && event.tags.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Topic Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Logistics & Location details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
                  <Calendar className="w-4 h-4 text-cyan-400" /> Date & Schedule
                </span>
                <p className="text-sm font-semibold text-white">
                  {new Date(event.startDate).toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">{event.timezone}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
                  <MapPin className="w-4 h-4 text-cyan-400" /> Campus Location
                </span>
                <p className="text-sm font-semibold text-white">{event.venue}</p>
                <p className="text-xs text-slate-400 mt-0.5">{event.room || 'General Admission Hall'}</p>
                <p className="text-[11px] text-slate-500 mt-1">Please have QR ticket ready at main gate</p>
              </div>
            </div>

            {/* Attendee Ratings & NPS score */}
            {feedbackData && feedbackData.feedback.length > 0 && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Attendee Satisfaction
                  </span>
                  <span className="text-xs font-bold text-cyan-400">
                    NPS Score: +{feedbackData.npsScore}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-extrabold text-white">
                    {feedbackData.averageRating}
                  </div>
                  <div className="text-xs text-slate-400">
                    Average rating based on {feedbackData.feedback.length} verified attendee reviews.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Registration Ticket Box */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Registration Status
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xl font-extrabold text-white">
                    {isFull ? 'Waitlist Only' : 'Admission Open'}
                  </span>
                  <span className="text-xs font-bold text-cyan-400">
                    Free / Student Pass
                  </span>
                </div>
              </div>

              {/* Capacity Progress Bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" /> Reserved Capacity
                  </span>
                  <span className="font-semibold text-slate-200">
                    {event.registeredCount} / {event.capacity}
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      fillPercentage >= 100 ? 'bg-amber-400' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${fillPercentage}%` }}
                  />
                </div>
                {isFull && (
                  <p className="text-[11px] text-amber-400 mt-1.5">
                    All seats claimed. Join the waitlist to auto-promote when spots open!
                  </p>
                )}
              </div>

              {/* Action Button */}
              {userRegistration ? (
                <div className="space-y-2">
                  <button
                    onClick={() => onViewTicketClick(userRegistration)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    View My QR Ticket Pass
                  </button>
                  <p className="text-[11px] text-emerald-400 text-center font-medium">
                    ✓ You are registered! Code: {userRegistration.ticketCode}
                  </p>
                </div>
              ) : userWaitlist ? (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
                  <p className="text-xs font-bold text-amber-300">You are on the Waitlist</p>
                  <p className="text-[11px] text-amber-200/80 mt-0.5">
                    Current Position: #{userWaitlist.position}. We will notify you via email when promoted.
                  </p>
                </div>
              ) : isFull ? (
                <button
                  onClick={() => onRegisterClick(event)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Join Automated Waitlist
                </button>
              ) : (
                <button
                  onClick={() => onRegisterClick(event)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 hover:scale-102"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Register & Get Digital Ticket
                </button>
              )}

              {/* Credential & Guarantee badges */}
              <div className="pt-4 border-t border-slate-900 space-y-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Instant email delivery with verifiable QR token</span>
                </div>
                {event.certificateEnabled && (
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Includes official digital certificate of attendance</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
