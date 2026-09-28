import Link from "next/link";
import { Video } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#030712]/95 backdrop-blur-md border-t border-white/10 py-10 px-4 sm:px-8 text-xs text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-white text-base hover:opacity-90 transition">
            <div className="rounded-xl bg-[#2563EB] text-white flex items-center justify-center border border-[#1D4ED8] w-7 h-7 shadow-sm">
              <Video className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display">MeetHub</span>
            <span className="text-xs text-slate-400 font-normal">
              | Meeting Intelligence &amp; Linear Sync
            </span>
          </Link>

          <div className="flex items-center gap-6 font-semibold text-slate-300 flex-wrap justify-center text-xs">
            <a href="/#pipeline" className="hover:text-[#22D3EE] transition-colors">
              Pipeline
            </a>
            <a href="/#features" className="hover:text-[#22D3EE] transition-colors">
              Capabilities
            </a>
            <a href="/#integrations" className="hover:text-[#22D3EE] transition-colors">
              Integrations
            </a>
            <a href="/#workflow" className="hover:text-[#22D3EE] transition-colors">
              Workflow
            </a>
            <Link href="/meeting/meet-q4-product-sync" className="text-emerald-400 hover:text-emerald-300 transition-colors font-bold">
              Audio Sync Demo
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/10 text-[11px] text-slate-400">
          <div className="text-slate-300 font-medium">© 2026 MeetHub. Unified Full-Stack Architecture.</div>
          <div className="flex items-center gap-3 flex-wrap font-semibold text-slate-400">
            <span className="text-slate-300">Stateless Processing</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">Linear API Ready</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">1-Click Vercel Deploy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
