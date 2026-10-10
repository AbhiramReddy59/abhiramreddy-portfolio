"use client";

import { useState } from "react";
import { Mail, ArrowUpRight, Copy, Check, MessageSquare } from "lucide-react";
import { PROFILE } from "@/lib/data";

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

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API is unavailable
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <section
      id="contact"
      className="section border-t border-[var(--line)]"
      aria-label="Contact and Collaborations"
    >
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-index">07 — Contact</span>
          <h2 className="section-title">
            Let&apos;s <span className="serif-accent">connect.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[var(--mute)] max-w-2xl font-sans leading-relaxed">
            Feel free to reach out for software engineering or data science collaborations.
          </p>
        </div>

        {/* Contact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Primary Action Card: Direct Email Channel (7 cols) */}
          <div className="lg:col-span-7 card p-8 sm:p-10 bg-white border border-[var(--line)] rounded-[28px] shadow-[0_4px_24px_rgba(13,13,13,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-4 mb-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--mute)]">
                  DIRECT CHANNEL
                </span>
                <span className="font-mono text-xs text-[var(--ink)] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" aria-hidden="true" />
                  AVAILABLE
                </span>
              </div>

              <h3 className="font-sans font-bold text-2xl sm:text-3xl text-[var(--ink)] tracking-tight leading-snug mb-3">
                Have an inquiry or technical opportunity?
              </h3>

              <p className="font-sans text-sm sm:text-base text-[var(--ink-2)] leading-relaxed mb-8">
                I am actively interested in data science, artificial intelligence, and software engineering opportunities in Australia. Reach out directly via email.
              </p>

              {/* Email Address Display Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[var(--paper)] border border-[var(--line)] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[var(--line)] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-[var(--ink)]" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-[var(--mute)] block uppercase tracking-wider">
                      PRIMARY EMAIL
                    </span>
                    <a
                      href={`mailto:${PROFILE.email}`}
                      className="font-mono font-semibold text-sm sm:text-base text-[var(--ink)] hover:text-[var(--mute)] transition-colors break-all"
                      aria-label={`Send email to ${PROFILE.email}`}
                    >
                      {PROFILE.email}
                    </a>
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="btn btn-secondary text-xs font-mono py-2 px-3.5 rounded-full shrink-0 self-start sm:self-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]"
                  aria-label={copied ? "Email address copied to clipboard" : "Copy email address to clipboard"}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
                      <span>Copy Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mailto Launch CTA */}
            <div className="pt-6 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-4">
              <a
                href={`mailto:${PROFILE.email}`}
                className="btn btn-primary text-xs sm:text-sm font-semibold py-3 px-6 rounded-full inline-flex items-center gap-2"
                aria-label={`Open mail application to send email to ${PROFILE.email}`}
              >
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
                <span>Open Mail Client</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />
              </a>

              <span className="font-mono text-xs text-[var(--mute)]">
                {PROFILE.location}
              </span>
            </div>
          </div>

          {/* Secondary Action Cards: LinkedIn & GitHub (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* LinkedIn Card */}
            <a
              href={PROFILE.linkedin.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-6 sm:p-7 bg-white border border-[var(--line)] rounded-[26px] shadow-[0_4px_24px_rgba(13,13,13,0.03)] hover:shadow-[0_12px_36px_rgba(13,13,13,0.06)] hover:-translate-y-0.5 transition-all duration-300 block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]"
              aria-label={`Connect on LinkedIn: ${PROFILE.linkedin.display} (opens in new tab)`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--paper)] border border-[var(--line)] flex items-center justify-center">
                  <LinkedinIcon className="w-5 h-5 text-[var(--ink)]" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--mute)] group-hover:text-[var(--ink)] transition-colors" aria-hidden="true" />
              </div>

              <h4 className="font-sans font-bold text-lg text-[var(--ink)] tracking-tight">
                LinkedIn Profile
              </h4>
              <p className="font-mono text-xs text-[var(--mute)] mt-1">
                {PROFILE.linkedin.display}
              </p>
              <p className="font-sans text-xs text-[var(--ink-2)] mt-3 leading-relaxed">
                Connect for professional networking, recommendations, and industry collaborations.
              </p>
            </a>

            {/* GitHub Card */}
            <a
              href={PROFILE.github.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-6 sm:p-7 bg-white border border-[var(--line)] rounded-[26px] shadow-[0_4px_24px_rgba(13,13,13,0.03)] hover:shadow-[0_12px_36px_rgba(13,13,13,0.06)] hover:-translate-y-0.5 transition-all duration-300 block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]"
              aria-label={`Inspect code repositories on GitHub: ${PROFILE.github.display} (opens in new tab)`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--paper)] border border-[var(--line)] flex items-center justify-center">
                  <GithubIcon className="w-5 h-5 text-[var(--ink)]" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--mute)] group-hover:text-[var(--ink)] transition-colors" aria-hidden="true" />
              </div>

              <h4 className="font-sans font-bold text-lg text-[var(--ink)] tracking-tight">
                GitHub Repositories
              </h4>
              <p className="font-mono text-xs text-[var(--mute)] mt-1">
                {PROFILE.github.display}
              </p>
              <p className="font-sans text-xs text-[var(--ink-2)] mt-3 leading-relaxed">
                Explore source code repositories, open-source projects, and technical implementations.
              </p>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
