"use client";

import Navigation from "./Navigation";
import Hero from "./hero/Hero";
import About from "./sections/About";
import Skills from "./sections/Skills";
import Work from "./sections/Work";
import Experience from "./sections/Experience";
import Certifications from "./sections/Certifications";
import Achievements from "./sections/Achievements";
import Contact from "./sections/Contact";
import { SmoothScrollProvider } from "@/lib/scroll";

export default function App() {
  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
        <Navigation />
        <main>
          <Hero />
          <About />
          <Skills />
          <Work />
          <Experience />
          <Certifications />
          <Achievements />
          <Contact />
        </main>
        <footer className="py-8 border-t border-[var(--line)] text-center text-xs text-[var(--mute)]">
          <p>&copy; {new Date().getFullYear()} Abhiram Reddy Enukonda. All rights reserved.</p>
        </footer>
      </div>
    </SmoothScrollProvider>
  );
}
