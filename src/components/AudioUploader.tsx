"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileAudio, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

interface AudioUploaderProps {
  onUploadFile: (file: File) => void;
  onLoadSample: () => void;
  isProcessing?: boolean;
}

export default function AudioUploader({
  onUploadFile,
  onLoadSample,
  isProcessing = false,
}: AudioUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    const validExtensions = [".mp3", ".wav", ".m4a", ".ogg", ".webm", ".mp4", ".aac"];
    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    if (!validExtensions.includes(fileExt) && !file.type.startsWith("audio/") && !file.type.startsWith("video/")) {
      setError("Please upload a valid audio or video file (.mp3, .wav, .m4a, .mp4, .webm)");
      return;
    }

    // Limit to 25MB for free tier demo safety
    if (file.size > 25 * 1024 * 1024) {
      setError("File exceeds 25MB limit. Please upload a shorter clip or use the Browser Recorder.");
      return;
    }

    setSelectedFile(file);
    onUploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
          dragActive
            ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
            : "border-slate-700/80 bg-slate-900/40 hover:bg-slate-900/70 hover:border-slate-600"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*,video/*"
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-indigo-600/30 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10">
            {selectedFile ? (
              <FileAudio className="w-7 h-7 text-emerald-400" />
            ) : (
              <UploadCloud className="w-7 h-7 text-blue-400" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              {selectedFile ? selectedFile.name : "Drag & drop your meeting audio/video file here"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports MP3, WAV, M4A, WEBM, MP4 (up to 25MB)
            </p>
          </div>

          {selectedFile && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ready for AI Processing ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
            </div>
          )}

          {error && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}

          {isProcessing && (
            <div className="text-xs font-medium text-blue-400 animate-pulse mt-2">
              Uploading & running Groq Whisper + Gemini AI...
            </div>
          )}
        </div>
      </div>

      {/* Or Load Demo Shortcut */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400 px-2">
        <span>Don&apos;t have an audio file ready?</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLoadSample();
          }}
          className="inline-flex items-center gap-1.5 font-medium text-blue-400 hover:text-blue-300 transition underline underline-offset-4"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Load Realistic Demo Meeting</span>
        </button>
      </div>
    </div>
  );
}
