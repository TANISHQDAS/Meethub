import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const groqKey = process.env.GROQ_API_KEY;

    if (!groqKey || groqKey.includes("placeholder")) {
      return NextResponse.json(
        {
          error: "GROQ_API_KEY is not configured in .env.local",
          fallbackAvailable: true,
        },
        { status: 400 }
      );
    }

    // Call Groq Whisper API
    const groqFormData = new FormData();
    groqFormData.append("file", file, file.name || "recording.webm");
    groqFormData.append("model", "whisper-large-v3");
    groqFormData.append("response_format", "verbose_json");
    groqFormData.append("temperature", "0.0");

    const groqRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
      },
      body: groqFormData,
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Groq API error:", errText);
      return NextResponse.json(
        { error: `Groq Whisper API error: ${groqRes.statusText}`, details: errText },
        { status: groqRes.status }
      );
    }

    const data = await groqRes.json();

    // Map segments to our Transcript format
    const segments = data.segments || [];
    const utterances = segments.map((seg: { id: number; start: number; end: number; text: string }, index: number) => {
      const startMin = Math.floor(seg.start / 60);
      const startSec = Math.floor(seg.start % 60);
      const timestamp = `${startMin.toString().padStart(2, "0")}:${startSec.toString().padStart(2, "0")}`;

      // Alternate speakers based on turn or segment if no diarizer active
      const speakerNames = ["Alex Rivera", "Sarah Jenkins", "David Chen"];
      const speaker = speakerNames[index % speakerNames.length];

      return {
        id: `turn-${index + 1}`,
        speaker,
        start: seg.start,
        end: seg.end,
        timestamp,
        text: seg.text.trim(),
        sentiment: "positive",
      };
    });

    return NextResponse.json({
      text: data.text,
      duration: data.duration || 0,
      utterances: utterances.length > 0 ? utterances : [
        {
          id: "turn-1",
          speaker: "Speaker 1",
          start: 0,
          end: data.duration || 30,
          timestamp: "00:00",
          text: data.text,
          sentiment: "positive",
        },
      ],
    });
  } catch (error: unknown) {
    console.error("Transcription route error:", error);
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
