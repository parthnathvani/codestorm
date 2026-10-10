import React, { useState, useEffect } from 'react';
import { Certificate } from '../../types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Award,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Printer,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface MyCertificatesProps {
  onViewCertificate: (cert: Certificate) => void;
  onExploreEvents: () => void;
}

export const MyCertificates: React.FC<MyCertificatesProps> = ({
  onViewCertificate,
  onExploreEvents
}) => {
  const { user, addToast } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const certs = await api.getMyCertificates();
      setCertificates(certs);
    } catch (err: any) {
      addToast('error', 'Failed to load credentials', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest font-extrabold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full">
            Collegiate Credentials
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 flex items-center gap-2">
            <Award className="w-8 h-8 text-amber-400" />
            Certificates of Participation
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Official verifiable credentials issued by department chairs and event organizers upon attendance.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 self-start md:self-auto transition-colors"
          title="Refresh certificates"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
          <Award className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-300">No Certificates Earned Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            Attend campus workshops, hackathons, or seminars. Once your gate check-in is verified, organizers can issue your official certificate!
          </p>
          <button
            onClick={onExploreEvents}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
          >
            Explore Events & Workshops
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-slate-900 border border-amber-500/30 hover:border-amber-400/60 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all group relative overflow-hidden"
            >
              {/* Gold accent line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-400" /> Verified Credential
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">{cert.certificateNumber}</span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                  {cert.eventTitle}
                </h3>

                <div className="mt-4 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Recipient:</span>
                    <span className="font-bold text-slate-200">{cert.userName}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Issued Date:</span>
                    <span className="text-slate-300">
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Signed By:</span>
                    <span className="text-amber-300 font-serif italic">{cert.signedBy}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => onViewCertificate(cert)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  View & Print Certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
