import React, { useState, useEffect } from 'react';
import { CollegeEvent, Registration, WaitlistEntry } from '../../types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Mail,
  ArrowLeft,
  QrCode,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface ParticipantsManagerProps {
  event: CollegeEvent;
  onBack: () => void;
  onViewTicket: (reg: Registration) => void;
}

export const ParticipantsManager: React.FC<ParticipantsManagerProps> = ({
  event,
  onBack,
  onViewTicket
}) => {
  const { addToast } = useAuth();
  const [participants, setParticipants] = useState<Registration[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'attended' | 'confirmed' | 'cancelled'>('all');
  const [activeTab, setActiveTab] = useState<'attendees' | 'waitlist'>('attendees');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getEventParticipants(event.id);
      setParticipants(res.participants);
      setWaitlist(res.waitlist);
    } catch (err: any) {
      addToast('error', 'Failed to load participants', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [event.id]);

  const handleToggleAttendance = async (reg: Registration) => {
    const nextStatus = reg.status === 'attended' ? 'confirmed' : 'attended';
    try {
      const updated = await api.manualCheckinOverride(reg.id, nextStatus);
      setParticipants((prev) => prev.map((p) => (p.id === reg.id ? updated : p)));
      addToast(
        'success',
        'Attendance Updated',
        `${reg.userName} marked as ${nextStatus === 'attended' ? 'Attended' : 'Confirmed'}.`
      );
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
    }
  };

  const handleDownloadCSV = () => {
    window.open(`/api/events/${event.id}/export/csv`, '_blank');
  };

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ticketCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.userEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Roster & Check-In Ledger
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              {event.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh participant list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('attendees')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'attendees'
              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Registered Attendees ({participants.length})
        </button>
        <button
          onClick={() => setActiveTab('waitlist')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'waitlist'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Waitlist Queue ({waitlist.length})
        </button>
      </div>

      {activeTab === 'attendees' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          {/* Filter / Search Bar */}
          <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search by student name, roll number, ticket code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {(['all', 'attended', 'confirmed', 'cancelled'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    statusFilter === st
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-6">Ticket Code</th>
                  <th className="py-3 px-4">Student Details</th>
                  <th className="py-3 px-4">Department & Year</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Check-In Verification</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      No participants match the search query.
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-cyan-400">
                        {p.ticketCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-white text-sm">{p.userName}</p>
                          <p className="text-[11px] text-slate-400">{p.userEmail}</p>
                          <span className="font-mono text-[10px] text-slate-500">{p.studentId}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-300">{p.department}</p>
                        <p className="text-[11px] text-slate-500">{p.year}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            p.status === 'attended'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : p.status === 'confirmed'
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {p.status === 'attended' ? (
                          <div className="text-[11px]">
                            <p className="text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {new Date(p.checkedInAt!).toLocaleTimeString()}
                            </p>
                            <p className="text-slate-500 text-[10px]">Gate: {p.checkInGate || 'Main'}</p>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Not Checked In</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onViewTicket(p)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
                            title="View QR Ticket Pass"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleAttendance(p)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                              p.status === 'attended'
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
                                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                            }`}
                          >
                            {p.status === 'attended' ? 'Mark Absent' : 'Verify Entry'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'waitlist' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Automated Waitlist Queue</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Students are prioritized by entry timestamp. When cancellations occur, Automation #1 automatically promotes position #1 to confirmed status.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full">
              {waitlist.length} Waiting
            </span>
          </div>

          {waitlist.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Clock className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-400">Waitlist Queue is Empty</p>
              <p className="text-xs text-slate-600 mt-1">All registered students currently have active confirmed slots.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {waitlist.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold text-sm">
                      #{w.position}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{w.userName}</p>
                      <p className="text-slate-400 text-xs">{w.userEmail} • Roll: {w.studentId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      Auto-Promotion Ready
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Joined {new Date(w.createdAt).toLocaleDateString()}
                    </p>
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
