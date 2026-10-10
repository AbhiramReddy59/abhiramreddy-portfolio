"use client";

import { useState } from "react";
import { ArrowUpRight, MapPin, GraduationCap, Briefcase, Mail } from "lucide-react";
import { PROFILE, EDUCATION } from "@/lib/data";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function About() {
  const [isFlipped, setIsFlipped] = useState(false);

  // Read master's and undergraduate education dynamically
  const currentEducation = EDUCATION[0];
  const priorEducation = EDUCATION[1];

  const toggleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleFlip();
    }
  };

  return (
    <section id="about" className="section border-t border-[var(--line)]" aria-label="About">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-index">01 — About</span>
          <h2 className="section-title">
            Analytical Engineering <span className="serif-accent">& AI.</span>
          </h2>
        </div>

        {/* 3-Column Balanced Composition: Intro | ID Card | Quick Facts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-start">
          {/* =========================================================================
              Column 1: Introduction (Editorial Bio from PROFILE.summary)
              ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-5 text-[var(--ink-2)] text-base sm:text-lg leading-relaxed">
              <p className="font-medium text-[var(--ink)] text-xl sm:text-2xl leading-snug tracking-tight">
                Data Science and Software Engineering professional bringing hands-on
                technical experience across distributed backends, AI applications, and
                geospatial analytics.
              </p>

              <p>
                Holding a B.Tech in Computer Science Engineering (CGPA 8.6) and
                currently completing a Master of Data Science with a Specialisation
                in Artificial Intelligence at the University of Southern Queensland (USQ).
              </p>

              <p className="text-sm sm:text-base text-[var(--mute)]">
                Experienced in engineering blockchain-backed data integrity pipelines,
                real-time geospatial intelligence widgets, and distributed data systems
                at Jellyspace, along with virtual software engineering simulations at
                JPMorgan Chase &amp; Co. and backend optimization at Elevatebox.
              </p>
            </div>

            {/* Verified External Channels */}
            <div className="pt-8 mt-6 border-t border-[var(--line)] flex flex-wrap items-center gap-4">
              <a
                href={PROFILE.github.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary text-xs sm:text-sm"
                aria-label={`GitHub profile: ${PROFILE.github.display}`}
              >
                <GithubIcon className="w-4 h-4 mr-1 opacity-70" />
                <span>GitHub</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-0.5 opacity-50" aria-hidden="true" />
              </a>

              <a
                href={PROFILE.linkedin.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary text-xs sm:text-sm"
                aria-label={`LinkedIn profile: ${PROFILE.linkedin.display}`}
              >
                <LinkedinIcon className="w-4 h-4 mr-1 opacity-70" />
                <span>LinkedIn</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-0.5 opacity-50" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* =========================================================================
              Column 2: Interactive Developer ID Card (Flippable Pass)
              ========================================================================= */}
          <div className="lg:col-span-4 flex justify-center w-full py-2">
            <button
              type="button"
              onClick={toggleFlip}
              onKeyDown={handleKeyDown}
              aria-label={
                isFlipped
                  ? "Developer ID card, showing academic and systems background. Click or press Enter or Space to flip to front."
                  : "Developer ID card, showing front profile with portrait monogram and title. Click or press Enter or Space to flip to back."
              }
              className="w-full max-w-[340px] sm:max-w-[360px] h-[500px] perspective-1000 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] focus-visible:ring-offset-4 rounded-[28px] cursor-pointer text-left select-none"
            >
              <div
                className={`card-flip-inner relative w-full h-full preserve-3d transition-all duration-300 ${
                  isFlipped ? "rotate-y-180" : ""
                }`}
              >
                {/* ----------------- CARD FRONT ----------------- */}
                <div
                  className="card-face backface-hidden absolute inset-0 w-full h-full bg-white border border-[var(--line)] rounded-[28px] p-6 sm:p-7 flex flex-col justify-between shadow-[0_4px_24px_rgba(13,13,13,0.03)] group-hover:shadow-[0_12px_36px_rgba(13,13,13,0.06)] group-hover:-translate-y-1 transition-all duration-300"
                  aria-hidden={isFlipped}
                >
                  {/* Top Clip Slot & Badge Indicator */}
                  <div>
                    <div className="w-12 h-2.5 rounded-full bg-[var(--soft)] border border-[var(--line)] mx-auto mb-4" />
                    <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--mute)]">
                        DEVELOPER PROFILE
                      </span>
                      <span className="font-mono text-[10px] font-semibold text-[var(--ink)] tracking-wider">
                        PORTFOLIO ID
                      </span>
                    </div>
                  </div>

                  {/* Central Portrait Image Area */}
                  <div className="flex flex-col items-center text-center my-auto py-2">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-[var(--paper)] border-2 border-[var(--ink)] flex items-center justify-center shadow-sm mb-4">
                      <img
                        src="/id-portrait.png"
                        alt={`${PROFILE.fullName} - Developer ID portrait`}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>

                    <h3 className="font-sans font-bold text-xl sm:text-2xl text-[var(--ink)] tracking-tight">
                      {PROFILE.fullName}
                    </h3>
                    <p className="font-sans text-xs text-[var(--mute)] font-medium mt-1 max-w-[240px]">
                      {PROFILE.title}
                    </p>
                  </div>

                  {/* Bottom Barcode & Flip Callout */}
                  <div>
                    {/* Decorative Barcode Graphic */}
                    <div className="mb-3">
                      <svg
                        className="w-full h-7 text-[var(--ink)] opacity-80"
                        viewBox="0 0 160 26"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <rect x="0" y="0" width="2" height="22" />
                        <rect x="4" y="0" width="1" height="22" />
                        <rect x="7" y="0" width="3" height="22" />
                        <rect x="12" y="0" width="1" height="22" />
                        <rect x="15" y="0" width="4" height="22" />
                        <rect x="21" y="0" width="2" height="22" />
                        <rect x="25" y="0" width="1" height="22" />
                        <rect x="28" y="0" width="3" height="22" />
                        <rect x="33" y="0" width="2" height="22" />
                        <rect x="37" y="0" width="1" height="22" />
                        <rect x="40" y="0" width="4" height="22" />
                        <rect x="46" y="0" width="2" height="22" />
                        <rect x="50" y="0" width="1" height="22" />
                        <rect x="53" y="0" width="3" height="22" />
                        <rect x="58" y="0" width="2" height="22" />
                        <rect x="62" y="0" width="4" height="22" />
                        <rect x="68" y="0" width="1" height="22" />
                        <rect x="71" y="0" width="3" height="22" />
                        <rect x="76" y="0" width="2" height="22" />
                        <rect x="80" y="0" width="1" height="22" />
                        <rect x="83" y="0" width="4" height="22" />
                        <rect x="89" y="0" width="2" height="22" />
                        <rect x="93" y="0" width="1" height="22" />
                        <rect x="96" y="0" width="3" height="22" />
                        <rect x="101" y="0" width="2" height="22" />
                        <rect x="105" y="0" width="4" height="22" />
                        <rect x="111" y="0" width="1" height="22" />
                        <rect x="114" y="0" width="3" height="22" />
                        <rect x="119" y="0" width="2" height="22" />
                        <rect x="123" y="0" width="1" height="22" />
                        <rect x="126" y="0" width="4" height="22" />
                        <rect x="132" y="0" width="2" height="22" />
                        <rect x="136" y="0" width="1" height="22" />
                        <rect x="139" y="0" width="3" height="22" />
                        <rect x="144" y="0" width="2" height="22" />
                        <rect x="148" y="0" width="4" height="22" />
                        <rect x="154" y="0" width="2" height="22" />
                        <rect x="158" y="0" width="2" height="22" />
                      </svg>
                      <div className="flex justify-between items-center font-mono text-[9px] text-[var(--faint)] tracking-widest mt-1">
                        <span>ORNAMENTAL BARCODE</span>
                        <span>AI &bull; DS &bull; SWE</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-[10px] font-mono text-[var(--mute)]">
                      <span>STATUS: VERIFIED</span>
                      <span className="text-[var(--ink)] font-semibold flex items-center gap-1">
                        FLIP ↻
                      </span>
                    </div>
                  </div>
                </div>

                {/* ----------------- CARD BACK ----------------- */}
                <div
                  className="card-face card-face-back backface-hidden absolute inset-0 w-full h-full bg-white border border-[var(--line)] rounded-[28px] p-6 sm:p-7 flex flex-col justify-between shadow-[0_4px_24px_rgba(13,13,13,0.03)] group-hover:shadow-[0_12px_36px_rgba(13,13,13,0.06)] group-hover:-translate-y-1 transition-all duration-300 rotate-y-180"
                  aria-hidden={!isFlipped}
                >
                  {/* Top Clip Slot & Back Header */}
                  <div>
                    <div className="w-12 h-2.5 rounded-full bg-[var(--soft)] border border-[var(--line)] mx-auto mb-4" />
                    <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--mute)]">
                        ACADEMIC PROFILE
                      </span>
                      <span className="font-mono text-[10px] text-[var(--ink)] font-semibold">
                        USQ &bull; NNRG
                      </span>
                    </div>
                  </div>

                  {/* Verified Academic & Background Details */}
                  <div className="space-y-4 my-auto py-2">
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--mute)] block mb-1">
                        CURRENT ENROLMENT
                      </span>
                      <p className="font-sans font-semibold text-sm text-[var(--ink)] leading-snug">
                        {currentEducation.degree}
                      </p>
                      <p className="font-mono text-xs text-[var(--mute)] mt-0.5">
                        {currentEducation.institution} &bull; {currentEducation.period}
                      </p>
                    </div>

                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--mute)] block mb-1">
                        UNDERGRADUATE
                      </span>
                      <p className="font-sans font-semibold text-sm text-[var(--ink)] leading-snug">
                        {priorEducation.degree}
                      </p>
                      <p className="font-mono text-xs text-[var(--mute)] mt-0.5">
                        {priorEducation.institution} &bull; {priorEducation.cgpa}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[var(--line)]">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--mute)] block mb-1">
                        KEY SYSTEMS FOCUS
                      </span>
                      <p className="font-sans text-xs text-[var(--ink-2)] leading-relaxed">
                        Artificial Intelligence &bull; Distributed Systems &bull; Geospatial
                        Intelligence
                      </p>
                    </div>
                  </div>

                  {/* Back Footer */}
                  <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-[10px] font-mono text-[var(--mute)]">
                    <span>{PROFILE.location}</span>
                    <span className="text-[var(--ink)] font-semibold flex items-center gap-1">
                      FLIP FRONT ↺
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* =========================================================================
              Column 3: Quick Facts Panel (Verified Data from PROFILE & EDUCATION)
              ========================================================================= */}
          <div className="lg:col-span-3 space-y-4">
            <div className="border-b border-[var(--line)] pb-3 mb-2 flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-[var(--mute)]">
                SPECIFICATIONS
              </span>
              <span className="font-mono text-xs text-[var(--faint)]">04 ITEMS</span>
            </div>

            {/* Fact 1: Location */}
            <div className="card p-4 sm:p-5">
              <div className="flex items-center gap-2 text-[var(--mute)] mb-1.5">
                <MapPin className="w-4 h-4" aria-hidden="true" />
                <span className="font-mono text-[11px] uppercase tracking-wider">
                  LOCATION
                </span>
              </div>
              <p className="font-sans font-semibold text-sm text-[var(--ink)]">
                {PROFILE.location}
              </p>
              <p className="font-mono text-xs text-[var(--mute)] mt-0.5">
                Australia
              </p>
            </div>

            {/* Fact 2: Education */}
            <div className="card p-4 sm:p-5">
              <div className="flex items-center gap-2 text-[var(--mute)] mb-1.5">
                <GraduationCap className="w-4 h-4" aria-hidden="true" />
                <span className="font-mono text-[11px] uppercase tracking-wider">
                  ACTIVE DEGREE
                </span>
              </div>
              <p className="font-sans font-semibold text-sm text-[var(--ink)] leading-snug">
                Master of Data Science
              </p>
              <p className="font-mono text-xs text-[var(--mute)] mt-0.5">
                Specialisation in AI &bull; USQ
              </p>
            </div>

            {/* Fact 3: Professional Focus */}
            <div id="professional-focus-card" className="card p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[var(--mute)] mb-2">
                  <Briefcase className="w-4 h-4" aria-hidden="true" />
                  <span className="font-mono text-[11px] uppercase tracking-wider">
                    PROFESSIONAL FOCUS
                  </span>
                </div>
                <div>
                  <p className="font-sans font-semibold text-sm text-[var(--ink)] leading-snug">
                    Data Science &amp; AI
                  </p>
                  <p className="font-sans font-medium text-xs text-[var(--ink-2)] mt-0.5 leading-snug">
                    Software Engineering
                  </p>
                </div>
              </div>
              <div className="pt-2 mt-2.5 border-t border-[var(--line)]">
                <p className="font-mono text-xs text-[var(--mute)]">
                  B.Tech Computer Science &middot; CGPA 8.6
                </p>
              </div>
            </div>

            {/* Fact 4: Email Direct Channel */}
            <div className="card p-4 sm:p-5">
              <div className="flex items-center gap-2 text-[var(--mute)] mb-1.5">
                <Mail className="w-4 h-4" aria-hidden="true" />
                <span className="font-mono text-[11px] uppercase tracking-wider">
                  DIRECT CHANNEL
                </span>
              </div>
              <a
                href={`mailto:${PROFILE.email}`}
                className="font-sans font-medium text-xs sm:text-sm text-[var(--ink)] hover:text-[var(--mute)] transition-colors break-all block"
                aria-label={`Send email to ${PROFILE.email}`}
              >
                {PROFILE.email}
              </a>
              <p className="font-mono text-xs text-[var(--mute)] mt-0.5">
                Inquiries &amp; Technical Roles
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
