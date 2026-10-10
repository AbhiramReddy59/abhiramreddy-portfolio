"use client";

import { FileText, GraduationCap, Users, Trophy } from "lucide-react";
import { ACHIEVEMENTS } from "@/lib/data";

export default function Achievements() {
  const getCategoryDetails = (title: string) => {
    if (title.includes("Research Paper")) {
      return {
        label: "PEER-REVIEWED RESEARCH",
        badge: "CONFERENCE PUBLICATION",
        icon: <FileText className="w-4 h-4 text-[var(--ink)]" aria-hidden="true" />,
      };
    }
    if (title.includes("Academic")) {
      return {
        label: "ACADEMIC EXCELLENCE",
        badge: "UNDERGRADUATE CGPA 8.6",
        icon: <GraduationCap className="w-4 h-4 text-[var(--ink)]" aria-hidden="true" />,
      };
    }
    if (title.includes("Leadership")) {
      return {
        label: "STUDENT LEADERSHIP",
        badge: "ORGANISATIONAL INITIATIVE",
        icon: <Users className="w-4 h-4 text-[var(--ink)]" aria-hidden="true" />,
      };
    }
    return {
      label: "HACKATHONS & INNOVATION",
      badge: "NATIONAL COMPETITOR",
      icon: <Trophy className="w-4 h-4 text-[var(--ink)]" aria-hidden="true" />,
    };
  };

  return (
    <section
      id="achievements"
      className="section border-t border-[var(--line)]"
      aria-label="Achievements and Recognitions"
    >
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-index">06 — Recognitions</span>
          <h2 className="section-title">
            Achievements &amp; <span className="serif-accent">Recognitions.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[var(--mute)] max-w-2xl font-sans leading-relaxed">
            Academic contributions, peer-reviewed research, leadership milestones, and national competitive hackathons.
          </p>
        </div>

        {/* 2-Column Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7">
          {ACHIEVEMENTS.map((item, index) => {
            const meta = getCategoryDetails(item.title);
            const isResearch = item.title.includes("Research");

            return (
              <article
                key={index}
                className={`card p-6 sm:p-8 bg-white border border-[var(--line)] rounded-[26px] flex flex-col justify-between shadow-[0_4px_24px_rgba(13,13,13,0.03)] hover:shadow-[0_12px_36px_rgba(13,13,13,0.06)] hover:-translate-y-0.5 transition-all duration-300 ${
                  isResearch ? "md:col-span-2 lg:col-span-1" : ""
                }`}
                aria-labelledby={`achievement-title-${index}`}
              >
                <div>
                  {/* Top Bar: Category & Index */}
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 mb-5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[var(--paper)] border border-[var(--line)] flex items-center justify-center shrink-0">
                        {meta.icon}
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--mute)] font-medium">
                        {meta.label}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[var(--faint)]">
                      0{index + 1}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    id={`achievement-title-${index}`}
                    className="font-sans font-bold text-xl sm:text-2xl text-[var(--ink)] tracking-tight leading-snug mb-3"
                  >
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="font-sans text-xs sm:text-sm text-[var(--ink-2)] leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Metadata */}
                <div className="pt-4 border-t border-[var(--line)] flex items-center justify-between font-mono text-[10px] text-[var(--mute)]">
                  <span className="uppercase tracking-wider">VERIFICATION</span>
                  <span className="font-semibold text-[var(--ink)]">{meta.badge}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
