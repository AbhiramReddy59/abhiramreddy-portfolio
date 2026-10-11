"use client";

import { useState, useMemo, useRef, useEffect, Fragment } from "react";
import { ArrowUpRight } from "lucide-react";
import { SKILL_GROUPS, PROJECTS, PROFILE } from "@/lib/data";
import { useReducedMotion } from "@/lib/hooks";

interface FlattenedSkill {
  name: string;
  category: string;
  symbol: string;
  atomicNumber: number;
}

// Deterministic symbols for each verified skill in the résumé inventory
const SKILL_SYMBOLS: Record<string, string> = {
  // Data Science & AI
  "Python": "Py",
  "Machine Learning": "ML",
  "Predictive Modeling": "PM",
  "NLP": "NL",
  "Generative AI": "GA",
  "LangChain": "LC",
  "Groq AI": "GQ",
  "Ollama": "OL",

  // Software & Backend
  "Java": "Ja",
  "C++": "C+",
  "Spring Boot": "SB",
  "REST APIs": "RA",
  "Kafka": "Kf",
  "Microservices": "MS",

  // Databases & Cloud
  "PostgreSQL": "Pg",
  "MongoDB": "Mg",
  "MySQL": "My",
  "AWS (EC2, S3, RDS, Lambda)": "AW",
  "Docker": "Dk",
  "Kubernetes": "K8",

  // Operational & Systems
  "Real-time Inventory Reconciliation": "IR",
  "Stock Replenishment": "SR",
  "Automated Reporting": "AR",
  "Sensor/IoT Systems": "IS",
  "Quality Compliance": "QC",
  "Process Optimization": "PO",
};

export default function Skills() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const prefersReducedMotion = useReducedMotion();
  const mobileInspectorRef = useRef<HTMLDivElement>(null);

  // Responsive grid column tracking for mobile/tablet row grouping
  const [gridCols, setGridCols] = useState(2);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const updateCols = () => {
      if (typeof window !== "undefined") {
        setGridCols(window.innerWidth >= 640 ? 3 : 2);
      }
    };
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  // Flatten all verified skills with sequential deterministic numbers
  const allSkills: FlattenedSkill[] = useMemo(() => {
    const list: FlattenedSkill[] = [];
    let counter = 1;
    SKILL_GROUPS.forEach((group) => {
      group.skills.forEach((skill) => {
        list.push({
          name: skill,
          category: group.category,
          symbol: SKILL_SYMBOLS[skill] || skill.slice(0, 2).toUpperCase(),
          atomicNumber: counter++,
        });
      });
    });
    return list;
  }, []);

  // Default selected skill is Python (first item) so inspector is populated on initial load
  const [selectedSkill, setSelectedSkill] = useState<FlattenedSkill>(
    allSkills[0] || {
      name: "Python",
      category: "Data Science & AI",
      symbol: "Py",
      atomicNumber: 1,
    }
  );

  // Category filters list
  const categoryFilters = useMemo(
    () => ["All", ...SKILL_GROUPS.map((g) => g.category)],
    []
  );

  // Filter skills based on selected category
  const filteredSkills = useMemo(() => {
    if (selectedCategory === "All") return allSkills;
    return allSkills.filter((s) => s.category === selectedCategory);
  }, [allSkills, selectedCategory]);

  // When category changes, auto-select the first skill in that category if current skill is not in it
  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    if (category !== "All") {
      const firstInGroup = allSkills.find((s) => s.category === category);
      if (firstInGroup && selectedSkill.category !== category) {
        setSelectedSkill(firstInGroup);
      }
    }
  };

  // Verified project associations strictly matched against data.ts PROJECTS
  const verifiedProjects = useMemo(() => {
    const normSelected = selectedSkill.name.toLowerCase();
    return PROJECTS.filter((proj) =>
      proj.technologies.some((tech) => {
        const normTech = tech.toLowerCase();
        return (
          normTech === normSelected ||
          normTech.includes(normSelected) ||
          normSelected.includes(normTech)
        );
      })
    );
  }, [selectedSkill]);

  // Calculate row end index for mobile inline inspector rendering
  const selectedIndex = useMemo(() => {
    return filteredSkills.findIndex((s) => s.name === selectedSkill.name);
  }, [filteredSkills, selectedSkill]);

  const rowEndIndex = useMemo(() => {
    if (selectedIndex === -1 || filteredSkills.length === 0) return -1;
    const rowIndex = Math.floor(selectedIndex / gridCols);
    const end = (rowIndex + 1) * gridCols - 1;
    return Math.min(filteredSkills.length - 1, end);
  }, [selectedIndex, filteredSkills.length, gridCols]);

  // Handle skill selection with viewport visibility check and minimal smooth scroll on mobile
  const handleSelectSkill = (skill: FlattenedSkill, isUserClick = false) => {
    setSelectedSkill(skill);

    if (isUserClick && typeof window !== "undefined" && window.innerWidth < 1024) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const el = mobileInspectorRef.current;
          if (!el) return;

          const rect = el.getBoundingClientRect();
          const headerOffset = 84; // 80px sticky header + 4px clearance
          const viewportHeight = window.innerHeight;

          // If inspector is already visible within viewport, no scroll is needed
          const isFullyVisible =
            rect.top >= headerOffset && rect.bottom <= viewportHeight - 16;
          if (isFullyVisible) return;

          const behavior = prefersReducedMotion ? "auto" : "smooth";

          // If inspector top is behind the sticky header
          if (rect.top < headerOffset) {
            window.scrollBy({
              top: rect.top - headerOffset,
              behavior,
            });
          }
          // If inspector bottom is below viewport, scroll just enough to reveal it
          else if (rect.bottom > viewportHeight - 16) {
            const neededScroll = rect.bottom - (viewportHeight - 16);
            const maxAllowedScroll = rect.top - headerOffset;
            const scrollAmount = Math.min(neededScroll, Math.max(0, maxAllowedScroll));
            if (scrollAmount > 0) {
              window.scrollBy({
                top: scrollAmount,
                behavior,
              });
            }
          }
        }, 30);
      });
    }
  };

  // Reusable Skill Inspector content for both desktop sidebar and mobile inline
  const renderInspectorContent = () => (
    <>
      {/* Inspector Top Label */}
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 mb-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--mute)]">
          SKILL INSPECTOR
        </span>
        <span className="font-mono text-[10px] text-[var(--faint)]">
          ELEMENT {String(selectedSkill.atomicNumber).padStart(2, "0")}
        </span>
      </div>

      {/* Periodic Badge & Title */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-[var(--paper)] border border-[var(--line)] flex flex-col items-center justify-center shrink-0">
          <span className="font-mono font-bold text-2xl text-[var(--ink)] leading-none">
            {selectedSkill.symbol}
          </span>
          <span className="font-mono text-[9px] text-[var(--mute)] mt-1">
            #{String(selectedSkill.atomicNumber).padStart(2, "0")}
          </span>
        </div>

        <div>
          <h3 className="font-sans font-bold text-xl sm:text-2xl text-[var(--ink)] tracking-tight leading-tight">
            {selectedSkill.name}
          </h3>
          <span className="font-mono text-xs text-[var(--mute)] mt-1 block">
            {selectedSkill.category}
          </span>
        </div>
      </div>

      {/* Related Projects / Skillset Inventory */}
      <div className="space-y-3 pt-4 border-t border-[var(--line)]">
        <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--mute)] block">
          RELATED PROJECTS
        </span>

        {verifiedProjects.length > 0 ? (
          <div className="space-y-2.5">
            {verifiedProjects.map((proj) => {
              const projectUrl = (proj as any).link || (proj as any).github;
              return (
                <div
                  key={proj.id}
                  className="p-3.5 rounded-xl bg-[var(--paper)]/60 border border-[var(--line)]"
                >
                  {projectUrl ? (
                    <a
                      href={projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans font-semibold text-xs sm:text-sm text-[var(--ink)] hover:text-[var(--mute)] transition-colors leading-snug inline-flex items-center gap-1 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] rounded"
                      aria-label={`${proj.title} (opens in new tab)`}
                    >
                      <span>{proj.title}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                    </a>
                  ) : (
                    <h4 className="font-sans font-semibold text-xs sm:text-sm text-[var(--ink)] leading-snug">
                      {proj.title}
                    </h4>
                  )}
                  {proj.type && (
                    <span className="font-mono text-[10px] text-[var(--mute)] block mt-0.5">
                      {proj.type}
                    </span>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {proj.technologies.map((t) => (
                      <span
                        key={t}
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          t.toLowerCase().includes(selectedSkill.name.toLowerCase()) ||
                          selectedSkill.name.toLowerCase().includes(t.toLowerCase())
                            ? "bg-[var(--ink)] text-white font-semibold"
                            : "bg-white border border-[var(--line)] text-[var(--mute)]"
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[var(--paper)]/60 border border-[var(--line)]">
            <p className="font-sans text-xs sm:text-sm font-semibold text-[var(--ink)]">
              Listed in my technical skill set
            </p>
            <p className="font-sans text-[11px] text-[var(--mute)] mt-1 leading-relaxed">
              Verified technical capability evidenced in professional resume inventory.
            </p>
            <div className="pt-3 mt-3 border-t border-[var(--line)]">
              <a
                href={PROFILE.github.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[var(--ink)] hover:text-[var(--mute)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] rounded"
                aria-label={`Explore my GitHub profile: ${PROFILE.github.display} (opens in new tab)`}
              >
                <span>Explore my GitHub profile</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Metadata Footer */}
      <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center justify-between font-mono text-[10px] text-[var(--mute)]">
        <span>RÉSUMÉ SOURCE</span>
        <span className="text-[var(--ink)] font-semibold">CONFIRMED</span>
      </div>
    </>
  );

  return (
    <section
      id="skills"
      className="section border-t border-[var(--line)]"
      aria-label="Capabilities and Technical Skills"
    >
      <div className="container">
        {/* Section Heading */}
        <div className="section-header">
          <span className="section-index">02 — Capabilities</span>
          <h2 className="section-title">
            The periodic table of my <span className="serif-accent">stack.</span>
          </h2>
        </div>

        {/* Category Filter Pills */}
        <div
          className="relative z-20 flex flex-wrap items-center gap-2 sm:gap-2.5 mb-8 sm:mb-10 w-full"
          role="group"
          aria-label="Filter skills by technical category"
        >
          {categoryFilters.map((category) => {
            const count =
              category === "All"
                ? allSkills.length
                : allSkills.filter((s) => s.category === category).length;
            const isSelected = selectedCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => handleSelectCategory(category)}
                aria-pressed={isSelected}
                className={`inline-flex items-center gap-2 text-xs font-mono font-medium tracking-wide py-2 px-3.5 sm:px-4 rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] focus-visible:ring-offset-2 ${
                  isSelected
                    ? "bg-[var(--ink)] text-white shadow-sm"
                    : "bg-white text-[var(--ink-2)] border border-[var(--line)] hover:border-[var(--ink)]/50"
                }`}
              >
                <span>{category}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-[var(--soft)] text-[var(--mute)]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2-Column Responsive Layout: Grid (8 cols) + Inspector (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* =========================================================================
              Column 1: Periodic Table Grid (lg:col-span-8)
              ========================================================================= */}
          <div className="lg:col-span-8">
            {filteredSkills.length === 0 ? (
              <div className="card p-12 text-center text-[var(--mute)] font-mono text-xs">
                No skills listed in this category.
              </div>
            ) : (
              <div
                className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5"
                role="list"
                aria-label="Technical skills grid"
              >
                {filteredSkills.map((skill, index) => {
                  const isSelected = selectedSkill.name === skill.name;
                  const isRowEnd = index === rowEndIndex;

                  return (
                    <Fragment key={skill.name}>
                      <button
                        type="button"
                        onClick={() => handleSelectSkill(skill, true)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSelectSkill(skill, true);
                          }
                        }}
                        aria-pressed={isSelected}
                        aria-label={`${skill.name}, ${skill.category}. Symbol: ${skill.symbol}`}
                        className={`relative p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] focus-visible:ring-offset-2 flex flex-col justify-between min-h-[116px] sm:min-h-[124px] ${
                          isSelected
                            ? "bg-white border-2 border-[var(--ink)] shadow-md ring-2 ring-[var(--ink)]/10 -translate-y-0.5"
                            : "bg-white border border-[var(--line)] hover:border-[var(--ink)]/40 hover:-translate-y-0.5 hover:shadow-sm"
                        }`}
                      >
                        {/* Top Row: Atomic Number & Category Indicator */}
                        <div className="flex items-center justify-between w-full">
                          <span className="font-mono text-[10px] font-medium text-[var(--mute)]">
                            {String(skill.atomicNumber).padStart(2, "0")}
                          </span>
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected
                                ? "bg-[var(--ink)]"
                                : "bg-[var(--faint)] opacity-60"
                            }`}
                            aria-hidden="true"
                          />
                        </div>

                        {/* Center: Deterministic Symbol */}
                        <div className="my-1.5">
                          <span className="font-mono font-bold text-2xl sm:text-3xl tracking-tight text-[var(--ink)] block">
                            {skill.symbol}
                          </span>
                        </div>

                        {/* Bottom: Skill Name & Category */}
                        <div>
                          <span className="font-sans font-semibold text-xs sm:text-[13px] text-[var(--ink)] leading-snug block line-clamp-2">
                            {skill.name}
                          </span>
                          <span className="font-mono text-[9px] text-[var(--mute)] uppercase tracking-wider block truncate mt-1">
                            {skill.category.split(" ")[0]}
                          </span>
                        </div>
                      </button>

                      {/* Mobile Inline Inspector directly below selected card's row */}
                      {isMounted && isRowEnd && (
                        <div
                          ref={mobileInspectorRef}
                          className="col-span-2 sm:col-span-3 lg:hidden my-2 card p-5 sm:p-6 bg-white border border-[var(--line)] rounded-[22px] shadow-[0_4px_20px_rgba(13,13,13,0.04)]"
                          aria-label="Selected Skill Details (Inline)"
                        >
                          {renderInspectorContent()}
                        </div>
                      )}
                    </Fragment>
                  );
                })}
              </div>
            )}
          </div>

          {/* =========================================================================
              Column 2: Skill Inspector (lg:col-span-4) - Desktop Sidebar Only
              ========================================================================= */}
          <aside
            className="hidden lg:block lg:col-span-4 card p-6 sm:p-7 bg-white border border-[var(--line)] rounded-[26px] sticky top-24 shadow-[0_4px_24px_rgba(13,13,13,0.03)]"
            aria-label="Selected Skill Details"
          >
            {renderInspectorContent()}
          </aside>
        </div>
      </div>
    </section>
  );
}
