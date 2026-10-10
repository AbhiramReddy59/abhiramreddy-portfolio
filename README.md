# Abhiram Reddy Enukonda — Personal Portfolio

A modern, editorial personal portfolio website for **Abhiram Reddy Enukonda**, highlighting his expertise across **Data Science**, **Artificial Intelligence**, and **Software Engineering**.

Designed with a warm off-white canvas, high-contrast typography, interactive character animation, and accessible interactions.

![Portfolio Preview](hero-revealed-state-1440.png)

---

## Features

- **Talking Character Hero:** Centered introduction video with an editorial 2-second cinematic entrance reveal, background typographic layering, user-controlled sound toggle, and automatic viewport visibility pausing.
- **Interactive Developer ID Pass:** 3D flippable pass in the About section featuring verified education at the University of Southern Queensland (USQ) and undergraduate background at NNRG College of Engineering.
- **Capabilities Periodic Table Grid:** Interactive skill grid organizing 26 verified technical capabilities with category filtering and an inspector panel.
- **Selected Work & Research:** Features lead academic research (*Bidirectional Load Balancing in Kubernetes* accepted at ICCIML) alongside Generative AI, IoT analytics, and systems projects.
- **Professional Journey:** High-contrast experience timeline prioritizing technical software engineering roles, with a secondary section for Australian workplace operations.
- **Certifications & Recognitions:** Verified technical credentials, coursework, academic excellence (CGPA 8.6), student leadership, and competitive hackathons.
- **Direct Contact Channel:** Direct email interface with one-click copy-to-clipboard functionality, native mail client trigger, and external LinkedIn/GitHub links.
- **Accessibility & Motion Control:** High-contrast focus rings, full keyboard navigability, semantic HTML5 structure, and full `@media (prefers-reduced-motion: reduce)` support.

---

## Technology Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Language:** [TypeScript 5.7](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) & PostCSS
- **Smooth Scrolling:** [Lenis](https://lenis.darkroom.engineering/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Data Architecture:** Single source of truth in `src/lib/data.ts` derived strictly from verified resume data.

---

## Project Structure

```text
ABHIRAM-TALKING-PORTFOLIO/
├── docs/
│   └── BUILD_LOG.md              # Preserved engineering checkpoints & validation records
├── public/
│   ├── hero/
│   │   └── intro.mp4             # Introduction character video
│   ├── logos/                    # Logos & brand icons
│   ├── id-portrait.png           # Developer portrait asset
│   └── resume.pdf                # Downloadable resume
├── src/
│   ├── app/
│   │   ├── globals.css           # Design tokens, resets & base layer
│   │   ├── layout.tsx            # Root layout, Google Fonts & metadata
│   │   └── page.tsx              # Application entry point
│   ├── components/
│   │   ├── App.tsx               # Main layout & section orchestration
│   │   ├── Navigation.tsx        # Responsive desktop & mobile navigation
│   │   ├── hero/
│   │   │   └── Hero.tsx          # Hero section with cinematic reveal & audio toggle
│   │   ├── sections/
│   │   │   ├── About.tsx         # Bio, flippable ID card & specifications
│   │   │   ├── Skills.tsx        # Interactive capabilities grid & inspector
│   │   │   ├── Work.tsx          # Featured research & project cards
│   │   │   ├── Experience.tsx    # Technical & Australian operations timeline
│   │   │   ├── Certifications.tsx# Credentials & technical coursework
│   │   │   ├── Achievements.tsx  # Academic, leadership & hackathon milestones
│   │   │   └── Contact.tsx       # Direct email channel & social links
│   │   └── ui/                   # Reusable UI primitives
│   └── lib/
│       ├── data.ts               # Verified data source of truth
│       ├── hooks.ts              # Client interaction & viewport hooks
│       └── scroll.tsx            # Lenis smooth-scroll provider
├── scripts/                      # Automated browser verification test suites
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies & project scripts
├── package-lock.json             # Dependency lockfile
├── postcss.config.mjs            # PostCSS configuration
├── tsconfig.json                 # TypeScript compiler configuration
└── README.md                     # Project documentation
```

---

## Prerequisites

- **Node.js:** v20.x or later recommended
- **npm:** v10.x or later

---

## Installation & Local Development

1. **Clone the repository and enter directory:**
   ```bash
   git clone https://github.com/AbhiramReddy59/abhiramreddy-portfolio
   cd abhiramreddy-portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **View in browser:**
   Open [http://localhost:3000](http://localhost:3000) to view the site.

---

## Production Build

To build and run the optimized production bundle locally:

```bash
# Build the production bundle
npm run build

# Start the production server
npm start
```

---

---

## Latest Checkpoint — Step 3.17: Hero Video — Unmuted Autoplay Attempt with Muted Fallback

- **Authoritative Playback Controller:** Established a unified playback state machine (`loading` | `ready` | `playing-unmuted` | `playing-muted` | `paused-hidden` | `paused-user` | `completed` | `failed`) with re-entrancy locks and unmount protection (`isMountedRef`), avoiding conflicting `play()` invocations.
- **Initial Playback Strategy:** When media readiness (`readyState >= 2`) and reveal criteria are satisfied, the controller attempts unmuted autoplay (`video.muted = false; video.play()`). If rejected by browser autoplay policy, it immediately falls back to muted autoplay (`video.muted = true; video.play()`). If both attempts fail, the character and CTAs remain visible with the sound/play control ready for user interaction—without retry loops.
- **One-Time Playback & Replay Support:** Native `loop` attribute removed; on video `ended`, playback marks as `completed`, automatically sets `video.muted = true`, preserves the final frame in the canvas, and updates the control to a Replay button (`RotateCcw` icon). Replay is an explicit user gesture restarting playback from beginning (`currentTime = 0`) with sound.
- **Visibility & Tab Switching:** Integrated IntersectionObserver (0.35 threshold) and `document.visibilitychange`. Pauses video when hero is out of view or tab is hidden; resumes unfinished video preserving its previous muted/unmuted state. Completed or manually paused video is never automatically resumed.
- **Accessibility & Validation Matrix:** All 15 validation matrix scenarios verified via automated CDP testing (`scripts/verify-autoplay-strategy.mjs`) and real headless Edge testing.
  - Zero unhandled promise rejections.
  - `npx tsc --noEmit` -> 0 errors.
  - `npm run build` -> production bundle compiled cleanly in 3.6s.
- **Known Browser-Policy Limitations:** Chromium/WebKit autoplay policies require user interaction or high Media Engagement Index (MEI) for unmuted audio on cold page loads; unmuted playback is an attempt with guaranteed graceful fallback to muted playback.

---

## Development History

Detailed records of engineering steps, technical decisions, responsive browser audits, and accessibility checks are documented in [docs/BUILD_LOG.md](docs/BUILD_LOG.md).

---

## Contact

- **Email:** [abhiramreddye@outlook.com](mailto:abhiramreddye@outlook.com)
- **LinkedIn:** [linkedin.com/in/abhiramreddye](https://linkedin.com/in/abhiramreddye)
- **GitHub:** [github.com/abhiramreddy59](https://github.com/abhiramreddy59)
