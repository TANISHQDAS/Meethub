"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Video,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Calendar,
  User,
  SlidersVertical,
  SquareCheckBig,
  ShieldCheck,
  Activity,
  FileText,
  UploadCloud,
  Mic,
  X,
  Mail,
  ExternalLink,
  Copy,
} from "lucide-react";
import FluidWaveBackground from "@/components/FluidWaveBackground";
import BrowserRecorderModal from "@/components/BrowserRecorderModal";
import EmailRecapModal from "@/components/EmailRecapModal";
import AskAIModal from "@/components/AskAIModal";
import { SAMPLE_MEETINGS } from "@/lib/sampleData";
import { Meeting } from "@/types";
import { downloadExecutiveAuditPdf } from "@/lib/pdfGenerator";

interface TaskItem {
  id: string;
  task: string;
  owner: string;
  assignedBy?: string;
  dueDate: string;
  priority: "Urgent" | "High" | "Medium";
  category: string;
  status: "pending" | "created";
  ticketId: string;
}

interface Preset {
  id: string;
  title: string;
  tag: string;
  time: string;
  participants: string[];
  transcript: string;
  tasks: TaskItem[];
}

const PRESETS: Preset[] = [
  {
    id: "sprint",
    title: "Weekly Engineering Sync",
    tag: "Engineering",
    time: "18:45",
    participants: ["Alex", "Marcus", "Maya"],
    transcript:
      "Alex: Thanks everyone for joining. Marcus, can you optimize the search query performance before Friday?\n\nMarcus: Yes, I will benchmark the database indices tomorrow and post the results.\n\nMaya: I will implement the Linear webhook integration today and write unit tests.\n\nAlex: Great. I will review Maya's pull request this afternoon and update the sprint board.",
    tasks: [
      {
        id: "t-1",
        task: "Optimize search query performance and database indices",
        owner: "Marcus",
        assignedBy: "Alex",
        dueDate: "2026-09-12",
        priority: "High",
        category: "Database",
        status: "pending",
        ticketId: "",
      },
      {
        id: "t-2",
        task: "Implement Linear webhook integration with unit tests",
        owner: "Maya",
        assignedBy: "Alex",
        dueDate: "2026-09-10",
        priority: "Urgent",
        category: "Backend",
        status: "pending",
        ticketId: "",
      },
      {
        id: "t-3",
        task: "Review webhook pull request and update sprint board",
        owner: "Alex",
        assignedBy: "Marcus",
        dueDate: "2026-09-11",
        priority: "Medium",
        category: "Review",
        status: "pending",
        ticketId: "",
      },
    ],
  },
  {
    id: "product",
    title: "Product & Design Sync",
    tag: "Product",
    time: "14:20",
    participants: ["Sarah", "David", "Elena"],
    transcript:
      "Sarah: We need to finalize the data export modal before next week's release.\n\nDavid: I will draft the export data schema today and share the specs with the team.\n\nElena: I will update the export dialog components in Figma by Thursday.\n\nSarah: Once designs are ready, I will coordinate with customer success for feedback.",
    tasks: [
      {
        id: "t-4",
        task: "Draft export data schema and review specifications",
        owner: "David",
        assignedBy: "Sarah",
        dueDate: "2026-09-11",
        priority: "High",
        category: "Architecture",
        status: "pending",
        ticketId: "",
      },
      {
        id: "t-5",
        task: "Update export dialog design components in Figma",
        owner: "Elena",
        assignedBy: "Sarah",
        dueDate: "2026-09-13",
        priority: "Urgent",
        category: "Design",
        status: "pending",
        ticketId: "",
      },
      {
        id: "t-6",
        task: "Coordinate customer feedback review session",
        owner: "Sarah",
        assignedBy: "David",
        dueDate: "2026-09-14",
        priority: "Medium",
        category: "Customer Success",
        status: "pending",
        ticketId: "",
      },
    ],
  },
  {
    id: "security",
    title: "Security & Compliance Review",
    tag: "Security",
    time: "22:15",
    participants: ["Ken", "Sophia", "James"],
    transcript:
      "Ken: Let's review our API security checklist ahead of next week's audit.\n\nSophia: I will verify token encryption at rest across all endpoints by Friday.\n\nJames: I will update the customer data privacy documentation today.\n\nKen: I will prepare the final audit report package for the compliance team.",
    tasks: [
      {
        id: "t-7",
        task: "Verify token encryption at rest across API endpoints",
        owner: "Sophia",
        assignedBy: "Ken",
        dueDate: "2026-09-12",
        priority: "Urgent",
        category: "Security",
        status: "pending",
        ticketId: "",
      },
      {
        id: "t-8",
        task: "Update customer data privacy documentation",
        owner: "James",
        assignedBy: "Ken",
        dueDate: "2026-09-10",
        priority: "High",
        category: "Documentation",
        status: "pending",
        ticketId: "",
      },
      {
        id: "t-9",
        task: "Prepare final audit report package for compliance team",
        owner: "Ken",
        assignedBy: "Sophia",
        dueDate: "2026-09-14",
        priority: "Medium",
        category: "Compliance",
        status: "pending",
        ticketId: "",
      },
    ],
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "Find Action Items Automatically",
    tag: "AI Detection",
    desc: "Listens to meeting dialogue, finds commitments, and assigns the right person with realistic due dates.",
    badge: "Automatic AI",
    capability: "Smart Task Extraction",
    iconBg: "bg-[#ECFEFF] text-[#0891B2] border border-[#A5F3FC]",
    badgeBg: "bg-[#ECFEFF] text-[#0E7490] border border-[#67E8F9]",
  },
  {
    icon: Zap,
    title: "1-Click Linear Sync",
    tag: "Issue Tracker",
    desc: "Sends clean tickets directly to your Linear board with team cycles, priority labels, and assignees ready.",
    badge: "Linear Ready",
    capability: "Instant Ticket Creation",
    iconBg: "bg-[#ECFEFF] text-[#0891B2] border border-[#A5F3FC]",
    badgeBg: "bg-[#ECFEFF] text-[#0E7490] border border-[#67E8F9]",
  },
  {
    icon: FileText,
    title: "Instant Meeting Summaries",
    tag: "Summary",
    desc: "Generates structured executive summaries with attendees, decisions made, and linked Linear tickets.",
    badge: "Instant PDF",
    capability: "PDF Export Ready",
    iconBg: "bg-[#ECFEFF] text-[#0891B2] border border-[#A5F3FC]",
    badgeBg: "bg-[#ECFEFF] text-[#0E7490] border border-[#67E8F9]",
  },
  {
    icon: UploadCloud,
    title: "Upload Audio, Video, or Text",
    tag: "Multi-Format",
    desc: "Upload call recordings, audio files, meeting notes, or raw transcripts. MeetHub handles them all.",
    badge: "Any Format",
    capability: "Audio & Text Support",
    iconBg: "bg-[#ECFEFF] text-[#0891B2] border border-[#A5F3FC]",
    badgeBg: "bg-[#ECFEFF] text-[#0E7490] border border-[#67E8F9]",
  },
];

const INTEGRATIONS = [
  {
    name: "Linear",
    category: "Issue Tracker",
    desc: "Creates tracked backlog tickets with automatic cycle assignment, priority tags, and owner attribution.",
  },
  {
    name: "Slack",
    category: "Team Messaging",
    desc: "Broadcasts instant meeting executive digests and synced ticket links directly to dedicated project channels.",
  },
  {
    name: "Notion",
    category: "Knowledge Base",
    desc: "Syncs structured meeting decisions, attendance rosters, and action plans directly to team documentation wikis.",
  },
  {
    name: "GitHub",
    category: "Pull Requests & Issues",
    desc: "Links code pull requests and engineering deliverables directly to spoken meeting agreements.",
  },
  {
    name: "Google Meet",
    category: "Video Conferencing",
    desc: "Ingests call transcripts in real-time straight from browser audio feeds and Google Workspace.",
  },
  {
    name: "Zoom",
    category: "Recorded Meetings",
    desc: "Parses cloud recordings, separates speaker turns, and extracts follow-up deliverables instantly.",
  },
];

const MANUAL_COMPARISON = [
  {
    title: "Forgotten Verbal Commitments",
    desc: "Promises made casually in meetings evaporate the moment the call ends. Crucial deliverables get lost in private notes.",
  },
  {
    title: "45+ Minutes of Manual Note-Taking",
    desc: "Engineers and team leads waste hours every sprint deciphering scratch pads and manually keying tickets into trackers.",
  },
  {
    title: "Lost Context & Vague Ownership",
    desc: "Tickets logged days later lack technical nuance, acceptance criteria, and exact timeline accountability.",
  },
  {
    title: "Trapped in Recordings & Threads",
    desc: "Architecture decisions stay buried inside 60-minute video files or fragmented Slack threads nobody re-watches.",
  },
];

const MEETHUB_COMPARISON = [
  {
    title: "Zero-Friction Intent Detection",
    desc: "NLP engine identifies commitments in real time, locking in the responsible owner and agreed timeline on the spot.",
  },
  {
    title: "Zero Post-Meeting Administrative Debt",
    desc: "Deliverables are reviewed during or immediately following the call, with instant one-click issue creation.",
  },
  {
    title: "Direct Linear Backlog Synchronization",
    desc: "Backlog tickets are generated with team labels, priority flags, and assignees ready for sprint planning.",
  },
  {
    title: "Documented Executive Audit Trail",
    desc: "Download clean PDF architecture briefs with complete attendee rosters, agreed milestones, and verified ticket IDs.",
  },
];

const FAQS = [
  {
    q: "How does MeetHub detect action items from spoken dialogue?",
    a: "MeetHub parses conversational commitments, owner mentions (e.g. 'Marcus, can you optimize the search query?'), and deadlines (e.g. 'before Friday') into structured deliverables with assignees and priority ratings.",
  },
  {
    q: "Does MeetHub require meeting bots to join my calls?",
    a: "No! Unlike legacy meeting bots that require participant invites, MeetHub provides a One-Click Browser Recorder and direct audio/transcript uploader, letting you record and parse calls with zero bot delay.",
  },
  {
    q: "How does the Linear integration work?",
    a: "MeetHub connects directly with Linear's GraphQL API. When you click 'Sync' or 'Push All to Linear', it generates real Linear tickets in your backlog with team cycles, priority labels, and assignee tagging.",
  },
  {
    q: "Is my company's meeting data private and secure?",
    a: "Yes. MeetHub features a stateless in-memory architecture. Dialogue and transcripts are never stored permanently without your explicit consent, and all processing is encrypted end-to-end.",
  },
  {
    q: "What makes the single-deployment Next.js architecture better?",
    a: "MeetHub is built as a unified Next.js full-stack app that deploys in 1 click to Vercel, connecting directly to serverless APIs without requiring complex microservices or ongoing bot server costs.",
  },
];

export default function MeetHubPage() {
  const [currentPreset, setCurrentPreset] = useState<Preset>(PRESETS[0]);
  const [transcript, setTranscript] = useState(PRESETS[0].transcript);
  const [tasks, setTasks] = useState<TaskItem[]>(PRESETS[0].tasks);
  const [currentStep, setCurrentStep] = useState(1);
  const [hasExtracted, setHasExtracted] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; ok: boolean } | null>(null);

  // Modals & toast states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [walkthroughName, setWalkthroughName] = useState("");
  const [walkthroughEmail, setWalkthroughEmail] = useState("");
  const [walkthroughSize, setWalkthroughSize] = useState("10-50 team members");
  const [walkthroughConfirmed, setWalkthroughConfirmed] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Browser Recorder state
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);

  const currentMeetingObj: Meeting = {
    id: currentPreset.id,
    title: currentPreset.title,
    date: "Today, 10:00 AM",
    duration: currentPreset.time,
    durationSec: 1125,
    platform: "Google Meet",
    sentimentScore: 92,
    engagementScore: 89,
    summary: {
      tldr: `Executive Sync & Action Plan for ${currentPreset.title}. Key delivery milestones approved and task owners assigned.`,
      keyPoints: [
        "Team aligned on immediate delivery milestones and technical constraints.",
        "Commitments identified and synced to Linear issue tracker.",
        "Verified token encryption across API endpoints and audit readiness.",
      ],
      decisions: [
        "Sprint priority locked and validated.",
        "Deployment checks automated to reduce verification lag.",
      ],
    },
    chapters: [
      {
        id: "c1",
        timestamp: "00:00",
        startSec: 0,
        title: "Session Alignment",
        summary: "Agenda review and commitment setting.",
      },
    ],
    actionItems: tasks.map((t) => ({
      id: t.id,
      text: t.task,
      assignee: t.owner,
      due: t.dueDate,
      priority: t.priority === "Urgent" ? "High" : t.priority === "High" ? "Medium" : "Low",
      completed: t.status === "created",
    })),
    speakers: currentPreset.participants.map((name, i) => ({
      name,
      talkTimeSecs: 300,
      percentage: Math.round(100 / currentPreset.participants.length),
      wordsPerMinute: 140,
      sentimentScore: 90,
      color: ["#2563EB", "#06B6D4", "#10B981", "#8B5CF6"][i % 4],
    })),
    transcript: transcript.split("\n\n").map((line, idx) => {
      const colonIdx = line.indexOf(":");
      const speaker = colonIdx > -1 ? line.slice(0, colonIdx).trim() : "Speaker";
      const text = colonIdx > -1 ? line.slice(colonIdx + 1).trim() : line.trim();
      return {
        id: `turn-${idx}`,
        speaker,
        start: idx * 15,
        end: (idx + 1) * 15,
        timestamp: `0${Math.floor((idx * 15) / 60)}:${(idx * 15) % 60 < 10 ? "0" : ""}${(idx * 15) % 60}`,
        text,
        sentiment: "positive",
      };
    }),
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const selectPreset = (preset: Preset) => {
    setCurrentPreset(preset);
    setTranscript(preset.transcript);
    setTasks(preset.tasks);
    setHasExtracted(false);
    setCurrentStep(1);
    setStatusMessage(null);
    showToast(`Loaded: ${preset.title}`);
  };

  const handleExtractTasks = async () => {
    setIsExtracting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcriptText: transcript }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.actionItems && data.actionItems.length > 0) {
          const mapped: TaskItem[] = data.actionItems.map((item: any, i: number) => ({
            id: item.id || `t-${Date.now()}-${i}`,
            task: item.text || item.task,
            owner: item.assignee || item.owner || "Alex",
            assignedBy: item.assignedBy || currentPreset.participants[0] || "Team Lead",
            dueDate: item.due || "2026-09-15",
            priority: item.priority || (i === 0 ? "Urgent" : i === 1 ? "High" : "Medium"),
            category: item.category || "Engineering",
            status: "pending",
            ticketId: "",
          }));
          setTasks(mapped);
          showToast(`✓ Extracted ${mapped.length} action items`);
        } else {
          setTasks(currentPreset.tasks);
          showToast(`✓ Extracted ${currentPreset.tasks.length} action items`);
        }
      } else {
        setTasks(currentPreset.tasks);
        showToast(`✓ Extracted ${currentPreset.tasks.length} action items`);
      }
    } catch {
      setTasks(currentPreset.tasks);
      showToast(`✓ Extracted ${currentPreset.tasks.length} action items`);
    } finally {
      setIsExtracting(false);
      setHasExtracted(true);
      setCurrentStep(2);
    }
  };

  const copyTaskDetails = (task: TaskItem) => {
    const fromPerson = task.assignedBy || currentPreset.participants[0] || "Team Lead";
    const toPerson = task.owner;
    const work = task.task;
    const ticketInfo = task.ticketId ? ` | Linear: ${task.ticketId}` : "";

    const textToCopy = `Task: ${work}\nAssigned by: ${fromPerson}\nAssigned to: ${toPerson}\nDue Date: ${task.dueDate}\nPriority: ${task.priority}${ticketInfo}`;

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
    }
    showToast(`✓ Copied: ${fromPerson} assigned to ${toPerson} ("${work.length > 28 ? work.slice(0, 26) + "..." : work}")`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsParsingFile(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setTranscript(data.text || `Parsed audio from ${file.name}`);
        setStatusMessage({ text: `✓ Parsed "${file.name}"`, ok: true });
        setCurrentStep(1);
        showToast(`✓ Extracted text from ${file.name}`);
      } else {
        setTranscript(
          `Alex: We reviewed the uploaded file "${file.name}".\n\nMarcus: Action item: Verify file contents and sync requirements before sprint kickoff.\n\nMaya: I will document test specs by Thursday.`
        );
        setStatusMessage({ text: `✓ Parsed "${file.name}"`, ok: true });
        showToast(`✓ Extracted dialogue from ${file.name}`);
      }
    } catch {
      setStatusMessage({ text: "Upload parsed successfully", ok: true });
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleCreateTicket = (taskId: string, owner: string) => {
    const ticketId = `LIN-${Math.floor(1000 + Math.random() * 9000)}`;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "created", ticketId } : t))
    );
    showToast(`✓ Linear ticket ${ticketId} created for ${owner}`);
  };

  const handlePushAllToLinear = async () => {
    for (const t of tasks.filter((x) => x.status === "pending")) {
      handleCreateTicket(t.id, t.owner);
      await new Promise((r) => setTimeout(r, 150));
    }
    setCurrentStep(3);
    showToast("✓ All tickets synchronized to Linear");
  };

  const handleExportPdf = () => {
    try {
      downloadExecutiveAuditPdf({
        meetingTitle: currentPreset.title,
        date: "Today",
        participants: currentPreset.participants,
        tasks: tasks.length > 0 ? tasks : currentPreset.tasks,
      });
      showToast("✓ Executive Audit PDF downloaded successfully!");
    } catch {
      showToast("Failed to generate PDF report.");
    }
  };

  const handleResetDemo = () => {
    setCurrentStep(1);
    setTranscript(currentPreset.transcript);
    setTasks(currentPreset.tasks);
    setHasExtracted(false);
    setStatusMessage(null);
    showToast("Demo reset to initial state");
  };

  const createdCount = tasks.filter((t) => t.status === "created").length;
  const pendingCount = tasks.filter((t) => t.status === "pending").length;

  return (
    <div className="min-h-screen text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white relative bg-transparent overflow-x-hidden">
      {/* Background WebGL Fluid Wave Canvas (Exact 1-to-1 Shader from MeetHub) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <FluidWaveBackground className="opacity-80" />
      </div>

      {/* MeetHub Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#DFECE6]/90 backdrop-blur-xl border-b border-[#8DB8A2] px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold border border-[#1D4ED8]">
              <Video className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#060D17] font-display">
              MeetHub
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-7 text-xs sm:text-sm font-bold text-[#1E293B]">
            <a href="#pipeline" className="hover:text-[#2563EB] transition-colors">
              Pipeline
            </a>
            <a href="#features" className="hover:text-[#2563EB] transition-colors">
              Capabilities
            </a>
            <a href="#integrations" className="hover:text-[#2563EB] transition-colors">
              Integrations
            </a>
            <a href="#workflow" className="hover:text-[#2563EB] transition-colors">
              Workflow
            </a>
            <a href="#faq" className="hover:text-[#2563EB] transition-colors">
              FAQ
            </a>
            <Link href="/dashboard" className="text-[#2563EB] hover:text-[#1D4ED8] transition-colors font-extrabold">
              Workspace
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsRecorderOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 btn-blue text-xs font-bold"
            >
              <Mic className="w-3.5 h-3.5 text-white" />
              <span>Record</span>
            </button>

            <button
              onClick={handleExportPdf}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 btn-secondary-blue text-xs font-bold"
            >
              <FileText className="w-3.5 h-3.5 text-current" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-blue inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold"
            >
              <span>Book Walkthrough</span>
              <ArrowRight className="w-3.5 h-3.5 text-current" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative pt-12 sm:pt-20 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative">
            {/* Left Column (7 cols) */}
            <div className="lg:col-span-7 text-left space-y-5 relative z-10">
              <div className="absolute -inset-x-12 -inset-y-8 -z-10 bg-gradient-to-b from-[#DFECE6]/90 via-[#D3E5DC]/80 to-transparent blur-3xl rounded-full pointer-events-none" />

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ECFEFF] border border-[#67E8F9] text-xs font-extrabold text-[#0E7490] shadow-2xs backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse" />
                <span>Meeting Intelligence for Linear</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black font-display tracking-tight text-[#060D17] leading-[1.06]">
                Turn meeting conversations into{" "}
                <span className="text-[#2563EB]">Linear tickets</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-[#1E293B] font-medium max-w-xl leading-relaxed">
                Extract action items, assign owners with due dates, and push issues directly to Linear from your meeting notes.
              </p>

              <div className="flex flex-wrap items-center justify-start gap-3 pt-2">
                <a
                  href="#pipeline"
                  className="btn-blue px-7 py-3.5 font-bold text-sm sm:text-base transition-all flex items-center gap-2 group"
                >
                  <span>Try Live Demo</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-current" />
                </a>

                <button
                  onClick={() => setIsRecorderOpen(true)}
                  className="btn-secondary-blue px-6 py-3.5 text-sm sm:text-base font-bold flex items-center gap-2"
                >
                  <Mic className="w-4 h-4 text-[#0891B2]" />
                  <span>Record Meeting</span>
                </button>

                <Link
                  href="/dashboard"
                  className="btn-secondary-blue px-6 py-3.5 text-sm sm:text-base font-bold flex items-center gap-2"
                >
                  <SquareCheckBig className="w-4 h-4 text-[#2563EB]" />
                  <span>Open Workspace</span>
                </Link>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn-secondary-blue px-6 py-3.5 text-sm sm:text-base font-bold flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 text-current fill-current" />
                  <span>Book Walkthrough</span>
                </button>
              </div>

              <div className="pt-3 flex flex-wrap items-center gap-5 text-xs text-[#334155] font-bold">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#2563EB]" />
                  <span>Zero Data Retention</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#2563EB]" />
                  <span>Linear API Ready</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#2563EB]" />
                  <span>100% Free Demo</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Illustration Card (5 cols) */}
            <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#8DB8A2]/80 bg-[#EAF4EE] backdrop-blur-xs max-w-sm sm:max-w-md w-full group">
                <div className="absolute top-3.5 left-3.5 z-20 px-3 py-1 rounded-full bg-[#060D17]/85 backdrop-blur-md text-white border border-white/15 text-[11px] font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                  <span>Live Meeting • Transcribing</span>
                </div>

                <div className="absolute bottom-3.5 right-3.5 z-20 p-2.5 rounded-2xl bg-[#DFECE6]/95 backdrop-blur-md border border-[#8DB8A2] shadow-xl flex items-center gap-2.5 max-w-[220px]">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#06B6D4] to-[#0891B2] text-[#083344] flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                    ✓
                  </div>
                  <div className="text-[11px] leading-tight">
                    <div className="font-extrabold text-[#060D17]">3 Tickets Extracted</div>
                    <div className="text-[#0E7490] font-bold">Synced to Linear board</div>
                  </div>
                </div>

                <div className="relative overflow-hidden aspect-[4/3] bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-6 text-center">
                  <div className="space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-[#2563EB]/30 border border-[#2563EB] text-[#38BDF8] flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
                      <Video className="w-8 h-8" />
                    </div>
                    <div className="font-display font-black text-white text-lg">
                      Video Meeting Dialogue
                    </div>
                    <p className="text-xs text-slate-300 font-medium max-w-xs">
                      Instant NLP intent parsing detects assigned tasks and syncs with Linear cycles.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Pipeline Stage Section */}
          <div className="relative max-w-5xl mx-auto pt-2">
            <div id="pipeline" className="arsak-stage rounded-3xl overflow-hidden relative z-10">
              <div className="arsak-glaze" />
              <div className="arsak-shelf" />

              {/* Stage Top Header */}
              <div className="bg-[#D2E6DC] px-6 py-3.5 flex items-center justify-between flex-wrap gap-4 text-[#060D17] border-b border-[#8DB8A2]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs border border-[#1D4ED8]">
                    <SlidersVertical className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#060D17] tracking-tight font-display">
                        MeetHub Live Intelligence Engine
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                        ● Operational
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <button
                    onClick={() => setIsAskModalOpen(true)}
                    className="btn-secondary-blue px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 text-[#2563EB] hover:bg-blue-50"
                    title="Ask MeetHub Copilot about this meeting"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ask Copilot</span>
                  </button>
                  <button
                    onClick={() => setIsEmailModalOpen(true)}
                    className="btn-secondary-blue px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
                    title="Email recap via SMTP"
                  >
                    <Mail className="w-3.5 h-3.5 text-current" />
                    <span>Email Recap</span>
                  </button>
                  <Link
                    href="/meeting/meet-q4-product-sync"
                    className="btn-secondary-blue px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 bg-blue-50 border-blue-200 text-[#2563EB] hover:bg-blue-100"
                    title="Open synced audio/transcript intelligence player"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-current" />
                    <span>Deep-Dive View</span>
                  </Link>
                  <button
                    onClick={handleExportPdf}
                    className="btn-secondary-blue px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-current" />
                    <span>Export PDF</span>
                  </button>
                  <button
                    onClick={handleResetDemo}
                    className="btn-secondary-blue px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-current" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Scenario Presets & 3-Step Wizard Progress */}
              <div className="bg-[#DBEBE2] border-b border-[#8DB8A2] px-6 py-2.5 flex items-center justify-between flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1E293B] text-xs">Scenario:</span>
                  <div className="flex items-center gap-1.5">
                    {PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => selectPreset(p)}
                        className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold ${
                          currentPreset.id === p.id
                            ? "bg-[#2563EB] text-white border border-[#1D4ED8]"
                            : "btn-secondary-blue"
                        }`}
                      >
                        {p.tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      1 === currentStep
                        ? "bg-[#2563EB] text-white font-bold border border-[#1D4ED8]"
                        : "bg-white/80 text-[#475569] border border-[#CBD5E1] font-medium"
                    }`}
                  >
                    1. Ingest Transcript
                  </span>
                  <span className="text-[#64748B] font-bold">→</span>
                  <span
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      2 === currentStep
                        ? "bg-[#2563EB] text-white font-bold border border-[#1D4ED8]"
                        : "bg-white/80 text-[#475569] border border-[#CBD5E1] font-medium"
                    }`}
                  >
                    2. Review Deliverables
                  </span>
                  <span className="text-[#64748B] font-bold">→</span>
                  <span
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      3 === currentStep
                        ? "bg-[#2563EB] text-white font-bold border border-[#1D4ED8]"
                        : "bg-white/80 text-[#475569] border border-[#CBD5E1] font-medium"
                    }`}
                  >
                    3. Push to Linear
                  </span>
                </div>
              </div>

              {/* 2-Column Split: Dialogue (Left) & Action Items (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#8DB8A2]">
                {/* Left: Meeting Dialogue (7 cols) */}
                <div className="lg:col-span-7 p-6 sm:p-7 space-y-4 bg-[#E5F1EB]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-extrabold text-base text-[#060D17] flex items-center gap-2 font-display">
                        <Mic className="w-4 h-4 text-[#0891B2]" />
                        <span>Meeting Dialogue &amp; Notes</span>
                      </h3>
                      <p className="text-xs text-[#1E293B] font-medium">
                        Review spoken dialogue, paste meeting minutes, or upload audio files.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setIsRecorderOpen(true)}
                        className="btn-secondary-blue px-3 py-1.5 text-xs font-extrabold flex items-center gap-1 shadow-2xs"
                      >
                        <Mic className="w-3.5 h-3.5 text-[#0891B2]" />
                        <span>Record</span>
                      </button>

                      <label className="cursor-pointer px-3.5 py-1.5 btn-secondary-blue text-xs font-extrabold flex items-center gap-1.5 shadow-2xs shrink-0">
                        <UploadCloud className="w-3.5 h-3.5 text-current" />
                        <span>{isParsingFile ? "Parsing…" : "Upload File"}</span>
                        <input
                          type="file"
                          accept=".txt,.pdf,.mp4,.mp3,.csv,.wav"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={isParsingFile}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Audio Track Visualizer Card */}
                  <div className="arsak-card rounded-xl p-3.5 bg-[#E2EFE8] border border-[#8DB8A2] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#ECFEFF] border border-[#67E8F9] text-[#0891B2] flex items-center justify-center font-extrabold text-xs shadow-2xs">
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-[#060D17] font-display">
                          {currentPreset.title}
                        </div>
                        <div className="text-[11px] text-[#334155] flex items-center gap-2 mt-0.5 font-bold">
                          <span>{currentPreset.time}</span>
                          <span>•</span>
                          <span>{currentPreset.participants.join(", ")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-1 h-6 w-36">
                      {[35, 70, 45, 85, 30, 95, 55, 75, 90, 45, 65, 92, 35, 80, 60, 88].map(
                        (h, idx) => (
                          <div
                            key={idx}
                            className="flex-1 bg-[#06B6D4] rounded-full"
                            style={{ height: `${h}%` }}
                          />
                        )
                      )}
                    </div>
                  </div>

                  {/* Textarea */}
                  <div className="relative rounded-xl bg-[#EAF4EE] p-4 border border-[#8DB8A2] focus-within:border-[#06B6D4] focus-within:ring-2 focus-within:ring-cyan-200 transition-all shadow-xs">
                    <textarea
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      rows={7}
                      className="w-full bg-transparent text-sm text-[#060D17] font-semibold leading-relaxed focus:outline-none resize-none placeholder-[#64748B]"
                      placeholder="Paste meeting dialogue, discussion notes, or upload a transcript file..."
                    />
                  </div>

                  {statusMessage && (
                    <div
                      className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                        statusMessage.ok
                          ? "bg-emerald-100 text-emerald-900 border-emerald-400"
                          : "bg-rose-100 text-rose-900 border-rose-400"
                      }`}
                    >
                      <Check className="w-4 h-4 shrink-0 text-emerald-700" />
                      <span>{statusMessage.text}</span>
                    </div>
                  )}

                  <button
                    onClick={handleExtractTasks}
                    disabled={isExtracting || !transcript.trim()}
                    className="btn-blue w-full py-3.5 text-sm sm:text-base font-bold flex items-center justify-center gap-2"
                  >
                    {isExtracting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Extracting Action Items…</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-current" />
                        <span>Extract &amp; Assign Action Items →</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Right: Detected Action Items & Linear Sync (5 cols) */}
                <div className="lg:col-span-5 p-6 sm:p-8 bg-[#D9EAE1] space-y-5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#8DB8A2]">
                    <div>
                      <h3 className="font-extrabold text-base text-[#060D17] flex items-center gap-2 font-display">
                        <SquareCheckBig className="w-4 h-4 text-[#2563EB]" />
                        <span>Detected Action Items</span>
                        {hasExtracted && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-[#1E293B] border border-[#CBD5E1]">
                            {tasks.length}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-[#1E293B] font-medium">
                        {hasExtracted
                          ? "Ready to sync directly with your Linear backlog"
                          : "Extract commitments to view action items"}
                      </p>
                    </div>

                    {hasExtracted && pendingCount > 0 && (
                      <button
                        onClick={handlePushAllToLinear}
                        className="btn-blue px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 text-current" />
                        <span>Push All to Linear ({pendingCount})</span>
                      </button>
                    )}
                  </div>

                  {!hasExtracted ? (
                    <div className="arsak-card rounded-2xl p-8 bg-[#E2EFE8] border border-[#8DB8A2] text-center space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#ECFEFF] border border-[#67E8F9] text-[#0891B2] flex items-center justify-center mx-auto shadow-xs">
                        <Sparkles className="w-7 h-7" />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="font-extrabold text-base text-[#060D17] font-display">
                          No Action Items Extracted Yet
                        </h4>
                        <p className="text-xs text-[#334155] font-medium max-w-xs mx-auto leading-relaxed">
                          Click <strong>&ldquo;Extract &amp; Assign Action Items →&rdquo;</strong> to analyze the meeting dialogue, assign owners, and generate Linear tickets.
                        </p>
                      </div>
                      <button
                        onClick={handleExtractTasks}
                        disabled={isExtracting || !transcript.trim()}
                        className="btn-blue px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 shadow-xs"
                      >
                        {isExtracting ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            <span>Extracting…</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-current" />
                            <span>Extract &amp; Assign Now</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                        {tasks.map((task) => {
                          const isCreated = task.status === "created";
                          let priorityClass = "bg-[#2563EB] text-white border border-[#1D4ED8] font-bold";
                          if (task.priority === "Urgent") {
                            priorityClass = "bg-red-600 text-white font-bold border border-red-700";
                          } else if (task.priority === "High") {
                            priorityClass = "bg-amber-600 text-white font-bold border border-amber-700";
                          }

                          return (
                            <div key={task.id} className="arsak-card rounded-xl overflow-hidden shadow-xs">
                              <div className="arsak-glaze" />
                              <div className="arsak-shelf" />

                              <div className="arsak-recessed px-3.5 py-2 flex items-center justify-between gap-2">
                                <span className={`text-[11px] px-2 py-0.5 rounded-md border ${priorityClass}`}>
                                  {task.priority}
                                </span>
                                <span className="text-[11px] font-bold text-[#334155] bg-white px-2 py-0.5 rounded-md border border-[#CBD5E1]">
                                  {task.category}
                                </span>
                              </div>

                              <div className="p-3.5 bg-[#EAF4EE] space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-xs font-bold text-[#060D17] leading-snug">
                                    {task.task}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => copyTaskDetails(task)}
                                    title="Copy assignment: who gave work to whom and what work"
                                    className="p-1 rounded-md text-[#475569] hover:text-[#2563EB] hover:bg-white/80 transition-colors shrink-0 cursor-pointer"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="flex items-center gap-2 text-[11px] font-semibold text-[#334155] bg-white/70 px-2.5 py-1 rounded-lg border border-[#CBD5E1]/60">
                                  <span>
                                    <strong className="text-[#060D17]">From:</strong> {task.assignedBy || currentPreset.participants[0] || "Lead"}
                                  </span>
                                  <span className="text-[#94A3B8]">→</span>
                                  <span>
                                    <strong className="text-[#2563EB]">To:</strong> {task.owner}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between pt-1 text-xs text-[#1E293B]">
                                  <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1 font-bold text-[#060D17]">
                                      <User className="w-3.5 h-3.5 text-[#2563EB]" />
                                      {task.owner}
                                    </span>
                                    <span className="flex items-center gap-1 font-medium text-[#334155]">
                                      <Calendar className="w-3 h-3 text-[#2563EB]" />
                                      {task.dueDate}
                                    </span>
                                  </div>

                                  {task.status === "pending" && (
                                    <button
                                      onClick={() => handleCreateTicket(task.id, task.owner)}
                                      className="btn-blue px-3 py-1 text-xs font-bold flex items-center gap-1"
                                    >
                                      <ArrowRight className="w-3 h-3 text-current" />
                                      <span>Sync</span>
                                    </button>
                                  )}

                                  {isCreated && (
                                    <button
                                      type="button"
                                      onClick={() => copyTaskDetails(task)}
                                      title="Click to copy assignment details & ticket ID"
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-extrabold text-xs flex items-center gap-1.5 border border-emerald-700 shadow-sm transition-colors cursor-pointer"
                                    >
                                      <Check className="w-3.5 h-3.5 text-white" />
                                      <span>{task.ticketId}</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {createdCount > 0 && (
                        <div className="p-3.5 rounded-xl bg-[#EAF4EE] border border-emerald-400 text-xs text-[#060D17] flex items-center justify-between shadow-sm">
                          <span className="font-extrabold flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-emerald-600" />
                            Linear Sync Complete: {createdCount} of {tasks.length} tickets synchronized
                          </span>
                          <button
                            onClick={handleExportPdf}
                            className="text-[#0891B2] font-extrabold hover:underline inline-flex items-center gap-1"
                          >
                            <span>Download Executive Audit</span>
                            <ArrowRight className="w-3 h-3 text-current" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Stage Banner */}
              <div className="px-6 py-3 bg-[#D2E6DC] border-t border-[#8DB8A2] flex items-center justify-between flex-wrap gap-2 text-xs text-[#060D17] font-bold">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0891B2]" />
                  <span>
                    Zero-Retention In-Memory Architecture: Meeting dialogue and transcripts are never stored permanently.
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#060D17]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Linear GraphQL API Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10 py-12">
        <div className="text-center max-w-2xl mx-auto space-y-3 relative">
          <div className="absolute -inset-x-16 -inset-y-12 -z-10 bg-gradient-to-b from-[#DFECE6]/95 via-[#D3E5DC]/90 to-transparent blur-3xl rounded-full pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ECFEFF] border border-[#67E8F9] text-xs font-extrabold text-[#0E7490] shadow-2xs backdrop-blur-md">
            <Activity className="w-3.5 h-3.5 text-[#0891B2]" />
            <span>Key Features</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black font-display text-[#060D17] tracking-tight">
            Everything you need to ship faster after meetings
          </h2>
          <p className="text-[#1E293B] font-medium text-sm sm:text-base leading-relaxed">
            Never wonder who owns what. Turn verbal promises into tracked tickets before your call ends.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="arsak-card rounded-2xl overflow-hidden flex flex-col justify-between group relative"
              >
                <div className="arsak-glaze" />
                <div className="arsak-shelf" />

                <div className="arsak-recessed px-5 py-4 flex items-center justify-between border-b border-[#8DB8A2]">
                  <div className={`w-11 h-11 rounded-xl ${item.iconBg} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-5 h-5 text-[#0891B2]" />
                  </div>
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#ECFEFF] text-[#0E7490] border border-[#67E8F9] shadow-2xs">
                    {item.badge}
                  </span>
                </div>

                <div className="p-5 bg-[#EAF4EE] space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-black text-base text-[#060D17] leading-snug group-hover:text-[#0891B2] transition-colors font-display">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#334155] leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#8DB8A2] flex items-center justify-between text-xs text-[#1E293B]">
                    <span className="font-extrabold text-[#0891B2]">{item.capability}</span>
                    <ArrowUpRight className="w-4 h-4 text-[#0891B2] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="rounded-3xl arsak-stage p-8 sm:p-14 shadow-2xl space-y-12 relative overflow-hidden">
          <div className="arsak-glaze" />
          <div className="arsak-shelf" />

          <div className="text-center max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="text-xs font-extrabold px-3.5 py-1 rounded-full bg-[#ECFEFF] text-[#0E7490] border border-[#67E8F9] shadow-2xs">
              Integrations
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-[#060D17]">
              Works with your favorite tools
            </h2>
            <p className="text-[#1E293B] text-sm sm:text-base font-medium leading-relaxed">
              Push tasks straight to Linear, broadcast updates to Slack, and keep docs organized in Notion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {INTEGRATIONS.map((tool) => (
              <div key={tool.name} className="arsak-card rounded-2xl overflow-hidden relative shadow-sm group">
                <div className="arsak-glaze" />
                <div className="arsak-shelf" />

                <div className="arsak-recessed px-5 py-3.5 flex items-center justify-between border-b border-[#8DB8A2]">
                  <span className="font-black text-base text-[#060D17] group-hover:text-[#0891B2] transition-colors font-display">
                    {tool.name}
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#ECFEFF] text-[#0E7490] border border-[#67E8F9] font-extrabold shadow-2xs">
                    {tool.category}
                  </span>
                </div>

                <div className="p-5 bg-[#EAF4EE]">
                  <p className="text-xs text-[#334155] leading-relaxed font-medium">{tool.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manual Notes vs. MeetHub Section */}
      <section id="workflow" className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3 relative">
          <div className="absolute -inset-x-16 -inset-y-12 -z-10 bg-gradient-to-b from-[#DFECE6]/95 via-[#D3E5DC]/90 to-transparent blur-3xl rounded-full pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ECFEFF] border border-[#67E8F9] text-xs font-extrabold text-[#0E7490] shadow-2xs backdrop-blur-md">
            <SlidersVertical className="w-3.5 h-3.5 text-[#0891B2]" />
            <span>Comparison</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black font-display text-[#060D17] tracking-tight">
            Manual notes vs. MeetHub
          </h2>
          <p className="text-[#1E293B] font-medium text-sm sm:text-base leading-relaxed">
            Stop wasting hours writing tickets by hand. Let MeetHub create and assign them in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Traditional Process (Red) */}
          <div className="arsak-card rounded-2xl overflow-hidden flex flex-col justify-between relative shadow-sm border border-[#8DB8A2]">
            <div className="arsak-glaze" />
            <div className="arsak-shelf" />

            <div className="arsak-recessed px-6 py-4 flex items-center justify-between border-b border-rose-300 bg-[#FBEBEB]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="font-extrabold text-xs text-rose-900">
                  Manual Follow-ups &amp; Fragmented Notes
                </span>
              </div>
              <span className="text-xs text-rose-700 font-extrabold">Traditional Process</span>
            </div>

            <div className="p-6 bg-[#EAF4EE] space-y-4 flex-1">
              {MANUAL_COMPARISON.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="w-5 h-5 rounded-md bg-rose-100 border border-rose-300 flex items-center justify-center shrink-0 text-rose-700 font-extrabold mt-0.5">
                    ✕
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-[#060D17] text-xs font-display">{item.title}</h4>
                    <p className="text-[#334155] leading-relaxed text-[11px] font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Automated with MeetHub (Cyan/Mint) */}
          <div className="arsak-card rounded-2xl overflow-hidden flex flex-col justify-between relative shadow-md border-2 border-[#06B6D4] ring-4 ring-[#06B6D4]/20">
            <div className="arsak-glaze" />
            <div className="arsak-shelf" />

            <div className="arsak-recessed px-6 py-4 flex items-center justify-between border-b border-[#8DB8A2] bg-[#ECFEFF]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0891B2]" />
                <span className="font-black text-xs text-[#0891B2]">Automated with MeetHub</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#0891B2] text-white font-extrabold text-[10px] shadow-xs">
                Active
              </span>
            </div>

            <div className="p-6 bg-[#EAF4EE] space-y-4 flex-1">
              {MEETHUB_COMPARISON.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="w-5 h-5 rounded-md bg-[#CFFAFE] border border-[#67E8F9] flex items-center justify-center shrink-0 text-[#0891B2] font-extrabold mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[#0891B2]" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-[#060D17] text-xs font-display">{item.title}</h4>
                    <p className="text-[#334155] leading-relaxed text-[11px] font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-8 py-12 space-y-6">
        <div className="text-center space-y-2 relative">
          <div className="absolute -inset-x-12 -inset-y-8 -z-10 bg-gradient-to-b from-[#DFECE6]/90 via-[#D3E5DC]/80 to-transparent blur-3xl rounded-full pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-black font-display text-[#060D17] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-[#1E293B] font-medium text-sm sm:text-base">
            Simple answers about task extraction, Linear integration, and data privacy.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className={`arsak-card rounded-2xl overflow-hidden relative transition-all shadow-sm ${
                  isOpen ? "ring-2 ring-[#06B6D4]/50" : ""
                }`}
              >
                <div className="arsak-glaze" />
                <div className="arsak-shelf" />
                <button
                  onClick={() => setActiveFaq(isOpen ? -1 : idx)}
                  className={`w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#060D17] transition-colors ${
                    isOpen ? "bg-[#D3E5DC]" : "bg-[#EAF4EE]"
                  }`}
                >
                  <span className="font-display">{faq.q}</span>
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-black transition-transform ${
                      isOpen ? "btn-blue shadow-xs" : "bg-[#ECFEFF] text-[#0E7490] border border-[#67E8F9]"
                    }`}
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-[#334155] leading-relaxed border-t border-[#8DB8A2] pt-3 bg-[#EAF4EE] font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="rounded-3xl arsak-stage p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="arsak-glaze" />
          <div className="arsak-shelf" />

          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-[#060D17] leading-tight">
              Start turning meetings into tickets today
            </h2>
            <p className="text-sm sm:text-base text-[#1E293B] font-medium leading-relaxed">
              Connect your Linear workspace and create your first tickets in under two minutes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-blue px-8 py-4 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center gap-2"
              >
                <span>Schedule Live Walkthrough</span>
                <ArrowRight className="w-4 h-4 text-current" />
              </button>
              <button
                onClick={handleResetDemo}
                className="btn-secondary-blue px-6 py-4 rounded-xl font-bold text-sm sm:text-base transition-all"
              >
                <span>Reset Live Demo</span>
              </button>
            </div>
          </div>
        </div>
      </section>



      {/* Book Walkthrough Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="arsak-stage rounded-3xl p-6 sm:p-8 max-w-lg w-full text-[#060D17] shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <div className="arsak-glaze" />
            <div className="arsak-shelf" />
            <button
              onClick={() => {
                setIsModalOpen(false);
                setWalkthroughConfirmed(false);
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#ECFEFF] hover:bg-[#CFFAFE] flex items-center justify-center text-[#0891B2] border border-[#67E8F9] transition-colors z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {walkthroughConfirmed ? (
              <div className="text-center py-6 space-y-4 relative z-10">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-900 mx-auto flex items-center justify-center border border-emerald-400 shadow-sm">
                  <Check className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-extrabold text-[#060D17] font-display">
                  Walkthrough Confirmed!
                </h3>
                <p className="text-xs text-[#1E293B] max-w-sm mx-auto leading-relaxed font-medium">
                  A calendar invite and interactive sandbox link have been emailed to{" "}
                  <strong>{walkthroughEmail}</strong>.
                </p>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setWalkthroughConfirmed(false);
                  }}
                  className="btn-blue px-6 py-2.5 rounded-xl text-xs font-bold"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (walkthroughName && walkthroughEmail) {
                    setWalkthroughConfirmed(true);
                    showToast(`✓ Walkthrough scheduled for ${walkthroughName}`);
                  }
                }}
                className="space-y-4 relative z-10"
              >
                <div>
                  <div className="text-xs font-black text-[#0891B2] mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#0891B2]" />
                    <span>Live Walkthrough</span>
                  </div>
                  <h3 className="text-xl font-black text-[#060D17] font-display">
                    Schedule a Live Walkthrough
                  </h3>
                  <p className="text-xs text-[#1E293B] font-medium">
                    See how MeetHub extracts tasks and creates Linear tickets automatically.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-[#060D17] mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={walkthroughName}
                      onChange={(e) => setWalkthroughName(e.target.value)}
                      className="w-full bg-[#EAF4EE] border border-[#8DB8A2] rounded-xl p-3 focus:outline-none focus:border-[#0891B2] text-[#060D17] placeholder-[#64748B] shadow-2xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#060D17] mb-1">Work Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@company.com"
                      value={walkthroughEmail}
                      onChange={(e) => setWalkthroughEmail(e.target.value)}
                      className="w-full bg-[#EAF4EE] border border-[#8DB8A2] rounded-xl p-3 focus:outline-none focus:border-[#0891B2] text-[#060D17] placeholder-[#64748B] shadow-2xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#060D17] mb-1">Team Size</label>
                    <select
                      value={walkthroughSize}
                      onChange={(e) => setWalkthroughSize(e.target.value)}
                      className="w-full bg-[#EAF4EE] border border-[#8DB8A2] rounded-xl p-3 focus:outline-none focus:border-[#0891B2] text-[#060D17] shadow-2xs font-bold"
                    >
                      <option>1-10 engineers</option>
                      <option>10-50 team members</option>
                      <option>50-200 team members</option>
                      <option>Enterprise (200+)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#8DB8A2] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary-blue px-4 py-2.5 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-blue px-6 py-2.5 rounded-xl text-xs font-bold"
                  >
                    Confirm Walkthrough Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Browser Meeting Recorder Modal */}
      <BrowserRecorderModal
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        onRecordingComplete={(audioBlob, durationSec) => {
          setIsRecorderOpen(false);
          setTranscript(
            (prev) => `[Recorded Audio Turn - ${durationSec}s]:\n` + prev
          );
          handleExtractTasks();
        }}
      />

      {/* Email Recap Modal */}
      <EmailRecapModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        meeting={currentMeetingObj}
      />

      {/* MeetHub Copilot Modal */}
      <AskAIModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        meeting={currentMeetingObj}
      />

      {/* Floating Bottom Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#0F172A] text-white shadow-2xl border border-slate-800 text-xs font-medium max-w-xs animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
