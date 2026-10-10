import {
  User,
  CollegeEvent,
  Registration,
  WaitlistEntry,
  Certificate,
  Feedback,
  EmailOutboxItem,
  AuditLog,
  SystemStats,
  ScanLogEntry
} from '../types';

class ApiClient {
  private getHeaders(): HeadersInit {
    const storedUser = localStorage.getItem('eventease_user');
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        headers['x-user-id'] = u.id;
        headers['x-user-role'] = u.role;
      } catch {
        // ignore
      }
    }
    return headers;
  }

  // Auth & Users
  async getCurrentUser(): Promise<User> {
    const res = await fetch('/api/users/current', { headers: this.getHeaders() });
    const data = await res.json();
    return data.user;
  }

  async getAllUsers(): Promise<User[]> {
    const res = await fetch('/api/users', { headers: this.getHeaders() });
    const data = await res.json();
    return data.users;
  }

  async switchUser(userId: string): Promise<User> {
    const res = await fetch('/api/users/switch', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    if (data.user) {
      localStorage.setItem('eventease_user', JSON.stringify(data.user));
    }
    return data.user;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const res = await fetch('/api/users/create', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (data.user) {
      localStorage.setItem('eventease_user', JSON.stringify(data.user));
    }
    return data.user;
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const res = await fetch(`/api/users/${userId}/role`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ role })
    });
    const data = await res.json();
    return data.user;
  }

  // Events
  async getEvents(): Promise<CollegeEvent[]> {
    const res = await fetch('/api/events', { headers: this.getHeaders() });
    const data = await res.json();
    return data.events || [];
  }

  async getEvent(id: string): Promise<CollegeEvent> {
    const res = await fetch(`/api/events/${id}`, { headers: this.getHeaders() });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch event');
    return data.event;
  }

  async createEvent(eventData: Partial<CollegeEvent>): Promise<CollegeEvent> {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(eventData)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to create event');
    return data.event;
  }

  async updateEvent(id: string, eventData: Partial<CollegeEvent>): Promise<CollegeEvent> {
    const res = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(eventData)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update event');
    return data.event;
  }

  async deleteEvent(id: string): Promise<void> {
    const res = await fetch(`/api/events/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to delete event');
  }

  // Registrations & Waitlist
  async registerForEvent(eventId: string, details: {
    name?: string;
    email?: string;
    studentId?: string;
    department?: string;
    year?: string;
    phone?: string;
    emergencyContact?: string;
  }): Promise<{ registration?: Registration; waitlisted?: boolean; waitlistPosition?: number; qrDataUrl?: string; message: string }> {
    const res = await fetch(`/api/events/${eventId}/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(details)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Registration failed');
    return data;
  }

  async cancelRegistration(registrationId: string): Promise<void> {
    const res = await fetch(`/api/registrations/${registrationId}/cancel`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Cancellation failed');
  }

  async getMyRegistrations(): Promise<{ registrations: Registration[]; waitlists: WaitlistEntry[] }> {
    const res = await fetch('/api/registrations/my', { headers: this.getHeaders() });
    const data = await res.json();
    return { registrations: data.registrations || [], waitlists: data.waitlists || [] };
  }

  async getEventParticipants(eventId: string): Promise<{ participants: Registration[]; waitlist: WaitlistEntry[] }> {
    const res = await fetch(`/api/events/${eventId}/participants`, { headers: this.getHeaders() });
    const data = await res.json();
    return { participants: data.participants || [], waitlist: data.waitlist || [] };
  }

  async getTicketDetails(code: string): Promise<{ registration: Registration; event: CollegeEvent; qrDataUrl: string }> {
    const res = await fetch(`/api/tickets/${code}`, { headers: this.getHeaders() });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Ticket not found');
    return data;
  }

  // Check-In Scanner
  async scanTicket(payload: { rawQrPayload?: string; ticketCode?: string; eventId?: string; gate?: string; scannerDeviceId?: string }): Promise<any> {
    const res = await fetch('/api/checkin/scan', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success && !data.alreadyCheckedIn) {
      throw new Error(data.error || 'Scan validation failed');
    }
    return data;
  }

  // Check-In History Log
  async getCheckInHistory(params?: { eventId?: string; status?: string; search?: string }): Promise<ScanLogEntry[]> {
    const query = new URLSearchParams();
    if (params?.eventId) query.append('eventId', params.eventId);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`/api/checkin/history?${query.toString()}`, { headers: this.getHeaders() });
    const data = await res.json();
    return data.logs || [];
  }

  async clearCheckInHistory(): Promise<void> {
    const res = await fetch('/api/checkin/history', {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to clear check-in logs');
  }

  async manualCheckinOverride(registrationId: string, status: 'attended' | 'confirmed'): Promise<Registration> {
    const res = await fetch(`/api/participants/${registrationId}/manual-checkin`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    return data.registration;
  }

  // Analytics & Reports
  async getEventAnalytics(eventId: string): Promise<any> {
    const res = await fetch(`/api/events/${eventId}/analytics`, { headers: this.getHeaders() });
    const data = await res.json();
    return data.metrics;
  }

  // Certificates
  async getMyCertificates(): Promise<Certificate[]> {
    const res = await fetch('/api/certificates', { headers: this.getHeaders() });
    const data = await res.json();
    return data.certificates || [];
  }

  async issueAllCertificates(eventId: string): Promise<{ issuedCount: number; totalAttended: number }> {
    const res = await fetch(`/api/events/${eventId}/certificates/issue-all`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    const data = await res.json();
    return data;
  }

  // Feedback
  async submitFeedback(eventId: string, payload: { rating: number; npsScore: number; highlights: string[]; comments: string }): Promise<Feedback> {
    const res = await fetch(`/api/events/${eventId}/feedback`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to submit feedback');
    return data.feedback;
  }

  async getEventFeedback(eventId: string): Promise<{ feedback: Feedback[]; averageRating: string; npsScore: number }> {
    const res = await fetch(`/api/events/${eventId}/feedback`, { headers: this.getHeaders() });
    const data = await res.json();
    return data;
  }

  // Emails & Automations
  async getEmails(): Promise<EmailOutboxItem[]> {
    const res = await fetch('/api/emails', { headers: this.getHeaders() });
    const data = await res.json();
    return data.emails || [];
  }

  async retryEmail(id: string): Promise<EmailOutboxItem> {
    const res = await fetch(`/api/emails/${id}/retry`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    const data = await res.json();
    return data.email;
  }

  async sendTestEmail(toEmail: string): Promise<any> {
    const res = await fetch('/api/gmail/send-test', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ toEmail })
    });
    return await res.json();
  }

  async triggerAutomationsNow(): Promise<{ actionsTriggered: number; details: string[] }> {
    const res = await fetch('/api/automations/run-now', {
      method: 'POST',
      headers: this.getHeaders()
    });
    const data = await res.json();
    return data.result;
  }

  async getSystemStats(): Promise<SystemStats> {
    const res = await fetch('/api/system/stats', { headers: this.getHeaders() });
    const data = await res.json();
    return data.stats;
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/audit-logs', { headers: this.getHeaders() });
    const data = await res.json();
    return data.logs || [];
  }

  async getIntegrationsStatus(): Promise<any> {
    const res = await fetch('/api/integrations/status', { headers: this.getHeaders() });
    return await res.json();
  }
}

export const api = new ApiClient();
