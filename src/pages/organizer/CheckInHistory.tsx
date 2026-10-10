import React, { useState, useEffect } from 'react';
import { ScanLogEntry, CollegeEvent } from '../../types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  History,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Search,
  Filter,
  Download,
  Trash2,
  RefreshCw,
  Smartphone,
  Laptop,
  Radio,
  Clock,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';

interface CheckInHistoryProps {
  events: CollegeEvent[];
  onBackToScanner?: () => void;
}

export const CheckInHistory: React.FC<CheckInHistoryProps> = ({ events, onBackToScanner }) => {
  const { addToast } = useAuth();
  const [logs, setLogs] = useState<ScanLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getCheckInHistory({
        eventId: eventFilter,
        status: statusFilter,
        search: searchQuery
      });
      setLogs(data);
    } catch (err: any) {
      addToast('error', 'Failed to load check-in logs', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [statusFilter, eventFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs();
  };

  const handleClearLogs = async () => {
    if (!confirm('Are you sure you want to clear the chronological scan history log? This cannot be undone.')) {
      return;
    }
    try {
      await api.clearCheckInHistory();
      addToast('info', 'Check-In History Cleared', 'All recorded scan attempts have been purged.');
      setLogs([]);
    } catch (err: any) {
      addToast('error', 'Clear Failed', err.message);
    }
  };

  const handleExportCSV = () => {
    window.open('/api/checkin/history/export/csv', '_blank');
    addToast('success', 'Exporting CSV Timeline', 'Downloading full chronological check-in ledger.');
  };

  // Metrics
  const approvedCount = logs.filter((l) => l.status === 'approved').length;
  const duplicateCount = logs.filter((l) => l.status === 'duplicate_attempt').length;
  const failedCount = logs.filter((l) => l.status === 'invalid_token' || l.status === 'wrong_event' || l.status === 'cancelled_pass').length;
  const uniqueDevices = Array.from(new Set(logs.map((l) => l.scannerDeviceId || 'Default'))).length;

  const getStatusBadge = (status: ScanLogEntry['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Approved Entry
          </span>
        );
      case 'duplicate_attempt':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Duplicate Scan Flagged
          </span>
        );
      case 'invalid_token':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3 h-3 text-rose-400" />
            Invalid / Counterfeit
          </span>
        );
      case 'wrong_event':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <HelpCircle className="w-3 h-3 text-purple-400" />
            Wrong Event Pass
          </span>
        );
      case 'cancelled_pass':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-700 text-slate-300 border border-slate-600">
            <XCircle className="w-3 h-3 text-slate-400" />
            Cancelled Seat
          </span>
        );
      default:
        return null;
    }
  };

  const getDeviceIcon = (deviceId: string) => {
    const lower = deviceId.toLowerCase();
    if (lower.includes('laser') || lower.includes('gun')) return <Radio className="w-3.5 h-3.5 text-cyan-400" />;
    if (lower.includes('mobile') || lower.includes('safari') || lower.includes('phone') || lower.includes('cam')) return <Smartphone className="w-3.5 h-3.5 text-emerald-400" />;
    return <Laptop className="w-3.5 h-3.5 text-blue-400" />;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] uppercase tracking-widest font-extrabold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
              <History className="w-3 h-3" />
              Organizer Telemetry Ledger
            </span>
            {onBackToScanner && (
              <button
                onClick={onBackToScanner}
                className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors ml-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Scanner
              </button>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Gate Check-In History Timeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Chronological audit of every successful or rejected check-in scan attempt across all gates and optical devices.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={loadLogs}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Export CSV Timeline
          </button>

          {logs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
              title="Clear check-in log records"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
            Total Scans Logged
          </span>
          <div className="text-2xl font-extrabold text-white mt-1">{logs.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Across {uniqueDevices} scanner device(s)</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[11px] uppercase font-bold text-emerald-400 block tracking-wider">
            Approved Entries
          </span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">{approvedCount}</div>
          <p className="text-[11px] text-emerald-300/80 mt-0.5">
            {logs.length > 0 ? Math.round((approvedCount / logs.length) * 100) : 0}% success rate
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[11px] uppercase font-bold text-amber-400 block tracking-wider">
            Duplicate Replay Flags
          </span>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">{duplicateCount}</div>
          <p className="text-[11px] text-amber-300/80 mt-0.5">Prevented multi-entry attempts</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[11px] uppercase font-bold text-rose-400 block tracking-wider">
            Failed / Counterfeit
          </span>
          <div className="text-2xl font-extrabold text-rose-400 mt-1">{failedCount}</div>
          <p className="text-[11px] text-rose-300/80 mt-0.5">Invalid tokens or wrong event</p>
        </div>
      </div>

      {/* Filter and View Toggle Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search student, ticket code, or device ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
          />
        </form>

        {/* Dropdowns & View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Events</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Outcomes</option>
            <option value="approved">Approved Only</option>
            <option value="duplicate_attempt">Duplicate Flags Only</option>
            <option value="invalid_token">Invalid Tokens Only</option>
            <option value="wrong_event">Wrong Event Passes</option>
          </select>

          {/* Toggle between Timeline & Table */}
          <div className="flex rounded-xl bg-slate-950 border border-slate-800 p-0.5">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'timeline' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'table' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {logs.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center text-slate-500">
          <History className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-300">No Check-In Scan Attempts Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your search query, or launch the Live QR Scanner to scan attendee passes.
          </p>
          {onBackToScanner && (
            <button
              onClick={onBackToScanner}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              Go to Live Scanner
            </button>
          )}
        </div>
      ) : viewMode === 'timeline' ? (
        /* Chronological Timeline View */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {logs.map((log) => {
              const isApproved = log.status === 'approved';
              const isDuplicate = log.status === 'duplicate_attempt';
              const isFailed = !isApproved && !isDuplicate;

              const dotColor = isApproved
                ? 'bg-emerald-400 ring-emerald-500/30'
                : isDuplicate
                ? 'bg-amber-400 ring-amber-500/30'
                : 'bg-rose-400 ring-rose-500/30';

              return (
                <div key={log.id} className="relative group">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1.5 w-3.5 h-3.5 rounded-full ring-4 ${dotColor} transition-transform group-hover:scale-125`}
                  />

                  {/* Timeline Card */}
                  <div className="bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition-all shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(log.status)}
                        <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/50 px-2.5 py-0.5 rounded-lg border border-cyan-500/20">
                          {log.ticketCode}
                        </span>
                        {log.eventTitle && (
                          <span className="text-xs text-slate-400 font-medium truncate max-w-[220px]">
                            • {log.eventTitle}
                          </span>
                        )}
                      </div>

                      {/* Timestamp & Relative time */}
                      <div className="text-left sm:text-right text-[11px] text-slate-400 flex items-center gap-1.5 sm:justify-end">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        <span className="text-slate-600">({new Date(log.timestamp).toLocaleDateString()})</span>
                      </div>
                    </div>

                    {/* Middle: Student Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Student Attendee</span>
                        <span className="font-bold text-white text-sm block mt-0.5">{log.studentName}</span>
                        {log.studentId && (
                          <span className="font-mono text-[11px] text-slate-400">ID: {log.studentId}</span>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Department / Contact</span>
                        <span className="text-slate-300 block mt-0.5 truncate">{log.department || 'N/A'}</span>
                        {log.userEmail && (
                          <span className="text-[11px] text-slate-400 truncate block">{log.userEmail}</span>
                        )}
                      </div>

                      {/* Scanner Device Identifier & Gate */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Scanner Device Station</span>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-mono font-semibold text-slate-200 mt-1">
                          {getDeviceIcon(log.scannerDeviceId || 'Default')}
                          <span>{log.scannerDeviceId || 'Station-01 (Default)'}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Gate: <strong className="text-slate-300">{log.gate}</strong> • By {log.scannedBy}
                        </p>
                      </div>
                    </div>

                    {/* Footer Notes / Rejection Reason */}
                    {log.notes && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span className="text-slate-500">Telemetry Note:</span>
                        <span className={isApproved ? 'text-emerald-300/90' : isDuplicate ? 'text-amber-300/90' : 'text-rose-300/90'}>
                          {log.notes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Detailed Tabular View */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-6">Timestamp</th>
                  <th className="py-3 px-4">Outcome Status</th>
                  <th className="py-3 px-4">Student Name & ID</th>
                  <th className="py-3 px-4">Ticket Code</th>
                  <th className="py-3 px-4">Scanner Device Identifier</th>
                  <th className="py-3 px-4">Gate & Staff</th>
                  <th className="py-3 px-6">Telemetry Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleTimeString()}
                      <span className="text-[10px] text-slate-600 block">{new Date(l.timestamp).toLocaleDateString()}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(l.status)}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white text-sm">{l.studentName}</p>
                      {l.studentId && <p className="font-mono text-[11px] text-slate-400">{l.studentId}</p>}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400 whitespace-nowrap">
                      {l.ticketCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
                        {getDeviceIcon(l.scannerDeviceId || 'Default')}
                        <span>{l.scannerDeviceId || 'Station-01'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-300">{l.gate}</p>
                      <p className="text-[10px] text-slate-500">By {l.scannedBy}</p>
                    </td>
                    <td className="py-3.5 px-6 text-[11px] text-slate-400 max-w-xs truncate">
                      {l.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
