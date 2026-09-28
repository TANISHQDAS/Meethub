import { Meeting } from "@/types";

export const SAMPLE_MEETINGS: Meeting[] = [
  {
    id: "meet-q4-product-sync",
    title: "Q4 Product Roadmap & AI Feature Review",
    date: "Today at 2:30 PM",
    duration: "24m 15s",
    durationSec: 1455,
    platform: "Google Meet",
    sentimentScore: 88,
    engagementScore: 92,
    summary: {
      tldr: "The team finalized the Q4 roadmap priorities, approving the real-time AI transcription integration, migrating to automated action-item tracking, and establishing a December 15th release cutoff.",
      keyPoints: [
        "Approved Groq Whisper-large-v3 integration for low-latency live captions.",
        "Allocated 2 weeks for the Web Audio mixer to support dual microphone and browser tab audio capture.",
        "Agreed to introduce sentiment and engagement scoring directly into the participant meeting recap email.",
        "Confirmed privacy-first architecture with end-to-end meeting recording storage."
      ],
      decisions: [
        "Target December 15 for the public beta launch.",
        "Use Google Gemini 1.5 Flash as the default high-throughput summarizer.",
        "Implement one-click Gmail SMTP recap dispatcher for post-call summaries."
      ]
    },
    chapters: [
      {
        id: "c1",
        timestamp: "00:00",
        startSec: 0,
        title: "Kickoff & Agenda Alignment",
        summary: "Sarah introduced the Q4 roadmap priorities and outlined the session objectives."
      },
      {
        id: "c2",
        timestamp: "04:12",
        startSec: 252,
        title: "AI Pipeline & Latency Benchmarks",
        summary: "Alex presented the Whisper vs. Gemini transcription speed tests, demonstrating sub-second response times."
      },
      {
        id: "c3",
        timestamp: "12:40",
        startSec: 760,
        title: "Browser Audio Capture & UX",
        summary: "David walked through the browser tab capture prototype and discussed handling multi-speaker audio."
      },
      {
        id: "c4",
        timestamp: "19:05",
        startSec: 1145,
        title: "Action Items & Timeline Sign-off",
        summary: "Team distributed sprint tasks and locked the final release schedule for December 15."
      }
    ],
    actionItems: [
      {
        id: "act-1",
        text: "Alex to finalize Groq Whisper API endpoint with retry fallbacks",
        assignee: "Alex Rivera",
        due: "This Friday",
        priority: "High",
        completed: false
      },
      {
        id: "act-2",
        text: "David to complete dual-stream audio mixer for browser tab recording",
        assignee: "David Chen",
        due: "Next Monday",
        priority: "High",
        completed: true
      },
      {
        id: "act-3",
        text: "Sarah to review legal terms for meeting recording consent banners",
        assignee: "Sarah Jenkins",
        due: "Oct 5",
        priority: "Medium",
        completed: false
      },
      {
        id: "act-4",
        text: "Configure Gmail SMTP template for automated post-meeting recaps",
        assignee: "Alex Rivera",
        due: "Oct 8",
        priority: "Low",
        completed: false
      }
    ],
    speakers: [
      {
        name: "Sarah Jenkins",
        talkTimeSecs: 640,
        percentage: 44,
        wordsPerMinute: 142,
        sentimentScore: 91,
        color: "#3b82f6" // Blue
      },
      {
        name: "Alex Rivera",
        talkTimeSecs: 510,
        percentage: 35,
        wordsPerMinute: 155,
        sentimentScore: 86,
        color: "#10b981" // Emerald
      },
      {
        name: "David Chen",
        talkTimeSecs: 305,
        percentage: 21,
        wordsPerMinute: 138,
        sentimentScore: 84,
        color: "#f59e0b" // Amber
      }
    ],
    transcript: [
      {
        id: "u1",
        speaker: "Sarah Jenkins",
        start: 0,
        end: 18,
        timestamp: "00:00",
        text: "Good afternoon everyone! Thanks for jumping on. Today we're reviewing the Q4 roadmap, specifically finalizing our meeting intelligence stack and the live recorder architecture.",
        sentiment: "positive"
      },
      {
        id: "u2",
        speaker: "Alex Rivera",
        start: 19,
        end: 42,
        timestamp: "00:19",
        text: "Excited for this. We did latency benchmarks on Groq's Whisper engine over the weekend. We're transcribing a 30-minute audio file in under 4 seconds with 98% accuracy on technical jargon.",
        sentiment: "positive"
      },
      {
        id: "u3",
        speaker: "David Chen",
        start: 43,
        end: 72,
        timestamp: "00:43",
        text: "That's huge. On the frontend side, I've implemented the Web Audio API mixer. It captures both the user's mic and the meeting tab audio, merging them cleanly without echo or feedback loops.",
        sentiment: "positive"
      },
      {
        id: "u4",
        speaker: "Sarah Jenkins",
        start: 73,
        end: 98,
        timestamp: "01:13",
        text: "That solves our biggest bottleneck! Users can record Google Meet or Zoom calls directly in their browser without waiting for an external bot to join or paying per-minute bot fees.",
        sentiment: "positive"
      },
      {
        id: "u5",
        speaker: "Alex Rivera",
        start: 99,
        end: 125,
        timestamp: "01:39",
        text: "Exactly. And for the AI layer, Gemini 1.5 Flash processes the full transcript in one prompt, extracting chapter timestamps, speaker analytics, and high-priority action items.",
        sentiment: "positive"
      },
      {
        id: "u6",
        speaker: "David Chen",
        start: 126,
        end: 155,
        timestamp: "02:06",
        text: "I also added interactive transcript sync. When a user clicks on any utterance in the transcript, the audio player immediately jumps to that exact millisecond.",
        sentiment: "positive"
      },
      {
        id: "u7",
        speaker: "Sarah Jenkins",
        start: 156,
        end: 190,
        timestamp: "02:36",
        text: "Fantastic. Let's make sure our release checklist is locked. Alex, please finalize the Groq Whisper fallback by Friday. David, complete the dual-stream mixer test by Monday. Great work team!",
        sentiment: "positive"
      }
    ]
  },
  {
    id: "meet-client-demo-enterprise",
    title: "Vocalis AI Enterprise Platform Demo",
    date: "Yesterday at 11:00 AM",
    duration: "18m 40s",
    durationSec: 1120,
    platform: "Zoom",
    sentimentScore: 94,
    engagementScore: 89,
    summary: {
      tldr: "Demonstrated real-time meeting transcription, instant action-item generation, and automated team recap emails to prospective client stakeholders.",
      keyPoints: [
        "Client was impressed by the instantaneous Groq Whisper transcription speed.",
        "Demonstrated the one-click browser recorder capturing Zoom web audio.",
        "Reviewed automated Gmail digest delivery with action items."
      ],
      decisions: [
        "Deliver pilot sandbox environment with 10 team seats by next Wednesday.",
        "Provide Supabase self-hosting documentation for client compliance team."
      ]
    },
    chapters: [
      {
        id: "cd1",
        timestamp: "00:00",
        startSec: 0,
        title: "Platform Overview",
        summary: "Introduction to Vocalis AI architecture and meeting copilot features."
      },
      {
        id: "cd2",
        timestamp: "06:15",
        startSec: 375,
        title: "Live Meeting Intelligence Demo",
        summary: "Real-time recording, transcription, and speaker talk-time breakdown."
      },
      {
        id: "cd3",
        timestamp: "14:20",
        startSec: 860,
        title: "Q&A and Pilot Next Steps",
        summary: "Answered questions on data privacy and scheduled trial onboarding."
      }
    ],
    actionItems: [
      {
        id: "act-c1",
        text: "Send pilot onboarding agreement to Marcus and Sarah",
        assignee: "Alex Rivera",
        due: "Tomorrow",
        priority: "High",
        completed: false
      },
      {
        id: "act-c2",
        text: "Prepare custom data retention guidelines for enterprise security review",
        assignee: "David Chen",
        due: "Oct 4",
        priority: "Medium",
        completed: false
      }
    ],
    speakers: [
      {
        name: "Alex Rivera",
        talkTimeSecs: 672,
        percentage: 60,
        wordsPerMinute: 148,
        sentimentScore: 95,
        color: "#10b981"
      },
      {
        name: "Marcus Vance (Client)",
        talkTimeSecs: 448,
        percentage: 40,
        wordsPerMinute: 130,
        sentimentScore: 92,
        color: "#6366f1"
      }
    ],
    transcript: [
      {
        id: "c-u1",
        speaker: "Alex Rivera",
        start: 0,
        end: 25,
        timestamp: "00:00",
        text: "Welcome Marcus! Today I want to show you how Vocalis AI eliminates manual note-taking and gives your executives instant meeting intelligence.",
        sentiment: "positive"
      },
      {
        id: "c-u2",
        speaker: "Marcus Vance (Client)",
        start: 26,
        end: 55,
        timestamp: "00:26",
        text: "Thanks Alex. Our biggest challenge right now is action items getting lost in Slack after 1-hour Zoom calls. We need something automated.",
        sentiment: "neutral"
      },
      {
        id: "c-u3",
        speaker: "Alex Rivera",
        start: 56,
        end: 95,
        timestamp: "00:56",
        text: "You will love this. As soon as the call ends, Vocalis generates timestamped action items assigned to each person, and automatically emails a digest to everyone on the calendar.",
        sentiment: "positive"
      }
    ]
  }
];
