import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Registration, CollegeEvent } from '../types';
import {
  X,
  Printer,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Download,
  Share2
} from 'lucide-react';

interface QRTicketModalProps {
  registration: Registration;
  event?: CollegeEvent;
  onClose: () => void;
}

export const QRTicketModal: React.FC<QRTicketModalProps> = ({
  registration,
  event,
  onClose
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    // Generate QR code data URL
    QRCode.toDataURL(registration.qrData, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 450,
      color: {
        dark: '#0b132b',
        light: '#ffffff'
      }
    }).then(setQrUrl);

    // Live anti-screenshot clock
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString() + '.' + Math.floor(now.getMilliseconds() / 100));
    };
    updateTime();
    const interval = setInterval(updateTime, 500);
    return () => clearInterval(interval);
  }, [registration]);

  const handlePrint = () => {
    window.print();
  };

  const downloadICS = () => {
    if (!event) return;
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EventEase//College Events//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${event.title}`,
      `DESCRIPTION:College Event - Registration Ticket Code: ${registration.ticketCode}`,
      `LOCATION:${event.venue} ${event.room || ''}`,
      `DTSTART:${new Date(event.startDate).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTEND:${new Date(event.endDate).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${registration.ticketCode}-event.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAttended = registration.status === 'attended';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Printable Area */}
        <div className="printable-area">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 text-white p-6 relative">
            <button
              onClick={onClose}
              className="no-print absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full">
                College Official Pass
              </span>
              {isAttended ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified & Checked In
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Confirmed Pass
                </span>
              )}
            </div>

            <h2 className="text-xl font-extrabold text-white leading-snug">
              {registration.eventTitle}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Ticket Code: <span className="font-mono font-bold text-cyan-300">{registration.ticketCode}</span>
            </p>
          </div>

          {/* Ticket Body */}
          <div className="p-6 bg-slate-50">
            {/* QR Card Container */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
              {/* Dynamic Anti-Screenshot Watermark */}
              <div className="absolute top-2 right-3 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                Live: {currentTime}
              </div>

              {qrUrl ? (
                <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-inner">
                  <img src={qrUrl} alt="QR Ticket Code" className="w-56 h-56 object-contain" />
                </div>
              ) : (
                <div className="w-56 h-56 flex items-center justify-center bg-slate-100 rounded-xl text-slate-400">
                  Rendering QR...
                </div>
              )}

              <div className="mt-3">
                <div className="font-mono text-lg font-extrabold text-slate-900 tracking-wider">
                  {registration.ticketCode}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Present this QR code at campus entry gate for fast verification
                </p>
              </div>

              {/* Status Banner */}
              {isAttended && (
                <div className="mt-4 w-full p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Checked in at {new Date(registration.checkedInAt!).toLocaleTimeString()} (Gate: {registration.checkInGate || 'Main Gate'})
                </div>
              )}
            </div>

            {/* Student & Event Meta Information */}
            <div className="mt-5 grid grid-cols-2 gap-3 text-left">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Student Name</span>
                <span className="text-sm font-semibold text-slate-900 block truncate">{registration.userName}</span>
                <span className="text-xs text-slate-500">{registration.studentId}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Department</span>
                <span className="text-sm font-semibold text-slate-900 block truncate">{registration.department}</span>
                <span className="text-xs text-slate-500">{registration.year}</span>
              </div>

              {event && (
                <>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-600" /> Date & Time
                    </span>
                    <span className="text-xs font-semibold text-slate-900 block mt-0.5">
                      {new Date(event.startDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-600" /> Venue & Hall
                    </span>
                    <span className="text-xs font-semibold text-slate-900 block mt-0.5 truncate">
                      {event.venue}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate block">
                      {event.room || 'General Admission'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Anti-fraud Security Hash */}
            <div className="mt-4 p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-center">
              <span className="text-[10px] font-mono text-slate-500 block truncate">
                Security Hash: {registration.qrSecurityHash?.slice(0, 32)}...
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Single-use verified token. Replay or counterfeit attempts will be flagged.
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons (Hidden when printing) */}
        <div className="no-print p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={downloadICS}
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <CalendarIcon className="w-4 h-4 text-cyan-600" />
            Add to Calendar
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print / Save Pass
          </button>
        </div>
      </div>
    </div>
  );
};
