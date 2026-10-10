"use client";

import { Briefcase, Calendar, MapPin, CheckCircle2 } from "lucide-react";
import { EXPERIENCE } from "@/lib/data";

export default function Experience() {
  const technicalExperience = EXPERIENCE.filter((e) => e.isTechnical);
  const operationsExperience = EXPERIENCE.filter((e) => !e.isTechnical);

  return (
    <section
      id="experience"
      className="section border-t border-[var(--line)]"
      aria-label="Professional and Technical Experience"
    >
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-index">04 — Experience</span>
          <h2 className="section-title">
            Professional <span className="serif-accent">Journey.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[var(--mute)] max-w-2xl font-sans leading-relaxed">
            A verified track record across software engineering, distributed data pipelines, and fast-paced operational environments.
          </p>
        </div>

        {/* =========================================================================
            1. Subsection: Technical Experience (Primary Visual Emphasis)
            ========================================================================= */}
        <div className="mb-14 sm:mb-16">
          <div className="flex items-center gap-3 mb-8 pb-3 border-b border-[var(--line)]">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--ink)]" aria-hidden="true" />
            <h3 className="font-sans font-bold text-lg sm:text-xl text-[var(--ink)] tracking-tight">
              Technical Experience
            </h3>
            <span className="font-mono text-xs text-[var(--mute)] ml-auto">
              03 ROLES
            </span>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {technicalExperience.map((item, index) => (
              <article
                key={item.id}
                className="card p-6 sm:p-8 bg-white border border-[var(--line)] rounded-[26px] shadow-[0_4px_24px_rgba(13,13,13,0.03)] hover:shadow-[0_12px_36px_rgba(13,13,13,0.06)] hover:-translate-y-0.5 transition-all duration-300"
                aria-labelledby={`role-title-${item.id}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
                  <div>
                    {/* Role Tag & Index */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--soft)] text-[var(--ink)] font-semibold border border-[var(--line)]">
                        {item.category}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--faint)]">
                        0{index + 1}
                      </span>
                    </div>

                    {/* Role Title */}
                    <h4
                      id={`role-title-${item.id}`}
                      className="font-sans font-bold text-xl sm:text-2xl text-[var(--ink)] tracking-tight leading-snug"
                    >
                      {item.role}
                    </h4>

                    {/* Company & Location */}
                    <p className="font-sans font-medium text-sm sm:text-base text-[var(--ink-2)] mt-1 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[var(--mute)] shrink-0" aria-hidden="true" />
                      <span>{item.company}</span>
                      <span className="text-[var(--faint)]">•</span>
                      <span className="text-[var(--mute)] font-normal text-xs sm:text-sm flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                        {item.location}
                      </span>
                    </p>
                  </div>

                  {/* Period Badge */}
                  <div className="shrink-0">
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-medium px-3 py-1 rounded-full bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)]">
                      <Calendar className="w-3.5 h-3.5 text-[var(--mute)]" aria-hidden="true" />
                      {item.period}
                    </span>
                  </div>
                </div>

                {/* Highlights List */}
                <div className="pt-4 border-t border-[var(--line)] space-y-2.5">
                  {item.highlights.map((highlight, hIdx) => (
                    <div key={hIdx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[var(--ink)] shrink-0 mt-0.5 opacity-70" aria-hidden="true" />
                      <p className="font-sans text-xs sm:text-sm text-[var(--ink-2)] leading-relaxed">
                        {highlight}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* =========================================================================
            2. Subsection: Current Australian Employment & Operations (Secondary)
            ========================================================================= */}
        <div>
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[var(--line)]">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--mute)]" aria-hidden="true" />
            <h3 className="font-sans font-bold text-base sm:text-lg text-[var(--ink-2)] tracking-tight">
              Current Australian Employment &amp; Operations
            </h3>
            <span className="font-mono text-xs text-[var(--mute)] ml-auto">
              OPERATIONS
            </span>
          </div>

          <p className="font-sans text-xs sm:text-sm text-[var(--mute)] mb-6 max-w-2xl leading-relaxed">
            Demonstrating active Australian workplace reliability, stock reconciliation, and safety compliance alongside postgraduate studies.
          </p>

          <div className="space-y-6">
            {operationsExperience.map((item) => (
              <article
                key={item.id}
                className="card p-6 sm:p-7 bg-[var(--paper)]/60 border border-[var(--line)] rounded-[24px] shadow-xs"
                aria-labelledby={`role-title-${item.id}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-[var(--mute)] font-medium border border-[var(--line)] inline-block mb-2">
                      {item.category}
                    </span>
                    <h4
                      id={`role-title-${item.id}`}
                      className="font-sans font-bold text-lg sm:text-xl text-[var(--ink)] tracking-tight leading-snug"
                    >
                      {item.role}
                    </h4>
                    <p className="font-sans text-xs sm:text-sm text-[var(--ink-2)] mt-0.5 flex items-center gap-1.5">
                      <span>{item.company}</span>
                      <span className="text-[var(--faint)]">•</span>
                      <span className="text-[var(--mute)] flex items-center gap-1">
                        <MapPin className="w-3 h-3" aria-hidden="true" />
                        {item.location}
                      </span>
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 font-mono text-xs px-3 py-1 rounded-full bg-white border border-[var(--line)] text-[var(--ink)] shrink-0 self-start">
                    <Calendar className="w-3.5 h-3.5 text-[var(--mute)]" aria-hidden="true" />
                    {item.period}
                  </span>
                </div>

                <div className="pt-3 border-t border-[var(--line)] space-y-2">
                  {item.highlights.map((highlight, hIdx) => (
                    <div key={hIdx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--mute)] shrink-0 mt-2" aria-hidden="true" />
                      <p className="font-sans text-xs sm:text-sm text-[var(--ink-2)] leading-relaxed">
                        {highlight}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
