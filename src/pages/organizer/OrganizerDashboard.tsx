import React, { useState } from 'react';
import { CollegeEvent, SystemStats } from '../../types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Users,
  QrCode,
  Award,
  Zap,
  TrendingUp,
  Download,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Mail,
  AlertTriangle,
  FileSpreadsheet,
  History
} from 'lucide-react';

interface OrganizerDashboardProps {
  events: CollegeEvent[];
  stats: SystemStats | null;
  onSelectEvent: (event: CollegeEvent) => void;
  onOpenCreateEvent: () => void;
  onOpenScanner: (eventId?: string) => void;
  onOpenParticipants: (eventId: string) => void;
  onOpenCheckInHistory?: () => void;
  onRefreshData: () => void;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({
  events,
  stats,
  onSelectEvent,
  onOpenCreateEvent,
  onOpenScanner,
  onOpenParticipants,
  onOpenCheckInHistory,
  onRefreshData
}) => {
  const { user, addToast } = useAuth();
  const [runningAutomations, setRunningAutomations] = useState(false);
  const [issuingCertsEventId, setIssuingCertsEventId] = useState<string | null>(null);

  const handleRunAutomations = async () => {
    setRunningAutomations(true);
    try {
      const res = await api.triggerAutomationsNow();
      addToast(
        'success',
        '16 Automations Cycle Executed',
        `Processed waitlists, deadline checks, and queued emails (${res.actionsTriggered} actions executed).`
      );
      onRefreshData();
    } catch (err: any) {
      addToast('error', 'Automations Trigger Failed', err.message);
    } finally {
      setRunningAutomations(false);
    }
  };

  const handleIssueCertificates = async (eventId: string) => {
    setIssuingCertsEventId(eventId);
    try {
      const res = await api.issueAllCertificates(eventId);
      addToast(
        'success',
        'Certificates Generated',
        `Issued ${res.issuedCount} verifiable certificates for attended students.`
      );
      onRefreshData();
    } catch (err: any) {
      addToast('error', 'Certificate Generation Failed', err.message);
    } finally {
      setIssuingCertsEventId(null);
    }
  };

  const handleDownloadCSV = (eventId: string, title: string) => {
    window.open(`/api/events/${eventId}/export/csv`, '_blank');
    addToast('info', 'Exporting CSV Report', `Downloading attendance ledger for "${title}"`);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-widest font-extrabold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full">
              Organizer Operations Hub
            </span>
            <span className="text-xs text-slate-400">Welcome, {user?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Campus Event Control & Attendance Center
          </h1>
          <p className="text-sm text-slate-300 max-w-xl mt-1.5 leading-relaxed">
            Manage registrations, monitor live gate check-in flow, auto-promote waitlists, and issue verified collegiate credentials.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenCreateEvent}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </button>

          <button
            onClick={() => onOpenScanner()}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 hover:scale-102"
          >
            <QrCode className="w-4 h-4" />
            Launch Scanner
          </button>

          {onOpenCheckInHistory && (
            <button
              onClick={onOpenCheckInHistory}
              className="px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-bold text-xs transition-all flex items-center gap-2"
            >
              <History className="w-4 h-4 text-cyan-400" />
              Check-In History
            </button>
          )}

          <button
            onClick={handleRunAutomations}
            disabled={runningAutomations}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors flex items-center gap-2 disabled:opacity-50"
            title="Runs all 16 background automation routines on demand"
          >
            <Zap className={`w-4 h-4 text-amber-400 ${runningAutomations ? 'animate-spin' : ''}`} />
            {runningAutomations ? 'Executing...' : 'Run 16 Automations'}
          </button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Total Campus Events</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            {stats?.totalEvents ?? events.length}
          </p>
          <p className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Managed across departments
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Total Registrations</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            {stats?.totalRegistrations ?? 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats?.totalWaitlisted ?? 0} students on waitlist queues
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Live Gate Check-Ins</span>
            <QrCode className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-2">
            {stats?.totalCheckedIn ?? 0}
          </p>
          <p className="text-[11px] text-emerald-300 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {stats?.overallAttendanceRate ?? 0}% overall turnout rate
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Credentials & Outbox</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            {stats?.totalCertificatesIssued ?? 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats?.emailsDelivered ?? 0} QR passes delivered
          </p>
        </div>
      </div>

      {/* Events Management Table & Control Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Managed College Events</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select an event to view attendees, gate statistics, or trigger batch credentials.
            </p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            {events.length} Events In Directory
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Event Details</th>
                <th className="py-3.5 px-4">Date & Venue</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Registration & Capacity</th>
                <th className="py-3.5 px-4">Gate Check-Ins</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {events.map((ev) => {
                const isFull = ev.registeredCount >= ev.capacity;
                const fillPercent = Math.min(100, Math.round((ev.registeredCount / ev.capacity) * 100));
                const checkInPercent = ev.registeredCount > 0 ? Math.round((ev.checkedInCount / ev.registeredCount) * 100) : 0;

                return (
                  <tr key={ev.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Event Details */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={ev.image}
                          alt={ev.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-800 flex-shrink-0"
                        />
                        <div>
                          <p className="font-bold text-white text-sm hover:text-cyan-400 transition-colors cursor-pointer" onClick={() => onSelectEvent(ev)}>
                            {ev.title}
                          </p>
                          <span className="text-[10px] text-cyan-400 font-semibold uppercase">{ev.category}</span>
                          <span className="text-[10px] text-slate-500 ml-2">by {ev.organizerName}</span>
                        </div>
                      </div>
                    </td>

                    {/* Date & Venue */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-200">
                          {new Date(ev.startDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                          {ev.venue} {ev.room ? `(${ev.room})` : ''}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ev.status === 'ongoing'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : ev.status === 'upcoming'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : ev.status === 'completed'
                            ? 'bg-slate-700 text-slate-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {ev.status}
                      </span>
                    </td>

                    {/* Capacity */}
                    <td className="py-4 px-4">
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-semibold text-white">
                            {ev.registeredCount} / {ev.capacity}
                          </span>
                          <span className="text-slate-400">{fillPercent}%</span>
                        </div>
                        <div className="w-28 bg-slate-950 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${fillPercent >= 100 ? 'bg-amber-400' : 'bg-cyan-400'}`}
                            style={{ width: `${fillPercent}%` }}
                          />
                        </div>
                        {ev.waitlistCount > 0 && (
                          <span className="text-[10px] text-amber-400 font-medium block mt-1">
                            +{ev.waitlistCount} waitlisted
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Gate Check-Ins */}
                    <td className="py-4 px-4">
                      <div>
                        <span className="font-bold text-emerald-400 text-sm">
                          {ev.checkedInCount}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">
                          ({checkInPercent}%)
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenScanner(ev.id)}
                          className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors"
                          title="Open Gate Scanner for this event"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onOpenParticipants(ev.id)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                          title="Manage Registered Participants & Waitlist"
                        >
                          <Users className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDownloadCSV(ev.id, ev.title)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors"
                          title="Export Attendance Report (CSV)"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                        </button>

                        {ev.certificateEnabled && (
                          <button
                            onClick={() => handleIssueCertificates(ev.id)}
                            disabled={issuingCertsEventId === ev.id}
                            className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
                            title="Issue Verified Certificates to All Attended Students"
                          >
                            <Award className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
