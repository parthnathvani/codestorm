import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { CollegeEvent } from '../../types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  QrCode,
  Camera,
  CameraOff,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Volume2,
  VolumeX,
  Keyboard,
  Sparkles,
  RefreshCw,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  History,
  Laptop
} from 'lucide-react';

interface QRScannerProps {
  events: CollegeEvent[];
  selectedEventId?: string;
  onRefreshStats?: () => void;
  onViewHistory?: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  events,
  selectedEventId: initialEventId,
  onRefreshStats,
  onViewHistory
}) => {
  const { user, addToast } = useAuth();
  const [selectedEventId, setSelectedEventId] = useState<string>(
    initialEventId || (events[0]?.id || '')
  );
  const [gate, setGate] = useState<string>('Gate North (Main Entrance)');
  const [scannerDeviceId, setScannerDeviceId] = useState<string>('Gate-North-Cam-01');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);

  // Scan result state
  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'duplicate' | 'invalid' | 'wrong_event' | 'cancelled';
    message: string;
    participant?: {
      name: string;
      email?: string;
      studentId: string;
      department?: string;
      ticketCode: string;
    };
    checkedInAt?: string;
    checkedInBy?: string;
  } | null>(null);

  const [scanHistory, setScanHistory] = useState<Array<{
    id: string;
    ticketCode: string;
    name: string;
    status: 'success' | 'duplicate' | 'invalid';
    time: string;
  }>>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Audio tone generator
  const playBeep = (type: 'success' | 'warning' | 'error') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      } else if (type === 'warning') {
        // Double tone for duplicate
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(330, audioCtx.currentTime + 0.15);
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        // Buzzer for error
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch {
      // AudioContext not allowed without user gesture
    }
  };

  // Process ticket scan code
  const handleVerifyCode = async (rawCode: string) => {
    if (processing || !rawCode.trim()) return;
    setProcessing(true);

    try {
      const res = await api.scanTicket({
        rawQrPayload: rawCode.trim(),
        ticketCode: rawCode.trim(),
        eventId: selectedEventId || undefined,
        gate,
        scannerDeviceId
      });

      if (res.status === 'success') {
        playBeep('success');
        setScanResult({
          status: 'success',
          message: res.message,
          participant: res.participant,
          checkedInAt: res.checkInTime
        });

        setScanHistory((prev) => [
          {
            id: 'sh_' + Date.now(),
            ticketCode: res.participant.ticketCode,
            name: res.participant.name,
            status: 'success',
            time: new Date().toLocaleTimeString()
          },
          ...prev.slice(0, 9)
        ]);

        addToast('success', 'Check-In Verified', `${res.participant.name} (${res.participant.studentId})`);
        onRefreshStats?.();
      } else if (res.alreadyCheckedIn || res.status === 'duplicate') {
        playBeep('warning');
        setScanResult({
          status: 'duplicate',
          message: res.error,
          participant: res.participant,
          checkedInAt: res.checkedInAt,
          checkedInBy: res.checkedInBy
        });

        setScanHistory((prev) => [
          {
            id: 'sh_' + Date.now(),
            ticketCode: res.participant?.ticketCode || rawCode,
            name: res.participant?.name || 'Already Checked In',
            status: 'duplicate',
            time: new Date().toLocaleTimeString()
          },
          ...prev.slice(0, 9)
        ]);

        addToast('warning', 'Already Checked In', `This pass was already scanned at ${new Date(res.checkedInAt).toLocaleTimeString()}`);
      } else {
        playBeep('error');
        setScanResult({
          status: 'invalid',
          message: res.error || 'Invalid code'
        });
      }
    } catch (err: any) {
      playBeep('error');
      setScanResult({
        status: 'invalid',
        message: err.message || 'Counterfeit or unregistered ticket code.'
      });
      setScanHistory((prev) => [
        {
          id: 'sh_' + Date.now(),
          ticketCode: rawCode,
          name: 'Invalid Ticket',
          status: 'invalid',
          time: new Date().toLocaleTimeString()
        },
        ...prev.slice(0, 9)
      ]);
      addToast('error', 'Check-In Rejected', err.message);
    } finally {
      setProcessing(false);
      setManualCode('');
    }
  };

  // Camera video frame scanner loop
  const scanVideoFrame = () => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data && !processing) {
        handleVerifyCode(code.data);
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
  };

  // Start Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
      }
    } catch (err: any) {
      console.warn('Camera stream inaccessible or permission denied:', err);
      addToast('info', 'Camera Not Accessible', 'You can use the high-speed manual barcode/QR input below.');
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const currentEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
            Live Check-In Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 flex items-center gap-2">
            <QrCode className="w-8 h-8 text-cyan-400" />
            Fast QR Entry Gate Scanner
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time optical camera scanning, instant duplicate-check verification, and audio telemetry.
          </p>
        </div>

        {/* Controls: Sound, Gate Selector, Device Identifier & History Link */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onViewHistory && (
            <button
              onClick={onViewHistory}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              title="View full chronological check-in scan timeline"
            >
              <History className="w-4 h-4 text-cyan-400" />
              Check-In History Log
            </button>
          )}

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-cyan-400'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
            title="Toggle Sound Effects"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Audio' : 'Muted'}</span>
          </button>

          {/* Scanner Device Identifier Selector */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
            <Laptop className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={scannerDeviceId}
              onChange={(e) => setScannerDeviceId(e.target.value)}
              className="bg-transparent border-0 text-xs text-white focus:outline-none font-mono"
            >
              <option value="Gate-North-Cam-01">Station-North-Cam01</option>
              <option value="Gate-South-Laser-02">LaserGun-Station-A</option>
              <option value="Mobile-Staff-Cam-03">Mobile-Safari-Gate2</option>
              <option value="VIP-Gate-FastTrack">VIP-FastTrack-Scanner</option>
            </select>
          </div>

          <select
            value={gate}
            onChange={(e) => setGate(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="Gate North (Main Entrance)">Gate North (Main Entrance)</option>
            <option value="Gate South (Student Center)">Gate South (Student Center)</option>
            <option value="Auditorium VIP / Speaker Gate">Auditorium VIP / Speaker Gate</option>
            <option value="FastTrack Express Lane">FastTrack Express Lane</option>
          </select>
        </div>
      </div>

      {/* Event Selection Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Event:</span>
          <select
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setScanResult(null);
            }}
            className="flex-1 sm:w-80 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm font-semibold text-cyan-300 focus:outline-none focus:border-cyan-500"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({ev.checkedInCount}/{ev.registeredCount} Checked In)
              </option>
            ))}
          </select>
        </div>

        {currentEvent && (
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-400">
              Capacity:{' '}
              <span className="font-bold text-white">
                {currentEvent.registeredCount}/{currentEvent.capacity}
              </span>
            </span>
            <span className="text-slate-400">
              Checked In:{' '}
              <span className="font-bold text-emerald-400">
                {currentEvent.checkedInCount} (
                {currentEvent.registeredCount > 0
                  ? Math.round((currentEvent.checkedInCount / currentEvent.registeredCount) * 100)
                  : 0}
                %)
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Main Scanner Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Camera Viewfinder & Manual Barcode Input */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 overflow-hidden relative shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                Optical Viewfinder
              </span>
              <button
                onClick={cameraActive ? stopCamera : startCamera}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  cameraActive
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20'
                }`}
              >
                {cameraActive ? (
                  <>
                    <CameraOff className="w-3.5 h-3.5" /> Stop Camera
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5" /> Start Live Camera
                  </>
                )}
              </button>
            </div>

            {/* Video Feed / Viewfinder Box */}
            <div className="relative aspect-video w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {cameraActive && (
                <>
                  {/* Target Crosshairs */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-56 h-56 border-2 border-cyan-400/80 rounded-2xl relative shadow-2xl">
                      {/* Laser scanning line */}
                      <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 shadow-lg shadow-cyan-400 animate-scan-laser" />
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-300" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-300" />
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-300" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-300" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-cyan-300 border border-cyan-500/20 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Optical Engine Active
                  </div>
                </>
              )}

              {!cameraActive && (
                <div className="text-center p-6 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                    <QrCode className="w-8 h-8 text-cyan-500/60" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-300">Live Camera is Idle</p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                      Click "Start Live Camera" to scan tickets using your webcam or mobile phone back camera.
                    </p>
                  </div>
                  <button
                    onClick={startCamera}
                    className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    Activate Camera
                  </button>
                </div>
              )}
            </div>

            {/* Manual Code / Barcode Gun Input */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-cyan-400" />
                High-Speed Hardware Scanner / Manual Ticket Code Entry:
              </label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerifyCode(manualCode);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="e.g. EE-HACK-84920 or paste JSON QR payload"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono tracking-wider"
                />
                <button
                  type="submit"
                  disabled={processing || !manualCode.trim()}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  Verify Pass
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Tip: Works with USB/Bluetooth handheld barcode scanners (scanners fire automatic Enter key).
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Scan Verification Result Card & Recent History */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Result Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative min-h-[220px] flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Scan Verification Status
              </span>

              {scanResult ? (
                <div>
                  {scanResult.status === 'success' && (
                    <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 animate-in fade-in zoom-in-95">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                        <div>
                          <h3 className="text-base font-extrabold text-white">ENTRY APPROVED</h3>
                          <span className="text-xs text-emerald-400 font-mono">
                            {scanResult.participant?.ticketCode}
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-950/80 rounded-xl p-3 border border-emerald-500/20 mt-3 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Student:</span>
                          <span className="font-bold text-white">{scanResult.participant?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Roll/ID:</span>
                          <span className="font-mono text-cyan-300">{scanResult.participant?.studentId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Department:</span>
                          <span className="text-slate-300 truncate max-w-[180px]">{scanResult.participant?.department}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-800 text-[11px]">
                          <span className="text-slate-500">Gate & Timestamp:</span>
                          <span className="text-emerald-400">{gate} • Just now</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {scanResult.status === 'duplicate' && (
                    <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 animate-in fade-in zoom-in-95">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0" />
                        <div>
                          <h3 className="text-base font-extrabold text-white">ALREADY CHECKED IN</h3>
                          <span className="text-xs text-amber-400">Duplicate Scan Flagged</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-amber-500/20">
                        {scanResult.message}
                      </p>
                    </div>
                  )}

                  {scanResult.status === 'invalid' && (
                    <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 animate-in fade-in zoom-in-95">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-6 h-6 text-rose-400 flex-shrink-0" />
                        <div>
                          <h3 className="text-base font-extrabold text-white">ENTRY DENIED</h3>
                          <span className="text-xs text-rose-400">Invalid or Counterfeit Pass</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-rose-500/20">
                        {scanResult.message}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <UserCheck className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="text-xs">Awaiting attendee scan</p>
                  <p className="text-[11px] text-slate-600 mt-1">Aim camera at QR code or type ticket code</p>
                </div>
              )}
            </div>

            {scanResult && (
              <button
                onClick={() => setScanResult(null)}
                className="mt-4 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Clear / Ready for Next Attendee
              </button>
            )}
          </div>

          {/* Recent Scans Activity Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Recent Scans This Session
              </span>
              <span className="text-[11px] text-slate-500">{scanHistory.length} recorded</span>
            </div>

            {scanHistory.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No scans logged in this session yet.</p>
            ) : (
              <div className="space-y-2">
                {scanHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="font-mono text-[10px] text-slate-400">{item.ticketCode}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          item.status === 'success'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : item.status === 'duplicate'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {item.status}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
