import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Certificate } from '../types';
import { X, Printer, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface CertificateModalProps {
  certificate: Certificate;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Printable Certificate Area */}
        <div className="printable-area p-8 sm:p-12 bg-[#FCFAF7] text-slate-900 border-8 border-double border-amber-600/40 m-2 rounded-2xl relative shadow-inner">
          {/* Close button */}
          <button
            onClick={onClose}
            className="no-print absolute top-4 right-4 p-2 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Seal & Heading */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 p-1 flex items-center justify-center shadow-md">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <Award className="w-8 h-8 text-amber-600" />
              </div>
            </div>

            <p className="text-xs uppercase tracking-widest font-extrabold text-amber-800">
              EventEase Collegiate Accreditation Board
            </p>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-950 mt-1 tracking-tight">
              Certificate of Participation
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Certificate No: {certificate.certificateNumber}
            </p>
          </div>

          {/* Presentation statement */}
          <div className="text-center my-8">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              This is to certify that
            </p>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-950 my-2 underline decoration-amber-500/50 underline-offset-8">
              {certificate.userName}
            </h2>
            <p className="text-xs text-slate-600">
              Student ID: <span className="font-semibold text-slate-800">{certificate.studentId}</span>
            </p>
            <p className="text-sm text-slate-700 max-w-lg mx-auto mt-4 leading-relaxed">
              has successfully registered, attended, and fulfilled all collegiate attendance requirements for the campus event:
            </p>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
              "{certificate.eventTitle}"
            </h3>
          </div>

          {/* Verification & Signatures */}
          <div className="mt-10 pt-6 border-t border-slate-300 grid grid-cols-2 sm:grid-cols-3 gap-6 items-end text-center">
            <div>
              <p className="text-xs text-slate-500">Date of Issue</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                {new Date(certificate.issueDate).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>

            <div className="hidden sm:flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border border-amber-600/50 flex items-center justify-center bg-amber-50">
                <ShieldCheck className="w-6 h-6 text-amber-700" />
              </div>
              <span className="text-[10px] uppercase font-bold text-amber-800 mt-1">Authentic Seal</span>
            </div>

            <div>
              <div className="border-b border-slate-400 pb-1 w-32 mx-auto font-serif italic text-slate-800">
                {certificate.signedBy}
              </div>
              <p className="text-xs font-semibold text-slate-900 mt-1">{certificate.signedBy}</p>
              <p className="text-[10px] text-slate-500">{certificate.signatoryTitle}</p>
            </div>
          </div>

          {/* Verification Hash Footer */}
          <div className="mt-8 pt-3 border-t border-dashed border-slate-300 text-center">
            <span className="text-[10px] font-mono text-slate-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verifiable on Campus Ledger • Status: Verified Valid
            </span>
          </div>
        </div>

        {/* Print / Action bar */}
        <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between">
          <span className="text-xs text-slate-300">
            Official certificate issued by department organizers
          </span>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print / Save Certificate
          </button>
        </div>
      </div>
    </div>
  );
};
