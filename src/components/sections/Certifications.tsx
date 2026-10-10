"use client";

import { Award, Cloud, Code, Terminal, Bot, Sparkles, Trophy } from "lucide-react";
import { CERTIFICATIONS } from "@/lib/data";

export default function Certifications() {
  // Map relevant visual icons and tags to each verified entry
  const getEntryIcon = (name: string, type?: string) => {
    if (name.includes("AWS")) return <Cloud className="w-4 h-4 text-[var(--ink)]" aria-hidden="true" />;
    if (name.includes("Full Stack")) return <Code className="w-4 h-4 text-[var(--ink)]" aria-hidden="true" />;
    if (name.includes("Java")) return <Terminal className="w-4 h-4 text-[var(--ink)]" aria-hidden="true" />;
    if (name.includes("Robotic")) return <Bot className="w-4 h-4 text-[var(--ink)]" aria-hidden="true" />;
    if (name.includes("GEN-AI")) return <Sparkles className="w-4 h-4 text-[var(--ink)]" aria-hidden="true" />;
    return <Trophy className="w-4 h-4 text-[var(--ink)]" aria-hidden="true" />;
  };

  return (
    <section
      id="certifications"
      className="section border-t border-[var(--line)]"
      aria-label="Certifications and Technical Credentials"
    >
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-index">05 — Certifications</span>
          <h2 className="section-title">
            Certifications &amp; <span className="serif-accent">Credentials.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[var(--mute)] max-w-2xl font-sans leading-relaxed">
            Verified technical specializations, industry internships, advanced technical coursework, and hackathon milestones.
          </p>
        </div>

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {CERTIFICATIONS.map((cert, index) => {
            const isAws = cert.name.includes("AWS");
            return (
              <article
                key={index}
                className="card p-6 bg-white border border-[var(--line)] rounded-[24px] flex flex-col justify-between shadow-[0_4px_24px_rgba(13,13,13,0.03)] hover:shadow-[0_12px_36px_rgba(13,13,13,0.06)] hover:-translate-y-0.5 transition-all duration-300"
                aria-labelledby={`cert-title-${index}`}
              >
                <div>
                  {/* Top Bar: Icon & Category Tag */}
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[var(--paper)] border border-[var(--line)] flex items-center justify-center shrink-0">
                        {getEntryIcon(cert.name, cert.type)}
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--mute)]">
                        {cert.type || (cert.issuer ? "PROFESSIONAL TRAINING" : "CREDENTIAL")}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[var(--faint)]">
                      0{index + 1}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    id={`cert-title-${index}`}
                    className="font-sans font-bold text-base sm:text-lg text-[var(--ink)] tracking-tight leading-snug mb-2"
                  >
                    {cert.name}
                  </h3>

                  {/* Issuer or Focus Details */}
                  {cert.issuer && (
                    <p className="font-sans text-xs text-[var(--ink-2)] font-medium">
                      Issued by <span className="font-semibold text-[var(--ink)]">{cert.issuer}</span>
                    </p>
                  )}

                  {isAws && (
                    <p className="font-sans text-xs text-[var(--mute)] leading-relaxed mt-1">
                      Cloud architecture curriculum focus covering EC2, S3, RDS, Lambda, and high-availability systems.
                    </p>
                  )}
                </div>

                {/* Bottom Source Status */}
                <div className="pt-4 mt-5 border-t border-[var(--line)] flex items-center justify-between font-mono text-[10px] text-[var(--mute)]">
                  <span>RECORD TYPE</span>
                  <span className="text-[var(--ink)] font-medium">
                    {cert.issuer ? "ORGANISATIONAL" : "TECHNICAL CURRICULUM"}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
