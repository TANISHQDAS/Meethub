"use client";

import { useState, useRef } from "react";
import {
  Play,
  Pause,
  Clock,
  Sparkles,
  Zap,
  BarChart3,
  Search,
  Mail,
  Copy,
  Check,
  Share2,
  Calendar,
  Layers,
  ArrowRight,
  User,
  CheckCircle2,
} from "lucide-react";
import { Meeting } from "@/types";
import SpeakerStats from "./SpeakerStats";
import EmailRecapModal from "./EmailRecapModal";
import AskAIModal from "./AskAIModal";

interface MeetingDetailViewProps {
  meeting: Meeting;
}

export default function MeetingDetailView({ meeting }: MeetingDetailViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"summary" | "actions" | "analytics">("summary");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSpeaker, setFilterSpeaker] = useState<string>("all");
  const [actionItems, setActionItems] = useState(meeting.actionItems);
  const [syncedItems, setSyncedItems] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {
        simulateAudioPlayback();
      });
      setIsPlaying(true);
    }
  };

  const simulateAudioPlayback = () => {
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= meeting.durationSec) {
          clearInterval(interval);
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);
  };

  const seekTo = (seconds: number) => {
    setCurrentTime(seconds);
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      if (!isPlaying) {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
  };

  const toggleActionItem = (id: string) => {
    setActionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const pushToLinear = (id: string) => {
    setSyncedItems((prev) => ({ ...prev, [id]: true }));
  };

  const copySummaryMarkdown = () => {
    const text = `# ${meeting.title}
Date: ${meeting.date} | Duration: ${meeting.duration}

## Executive Summary
${meeting.summary.tldr}

## Key Takeaways
${meeting.summary.keyPoints.map((p) => `- ${p}`).join("\n")}

## Decisions Made
${meeting.summary.decisions.map((d) => `- ${d}`).join("\n")}

## Linear Action Items
${actionItems.map((a) => `- [${a.completed ? "x" : " "}] ${a.text} (@${a.assignee}) - Priority: ${a.priority}`).join("\n")}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSeconds = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = Math.floor(totalSec % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const filteredTranscript = meeting.transcript.filter((u) => {
    const matchesSearch =
      u.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.speaker.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpeaker = filterSpeaker === "all" || u.speaker === filterSpeaker;
    return matchesSearch && matchesSpeaker;
  });

  const uniqueSpeakers = Array.from(new Set(meeting.transcript.map((u) => u.speaker)));

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16 text-[#0F172A]">
      {/* Top Header Card */}
      <div className="arsak-stage rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl border border-[#85B49C]">
        <div className="arsak-glaze" />
        <div className="arsak-shelf" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#ECFEFF] text-[#0E7490] border border-[#67E8F9]">
                {meeting.platform}
              </span>
              <span className="flex items-center gap-1 text-xs text-[#334155] font-semibold">
                <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                {meeting.date}
              </span>
              <span className="flex items-center gap-1 text-xs text-[#334155] font-semibold">
                <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                {meeting.duration}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#060D17] tracking-tight font-display">
              {meeting.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAskModalOpen(true)}
              className="btn-blue px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ask Copilot</span>
            </button>

            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="btn-secondary-blue px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
            >
              <Mail className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Send Recap</span>
            </button>

            <button
              onClick={copySummaryMarkdown}
              className="btn-secondary-blue px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Notes"}</span>
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: meeting.title, url: window.location.href });
                }
              }}
              className="btn-secondary-blue p-2 text-xs font-bold shadow-2xs"
              title="Share Meeting"
            >
              <Share2 className="w-4 h-4 text-[#334155]" />
            </button>
          </div>
        </div>

        {/* Audio Player Bar */}
        <div className="p-4 rounded-xl bg-[#D6E7DF] border border-[#8DB8A2] flex flex-col sm:flex-row items-center gap-4 relative z-10">
          {meeting.audioUrl && (
            <audio
              ref={audioRef}
              src={meeting.audioUrl}
              onTimeUpdate={() => {
                if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
              }}
              onEnded={() => setIsPlaying(false)}
            />
          )}

          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full btn-blue text-white flex items-center justify-center shrink-0 shadow-md"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>

          <div className="flex-1 w-full space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#1E293B] font-bold">
              <span>{formatSeconds(currentTime)}</span>
              <span>{formatSeconds(meeting.durationSec)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={meeting.durationSec}
              value={currentTime}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="w-full h-1.5 bg-[#8DB8A2] rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
            />
          </div>

          <button
            onClick={cycleSpeed}
            className="text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg btn-secondary-blue shadow-2xs"
          >
            {playbackSpeed}x
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: Transcript (Left) + AI Tabs (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Transcript (7 cols) */}
        <div className="lg:col-span-7 arsak-card rounded-2xl p-5 space-y-4 shadow-sm border border-[#85B49C]">
          <div className="arsak-glaze" />
          <div className="arsak-shelf" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#8DB8A2]">
            <div>
              <h2 className="text-base font-bold text-[#060D17] font-display flex items-center gap-2">
                <span>Meeting Transcript</span>
                <span className="text-xs font-bold text-[#334155]">
                  ({meeting.transcript.length} turns)
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterSpeaker}
                onChange={(e) => setFilterSpeaker(e.target.value)}
                className="text-xs bg-[#EAF4EE] border border-[#8DB8A2] text-[#060D17] font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#0891B2]"
              >
                <option value="all">All Speakers</option>
                {uniqueSpeakers.map((s, i) => (
                  <option key={i} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search words in transcript..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#EAF4EE] border border-[#8DB8A2] text-xs text-[#060D17] placeholder:text-[#334155] focus:outline-none focus:border-[#0891B2] font-medium"
            />
          </div>

          {/* Transcript Scroll Area */}
          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-2">
            {filteredTranscript.map((u) => {
              const isActive = currentTime >= u.start && currentTime <= u.end;
              return (
                <div
                  key={u.id}
                  onClick={() => seekTo(u.start)}
                  className={`p-3.5 rounded-xl transition cursor-pointer border ${
                    isActive
                      ? "bg-[#CFF3E1] border-[#52A982] shadow-sm"
                      : "bg-[#EAF4EE] border-[#8DB8A2] hover:bg-[#DDF0E6]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0891B2]" />
                      <span className="text-xs font-bold text-[#060D17] font-display">{u.speaker}</span>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-[#0E7490] bg-[#ECFEFF] px-2 py-0.5 rounded border border-[#67E8F9]">
                      {u.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-[#1E293B] leading-relaxed font-medium">{u.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI Intelligence & Linear Sync (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Tabs Selector */}
          <div className="flex rounded-xl bg-[#D3E5DC] p-1 border border-[#8DB8A2]">
            <button
              onClick={() => setActiveTab("summary")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                activeTab === "summary"
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-[#1E293B] hover:text-[#060D17]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Summary</span>
            </button>

            <button
              onClick={() => setActiveTab("actions")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                activeTab === "actions"
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-[#1E293B] hover:text-[#060D17]"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Linear Tickets ({actionItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                activeTab === "analytics"
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-[#1E293B] hover:text-[#060D17]"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
          </div>

          {/* TAB 1: SUMMARY & CHAPTERS */}
          {activeTab === "summary" && (
            <div className="arsak-card rounded-2xl p-5 space-y-5 border border-[#85B49C]">
              <div className="arsak-glaze" />
              <div className="arsak-shelf" />

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0E7490] mb-2 font-display">
                  Executive TL;DR
                </h3>
                <p className="text-xs text-[#060D17] leading-relaxed bg-[#EAF4EE] p-3.5 rounded-xl border border-[#8DB8A2] font-medium">
                  {meeting.summary.tldr}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2563EB] mb-2 font-display">
                  Key Takeaways
                </h3>
                <ul className="space-y-2">
                  {meeting.summary.keyPoints.map((point, i) => (
                    <li key={i} className="text-xs text-[#1E293B] flex items-start gap-2 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#059669] mb-2 font-display">
                  Decisions Made
                </h3>
                <ul className="space-y-2">
                  {meeting.summary.decisions.map((decision, i) => (
                    <li key={i} className="text-xs text-[#1E293B] flex items-start gap-2 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#059669] mt-1.5 shrink-0" />
                      <span>{decision}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#B45309] mb-2 flex items-center gap-1.5 font-display">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Topic Chapters</span>
                </h3>
                <div className="space-y-2">
                  {meeting.chapters.map((ch) => (
                    <div
                      key={ch.id}
                      onClick={() => seekTo(ch.startSec)}
                      className="p-3 rounded-xl bg-[#EAF4EE] border border-[#8DB8A2] hover:bg-[#DDF0E6] cursor-pointer transition"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-[#060D17] mb-1 font-display">
                        <span>{ch.title}</span>
                        <span className="font-mono text-[10px] text-[#0E7490] bg-[#ECFEFF] px-1.5 py-0.5 rounded border border-[#67E8F9]">
                          {ch.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#334155] font-medium">{ch.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LINEAR TICKETS */}
          {activeTab === "actions" && (
            <div className="arsak-card rounded-2xl p-5 space-y-4 border border-[#85B49C]">
              <div className="arsak-glaze" />
              <div className="arsak-shelf" />

              <div className="flex items-center justify-between pb-2 border-b border-[#8DB8A2]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#060D17] font-display">
                  Linear Action Items
                </h3>
                <span className="text-[10px] text-[#334155] font-bold">
                  {actionItems.filter((a) => a.completed || syncedItems[a.id]).length}/{actionItems.length} Synced
                </span>
              </div>

              <div className="space-y-2.5">
                {actionItems.map((item, idx) => {
                  const isSynced = syncedItems[item.id];
                  const issueKey = `ENG-${240 + idx + 1}`;
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-[#8DB8A2] bg-[#EAF4EE] space-y-2 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => toggleActionItem(item.id)}
                            className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                          />
                          <span className="font-mono text-[10px] font-bold text-[#0E7490] bg-[#ECFEFF] px-2 py-0.5 rounded border border-[#67E8F9]">
                            {issueKey}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold text-white ${
                            item.priority === "High" ? "bg-amber-600" : "bg-blue-600"
                          }`}
                        >
                          {item.priority}
                        </span>
                      </div>

                      <p
                        className={`text-xs font-bold ${
                          item.completed ? "line-through text-[#64748B]" : "text-[#060D17]"
                        }`}
                      >
                        {item.text}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <div className="flex items-center gap-2 text-[11px] text-[#334155] font-medium">
                          <span className="flex items-center gap-1 font-bold text-[#060D17]">
                            <User className="w-3.5 h-3.5 text-[#2563EB]" />
                            {item.assignee}
                          </span>
                          {item.due && <span>• Due: {item.due}</span>}
                        </div>

                        {isSynced ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Synced</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => pushToLinear(item.id)}
                            className="btn-blue px-2.5 py-1 text-[11px] font-bold flex items-center gap-1"
                          >
                            <span>Push Linear</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: MEETING ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="arsak-card rounded-2xl p-5 space-y-4 border border-[#85B49C]">
              <div className="arsak-glaze" />
              <div className="arsak-shelf" />
              <SpeakerStats
                speakers={meeting.speakers}
                sentimentScore={meeting.sentimentScore}
                engagementScore={meeting.engagementScore}
              />
            </div>
          )}
        </div>
      </div>

      <EmailRecapModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        meeting={meeting}
      />
      <AskAIModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        meeting={meeting}
      />
    </div>
  );
}
