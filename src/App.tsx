import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CollegeEvent, Registration, WaitlistEntry, Certificate, SystemStats } from './types';
import { api } from './lib/api';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/ToastContainer';
import { LandingPage } from './pages/LandingPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { MyRegistrations } from './pages/student/MyRegistrations';
import { MyCertificates } from './pages/student/MyCertificates';
import { OrganizerDashboard } from './pages/organizer/OrganizerDashboard';
import { QRScanner } from './pages/organizer/QRScanner';
import { ParticipantsManager } from './pages/organizer/ParticipantsManager';
import { CheckInHistory } from './pages/organizer/CheckInHistory';
import { EmailOutboxMonitor } from './pages/organizer/EmailOutboxMonitor';
import { AdminPortal } from './pages/admin/AdminPortal';
import { ContactPage } from './pages/ContactPage';
import { QRTicketModal } from './components/QRTicketModal';
import { CertificateModal } from './components/CertificateModal';
import { RegistrationModal } from './components/RegistrationModal';
import { EventEditorModal } from './pages/organizer/EventEditorModal';
import { FeedbackModal } from './components/FeedbackModal';
import { AuthModal } from './components/AuthModal';

function MainApp() {
  const { user, role, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [myWaitlists, setMyWaitlists] = useState<WaitlistEntry[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);

  // Selected views & modals
  const [selectedEvent, setSelectedEvent] = useState<CollegeEvent | null>(null);
  const [scannerEventId, setScannerEventId] = useState<string | undefined>(undefined);
  const [participantsEventId, setParticipantsEventId] = useState<string | null>(null);

  const [activeTicketModal, setActiveTicketModal] = useState<Registration | null>(null);
  const [activeCertificateModal, setActiveCertificateModal] = useState<Certificate | null>(null);
  const [activeRegistrationEvent, setActiveRegistrationEvent] = useState<CollegeEvent | null>(null);
  const [eventEditorState, setEventEditorState] = useState<{ open: boolean; event: CollegeEvent | null }>({ open: false, event: null });
  const [feedbackTarget, setFeedbackTarget] = useState<{ eventId: string; eventTitle: string } | null>(null);
  const [authModalConfig, setAuthModalConfig] = useState<{ open: boolean; initialRole: 'student' | 'organizer' }>({ open: false, initialRole: 'student' });

  const loadData = async () => {
    try {
      const [eventsData, regsData, statsData] = await Promise.all([
        api.getEvents(),
        api.getMyRegistrations(),
        api.getSystemStats()
      ]);
      setEvents(eventsData);
      setMyRegistrations(regsData.registrations);
      setMyWaitlists(regsData.waitlists);
      setSystemStats(statsData);

      // Refresh selected event if open
      if (selectedEvent) {
        const updated = eventsData.find((e) => e.id === selectedEvent.id);
        if (updated) setSelectedEvent(updated);
      }
    } catch (err) {
      console.error('Data reload error:', err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleViewDetails = (event: CollegeEvent) => {
    setSelectedEvent(event);
    setCurrentTab('event-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenScanner = (eventId?: string) => {
    setScannerEventId(eventId);
    setCurrentTab('scanner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenParticipants = (eventId: string) => {
    setParticipantsEventId(eventId);
    setCurrentTab('participants');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const participantsTargetEvent = events.find((e) => e.id === participantsEventId) || events[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCreateEvent={() => setEventEditorState({ open: true, event: null })}
        onOpenAuthModal={(role) => setAuthModalConfig({ open: true, initialRole: role || 'student' })}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === 'landing' && (
          <LandingPage
            events={events}
            stats={systemStats}
            onExploreEvents={() => setCurrentTab('events')}
            onOpenScanner={() => handleOpenScanner()}
            onViewDetails={handleViewDetails}
            onRegisterClick={(ev) => setActiveRegistrationEvent(ev)}
            onViewTicketClick={(reg) => setActiveTicketModal(reg)}
            onOpenAuthModal={(role) => setAuthModalConfig({ open: true, initialRole: role || 'student' })}
          />
        )}

        {currentTab === 'events' && (
          <EventsPage
            events={events}
            myRegistrations={myRegistrations}
            myWaitlists={myWaitlists}
            onViewDetails={handleViewDetails}
            onRegisterClick={(ev) => setActiveRegistrationEvent(ev)}
            onViewTicketClick={(reg) => setActiveTicketModal(reg)}
          />
        )}

        {currentTab === 'event-detail' && selectedEvent && (
          <EventDetailPage
            event={selectedEvent}
            onBack={() => setCurrentTab('events')}
            onRegisterClick={(ev) => setActiveRegistrationEvent(ev)}
            onViewTicketClick={(reg) => setActiveTicketModal(reg)}
            userRegistration={myRegistrations.find((r) => r.eventId === selectedEvent.id && r.status !== 'cancelled')}
            userWaitlist={myWaitlists.find((w) => w.eventId === selectedEvent.id && w.status === 'waiting')}
          />
        )}

        {currentTab === 'student-registrations' && (
          <MyRegistrations
            onViewTicket={(reg) => setActiveTicketModal(reg)}
            onOpenFeedback={(eventId, title) => setFeedbackTarget({ eventId, eventTitle: title })}
            onExploreEvents={() => setCurrentTab('events')}
          />
        )}

        {currentTab === 'student-certificates' && (
          <MyCertificates
            onViewCertificate={(cert) => setActiveCertificateModal(cert)}
            onExploreEvents={() => setCurrentTab('events')}
          />
        )}

        {currentTab === 'organizer-dashboard' && (
          <OrganizerDashboard
            events={events}
            stats={systemStats}
            onSelectEvent={handleViewDetails}
            onOpenCreateEvent={() => setEventEditorState({ open: true, event: null })}
            onOpenScanner={handleOpenScanner}
            onOpenParticipants={handleOpenParticipants}
            onOpenCheckInHistory={() => setCurrentTab('checkin-history')}
            onRefreshData={loadData}
          />
        )}

        {currentTab === 'scanner' && (
          <QRScanner
            events={events}
            selectedEventId={scannerEventId}
            onRefreshStats={loadData}
            onViewHistory={() => setCurrentTab('checkin-history')}
          />
        )}

        {currentTab === 'checkin-history' && (
          <CheckInHistory
            events={events}
            onBackToScanner={() => setCurrentTab('scanner')}
          />
        )}

        {currentTab === 'participants' && participantsTargetEvent && (
          <ParticipantsManager
            event={participantsTargetEvent}
            onBack={() => setCurrentTab('organizer-dashboard')}
            onViewTicket={(reg) => setActiveTicketModal(reg)}
          />
        )}

        {currentTab === 'outbox' && <EmailOutboxMonitor />}

        {currentTab === 'admin-portal' && (
          <AdminPortal
            stats={systemStats}
            onRefreshData={loadData}
          />
        )}

        {currentTab === 'help' && <ContactPage />}
      </main>

      {/* Global Modals */}
      {activeTicketModal && (
        <QRTicketModal
          registration={activeTicketModal}
          event={events.find((e) => e.id === activeTicketModal.eventId)}
          onClose={() => setActiveTicketModal(null)}
        />
      )}

      {activeCertificateModal && (
        <CertificateModal
          certificate={activeCertificateModal}
          onClose={() => setActiveCertificateModal(null)}
        />
      )}

      {activeRegistrationEvent && (
        <RegistrationModal
          event={activeRegistrationEvent}
          onClose={() => setActiveRegistrationEvent(null)}
          onSuccess={(newReg) => {
            loadData();
            if (newReg) {
              setActiveTicketModal(newReg);
            }
          }}
        />
      )}

      {eventEditorState.open && (
        <EventEditorModal
          initialEvent={eventEditorState.event}
          onClose={() => setEventEditorState({ open: false, event: null })}
          onSuccess={() => {
            loadData();
            setEventEditorState({ open: false, event: null });
          }}
        />
      )}

      {feedbackTarget && (
        <FeedbackModal
          eventId={feedbackTarget.eventId}
          eventTitle={feedbackTarget.eventTitle}
          onClose={() => setFeedbackTarget(null)}
          onSuccess={loadData}
        />
      )}

      {authModalConfig.open && (
        <AuthModal
          initialRole={authModalConfig.initialRole}
          onClose={() => setAuthModalConfig({ open: false, initialRole: 'student' })}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-10 text-slate-500 text-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-sm">Event<span className="text-cyan-400">Ease</span></span>
            <span>—</span>
            <span>College Event Registration & Check-In Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setCurrentTab('events')} className="hover:text-slate-300 transition-colors">Events Directory</button>
            <button onClick={() => setCurrentTab('scanner')} className="hover:text-slate-300 transition-colors">QR Scanner</button>
            <button onClick={() => setCurrentTab('checkin-history')} className="hover:text-cyan-400 transition-colors">Scan History</button>
            <button onClick={() => setCurrentTab('help')} className="hover:text-slate-300 transition-colors">Help & FAQ</button>
            <span className="text-slate-600">● 16 Automations Active</span>
          </div>
        </div>
      </footer>

      {/* Global Toast Alerts */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
