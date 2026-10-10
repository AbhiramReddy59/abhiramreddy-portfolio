"use client";

import { ArrowUpRight, Cpu, Layers, Radio, ShieldCheck, Sparkles, BookOpen } from "lucide-react";
import { PROJECTS, PROFILE } from "@/lib/data";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function Work() {
  // Identify the lead featured project by strongest evidence (ICCIML peer-reviewed research paper)
  const leadProject = PROJECTS.find((p) => p.id === "k8s-load-balancing") || PROJECTS[0];
  const supportingProjects = PROJECTS.filter((p) => p.id !== leadProject.id);

  return (
    <section
      id="work"
      className="section border-t border-[var(--line)]"
      aria-label="Selected Work and Projects"
    >
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-index">03 — Selected Work</span>
          <h2 className="section-title">
            Things I&apos;ve <span className="serif-accent">built.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[var(--mute)] max-w-2xl font-sans leading-relaxed">
            A verified selection of software engineering systems, peer-reviewed distributed computing research, and practical artificial intelligence implementations.
          </p>
        </div>

        {/* =========================================================================
            1. Lead Featured Project: Bidirectional Load Balancing in Kubernetes
            ========================================================================= */}
        <div className="mb-10 sm:mb-12">
          <article
            className="card p-6 sm:p-8 lg:p-10 bg-white border border-[var(--line)] rounded-[28px] shadow-[0_4px_24px_rgba(13,13,13,0.03)] hover:shadow-[0_12px_36px_rgba(13,13,13,0.06)] hover:-translate-y-0.5 transition-all duration-300"
            aria-labelledby="lead-project-title"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Project Details */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  {/* Eyebrow & Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-[var(--ink)] text-white font-semibold">
                      FEATURED RESEARCH
                    </span>
                    <span className="font-mono text-[10px] tracking-wider px-2.5 py-1 rounded-full bg-[var(--soft)] text-[var(--ink)] border border-[var(--line)] flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3 text-[var(--ink)]" aria-hidden="true" />
                      ICCIML ACCEPTED
                    </span>
                  </div>

                  <h3
                    id="lead-project-title"
                    className="font-sans font-bold text-2xl sm:text-3xl lg:text-4xl text-[var(--ink)] tracking-tight leading-tight mb-4"
                  >
                    {leadProject.title}
                  </h3>

                  <p className="font-sans text-sm sm:text-base text-[var(--ink-2)] leading-relaxed mb-6">
                    {leadProject.description}
                  </p>

                  {/* Research Context Callout */}
                  <div className="p-4 rounded-2xl bg-[var(--paper)]/80 border border-[var(--line)] mb-6 text-xs sm:text-sm text-[var(--ink-2)] font-sans">
                    <p className="font-semibold text-[var(--ink)] mb-1 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[var(--ink)]" aria-hidden="true" />
                      Academic &amp; Systems Contribution
                    </p>
                    <p className="text-[var(--mute)] leading-relaxed">
                      Authored research proposing bidirectional scheduling mechanisms to mitigate cluster imbalance and communication overhead across heterogeneous cloud nodes.
                    </p>
                  </div>
                </div>

                {/* Technology Tags & Verification Badge */}
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {leadProject.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-xs px-2.5 py-1 rounded-md bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-[var(--line)] flex items-center justify-between font-mono text-[11px] text-[var(--mute)]">
                    <span className="uppercase tracking-wider">PROJECT STATUS</span>
                    <span className="font-semibold text-[var(--ink)]">PEER-REVIEWED RESEARCH PAPER</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Technical Architecture Composition (CSS-based) */}
              <div className="lg:col-span-5 w-full">
                <div
                  className="rounded-2xl p-5 sm:p-6 bg-[var(--paper)] border border-[var(--line)] flex flex-col justify-between font-mono text-xs shadow-inner"
                  aria-label="Schematic representation of bidirectional load balancing architecture"
                >
                  {/* Schematic Header */}
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 mb-5 text-[10px] text-[var(--mute)]">
                    <span className="tracking-widest uppercase">SCHEMATIC // CLUSTER TOPOLOGY</span>
                    <span className="flex items-center gap-1.5 text-[var(--ink)] font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" aria-hidden="true" />
                      BALANCED
                    </span>
                  </div>

                  {/* Visual Node Diagram */}
                  <div className="space-y-3.5 my-2">
                    {/* Node 1: Ingress / Dispatcher */}
                    <div className="p-3 rounded-xl bg-white border border-[var(--line)] flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <Cpu className="w-4 h-4 text-[var(--ink)]" aria-hidden="true" />
                        <div>
                          <span className="font-bold text-[var(--ink)] block text-xs">Ingress Controller</span>
                          <span className="text-[10px] text-[var(--mute)] block">Traffic Distribution Layer</span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--soft)] text-[var(--ink)] font-medium">
                        PORT 443
                      </span>
                    </div>

                    {/* Bidirectional Connector Indicator */}
                    <div className="flex items-center justify-center gap-2 py-1 text-[var(--mute)] text-[10px]">
                      <span className="h-4 w-[1px] bg-[var(--line)]" />
                      <span className="tracking-widest uppercase text-[9px] px-2 py-0.5 rounded bg-white border border-[var(--line)]">
                        ⇄ BIDIRECTIONAL LATENCY FEEDBACK ⇄
                      </span>
                      <span className="h-4 w-[1px] bg-[var(--line)]" />
                    </div>

                    {/* Node 2: K8s Worker Nodes */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-white border border-[var(--line)] shadow-xs">
                        <span className="font-bold text-[var(--ink)] block text-xs">Node Pool A</span>
                        <span className="text-[10px] text-[var(--mute)] block mt-0.5">Pod Auto-Scaler</span>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          <span className="text-[9px] text-[var(--mute)] font-medium">Opt. Latency</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[var(--line)] shadow-xs">
                        <span className="font-bold text-[var(--ink)] block text-xs">Node Pool B</span>
                        <span className="text-[10px] text-[var(--mute)] block mt-0.5">Replica Balancing</span>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          <span className="text-[9px] text-[var(--mute)] font-medium">Load Adjusted</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Schematic Footer */}
                  <div className="pt-4 mt-5 border-t border-[var(--line)] flex items-center justify-between text-[10px] text-[var(--mute)]">
                    <span>SCHEDULER ENGINE</span>
                    <span className="font-semibold text-[var(--ink)]">KUBERNETES v1.28+</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* =========================================================================
            2. Supporting Projects Grid (3 Cards)
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 mb-12 sm:mb-14">
          {supportingProjects.map((project, idx) => {
            // Category labels & illustrative technical icons
            const isSmartSummarizer = project.id === "smart-summarizer";
            const isSmartIrrigation = project.id === "smart-irrigation";
            const isQrAttendance = project.id === "qr-attendance";

            const categoryLabel = isSmartSummarizer
              ? "GENERATIVE AI & NLP"
              : isSmartIrrigation
              ? "DATA SCIENCE & IOT"
              : "SOFTWARE & SYSTEMS";

            const icon = isSmartSummarizer ? (
              <Sparkles className="w-4 h-4 text-[var(--ink)]" aria-hidden="true" />
            ) : isSmartIrrigation ? (
              <Radio className="w-4 h-4 text-[var(--ink)]" aria-hidden="true" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-[var(--ink)]" aria-hidden="true" />
            );

            return (
              <article
                key={project.id}
                className="card p-6 sm:p-7 bg-white border border-[var(--line)] rounded-[26px] flex flex-col justify-between shadow-[0_4px_24px_rgba(13,13,13,0.03)] hover:shadow-[0_12px_36px_rgba(13,13,13,0.06)] hover:-translate-y-0.5 transition-all duration-300"
                aria-labelledby={`project-title-${project.id}`}
              >
                <div>
                  {/* Top Bar: Category Eyebrow & Index */}
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 mb-5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--mute)] flex items-center gap-1.5 font-medium">
                      {icon}
                      {categoryLabel}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--faint)]">
                      0{idx + 2}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    id={`project-title-${project.id}`}
                    className="font-sans font-bold text-lg sm:text-xl text-[var(--ink)] tracking-tight leading-snug mb-3"
                  >
                    {project.title}
                  </h3>

                  {/* Verified Description */}
                  <p className="font-sans text-xs sm:text-sm text-[var(--ink-2)] leading-relaxed mb-6">
                    {project.description}
                  </p>

                  {/* CSS-based Architectural Telemetry Card */}
                  <div className="p-3.5 rounded-xl bg-[var(--paper)]/80 border border-[var(--line)] font-mono text-[11px] mb-6 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-[var(--mute)]">
                      <span className="uppercase tracking-wider">PIPELINE ARCHITECTURE</span>
                      <span className="text-[var(--ink)] font-semibold">VERIFIED</span>
                    </div>

                    {isSmartSummarizer && (
                      <div className="text-[10px] text-[var(--ink-2)] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--mute)]">Inference:</span>
                          <span className="font-semibold text-[var(--ink)]">Groq AI LPU Engine</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--mute)]">Local LLM:</span>
                          <span className="font-semibold text-[var(--ink)]">Ollama Framework</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--mute)]">Orchestrator:</span>
                          <span className="font-semibold text-[var(--ink)]">LangChain Chains</span>
                        </div>
                      </div>
                    )}

                    {isSmartIrrigation && (
                      <div className="text-[10px] text-[var(--ink-2)] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--mute)]">Telemetry:</span>
                          <span className="font-semibold text-[var(--ink)]">Real-time Soil &amp; IoT</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--mute)]">Predictive:</span>
                          <span className="font-semibold text-[var(--ink)]">Weather Analytics</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--mute)]">Outcome:</span>
                          <span className="font-semibold text-[var(--ink)]">Water Optimization</span>
                        </div>
                      </div>
                    )}

                    {isQrAttendance && (
                      <div className="text-[10px] text-[var(--ink-2)] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--mute)]">Auth Token:</span>
                          <span className="font-semibold text-[var(--ink)]">Dynamic QR Session</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--mute)]">Integration:</span>
                          <span className="font-semibold text-[var(--ink)]">Secure Database</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--mute)]">Processing:</span>
                          <span className="font-semibold text-[var(--ink)]">Real-Time Verification</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Technology Stack */}
                <div className="pt-4 border-t border-[var(--line)]">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.technologies.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-[10px] px-2 py-0.5 rounded bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between font-mono text-[10px] text-[var(--mute)]">
                    <span>SOURCE STATUS</span>
                    <span className="text-[var(--ink)] font-medium">RÉSUMÉ RECORD</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* =========================================================================
            3. Editorial External Profile Callout
            ========================================================================= */}
        <div className="card p-6 sm:p-8 bg-white border border-[var(--line)] rounded-[26px] flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--mute)] block mb-1">
              CODE &amp; IMPLEMENTATIONS
            </span>
            <h4 className="font-sans font-bold text-lg sm:text-xl text-[var(--ink)] tracking-tight">
              Looking for more repositories and experiments?
            </h4>
            <p className="font-sans text-xs sm:text-sm text-[var(--mute)] mt-1 max-w-xl">
              Inspect active codebases, utility tools, and ongoing software projects directly on GitHub.
            </p>
          </div>

          <a
            href={PROFILE.github.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary text-xs sm:text-sm shrink-0 inline-flex items-center gap-2 group"
            aria-label={`Explore open-source repositories on GitHub: ${PROFILE.github.display} (opens in new tab)`}
          >
            <GithubIcon className="w-4 h-4 opacity-80" />
            <span>GitHub Repositories</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
