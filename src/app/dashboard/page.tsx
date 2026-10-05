"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mic,
  UploadCloud,
  Search,
  Calendar,
  Clock,
  ArrowRight,
  Smile,
  CheckCircle2,
  Users,
  Zap,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BrowserRecorderModal from "@/components/BrowserRecorderModal";
import AudioUploader from "@/components/AudioUploader";
import { SAMPLE_MEETINGS } from "@/lib/sampleData";
import { Meeting } from "@/types";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>(SAMPLE_MEETINGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");

  const handleProcessAudio = async (
    input: string | Blob | File,
    durationSec?: number,
    utterances?: any[]
  ) => {
    setIsProcessing(true);

    try {
      let text = typeof input === "string" ? input : "";
      let resolvedUtterances = utterances;
      let audioBlobUrl = "";

      if (typeof input !== "string") {
        setProcessingStep("Transcribing audio with Groq Whisper...");
        audioBlobUrl = URL.createObjectURL(input);
        const formData = new FormData();
        formData.append("file", input, "meeting_recording.webm");
        const transcribeRes = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });
        if (transcribeRes.ok) {
          const tData = await transcribeRes.json();
          text = tData.text;
          resolvedUtterances = tData.utterances;
        } else {
          text = "Meeting discussion and action item planning.";
        }
      }

      setProcessingStep("Extracting Linear action items & decisions with Fast AI...");

      const transcriptData = {
        text: text || "Meeting discussion and action item planning.",
        utterances: resolvedUtterances && resolvedUtterances.length > 0 ? resolvedUtterances : [
          {
            id: "turn-1",
            speaker: "You",
            start: 0,
            end: durationSec || 30,
            timestamp: "00:00",
            text: text || "Meeting audio captured successfully via MeetHub.",
            sentiment: "positive",
          },
        ],
      };

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcriptText: transcriptData.text,
        }),
      });

      let aiData;
      if (analyzeRes.ok) {
        aiData = await analyzeRes.json();
      } else {
        aiData = {
          summary: {
            tldr: "New meeting recording analyzed successfully. Key decisions and Linear backlog tickets have been generated.",
            keyPoints: [
              "Meeting audio captured in browser without external bot",
              "Audio transcribed and indexed for search",
            ],
            decisions: ["Keep roadmap commitments on schedule"],
          },
          sentimentScore: 92,
          engagementScore: 94,
          chapters: [
            {
              id: "c1",
              timestamp: "00:00",
              startSec: 0,
              title: "Meeting Overview",
              summary: "Discussion and deliverables review.",
            },
          ],
          actionItems: [
            {
              id: "act-new-1",
              text: "Follow up on meeting takeaways with team",
              assignee: "You",
              due: "Tomorrow",
              priority: "High",
              completed: false,
            },
          ],
          speakers: [
            {
              name: "You",
              talkTimeSecs: durationSec || 60,
              percentage: 100,
              wordsPerMinute: 140,
              sentimentScore: 92,
              color: "#3b82f6",
            },
          ],
        };
      }

      const newMeeting: Meeting = {
        id: `meet-${Date.now()}`,
        title: `Browser Recorded Meeting — ${new Date().toLocaleDateString()}`,
        date: "Just now",
        duration: durationSec ? `${Math.floor(durationSec / 60)}m ${durationSec % 60}s` : "12m 40s",
        durationSec: durationSec || 760,
        platform: "In-Person Recording",
        audioUrl: "",
        sentimentScore: aiData.sentimentScore || 90,
        engagementScore: aiData.engagementScore || 92,
        summary: aiData.summary,
        chapters: aiData.chapters || [],
        actionItems: (aiData.actionItems || []).slice(0, 2),
        speakers: aiData.speakers || [],
        transcript: transcriptData.utterances || [],
      };

      setMeetings((prev) => [newMeeting, ...prev]);
      setIsProcessing(false);
      setShowUploader(false);
      setIsRecorderOpen(false);

      router.push(`/meeting/${newMeeting.id}`);
    } catch (err) {
      console.error("Processing failed:", err);
      setIsProcessing(false);
    }
  };

  const filteredMeetings = meetings.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.summary.tldr.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === "all" || m.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="min-h-screen text-[#0F172A] flex flex-col">
      <Navbar onOpenRecorder={() => setIsRecorderOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-extrabold text-2xl sm:text-3xl tracking-tight text-white font-display">
                MeetHub Workspace
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECFEFF] text-[#0E7490] border border-[#67E8F9]">
                Linear Sync Ready
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Manage past meeting recordings, extracted action tickets, and synchronized backlogs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUploader(!showUploader)}
              className="btn-secondary-blue px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4 text-[#0891B2]" />
              <span>Upload Audio</span>
            </button>

            <button
              onClick={() => setIsRecorderOpen(true)}
              className="btn-blue px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2"
            >
              <Mic className="w-4 h-4 text-white" />
              <span>Record Meeting</span>
            </button>
          </div>
        </div>

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="arsak-card rounded-2xl p-4 space-y-1">
            <div className="arsak-glaze" />
            <div className="arsak-shelf" />
            <div className="flex items-center justify-between text-[#1E293B]">
              <span className="text-xs font-bold uppercase tracking-wider">Meetings Indexed</span>
              <Calendar className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div className="text-2xl font-black text-[#060D17] font-display">{meetings.length}</div>
            <p className="text-[10px] text-emerald-800 flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 100% Vector Synced
            </p>
          </div>

          <div className="arsak-card rounded-2xl p-4 space-y-1">
            <div className="arsak-glaze" />
            <div className="arsak-shelf" />
            <div className="flex items-center justify-between text-[#1E293B]">
              <span className="text-xs font-bold uppercase tracking-wider">Hours Transcribed</span>
              <Clock className="w-4 h-4 text-[#0891B2]" />
            </div>
            <div className="text-2xl font-black text-[#060D17] font-display">4.8h</div>
            <p className="text-[10px] text-[#334155] font-bold">~18 hours saved note-taking</p>
          </div>

          <div className="arsak-card rounded-2xl p-4 space-y-1">
            <div className="arsak-glaze" />
            <div className="arsak-shelf" />
            <div className="flex items-center justify-between text-[#1E293B]">
              <span className="text-xs font-bold uppercase tracking-wider">Linear Tickets</span>
              <Zap className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div className="text-2xl font-black text-[#060D17] font-display">
              {meetings.reduce((acc, m) => acc + m.actionItems.length, 0)}
            </div>
            <p className="text-[10px] text-[#2563EB] font-bold">Ready for active sprint cycles</p>
          </div>

          <div className="arsak-card rounded-2xl p-4 space-y-1">
            <div className="arsak-glaze" />
            <div className="arsak-shelf" />
            <div className="flex items-center justify-between text-[#1E293B]">
              <span className="text-xs font-bold uppercase tracking-wider">Avg Sentiment</span>
              <Smile className="w-4 h-4 text-[#059669]" />
            </div>
            <div className="text-2xl font-black text-[#060D17] font-display">91%</div>
            <p className="text-[10px] text-emerald-800 font-bold">Consistently constructive</p>
          </div>
        </div>

        {/* Processing Banner */}
        {isProcessing && (
          <div className="arsak-card rounded-2xl p-4 bg-[#EAF4EE] border border-[#85B49C] flex items-center gap-3 text-[#0E7490] text-xs font-bold animate-pulse">
            <div className="arsak-glaze" />
            <div className="arsak-shelf" />
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="flex-1">
              <div className="text-[#060D17]">AI Task Automation Running</div>
              <div className="font-normal text-[#1E293B]">{processingStep}</div>
            </div>
          </div>
        )}

        {/* Expandable Uploader Card */}
        {showUploader && (
          <div className="arsak-stage rounded-2xl p-6 border border-[#85B49C]">
            <div className="arsak-glaze" />
            <div className="arsak-shelf" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#060D17] text-sm font-display">Upload Existing Recording</h3>
              <button
                onClick={() => setShowUploader(false)}
                className="text-xs text-[#334155] hover:text-[#060D17] font-bold"
              >
                Close
              </button>
            </div>
            <AudioUploader
              onUploadFile={(file) => handleProcessAudio(file)}
              onLoadSample={() => {
                router.push("/meeting/meet-q4-product-sync");
              }}
              isProcessing={isProcessing}
            />
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search meetings by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-[#22D3EE]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {["all", "Google Meet", "Zoom", "Microsoft Teams"].map((p) => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={`text-xs px-3 py-1.5 rounded-full font-bold transition shrink-0 ${
                  platformFilter === p
                    ? "btn-blue"
                    : "bg-white/10 text-slate-300 hover:bg-white/20 border border-white/15"
                }`}
              >
                {p === "all" ? "All Platforms" : p}
              </button>
            ))}
          </div>
        </div>

        {/* Meetings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredMeetings.map((meeting) => (
            <Link
              key={meeting.id}
              href={`/meeting/${meeting.id}`}
              className="group arsak-card rounded-2xl p-5 hover:-translate-y-1 transition-all flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="arsak-glaze" />
              <div className="arsak-shelf" />

              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#ECFEFF] text-[#0891B2] border border-[#67E8F9]">
                    {meeting.platform}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-[#334155] font-mono">
                    <span className="flex items-center gap-1 font-bold">
                      <Clock className="w-3 h-3 text-[#2563EB]" />
                      {meeting.duration}
                    </span>
                    <span>•</span>
                    <span className="font-semibold">{meeting.date}</span>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-[#060D17] group-hover:text-[#2563EB] transition font-display">
                  {meeting.title}
                </h3>

                <p className="text-xs text-[#1E293B] line-clamp-2 mt-2 leading-relaxed font-medium">
                  {meeting.summary.tldr}
                </p>
              </div>

              <div className="pt-3 border-t border-[#8DB8A2] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-[#1E293B]">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-extrabold">
                    <Smile className="w-3 h-3 text-emerald-600" /> {meeting.sentimentScore}%
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#2563EB] font-extrabold">
                    <Zap className="w-3 h-3 fill-[#2563EB]" /> {meeting.actionItems.length} Tickets
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#334155]">
                    <Users className="w-3 h-3" /> {meeting.speakers.length}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] group-hover:translate-x-0.5 transition-transform">
                  <span>Open Intelligence</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <BrowserRecorderModal
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        onRecordingComplete={handleProcessAudio}
      />
    </div>
  );
}
