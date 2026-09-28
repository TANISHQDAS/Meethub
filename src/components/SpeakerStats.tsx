"use client";

import { SpeakerStat } from "@/types";
import { Gauge, Users, Clock, Flame, Smile } from "lucide-react";

interface SpeakerStatsProps {
  speakers: SpeakerStat[];
  sentimentScore: number;
  engagementScore: number;
}

export default function SpeakerStats({
  speakers,
  sentimentScore,
  engagementScore,
}: SpeakerStatsProps) {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  const getPacingLabel = (wpm: number) => {
    if (wpm < 120) return { text: "Deliberate", color: "text-amber-700" };
    if (wpm <= 160) return { text: "Optimal Pace", color: "text-emerald-800" };
    return { text: "Fast Paced", color: "text-rose-700" };
  };

  return (
    <div className="space-y-5 text-[#060D17]">
      {/* High level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-[#EAF4EE] border border-[#8DB8A2] flex flex-col justify-between gap-1.5 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-1 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                <Smile className="w-3.5 h-3.5" />
              </div>
              <p className="text-[11px] text-[#334155] font-bold truncate">Meeting Sentiment</p>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
              Constructive
            </span>
          </div>
          <h4 className="text-base font-extrabold text-[#060D17]">{sentimentScore}% Positive</h4>
        </div>

        <div className="p-3 rounded-xl bg-[#EAF4EE] border border-[#8DB8A2] flex flex-col justify-between gap-1.5 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-1 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center font-bold shrink-0">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <p className="text-[11px] text-[#334155] font-bold truncate">Team Focus</p>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 shrink-0">
              Active
            </span>
          </div>
          <h4 className="text-base font-extrabold text-[#060D17]">{engagementScore}/100</h4>
        </div>
      </div>

      {/* Speaker Talk-Time Ratio */}
      <div className="p-4 rounded-xl bg-[#EAF4EE] border border-[#8DB8A2] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-xs text-[#060D17]">
            <Users className="w-4 h-4 text-[#2563EB]" />
            <span>Speaker Talk-Time Ratio</span>
          </div>
          <span className="text-[11px] text-[#334155] font-semibold">
            {speakers.length} {speakers.length === 1 ? "Speaker" : "Speakers"}
          </span>
        </div>

        {/* Multi-segment progress bar */}
        <div className="w-full h-2.5 rounded-full bg-[#CBD5E1] overflow-hidden flex shadow-inner">
          {speakers.map((s, idx) => (
            <div
              key={idx}
              style={{
                width: `${s.percentage}%`,
                backgroundColor: s.color,
              }}
              title={`${s.name}: ${s.percentage}%`}
              className="h-full transition-all duration-500 hover:brightness-110"
            />
          ))}
        </div>

        {/* Speaker List */}
        <div className="divide-y divide-[#8DB8A2]/60 pt-1">
          {speakers.map((speaker, idx) => {
            const pacing = getPacingLabel(speaker.wordsPerMinute);
            return (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: speaker.color }}
                  />
                  <div>
                    <span className="font-bold text-[#060D17]">{speaker.name}</span>
                    <div className="flex items-center gap-2 text-[10px] text-[#334155] font-semibold mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#64748B]" />
                        {formatTime(speaker.talkTimeSecs)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-[#64748B]" />
                        {speaker.wordsPerMinute} WPM (
                        <span className={`font-bold ${pacing.color}`}>{pacing.text}</span>)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-[#060D17] text-xs">{speaker.percentage}%</div>
                  <div className="text-[10px] text-emerald-800 font-bold">
                    {speaker.sentimentScore}% Pos
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
