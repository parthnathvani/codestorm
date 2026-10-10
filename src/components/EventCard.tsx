import React from 'react';
import { CollegeEvent, Registration, WaitlistEntry } from '../types';
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

interface EventCardProps {
  event: CollegeEvent;
  userRegistration?: Registration;
  userWaitlist?: WaitlistEntry;
  onViewDetails: (event: CollegeEvent) => void;
  onRegisterClick: (event: CollegeEvent) => void;
  onViewTicketClick: (registration: Registration) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  userRegistration,
  userWaitlist,
  onViewDetails,
  onRegisterClick,
  onViewTicketClick
}) => {
  const isFull = event.registeredCount >= event.capacity;
  const isCancelled = event.status === 'cancelled';
  const isCompleted = event.status === 'completed';
  const isOngoing = event.status === 'ongoing';

  const fillPercentage = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));

  const getStatusBadge = () => {
    if (isCancelled) {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">Cancelled</span>;
    }
    if (isOngoing) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Happening Now
        </span>
      );
    }
    if (isCompleted) {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-700/60 text-slate-300 border border-slate-600/40">Completed</span>;
    }
    if (isFull) {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Waitlist Active</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Registration Open</span>;
  };

  return (
    <div className="group bg-slate-900 rounded-3xl border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-cyan-500/10 flex flex-col justify-between">
      <div>
        {/* Banner Image & Top Badges */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-950">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-950/60" />

          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-slate-800">
              {event.category}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            {getStatusBadge()}
          </div>

          {/* User Status Ribbon if already registered or waitlisted */}
          {userRegistration && (
            <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 backdrop-blur-md border border-emerald-500/50 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {userRegistration.status === 'attended' ? 'Attended' : 'Pass Confirmed'}
              </span>
              <span className="font-mono text-[11px] text-emerald-400">{userRegistration.ticketCode}</span>
            </div>
          )}

          {!userRegistration && userWaitlist && (
            <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 backdrop-blur-md border border-amber-500/50 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Waitlist Position
              </span>
              <span className="font-bold text-amber-400">#{userWaitlist.position}</span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-5">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {new Date(event.startDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <span>•</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors leading-snug line-clamp-2">
            {event.title}
          </h3>

          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-300">
            <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span className="truncate">
              {event.venue} {event.room ? `• ${event.room}` : ''}
            </span>
          </div>

          {/* Capacity Progress Bar */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-500" /> Capacity
              </span>
              <span className="font-medium text-slate-300">
                {event.registeredCount} / {event.capacity}
                <span className="text-slate-500 text-[11px] ml-1">({fillPercentage}%)</span>
              </span>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  fillPercentage >= 100
                    ? 'bg-amber-400'
                    : fillPercentage >= 85
                    ? 'bg-amber-500'
                    : 'bg-cyan-400'
                }`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 pt-0 flex items-center gap-2">
        <button
          onClick={() => onViewDetails(event)}
          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors text-center"
        >
          Details
        </button>

        {userRegistration ? (
          <button
            onClick={() => onViewTicketClick(userRegistration)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 text-center flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            View QR Pass
          </button>
        ) : userWaitlist ? (
          <button
            onClick={() => onViewDetails(event)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors text-center"
          >
            Waitlist #{userWaitlist.position}
          </button>
        ) : isCancelled ? (
          <button
            disabled
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 text-slate-500 text-xs font-semibold cursor-not-allowed text-center"
          >
            Cancelled
          </button>
        ) : isCompleted ? (
          <button
            onClick={() => onViewDetails(event)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold text-center hover:bg-slate-700"
          >
            Past Event
          </button>
        ) : isFull ? (
          <button
            onClick={() => onRegisterClick(event)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all text-center flex items-center justify-center gap-1"
          >
            Join Waitlist
          </button>
        ) : (
          <button
            onClick={() => onRegisterClick(event)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 text-center flex items-center justify-center gap-1 hover:scale-102"
          >
            Register Now
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
