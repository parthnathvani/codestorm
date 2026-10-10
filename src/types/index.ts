export type UserRole = 'student' | 'organizer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  department?: string;
  year?: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export type EventStatus = 'draft' | 'published' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type EventCategory = 
  | 'Tech & Coding'
  | 'Cultural & Arts'
  | 'Sports & Fitness'
  | 'Academic & Seminar'
  | 'Workshop & Bootcamp'
  | 'Career & Networking'
  | 'Social & Community';

export interface CollegeEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  department: string;
  venue: string;
  room?: string;
  startDate: string; // ISO String
  endDate: string; // ISO String
  timezone: string;
  regOpenDate: string; // ISO String
  regCloseDate: string; // ISO String
  capacity: number;
  registeredCount: number;
  checkedInCount: number;
  waitlistCount: number;
  waitlistEnabled: boolean;
  maxWaitlistCapacity: number;
  image: string;
  status: EventStatus;
  tags: string[];
  feedbackEnabled: boolean;
  certificateEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RegistrationStatus = 'confirmed' | 'waitlisted' | 'cancelled' | 'attended';

export interface Registration {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  studentId: string;
  department: string;
  year: string;
  phone?: string;
  registeredAt: string;
  status: RegistrationStatus;
  ticketCode: string; // e.g. EE-HACK-84920
  qrData: string; // verification payload
  qrSecurityHash: string;
  checkedInAt?: string;
  checkedInBy?: string;
  checkInGate?: string;
  waitlistPosition?: number;
  emergencyContact?: string;
  specialNeeds?: string;
}

export interface WaitlistEntry {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  studentId: string;
  position: number;
  status: 'waiting' | 'promoted' | 'declined' | 'expired';
  promotedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  registrationId: string;
  ticketCode: string;
  userId: string;
  userName: string;
  userEmail: string;
  studentId: string;
  timestamp: string;
  gate: string;
  scannedBy: string;
  status: 'valid' | 'duplicate_attempt' | 'rejected';
}

export type ScanAttemptStatus = 'approved' | 'duplicate_attempt' | 'invalid_token' | 'wrong_event' | 'cancelled_pass';

export interface ScanLogEntry {
  id: string;
  timestamp: string;
  eventId?: string;
  eventTitle?: string;
  ticketCode: string;
  studentName: string;
  studentId?: string;
  department?: string;
  userEmail?: string;
  scannerDeviceId: string;
  gate: string;
  scannedBy: string;
  status: ScanAttemptStatus;
  notes?: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  studentId: string;
  issueDate: string;
  verificationUrl: string;
  status: 'issued' | 'revoked';
  signedBy: string;
  signatoryTitle: string;
}

export interface Feedback {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  rating: number; // 1 to 5
  npsScore: number; // 0 to 10
  highlights: string[];
  comments: string;
  submittedAt: string;
}

export type EmailType = 
  | 'qr_ticket'
  | 'reminder_24h'
  | 'reminder_1h'
  | 'waitlist_promoted'
  | 'event_cancelled'
  | 'certificate_ready'
  | 'feedback_survey';

export interface EmailOutboxItem {
  id: string;
  to: string;
  subject: string;
  type: EmailType;
  eventId: string;
  eventTitle: string;
  registrationId?: string;
  htmlContent: string;
  status: 'queued' | 'sent' | 'failed';
  attempts: number;
  lastAttemptAt?: string;
  errorMessage?: string;
  createdAt: string;
  sentAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  category: 'registration' | 'checkin' | 'waitlist' | 'event' | 'security' | 'email' | 'system';
  actorId: string;
  actorName: string;
  actorRole: string;
  targetId?: string;
  details?: Record<string, unknown>;
  severity: 'info' | 'warning' | 'error' | 'success';
}

export interface SystemStats {
  totalEvents: number;
  totalRegistrations: number;
  totalCheckedIn: number;
  totalWaitlisted: number;
  totalCertificatesIssued: number;
  emailsDelivered: number;
  overallAttendanceRate: number;
  activeAutomationsCount: number;
}
