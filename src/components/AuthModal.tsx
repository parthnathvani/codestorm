import React, { useState } from 'react';
import { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  X,
  User,
  Mail,
  GraduationCap,
  Shield,
  Sparkles,
  CheckCircle2,
  Lock,
  KeyRound,
  Layers,
  ArrowRight,
  School,
  Building
} from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  initialRole?: 'student' | 'organizer';
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, initialRole = 'student' }) => {
  const { usersList, switchUser, createAccount, addToast } = useAuth();
  const [selectedPortal, setSelectedPortal] = useState<'student' | 'organizer'>(initialRole);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  // Student Form
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    studentId: '',
    department: 'Computer Science & Engineering',
    year: 'Junior (3rd Year)'
  });

  // Organizer Form
  const [organizerForm, setOrganizerForm] = useState({
    name: '',
    email: '',
    department: 'Faculty of Computing & Innovation',
    facultyPasscode: 'FACULTY-2026',
    role: 'organizer' as UserRole
  });

  const [submitting, setSubmitting] = useState(false);

  const studentUsers = usersList.filter((u) => u.role === 'student');
  const organizerUsers = usersList.filter((u) => u.role === 'organizer' || u.role === 'admin');

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createAccount({
        name: studentForm.name,
        email: studentForm.email,
        studentId: studentForm.studentId || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
        department: studentForm.department,
        year: studentForm.year,
        role: 'student'
      });
      onClose();
    } catch {
      // toast shown in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleOrganizerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (organizerForm.facultyPasscode !== 'FACULTY-2026') {
      addToast('error', 'Invalid Faculty Passcode', 'Please enter valid department authorization passcode (Default: FACULTY-2026).');
      return;
    }

    setSubmitting(true);
    try {
      await createAccount({
        name: organizerForm.name,
        email: organizerForm.email,
        department: organizerForm.department,
        role: organizerForm.role
      });
      onClose();
    } catch {
      // toast shown in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-8">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-full inline-block mb-1">
              Campus Authorization Gate
            </span>
            <h2 className="text-xl font-extrabold text-white">EventEase Sign-In Portal</h2>
            <p className="text-xs text-slate-400 mt-0.5">Separate gateways for student attendees and faculty organizers</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Dual-Portal Tab Selector */}
        <div className="grid grid-cols-2 p-2 bg-slate-950 border-b border-slate-800 gap-2">
          <button
            onClick={() => {
              setSelectedPortal('student');
              setIsRegistering(false);
            }}
            className={`py-3 px-4 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
              selectedPortal === 'student'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Sign-In</span>
          </button>

          <button
            onClick={() => {
              setSelectedPortal('organizer');
              setIsRegistering(false);
            }}
            className={`py-3 px-4 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
              selectedPortal === 'organizer'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20 scale-[1.02]'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Organizer / Faculty Sign-In</span>
          </button>
        </div>

        {/* Portal Body */}
        <div className="p-6">
          {/* ============================== */}
          {/* 1. STUDENT PORTAL EXPERIENCE   */}
          {/* ============================== */}
          {selectedPortal === 'student' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 flex items-center gap-3">
                <GraduationCap className="w-5 h-5 flex-shrink-0 text-cyan-400" />
                <div>
                  <p className="font-bold">Student Attendee Gateway</p>
                  <p className="text-[11px] text-cyan-200/80">
                    Sign in to browse campus events, download digital QR tickets, check waitlist status, and claim participation certificates.
                  </p>
                </div>
              </div>

              {!isRegistering ? (
                /* Student 1-Click Fast Profiles */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Choose Student Identity:</span>
                    <button
                      onClick={() => setIsRegistering(true)}
                      className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      + Create New Student Profile
                    </button>
                  </div>

                  <div className="space-y-2">
                    {studentUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          onClose();
                        }}
                        className="w-full p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 transition-all flex items-center justify-between text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 font-bold flex items-center justify-center border border-cyan-500/20">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs group-hover:text-cyan-300 transition-colors">
                              {u.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">{u.studentId || 'CS-2024-8812'} • {u.email}</p>
                            <p className="text-[10px] text-slate-500">{u.department}</p>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-1 rounded-full group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                          Enter As Student →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Register Student Account Form */
                <form onSubmit={handleStudentSubmit} className="space-y-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-300">New Student Registration</span>
                    <button
                      type="button"
                      onClick={() => setIsRegistering(false)}
                      className="text-xs font-medium text-slate-400 hover:text-white"
                    >
                      ← Back to Student List
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                      placeholder="e.g. Priyansh Patel"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Student Roll Number</label>
                      <input
                        type="text"
                        required
                        value={studentForm.studentId}
                        onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                        placeholder="e.g. CS-2025-9901"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">University Email</label>
                      <input
                        type="email"
                        required
                        value={studentForm.email}
                        onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                        placeholder="student@college.edu"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                    <input
                      type="text"
                      required
                      value={studentForm.department}
                      onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {submitting ? 'Registering...' : 'Sign In as Student'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ========================================= */}
          {/* 2. ORGANIZER & FACULTY PORTAL EXPERIENCE  */}
          {/* ========================================= */}
          {selectedPortal === 'organizer' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-center gap-3">
                <Shield className="w-5 h-5 flex-shrink-0 text-purple-400" />
                <div>
                  <p className="font-bold">Faculty & Event Committee Gateway</p>
                  <p className="text-[11px] text-purple-200/80">
                    Sign in to publish college events, launch live optical scanners, inspect check-in histories, and export reports.
                  </p>
                </div>
              </div>

              {!isRegistering ? (
                /* Organizer 1-Click Fast Profiles */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Authorized Faculty Personas:</span>
                    <button
                      onClick={() => setIsRegistering(true)}
                      className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      + Onboard New Faculty Chair
                    </button>
                  </div>

                  <div className="space-y-2">
                    {organizerUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          onClose();
                        }}
                        className="w-full p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/50 transition-all flex items-center justify-between text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-300 font-bold flex items-center justify-center border border-purple-500/30">
                            {u.role === 'admin' ? <Shield className="w-4 h-4 text-amber-400" /> : <Building className="w-4 h-4 text-purple-400" />}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                              {u.name}
                              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-full font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {u.role}
                              </span>
                            </p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                            <p className="text-[10px] text-slate-500">{u.department}</p>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2.5 py-1 rounded-full group-hover:bg-purple-500 group-hover:text-white transition-all">
                          Enter Faculty Hub →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Register Faculty Organizer Form */
                <form onSubmit={handleOrganizerSubmit} className="space-y-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-300">Faculty Chair Onboarding</span>
                    <button
                      type="button"
                      onClick={() => setIsRegistering(false)}
                      className="text-xs font-medium text-slate-400 hover:text-white"
                    >
                      ← Back to Faculty List
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Faculty / Staff Name</label>
                    <input
                      type="text"
                      required
                      value={organizerForm.name}
                      onChange={(e) => setOrganizerForm({ ...organizerForm, name: e.target.value })}
                      placeholder="e.g. Prof. Rajesh Sharma"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Staff Email</label>
                      <input
                        type="email"
                        required
                        value={organizerForm.email}
                        onChange={(e) => setOrganizerForm({ ...organizerForm, email: e.target.value })}
                        placeholder="faculty@college.edu"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                        <KeyRound className="w-3 h-3 text-amber-400" />
                        Passcode
                      </label>
                      <input
                        type="text"
                        required
                        value={organizerForm.facultyPasscode}
                        onChange={(e) => setOrganizerForm({ ...organizerForm, facultyPasscode: e.target.value })}
                        placeholder="FACULTY-2026"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                    <input
                      type="text"
                      required
                      value={organizerForm.department}
                      onChange={(e) => setOrganizerForm({ ...organizerForm, department: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {submitting ? 'Verifying...' : 'Sign In as Organizer'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
