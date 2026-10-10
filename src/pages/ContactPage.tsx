import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  HelpCircle,
  Mail,
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Shield,
  FileQuestion
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { addToast } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry / Event Question',
    message: ''
  });

  const faqs = [
    {
      q: 'How does the digital QR ticket check-in work?',
      a: 'When you register for any campus event on EventEase, a unique cryptographically signed QR code is generated instantly. You can save or print the pass, or show it from your phone at the event gate. Organizers scan it with their camera or barcode scanner, verifying your entry in less than two seconds.'
    },
    {
      q: 'How does the automated waitlist promotion engine work?',
      a: 'If an event reaches maximum capacity, students can join the ordered waitlist. If any confirmed participant cancels their registration, the EventEase backend engine automatically promotes the student at position #1, generates their QR pass, and dispatches an alert email.'
    },
    {
      q: 'How do I claim my Certificate of Participation?',
      a: 'Certificates are unlocked exclusively for participants whose gate check-in was successfully verified by event organizers. Once the event concludes and organizers authorize issuance, your verified certificate appears in your "Certificates" tab with a unique verification code and printable layout.'
    },
    {
      q: 'Can I cancel my registration if I cannot attend?',
      a: 'Yes! Navigate to "My Tickets" and click the cancel button. Releasing your seat immediately allows waitlisted peers to attend.'
    },
    {
      q: 'As an organizer, how do I scan tickets without special hardware?',
      a: 'EventEase features an in-browser optical QR scanner that runs on any laptop webcam, tablet, or smartphone browser. It also accepts standard USB/Bluetooth handheld barcode guns.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    addToast('success', 'Support Ticket Submitted', 'Campus Event Operations will respond within 24 hours.');
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-12 pb-16">
      {/* Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-extrabold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full">
          Support & Knowledge Base
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Frequently Asked Questions & Help
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Everything you need to know about college event registrations, QR pass scanning, and verified certificates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FAQ Accordion */}
        <div className="lg:col-span-7 space-y-3">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-cyan-400" />
            Platform FAQs
          </h2>

          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-cyan-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-950/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Form & Help Desk */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-cyan-400" />
                Contact Campus Event Desk
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Have a question regarding department approvals or gate operations? Send our team a message.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">Inquiry Received</h3>
                <p className="text-xs text-slate-300">
                  Your ticket has been logged with the Campus Operations Office. We will get back to you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-3 px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. Alex Rivera"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">University Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    placeholder="student@college.edu"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="General Inquiry / Event Question">General Inquiry / Event Question</option>
                    <option value="QR Ticket Assistance">QR Ticket Assistance</option>
                    <option value="Waitlist Status Query">Waitlist Status Query</option>
                    <option value="Certificate Verification Help">Certificate Verification Help</option>
                    <option value="Organizer Account Onboarding">Organizer Account Onboarding</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Message</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Describe your issue or request..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>

          {/* Office Hours Info */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2 text-slate-400">
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Campus Student Union • Directorate Room 204</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Campus Hotline: +1 (555) 019-2834 (Mon-Fri 8am-6pm)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
