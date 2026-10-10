"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PROFILE } from "@/lib/data";
import { useScrolled, useScrollProgress, useActiveSection, useReducedMotion } from "@/lib/hooks";

const NAVIGATION_ITEMS = [
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Work", href: "#work" },
  { name: "Experience", href: "#experience" },
  { name: "Certifications", href: "#certifications" },
  { name: "Achievements", href: "#achievements" },
  { name: "Contact", href: "#contact" },
];

const SECTION_IDS = NAVIGATION_ITEMS.map((item) => item.href.replace("#", ""));

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isScrolled = useScrolled(30);
  const scrollProgress = useScrollProgress();
  const activeSection = useActiveSection(SECTION_IDS);
  const prefersReducedMotion = useReducedMotion();

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const firstNavLinkRef = useRef<HTMLAnchorElement>(null);

  // Name derived from PROFILE.fullName: "Abhiram Reddy Enukonda" -> "ABHIRAM REDDY"
  const nameParts = PROFILE.fullName.split(" ");
  const brandName = `${nameParts[0]} ${nameParts[1]}`.toUpperCase();

  // Scroll to section with smooth behavior unless reduced motion is preferred
  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      const targetId = href.replace("#", "");
      const targetElement = document.getElementById(targetId);

      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        document.body.style.overflow = "";
      }

      if (targetElement) {
        if (prefersReducedMotion) {
          targetElement.scrollIntoView({ behavior: "auto" });
        } else {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
        window.history.pushState(null, "", href);
      }
    },
    [isMobileMenuOpen, prefersReducedMotion]
  );

  // Toggle mobile menu
  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = "";
    // Return focus to menu trigger button
    setTimeout(() => {
      menuButtonRef.current?.focus();
    }, 50);
  };

  // Keyboard navigation & Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  // Focus management when mobile menu opens
  useEffect(() => {
    if (isMobileMenuOpen) {
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 80);
    }
  }, [isMobileMenuOpen]);

  // Cleanup body lock on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      {/* 1. Thin Scroll Progress Indicator */}
      <div
        className="fixed top-0 left-0 right-0 h-[2.5px] z-[60] pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="h-full bg-[var(--ink)] transition-[width] duration-75 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 2. Main Navigation Bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isScrolled ? "py-3" : "py-5 sm:py-6"
        }`}
      >
        <div className="container">
          <div
            className={`flex items-center justify-between transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isScrolled
                ? "bg-white/85 backdrop-blur-md border border-[var(--line)] shadow-[0_4px_24px_rgba(13,13,13,0.04)] px-4 sm:px-6 py-2.5 rounded-full"
                : "bg-transparent border border-transparent px-2 py-1"
            }`}
          >
            {/* Left: AR Initials & Full Name */}
            <a
              href="#hero"
              onClick={(e) => handleNavClick(e, "#hero")}
              className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] rounded-full p-1"
              aria-label={`${PROFILE.fullName} - Return to top`}
            >
              <span className="w-8 h-8 rounded-full bg-[var(--ink)] text-[var(--paper)] text-xs font-mono font-medium flex items-center justify-center tracking-tight transition-transform duration-200 group-hover:scale-105">
                AR
              </span>
              <span className="font-sans font-bold text-xs sm:text-sm tracking-tight text-[var(--ink)] uppercase">
                {brandName}
              </span>
            </a>

            {/* Right: Desktop Navigation Links */}
            <nav
              className="hidden md:flex items-center gap-7 lg:gap-8"
              aria-label="Primary Navigation"
            >
              {NAVIGATION_ITEMS.map((item) => {
                const isActive = activeSection === item.href.replace("#", "");
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`relative text-sm tracking-tight font-medium transition-colors duration-200 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] rounded-md ${
                      isActive
                        ? "text-[var(--ink)] font-semibold"
                        : "text-[var(--mute)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {item.name}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[var(--ink)] rounded-full animate-fade-in"
                        aria-hidden="true"
                      />
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Right: Mobile "Menu" Trigger Button */}
            <div className="md:hidden flex items-center">
              <button
                ref={menuButtonRef}
                type="button"
                onClick={openMobileMenu}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation-overlay"
                aria-label="Open navigation"
                className="inline-flex items-center justify-center bg-[var(--ink)] text-[var(--paper)] text-xs font-medium tracking-wide uppercase px-4 py-2 min-h-[44px] min-w-[72px] rounded-full hover:bg-[var(--ink-2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] focus-visible:ring-offset-2"
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Mobile Full-Screen Navigation Overlay */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Site Navigation"
          className="fixed inset-0 z-50 bg-[var(--paper)] flex flex-col justify-between p-6 sm:p-8 animate-fade-in"
        >
          {/* Top Bar inside Overlay */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--ink)] text-[var(--paper)] text-xs font-mono font-medium flex items-center justify-center">
                AR
              </span>
              <span className="font-sans font-bold text-xs tracking-tight text-[var(--ink)] uppercase">
                {brandName}
              </span>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeMobileMenu}
              aria-label="Close navigation"
              className="inline-flex items-center justify-center bg-[var(--ink)] text-[var(--paper)] text-xs font-medium tracking-wide uppercase px-4 py-2 min-h-[44px] min-w-[72px] rounded-full hover:bg-[var(--ink-2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] focus-visible:ring-offset-2"
            >
              Close
            </button>
          </div>

          {/* Central Editorial Links Stack */}
          <nav
            className="flex flex-col gap-6 my-auto py-8"
            aria-label="Mobile Primary Navigation"
          >
            {NAVIGATION_ITEMS.map((item, index) => {
              const isActive = activeSection === item.href.replace("#", "");
              return (
                <a
                  key={item.href}
                  ref={index === 0 ? firstNavLinkRef : undefined}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  style={{
                    animationDelay: `${index * 45}ms`,
                  }}
                  className={`text-3xl sm:text-4xl font-bold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] rounded-lg py-1 ${
                    isActive
                      ? "text-[var(--ink)] translate-x-2"
                      : "text-[var(--ink)] hover:text-[var(--mute)]"
                  }`}
                >
                  <span className="font-mono text-xs font-normal text-[var(--mute)] mr-3 tracking-widest">
                    0{index + 1}
                  </span>
                  {item.name}
                </a>
              );
            })}
          </nav>

          {/* Bottom Info Bar inside Overlay */}
          <div className="pt-6 border-t border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[var(--mute)] font-mono gap-2">
            <span>{PROFILE.location}</span>
            <span>{PROFILE.email}</span>
          </div>
        </div>
      )}
    </>
  );
}
