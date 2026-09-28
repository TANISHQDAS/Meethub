"use client";

import Link from "next/link";
import { Video, Mic, ArrowRight } from "lucide-react";

interface NavbarProps {
  onOpenRecorder?: () => void;
}

export default function Navbar({ onOpenRecorder }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#030712]/85 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center border border-[#1D4ED8] shadow-md group-hover:scale-105 transition-transform">
            <Video className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-xl tracking-tight text-white font-display">
              MeetHub
            </span>
            <span className="hidden sm:inline text-xs text-slate-400 font-normal">
              | Meeting Intelligence &amp; Linear Sync
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-300">
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
          <a href="/#faq" className="hover:text-[#22D3EE] transition-colors">
            FAQ
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {onOpenRecorder && (
            <button
              onClick={onOpenRecorder}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition active:scale-95"
            >
              <Mic className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>Record Audio</span>
            </button>
          )}

          <a
            href="/#pipeline"
            className="btn-blue px-4 sm:px-5 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <span>Try Live Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
}
