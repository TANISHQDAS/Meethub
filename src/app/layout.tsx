import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "MeetHub — Meeting Collaboration & AI Task Automation | Linear Integration",
  description:
    "Turn meeting conversations into Linear tickets. Extract action items, assign owners with due dates, and push issues directly to Linear from your meeting notes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#000000] text-slate-100 font-sans antialiased min-h-screen selection:bg-[#06B6D4] selection:text-[#083344] arsak-dot-grid flex flex-col">
        {children}
        <Footer />
      </body>
    </html>
  );
}
