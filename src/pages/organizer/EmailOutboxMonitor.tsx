import React, { useState, useEffect } from 'react';
import { EmailOutboxItem, AuditLog } from '../../types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Mail,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCw,
  Send,
  Eye,
  Shield,
  X,
  Sparkles,
  Inbox
} from 'lucide-react';

export const EmailOutboxMonitor: React.FC = () => {
  const { addToast } = useAuth();
  const [emails, setEmails] = useState<EmailOutboxItem[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'outbox' | 'audit'>('outbox');
  const [inspectEmail, setInspectEmail] = useState<EmailOutboxItem | null>(null);
  const [testEmailAddress, setTestEmailAddress] = useState('parthnathvani88@gmail.com');
  const [sendingTest, setSendingTest] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [emailData, logData] = await Promise.all([
        api.getEmails(),
        api.getAuditLogs()
      ]);
      setEmails(emailData);
      setLogs(logData);
    } catch (err: any) {
      addToast('error', 'Failed to load outbox', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRetry = async (id: string) => {
    try {
      const updated = await api.retryEmail(id);
      setEmails((prev) => prev.map((e) => (e.id === id ? updated : e)));
      addToast('success', 'Email Outbox Processed', `Job re-dispatched to ${updated.to}.`);
    } catch (err: any) {
      addToast('error', 'Retry Failed', err.message);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailAddress) return;
    setSendingTest(true);
    try {
      const res = await api.sendTestEmail(testEmailAddress);
      addToast('success', 'Dispatched Test Email', res.message);
      if (res.outboxItem) {
        setEmails((prev) => [res.outboxItem, ...prev]);
      }
    } catch (err: any) {
      addToast('error', 'Test Send Failed', err.message);
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest font-extrabold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full">
            Communications & System Telemetry
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 flex items-center gap-2">
            <Mail className="w-8 h-8 text-cyan-400" />
            Email Outbox & Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tracks transactional QR tickets, reminder broadcasts, waitlist promotions, and security events.
          </p>
        </div>

        {/* Live Test Dispatch Tool */}
        <form onSubmit={handleSendTest} className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
          <input
            type="email"
            value={testEmailAddress}
            onChange={(e) => setTestEmailAddress(e.target.value)}
            placeholder="Recipient email address"
            className="bg-transparent border-0 px-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none w-52 sm:w-64 font-mono"
          />
          <button
            type="submit"
            disabled={sendingTest}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {sendingTest ? 'Sending...' : 'Test Send'}
          </button>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('outbox')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'outbox'
              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Email Outbox Queue ({emails.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          System Audit Trail ({logs.length})
        </button>
      </div>

      {activeTab === 'outbox' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-6">Recipient & Subject</th>
                  <th className="py-3 px-4">Template Type</th>
                  <th className="py-3 px-4">Event Ref</th>
                  <th className="py-3 px-4">Status & Dispatch Time</th>
                  <th className="py-3 px-6 text-right">Preview & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {emails.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      Outbox queue is currently empty.
                    </td>
                  </tr>
                ) : (
                  emails.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-6">
                        <div>
                          <p className="font-semibold text-white">{e.subject}</p>
                          <p className="text-[11px] text-cyan-400 font-mono mt-0.5">{e.to}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-950 border border-slate-800 text-slate-300">
                          {e.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {e.eventTitle}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              e.status === 'sent'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : e.status === 'queued'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {e.status}
                          </span>
                          <p className="text-[10px] text-slate-500">
                            {e.sentAt ? new Date(e.sentAt).toLocaleTimeString() : new Date(e.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setInspectEmail(e)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                            title="Inspect HTML Email Template"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {e.status !== 'sent' && (
                            <button
                              onClick={() => handleRetry(e.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors"
                              title="Retry Dispatch"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl p-6">
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs gap-2"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      log.severity === 'success'
                        ? 'bg-emerald-400'
                        : log.severity === 'warning'
                        ? 'bg-amber-400'
                        : log.severity === 'error'
                        ? 'bg-rose-400'
                        : 'bg-cyan-400'
                    }`}
                  />
                  <div>
                    <span className="font-mono font-bold text-white tracking-wide">
                      {log.action}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2">
                      by {log.actorName} ({log.actorRole})
                    </span>
                    {log.details && (
                      <pre className="text-[10px] text-slate-500 font-mono mt-0.5 max-w-lg truncate">
                        {JSON.stringify(log.details)}
                      </pre>
                    )}
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-500 sm:self-center">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email Inspection Modal */}
      {inspectEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Email Preview • To: {inspectEmail.to}</p>
                <h3 className="text-sm font-bold text-white">{inspectEmail.subject}</h3>
              </div>
              <button
                onClick={() => setInspectEmail(null)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div
                dangerouslySetInnerHTML={{ __html: inspectEmail.htmlContent }}
                className="text-slate-900"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
