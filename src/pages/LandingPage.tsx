import React from 'react';
import { CollegeEvent, SystemStats } from '../types';
import { useAuth } from '../context/AuthContext';
import { EventCard } from '../components/EventCard';
import {
  Calendar,
  QrCode,
  Zap,
  Award,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  GraduationCap,
  Shield,
  KeyRound
} from 'lucide-react';

interface LandingPageProps {
  events: CollegeEvent[];
  stats: SystemStats | null;
  onExploreEvents: () => void;
  onOpenScanner: () => void;
  onViewDetails: (event: CollegeEvent) => void;
  onRegisterClick: (event: CollegeEvent) => void;
  onViewTicketClick: (reg: any) => void;
  onOpenAuthModal?: (role?: 'student' | 'organizer') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  events,
  stats,
  onExploreEvents,
  onOpenScanner,
  onViewDetails,
  onRegisterClick,
  onViewTicketClick,
  onOpenAuthModal
}) => {
  const { role, user } = useAuth();
  const featuredEvents = events.slice(0, 3);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-16 pb-12 sm:pb-20">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/15 to-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Next-Gen Collegiate Operations Platform
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              Seamless College Event Registration &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
                Instant QR Check-In
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              EventEase streamlines campus life. Discover university hackathons, workshops, and symposiums, receive tamper-proof QR tickets, check in under 2 seconds, and collect verifiable participation certificates.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={onExploreEvents}
                className="px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all hover:scale-102 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Discover Campus Events
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenScanner}
                className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-bold text-sm shadow-lg transition-all flex items-center gap-2"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                Open Live Gate Scanner
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left max-w-4xl mx-auto">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-2xl font-extrabold text-white block">
                  {stats?.totalEvents ?? events.length}
                </span>
                <span className="text-xs text-slate-400">Flagship Campus Events</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-2xl font-extrabold text-cyan-400 block">
                  {stats?.totalRegistrations ?? 118}
                </span>
                <span className="text-xs text-slate-400">Confirmed Attendees</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-2xl font-extrabold text-emerald-400 block">
                  &lt; 2s
                </span>
                <span className="text-xs text-slate-400">QR Gate Scan Latency</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-2xl font-extrabold text-amber-400 block">
                  16
                </span>
                <span className="text-xs text-slate-400">Active Automations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest font-extrabold text-cyan-400">
              Campus Spotlight
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Featured Upcoming Events
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Limited capacity with automated waitlists and verifiable certificate issuance.
            </p>
          </div>

          <button
            onClick={onExploreEvents}
            className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors self-start sm:self-auto"
          >
            View all {events.length} events
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onViewDetails={onViewDetails}
              onRegisterClick={onRegisterClick}
              onViewTicketClick={onViewTicketClick}
            />
          ))}
        </div>
      </section>

      {/* Core Platform Capabilities Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest font-extrabold text-cyan-400">
            Why EventEase
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Engineered for Modern College Campuses
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Replacing slow paper sign-in sheets and clunky spreadsheets with an automated, tamper-proof system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Dynamic Anti-Fraud QR Pass</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every registration produces a cryptographically signed, single-use ticket code with live moving watermarks to prevent screenshot sharing and fraud.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Automated Waitlist Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When high-demand workshops fill up, students enter an ordered queue. The moment a seat is cancelled, position #1 is instantly auto-promoted and ticketed.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Verifiable Credentials</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Only students with verified physical gate check-ins unlock official department certificates of participation, verifiable via public ledger hashes.
            </p>
          </div>
        </div>
      </section>

      {/* Dual Campus Portals Access Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest font-extrabold text-cyan-400">
            Dedicated Role Portals
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Choose Your Campus Gateway
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Separate, specialized portals designed specifically for Student attendees and Faculty organizers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Student Portal Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5">
                <GraduationCap className="w-7 h-7" />
              </div>

              <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-400 block mb-1">
                For Students & Attendees
              </span>
              <h3 className="text-2xl font-extrabold text-white">Student Sign-In Portal</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
                Log in with your Student Roll ID or university email. Explore technical bootcamps and cultural events, download verifiable QR ticket passes, get notified of automatic waitlist promotions, and view participation certificates.
              </p>

              <div className="mt-6 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Single-use tamper-proof QR tickets on your phone</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Real-time waitlist queue tracking & auto-promotion</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Verifiable collegiate attendance certificates</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <button
                onClick={() => onOpenAuthModal?.('student')}
                className="w-full py-3.5 px-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                Sign In to Student Portal
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Organizer / Faculty Portal Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-purple-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5">
                <Shield className="w-7 h-7" />
              </div>

              <span className="text-xs uppercase font-extrabold tracking-wider text-purple-400 block mb-1">
                For Faculty, Chairs & Event Committees
              </span>
              <h3 className="text-2xl font-extrabold text-white">Organizer & Faculty Portal</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
                Log in with your faculty credentials or department authorization passcode. Create and publish campus events, launch live optical QR gate scanners, monitor the chronological check-in history timeline, and issue batch credentials.
              </p>

              <div className="mt-6 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>Hardware & webcam optical QR entry scanner with audio</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>Chronological check-in history timeline & scanner device IDs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>One-click attendance ledger CSV exports & certificates</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <button
                onClick={() => onOpenAuthModal?.('organizer')}
                className="w-full py-3.5 px-4 rounded-2xl bg-purple-500 hover:bg-purple-400 text-white font-extrabold text-xs shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Sign In to Faculty Portal
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Organizer Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
              For Faculty & Club Organizers
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Effortless Event Management & Live Gate Telemetry
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Create events in minutes, launch our zero-app optical barcode scanner on any mobile device or webcam, export instant attendance CSV reports, and track real-time check-in velocity.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={onOpenScanner}
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all text-center flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              Try QR Gate Scanner
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
