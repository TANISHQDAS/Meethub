export interface TranscriptUtterance {
  id: string;
  speaker: string;
  start: number; // in seconds
  end: number;
  timestamp: string; // "01:24"
  text: string;
  sentiment?: "positive" | "neutral" | "negative";
}

export interface ActionItem {
  id: string;
  text: string;
  assignee: string;
  due?: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
}

export interface MeetingChapter {
  id: string;
  timestamp: string;
  startSec: number;
  title: string;
  summary: string;
}

export interface SpeakerStat {
  name: string;
  talkTimeSecs: number;
  percentage: number;
  wordsPerMinute: number;
  sentimentScore: number; // 0 - 100
  color: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  durationSec: number;
  platform: "Google Meet" | "Zoom" | "Microsoft Teams" | "In-Person Recording";
  audioUrl?: string;
  sentimentScore: number; // 0 - 100
  engagementScore: number; // 0 - 100
  summary: {
    tldr: string;
    keyPoints: string[];
    decisions: string[];
  };
  chapters: MeetingChapter[];
  actionItems: ActionItem[];
  speakers: SpeakerStat[];
  transcript: TranscriptUtterance[];
}
