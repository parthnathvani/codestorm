import React, { useState, useEffect } from 'react';
import { Registration, WaitlistEntry, CollegeEvent } from '../../types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  QrCode,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MessageSquare,
  Award,
  Trash2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface MyRegistrationsProps {
  onViewTicket: (reg: Registration) => void;
  onOpenFeedback: (eventId: string, title: string) => void;
  onExploreEvents: () => void;
}

export const MyRegistrations: React.FC<MyRegistrationsProps> = ({
  onViewTicket,
  onOpenFeedback,
  onExploreEvents
}) => {
  const { user, addToast } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [waitlists, setWaitlists] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'attended' | 'waitlist'>('active');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getMyRegistrations();
      setRegistrations(res.registrations);
      setWaitlists(res.waitlists);
    } catch (err: any) {
      addToast('error', 'Failed to load tickets', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancel = async (regId: string, eventTitle: string) => {
    if (!confirm(`Are you sure you want to cancel your seat for "${eventTitle}"? If there is a waitlist, the next student will be promoted immediately.`)) {
      return;
    }

    try {
      await api.cancelRegistration(regId);
      addToast('info', 'Registration Cancelled', `Your slot for "${eventTitle}" was released.`);
      loadData();
    } catch (err: any) {
      addToast('error', 'Cancellation Error', err.message);
    }
  };

  const activeRegistrations = registrations.filter((r) => r.status === 'confirmed');
  const attendedRegistrations = registrations.filter((r) => r.status === 'attended');

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest font-extrabold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full">
            Student Identity: {user?.name}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            My Registered Events & QR Tickets
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access your verifiable check-in passes, monitor waitlist positions, and claim participation credentials.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 self-start md:self-auto transition-colors"
          title="Refresh ticket state"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'active'
              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Upcoming Confirmed Passes ({activeRegistrations.length})
        </button>

        <button
          onClick={() => setActiveTab('waitlist')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'waitlist'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Active Waitlists ({waitlists.length})
        </button>

        <button
          onClick={() => setActiveTab('attended')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'attended'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Past & Attended ({attendedRegistrations.length})
        </button>
      </div>

      {/* Active Passes View */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeRegistrations.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
              <QrCode className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-slate-300">No Upcoming Registered Events</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                Explore campus workshops, hackathons, and symposiums to secure your digital QR ticket pass.
              </p>
              <button
                onClick={onExploreEvents}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
              >
                Discover Campus Events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-full">
                        Confirmed Pass
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-400">
                        {reg.ticketCode}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                      {reg.eventTitle}
                    </h3>

                    <div className="mt-4 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-400">
                        <span>Attendee:</span>
                        <span className="font-semibold text-slate-200">{reg.userName}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Student Roll:</span>
                        <span className="font-mono text-cyan-300">{reg.studentId}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Department:</span>
                        <span className="text-slate-300 truncate max-w-[140px]">{reg.department}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => onViewTicket(reg)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <QrCode className="w-4 h-4" />
                      View QR Pass
                    </button>
                    <button
                      onClick={() => handleCancel(reg.id, reg.eventTitle)}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                      title="Cancel Registration & Release Seat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Waitlists View */}
      {activeTab === 'waitlist' && (
        <div className="space-y-4">
          {waitlists.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
              <Clock className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-slate-300">No Waitlisted Events</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                You are not currently waiting on any sold-out event rosters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {waitlists.map((w) => (
                <div
                  key={w.id}
                  className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-xl flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                        Waitlist Active
                      </span>
                      <span className="text-xs text-slate-400">Position #{w.position}</span>
                    </div>
                    <h3 className="text-base font-bold text-white">Event Ref: {w.eventId}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Automated queue monitoring is active. If a slot frees up, you will be automatically promoted!
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-extrabold text-xl flex-shrink-0 ml-4">
                    #{w.position}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Attended Events View */}
      {activeTab === 'attended' && (
        <div className="space-y-4">
          {attendedRegistrations.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
              <CheckCircle2 className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-slate-300">No Attended Events Recorded Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                When you check in at the campus gate with your QR code, your attendance record will unlock feedback and certificates here!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attendedRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Checked In & Attended
                      </span>
                      <span className="font-mono text-xs text-slate-400">{reg.ticketCode}</span>
                    </div>

                    <h3 className="text-base font-bold text-white line-clamp-2">
                      {reg.eventTitle}
                    </h3>

                    <p className="text-xs text-slate-400 mt-2">
                      Verified at {new Date(reg.checkedInAt || reg.registeredAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => onOpenFeedback(reg.eventId, reg.eventTitle)}
                      className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Feedback
                    </button>
                    <button
                      onClick={() => onViewTicket(reg)}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                    >
                      Pass Record
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
