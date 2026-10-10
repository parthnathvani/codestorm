import React, { useState, useEffect } from 'react';
import { User, UserRole, SystemStats } from '../../types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Users,
  Settings,
  Mail,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  FileCode,
  Copy,
  ExternalLink,
  RefreshCw,
  Server
} from 'lucide-react';

interface AdminPortalProps {
  stats: SystemStats | null;
  onRefreshData: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ stats, onRefreshData }) => {
  const { usersList, updateUserRole, addToast } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'automations' | 'firebase' | 'gmail'>('users');
  const [integrationsStatus, setIntegrationsStatus] = useState<any>(null);
  const [runningAutomations, setRunningAutomations] = useState(false);
  const [automationLogs, setAutomationLogs] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    api.getIntegrationsStatus().then(setIntegrationsStatus).catch(console.error);
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    await updateUserRole(userId, newRole);
  };

  const handleRunAutomations = async () => {
    setRunningAutomations(true);
    try {
      const res = await api.triggerAutomationsNow();
      setAutomationLogs(res.details);
      addToast(
        'success',
        'Automation Engine Complete',
        `${res.actionsTriggered} automated actions were processed.`
      );
      onRefreshData();
    } catch (err: any) {
      addToast('error', 'Execution error', err.message);
    } finally {
      setRunningAutomations(false);
    }
  };

  const FIREBASE_RULES_TEMPLATE = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read published events
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role in ['organizer', 'admin'];
    }
    // Registrations restricted to owner & organizers
    match /registrations/{regId} {
      allow read: if request.auth != null && (request.auth.uid == resource.data.userId || request.auth.token.role in ['organizer', 'admin']);
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update: if request.auth.token.role in ['organizer', 'admin'];
    }
    // System audit logs
    match /auditLogs/{logId} {
      allow read, write: if request.auth.token.role == 'admin';
    }
  }
}`;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest font-extrabold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full">
            Campus Directorate Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 flex items-center gap-2">
            <Shield className="w-8 h-8 text-amber-400" />
            Administration & Cloud Integrations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage user roles, inspect Gmail SMTP & Firebase architecture, and monitor the 16 backend automation engines.
          </p>
        </div>

        <button
          onClick={handleRunAutomations}
          disabled={runningAutomations}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 self-start md:self-auto disabled:opacity-50"
        >
          <Zap className={`w-4 h-4 ${runningAutomations ? 'animate-spin' : ''}`} />
          {runningAutomations ? 'Processing Engine...' : 'Run All 16 Automations'}
        </button>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          User Roles & Access Control
        </button>

        <button
          onClick={() => setActiveTab('automations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'automations'
              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          The 16 Automations Engine
        </button>

        <button
          onClick={() => setActiveTab('firebase')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'firebase'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-400" />
          Firebase Architecture
        </button>

        <button
          onClick={() => setActiveTab('gmail')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'gmail'
              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Mail className="w-4 h-4 text-blue-400" />
          Gmail Integration
        </button>
      </div>

      {/* Tab: User Roles & RBAC */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Authorized Users & Roles</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Role-based access control (RBAC). Changes take effect immediately.
              </p>
            </div>
            <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
              {usersList.length} Registered Accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-4">Contact & Roll/ID</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Current Role</th>
                  <th className="py-3.5 px-6 text-right">Role Assignment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-cyan-400">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-mono text-cyan-300">{u.studentId || 'Faculty Staff'}</p>
                      <p className="text-[11px] text-slate-500">{u.phone || 'No phone'}</p>
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      {u.department || 'General Campus'}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : u.role === 'organizer'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="student">Student</option>
                        <option value="organizer">Organizer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: The 16 Automations Engine */}
      {activeTab === 'automations' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-2">
              The 16 EventEase Automated Background Routines
            </h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              These 16 routines execute on the server every 25 seconds in background loops and can also be fired instantly on demand.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {[
                { id: 1, title: 'Auto-Waitlist Promotion Engine', desc: 'Promotes position #1 immediately when cancellations occur or capacity increases, generates tickets and dispatches email.' },
                { id: 2, title: 'Event Capacity Auto-Lock', desc: 'Automatically flags events as sold-out/waitlist-only the exact millisecond registeredCount hits maximum capacity.' },
                { id: 3, title: 'Registration Deadline Auto-Closer', desc: 'Closes ticket registration automatically when now >= regCloseDate.' },
                { id: 4, title: 'Automated QR Ticket Pass Dispatch', desc: 'Generates high-resolution vector QR pass and HTML transactional email ticket upon confirmed registration.' },
                { id: 5, title: '24h & 1h Reminder Scheduler', desc: 'Schedules and queues pre-event reminder alerts to all confirmed attendees with gate information.' },
                { id: 6, title: 'Duplicate Registration Guard', desc: 'Server-side transaction preventing duplicate seat reservations by the same student for the same event.' },
                { id: 7, title: 'Instant QR Scan Verification', desc: 'Decrypts and matches signed ticket token against event database with sub-50ms latency.' },
                { id: 8, title: 'Single-Use Fraud & Replay Prevention', desc: 'Flagging already-verified QR tokens, showing original gate staff, and rejecting reuse.' },
                { id: 9, title: 'Real-Time Attendance Analytics Computation', desc: 'Computes turnout percentage, capacity fill rates, and hourly check-in velocity.' },
                { id: 10, title: 'Auto-Attendance Eligibility Check', desc: 'Validates physical gate check-in before issuing official certificates.' },
                { id: 11, title: 'Verifiable Certificate of Participation Generator', desc: 'Produces tamper-evident collegiate certificates with unique hash and verifiable IDs.' },
                { id: 12, title: 'Post-Event Feedback Survey Trigger', desc: 'Triggers evaluation surveys to verified attendees once event status reaches completed.' },
                { id: 13, title: 'Dynamic Net Promoter Score (NPS) Calculator', desc: 'Computes promoter vs detractor balance and averages ratings dynamically.' },
                { id: 14, title: 'Real-Time Security Audit Log Tracking', desc: 'Logs all administrative overrides, check-ins, registrations, and role modifications.' },
                { id: 15, title: 'Automated CSV/Excel Report Generator', desc: 'Creates instant structured attendance exports with gate logs and student details.' },
                { id: 16, title: 'Outbox Email Queue Retry Worker', desc: 'Asynchronous outbox worker managing delivery retries, exponential backoff, and delivery status.' }
              ].map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                    {item.id}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                    <span className="text-[10px] text-emerald-400 font-semibold mt-1.5 inline-block">● Active In Server Engine</span>
                  </div>
                </div>
              ))}
            </div>

            {automationLogs.length > 0 && (
              <div className="mt-6 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 mb-2">Last Execution Run Telemetry:</h4>
                <div className="space-y-1 font-mono text-[11px] text-emerald-400 max-h-48 overflow-y-auto">
                  {automationLogs.map((log, i) => (
                    <div key={i}>✓ {log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Firebase Architecture */}
      {activeTab === 'firebase' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  Firebase Deployment Architecture
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Firestore rules, collections blueprint, and cloud function specifications for production hosting.
                </p>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(FIREBASE_RULES_TEMPLATE);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 3000);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedCode ? 'Copied Rules!' : 'Copy firestore.rules'}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Firebase Realtime DB / Firestore:</span>
                <span className="text-emerald-400 font-semibold">Ready for production sync</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Target Project ID:</span>
                <span className="font-mono text-cyan-300">{integrationsStatus?.firebase?.projectId || 'eventease-college-prod'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Cloud Functions Environment:</span>
                <span className="text-slate-300">Node.js 20 / TypeScript Scheduled Worker</span>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Production firestore.rules Configuration:
              </label>
              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                {FIREBASE_RULES_TEMPLATE}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Gmail Integration */}
      {activeTab === 'gmail' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-400" />
            Gmail API & SMTP Integration Settings
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            EventEase uses a production-ready asynchronous Email Outbox queue with idempotent delivery tracking. To route through an active Gmail account, configure your credentials in the environment variables:
          </p>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
            <p className="text-cyan-400"># Configure in your .env or server environment:</p>
            <p>GMAIL_USER="campus-events@college.edu"</p>
            <p>GMAIL_APP_PASSWORD="your-16-char-app-password"</p>
            <p># Optional Gmail OAuth2 configuration:</p>
            <p>GMAIL_CLIENT_ID="..."</p>
            <p>GMAIL_CLIENT_SECRET="..."</p>
            <p>GMAIL_REFRESH_TOKEN="..."</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <div>
              <p className="font-semibold">Integrated Outbox Engine Operational</p>
              <p className="text-[11px] text-emerald-200/80 mt-0.5">
                All generated QR tickets and automated reminders are queued and can be previewed or tested directly from the "Outbox & Logs" tab!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
