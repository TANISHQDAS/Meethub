# MeetHub — Meeting Collaboration & AI Task Automation | Linear Integration

MeetHub is a high-performance meeting intelligence platform modeled after **[socials-prjt.vercel.app](https://socials-prjt.vercel.app/)**, designed to turn meeting speech, transcripts, and recordings into verified action tickets in Linear automatically.

---

## 🎨 Design & Aesthetic

- **Tactile Paper / Sage Theme**: Custom `.arsak-card`, `.arsak-stage`, and `.arsak-recessed` parchment surfaces with noise textures and 3D teal/mint bottom shelves (`.arsak-shelf`).
- **Cyan Dot Matrix Grid**: Deep black background (`#000000`) with high-contrast cyan grid matrix (`.arsak-dot-grid`).
- **Typography & UI**: Plus Jakarta Sans, Kanit, and JetBrains Mono with pill buttons (`.btn-blue`, `.btn-secondary-blue`).

---

## 🚀 Key Capabilities

1. **Interactive Meeting Pipeline (`#pipeline`)**:
   - **Meeting Dialogue & Notes**: Live audio waveform player ("Weekly Engineering Sync"), file uploader, and editable transcript turns.
   - **One-Click Browser Recorder**: Dual audio mixer capturing your microphone + Google Meet / Zoom tab audio directly.
   - **Detected Action Items & 1-Click Linear Sync**: Detects commitments, assigns owners, priorities (`High` / `Medium` / `Low`), issue keys (`ENG-241`), and syncs directly to Linear with one click!

2. **Sub-Second Groq Whisper Transcription**:
   - Runs `whisper-large-v3` on Groq Cloud's free tier.

3. **Google Gemini 1.5 Flash Task & Meeting Intelligence**:
   - Extracts actionable tasks, assignees, deadlines, and topic chapters.

4. **Speaker Talk-Time & Pacing Analytics**:
   - Speaker speaking ratio bar, words per minute (WPM) pacing detector, and sentiment rating.

5. **Works with Your Favorite Tools**:
   - Linear, Slack, Notion, GitHub, Google Meet, Zoom, and Gmail SMTP recaps.

---

## 🔑 Configured Keys in `.env.local`

Located at `C:\Users\tanis\.gemini\antigravity\scratch\vocalis-ai\.env.local`:

- `GEMINI_API_KEY`: Used for AI task extraction, summaries, and Q&A.
- `GROQ_API_KEY`: Used for sub-second Whisper transcription.
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key.
- `GMAIL_APP_PASSWORD`: Gmail App Password for sending meeting recap digests.

---

## 🏃 Running the Application

In your terminal:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!
