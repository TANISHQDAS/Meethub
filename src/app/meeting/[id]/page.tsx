"use client";

import Navbar from "@/components/Navbar";
import MeetingDetailView from "@/components/MeetingDetailView";
import { SAMPLE_MEETINGS } from "@/lib/sampleData";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function MeetingPage({ params }: { params: { id: string } }) {
  const meetingId = params.id;

  const meeting =
    SAMPLE_MEETINGS.find((m) => m.id === meetingId) || SAMPLE_MEETINGS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-4">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Workspace</span>
        </Link>

        {/* Meeting Detail View */}
        <MeetingDetailView meeting={meeting} />
      </main>
    </div>
  );
}
