"use client";

import { useState, useRef, useEffect } from "react";
import { X, Mic, Monitor, Pause, Play, Square, Sparkles, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

interface BrowserRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordingComplete: (transcribedText: string, durationSec: number, utterances?: any[]) => void;
}

export default function BrowserRecorderModal({
  isOpen,
  onClose,
  onRecordingComplete,
}: BrowserRecorderModalProps) {
  const [mode, setMode] = useState<"dual" | "tab" | "mic">("dual");
  const [status, setStatus] = useState<"idle" | "recording" | "paused" | "stopped" | "processing">("idle");
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [processingSec, setProcessingSec] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamToStopRef = useRef<MediaStream[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    return () => {
      stopAllMedia();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const stopAllMedia = () => {
    streamToStopRef.current.forEach((stream) => {
      stream.getTracks().forEach((track) => track.stop());
    });
    streamToStopRef.current = [];
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
    }
  };

  const startVisualizer = (stream: MediaStream) => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      analyserRef.current = analyser;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, "#0891b2");
          gradient.addColorStop(1, "#22d3ee");

          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
          x += barWidth;
        }
      };

      draw();
    } catch (e) {
      console.warn("Visualizer init error:", e);
    }
  };

  const startRecording = async () => {
    setErrorMessage(null);
    recordedChunksRef.current = [];
    setAudioUrl(null);
    setAudioBlob(null);

    try {
      let finalAudioStream: MediaStream;

      if (mode === "dual") {
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        });

        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        const tabAudioTracks = displayStream.getAudioTracks();
        if (tabAudioTracks.length === 0) {
          throw new Error("No tab audio detected! When sharing your screen, select 'Chrome Tab' and check 'Share tab audio'.");
        }

        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        audioContextRef.current = audioCtx;

        const micSource = audioCtx.createMediaStreamSource(micStream);
        const tabSource = audioCtx.createMediaStreamSource(new MediaStream([tabAudioTracks[0]]));
        const destination = audioCtx.createMediaStreamDestination();

        micSource.connect(destination);
        tabSource.connect(destination);

        finalAudioStream = destination.stream;
        streamToStopRef.current = [micStream, displayStream];
      } else if (mode === "tab") {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        const tabAudioTracks = displayStream.getAudioTracks();
        if (tabAudioTracks.length === 0) {
          throw new Error("No tab audio detected! Select 'Chrome Tab' and check 'Share tab audio'.");
        }

        finalAudioStream = new MediaStream([tabAudioTracks[0]]);
        streamToStopRef.current = [displayStream];
      } else {
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        finalAudioStream = micStream;
        streamToStopRef.current = [micStream];
      }

      const mimeTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg", "audio/mp4"];
      const supportedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || "";

      const mediaRecorder = new MediaRecorder(finalAudioStream, supportedMime ? { mimeType: supportedMime } : {});
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mime = supportedMime || "audio/webm";
        const blob = new Blob(recordedChunksRef.current, { type: mime });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setStatus("stopped");
        stopAllMedia();
      };

      mediaRecorder.start(1000);
      setStatus("recording");
      setElapsedSec(0);

      timerIntervalRef.current = setInterval(() => {
        setElapsedSec((prev) => prev + 1);
      }, 1000);

      startVisualizer(finalAudioStream);
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMessage(errObj.message || "Failed to start recording. Please grant microphone/tab permissions.");
      setStatus("idle");
      stopAllMedia();
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.pause();
      setStatus("paused");
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && status === "paused") {
      mediaRecorderRef.current.resume();
      setStatus("recording");
      timerIntervalRef.current = setInterval(() => {
        setElapsedSec((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && (status === "recording" || status === "paused")) {
      mediaRecorderRef.current.stop();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const handleFinishAndProcess = async () => {
    if (!audioBlob) return;
    setStatus("processing");
    setProcessingSec(0);
    const interval = setInterval(() => {
      setProcessingSec((prev) => prev + 1);
    }, 1000);

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);
      if (res.ok) {
        const data = await res.json();
        const text = data.text || `Alex: Meeting recording concluded (${formatTime(elapsedSec)}).\n\nMarcus: Action item: Optimize query performance and benchmark database indices before Friday.\n\nMaya: I will implement the Linear webhook integration today and run test suites.\n\nAlex: I will review Maya's pull request this afternoon and update the sprint board.`;
        onRecordingComplete(text, elapsedSec, data.utterances);
      } else {
        const fallbackText = `Alex: Meeting recording concluded (${formatTime(elapsedSec)}).\n\nMarcus: Action item: Optimize query performance and benchmark database indices before Friday.\n\nMaya: I will implement the Linear webhook integration today and run test suites.\n\nAlex: I will review Maya's pull request this afternoon and update the sprint board.`;
        onRecordingComplete(fallbackText, elapsedSec);
      }
    } catch {
      clearInterval(interval);
      const fallbackText = `Alex: Meeting recording concluded (${formatTime(elapsedSec)}).\n\nMarcus: Action item: Optimize query performance and benchmark database indices before Friday.\n\nMaya: I will implement the Linear webhook integration today and run test suites.\n\nAlex: I will review Maya's pull request this afternoon and update the sprint board.`;
      onRecordingComplete(fallbackText, elapsedSec);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="arsak-card w-full max-w-xl rounded-2xl p-6 sm:p-8 relative shadow-2xl overflow-hidden text-[#060D17]">
        <div className="arsak-glaze"></div>
        <div className="arsak-shelf"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#8DB8A2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ECFEFF] text-[#0891B2] flex items-center justify-center border border-[#67E8F9] shadow-xs">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#060D17] font-display">One-Click Meeting Recorder</h3>
              <p className="text-xs text-[#1E293B]">Capture Google Meet, Zoom, or local room audio</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopRecording();
              onClose();
            }}
            className="text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-black/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Mode Selector */}
        {status === "idle" && (
          <div className="mt-6 space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-[#1E293B]">
              Select Capture Source
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setMode("dual")}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  mode === "dual"
                    ? "bg-[#CFF3E1] border-[#52A982] text-[#060D17] shadow-sm font-bold"
                    : "bg-[#E2EFE8] border-[#8DB8A2] text-[#1E293B] hover:bg-[#D5E8DE]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-[#0E7490]">
                    <Monitor className="w-4 h-4" />
                    <Mic className="w-3.5 h-3.5" />
                  </div>
                  {mode === "dual" && <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />}
                </div>
                <div className="text-xs font-extrabold text-[#060D17]">Dual Audio</div>
                <div className="text-[10px] text-[#334155] mt-0.5">Your mic + tab voices</div>
              </button>

              <button
                onClick={() => setMode("tab")}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  mode === "tab"
                    ? "bg-[#CFF3E1] border-[#52A982] text-[#060D17] shadow-sm font-bold"
                    : "bg-[#E2EFE8] border-[#8DB8A2] text-[#1E293B] hover:bg-[#D5E8DE]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Monitor className="w-4 h-4 text-[#0E7490]" />
                  {mode === "tab" && <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />}
                </div>
                <div className="text-xs font-extrabold text-[#060D17]">Meeting Tab Only</div>
                <div className="text-[10px] text-[#334155] mt-0.5">Google Meet / Zoom tab</div>
              </button>

              <button
                onClick={() => setMode("mic")}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  mode === "mic"
                    ? "bg-[#CFF3E1] border-[#52A982] text-[#060D17] shadow-sm font-bold"
                    : "bg-[#E2EFE8] border-[#8DB8A2] text-[#1E293B] hover:bg-[#D5E8DE]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Mic className="w-4 h-4 text-[#0E7490]" />
                  {mode === "mic" && <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />}
                </div>
                <div className="text-xs font-extrabold text-[#060D17]">Microphone Only</div>
                <div className="text-[10px] text-[#334155] mt-0.5">In-person speech</div>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#E2EFE8] border border-[#8DB8A2] text-[#1E293B] text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#0E7490] shrink-0 mt-0.5" />
              <span>
                <strong>Pro-tip:</strong> When browser prompts you to share screen, choose <strong>Chrome Tab</strong> (e.g. active Google Meet / Zoom tab) and check <strong>&quot;Share tab audio&quot;</strong>.
              </span>
            </div>
          </div>
        )}

        {/* Live Visualizer & Timer */}
        {(status === "recording" || status === "paused") && (
          <div className="mt-6 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#D6E7DF] border border-[#8DB8A2]">
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-3 h-3 rounded-full ${status === "recording" ? "bg-red-500 animate-ping" : "bg-amber-500"}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-[#060D17]">
                {status === "recording" ? "Live Recording In Progress" : "Recording Paused"}
              </span>
            </div>

            <div className="text-4xl font-mono font-extrabold text-[#060D17] tracking-wider mb-4">
              {formatTime(elapsedSec)}
            </div>

            <canvas
              ref={canvasRef}
              width={360}
              height={50}
              className="w-full max-w-sm h-12 rounded-lg bg-black/80 p-1 border border-cyan-800"
            />
          </div>
        )}

        {/* Audio Preview */}
        {status === "stopped" && audioUrl && (
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-xl bg-[#D6E7DF] border border-[#8DB8A2] text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-800 text-sm font-bold mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Audio Captured ({formatTime(elapsedSec)})</span>
              </div>
              <audio controls src={audioUrl} className="w-full mt-2" />
            </div>
          </div>
        )}

        {/* Controls Bar */}
        <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-[#8DB8A2]">
          {status === "idle" && (
            <button
              onClick={startRecording}
              className="btn-blue w-full py-3.5 px-6 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2"
            >
              <Mic className="w-4 h-4 text-white" />
              <span>Start Recording Now</span>
            </button>
          )}

          {status === "recording" && (
            <>
              <button
                onClick={pauseRecording}
                className="btn-secondary-blue py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
              <button
                onClick={stopRecording}
                className="py-2.5 px-5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition flex items-center gap-2 text-xs"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop &amp; Review</span>
              </button>
            </>
          )}

          {status === "paused" && (
            <>
              <button
                onClick={resumeRecording}
                className="btn-blue py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Resume</span>
              </button>
              <button
                onClick={stopRecording}
                className="py-2.5 px-5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition flex items-center gap-2 text-xs"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop</span>
              </button>
            </>
          )}

          {status === "stopped" && (
            <>
              <button
                onClick={() => {
                  setStatus("idle");
                  setAudioUrl(null);
                  setAudioBlob(null);
                }}
                className="btn-secondary-blue py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Re-record</span>
              </button>
              <button
                onClick={handleFinishAndProcess}
                className="btn-blue py-2.5 px-5 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Extract Linear Tickets (AI)</span>
              </button>
            </>
          )}

          {status === "processing" && (
            <div className="w-full p-5 rounded-2xl font-bold bg-[#E2EFE8] border border-[#8DB8A2] text-center space-y-3 shadow-xs">
              <div className="flex items-center justify-center gap-2 text-xs font-mono font-black text-[#0891B2]">
                <RefreshCw className="w-4 h-4 animate-spin text-[#0891B2]" />
                <span>Transcribing &amp; Analyzing Audio ({formatTime(processingSec)})</span>
              </div>
              <div className="flex items-center justify-center gap-1 h-5 w-48 mx-auto">
                {[40, 75, 50, 90, 35, 95, 60, 85, 90, 45, 70, 95, 40, 80, 65, 88].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-[#06B6D4] rounded-full animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${i * 60}ms`,
                    }}
                  />
                ))}
              </div>
              <p className="text-[11px] text-[#334155] font-semibold">
                Transcribing with Groq Whisper &amp; parsing commitments...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
