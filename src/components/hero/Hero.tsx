"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, VolumeX, RotateCcw, ArrowDownRight } from "lucide-react";
import { PROFILE } from "@/lib/data";
import { useReducedMotion } from "@/lib/hooks";

export type PlaybackState =
  | "loading"
  | "ready"
  | "playing-unmuted"
  | "playing-muted"
  | "paused-hidden"
  | "paused-user"
  | "completed"
  | "failed";

type AnimationPhase = "initial" | "portal" | "revealing" | "settled";

export default function Hero() {
  const [playbackState, setPlaybackState] = useState<PlaybackState>("loading");
  const [isMuted, setIsMuted] = useState(true);
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>("initial");
  const [hasVideoError, setHasVideoError] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Authoritative playback & lifecycle refs
  const isMountedRef = useRef(true);
  const isHeroVisibleRef = useRef(true);
  const autoplayAttemptedRef = useRef(false);
  const wasMutedBeforeHiddenRef = useRef(true);
  const userManuallyPausedRef = useRef(false);
  const playbackActionLockRef = useRef(false);
  const playbackStateRef = useRef<PlaybackState>("loading");
  const videoReadyRef = useRef(false);
  const activePlayPromiseRef = useRef<Promise<void> | null>(null);

  // Synchronize playbackStateRef
  useEffect(() => {
    playbackStateRef.current = playbackState;
  }, [playbackState]);

  // Lifecycle & unmount cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      const videoEl = videoRef.current;
      if (videoEl) {
        videoEl.pause();
      }
    };
  }, []);

  // Helper to verify current hero visibility
  const checkIsHeroVisible = useCallback(() => {
    if (typeof window === "undefined" || !heroRef.current) return true;
    const rect = heroRef.current.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const visibleH = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0));
    return rect.height > 0 ? visibleH / rect.height >= 0.35 : true;
  }, []);

  // Authoritative Playback Controller: Executes play promise with error handling & race checks
  const executePlay = useCallback(
    async (desiredUnmuted: boolean): Promise<boolean> => {
      const videoEl = videoRef.current;
      if (!videoEl || !isMountedRef.current) return false;
      if (videoEl.ended) return false;

      try {
        videoEl.muted = !desiredUnmuted;
        const playPromise = videoEl.play();
        activePlayPromiseRef.current = playPromise;
        await playPromise;
        activePlayPromiseRef.current = null;

        if (!isMountedRef.current) return false;

        // Race check: If viewport or tab became hidden while promise was resolving
        const isVisible = checkIsHeroVisible();
        isHeroVisibleRef.current = isVisible;
        if (!isVisible || (typeof document !== "undefined" && document.hidden)) {
          videoEl.pause();
          setPlaybackState("paused-hidden");
          setIsMuted(videoEl.muted);
          return false;
        }

        const nextState: PlaybackState = videoEl.muted
          ? "playing-muted"
          : "playing-unmuted";
        setPlaybackState(nextState);
        setIsMuted(videoEl.muted);
        userManuallyPausedRef.current = false;
        return true;
      } catch {
        activePlayPromiseRef.current = null;
        return false;
      }
    },
    [checkIsHeroVisible]
  );

  // Initial Playback Strategy:
  // 1. Attempt unmuted autoplay
  // 2. If rejected, immediately fallback to muted playback
  // 3. If muted fails, keep video and controls in 'ready' state without retrying
  const startInitialAutoplay = useCallback(async () => {
    if (autoplayAttemptedRef.current) return;
    const videoEl = videoRef.current;
    if (!videoEl || !isMountedRef.current || hasVideoError) return;
    if (videoEl.ended) return;

    autoplayAttemptedRef.current = true;

    // Reduced motion: Do not force audio or sudden unmuted playback
    if (prefersReducedMotion) {
      const mutedOk = await executePlay(false);
      if (!mutedOk && isMountedRef.current) {
        setPlaybackState("ready");
        setIsMuted(true);
      }
      return;
    }

    // Attempt 1: Unmuted playback
    const unmutedOk = await executePlay(true);
    if (unmutedOk) {
      return;
    }

    if (!isMountedRef.current) return;

    // Attempt 2: Muted fallback
    const mutedOk = await executePlay(false);
    if (!mutedOk && isMountedRef.current) {
      // Both attempts failed: Keep character visible and sound control ready for user gesture
      setPlaybackState("ready");
      setIsMuted(true);
    }
  }, [executePlay, hasVideoError, prefersReducedMotion]);

  // Media readiness listener
  const handleMediaReady = useCallback(() => {
    videoReadyRef.current = true;
    if (playbackStateRef.current === "loading") {
      setPlaybackState("ready");
    }
    const revealPermits =
      prefersReducedMotion || animationPhase !== "initial";
    if (revealPermits && !autoplayAttemptedRef.current) {
      startInitialAutoplay();
    }
  }, [animationPhase, prefersReducedMotion, startInitialAutoplay]);

  // Media completion handler: One-time playback ended
  const handleEnded = useCallback(() => {
    if (!isMountedRef.current) return;
    const videoEl = videoRef.current;
    if (videoEl) {
      videoEl.muted = true;
    }
    setIsMuted(true);
    setPlaybackState("completed");
    userManuallyPausedRef.current = false;
  }, []);

  // Media error handler
  const handleError = useCallback(() => {
    if (!isMountedRef.current) return;
    setHasVideoError(true);
    setPlaybackState("failed");
  }, []);

  // Check initial video readiness on mount if already loaded & wire native listeners
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    videoEl.addEventListener("error", handleError);
    videoEl.addEventListener("loadeddata", handleMediaReady);
    videoEl.addEventListener("canplay", handleMediaReady);
    videoEl.addEventListener("ended", handleEnded);

    if (videoEl.readyState >= 2) {
      handleMediaReady();
    }

    return () => {
      videoEl.removeEventListener("error", handleError);
      videoEl.removeEventListener("loadeddata", handleMediaReady);
      videoEl.removeEventListener("canplay", handleMediaReady);
      videoEl.removeEventListener("ended", handleEnded);
    };
  }, [handleMediaReady, handleEnded, handleError]);

  // Canvas Video Frame Processor:
  // Seamlessly composites video frames with alpha feathering on white background,
  // ensures the outlined ABHIRAM typography is visible, and preserves final frame on ended
  useEffect(() => {
    const videoEl = videoRef.current;
    const canvasEl = canvasRef.current;
    if (!videoEl || !canvasEl || hasVideoError) return;

    const ctx = canvasEl.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let isRunning = true;
    let rvfcId: number | null = null;
    let rafId: number | null = null;

    const drawFrame = () => {
      if (!videoEl || !canvasEl) return;
      if (videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
        if (canvasEl.width !== 720) {
          canvasEl.width = 720;
          canvasEl.height = 405;
        }

        ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
        const imgData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
        const buf = new Uint32Array(imgData.data.buffer);
        const len = buf.length;

        for (let i = 0; i < len; i++) {
          const pixel = buf[i];
          const r = pixel & 0xff;
          const g = (pixel >> 8) & 0xff;
          const b = (pixel >> 16) & 0xff;

          if (r > 238 && g > 238 && b > 238) {
            const minVal = r < g ? (r < b ? r : b) : g < b ? g : b;
            const alpha = Math.max(
              0,
              Math.min(255, Math.floor((255 * (255 - minVal)) / 14))
            );
            buf[i] = (alpha << 24) | (b << 16) | (g << 8) | r;
          }
        }

        ctx.putImageData(imgData, 0, 0);
      }
    };

    const loopRender = () => {
      if (!isRunning || !videoEl || videoEl.paused || videoEl.ended) return;
      drawFrame();

      if ("requestVideoFrameCallback" in videoEl) {
        rvfcId = (
          videoEl as unknown as {
            requestVideoFrameCallback: (cb: () => void) => number;
          }
        ).requestVideoFrameCallback(loopRender);
      } else {
        rafId = requestAnimationFrame(loopRender);
      }
    };

    const handlePlay = () => {
      if ("requestVideoFrameCallback" in videoEl) {
        rvfcId = (
          videoEl as unknown as {
            requestVideoFrameCallback: (cb: () => void) => number;
          }
        ).requestVideoFrameCallback(loopRender);
      } else {
        rafId = requestAnimationFrame(loopRender);
      }
    };

    videoEl.addEventListener("play", handlePlay);
    videoEl.addEventListener("pause", drawFrame);
    videoEl.addEventListener("ended", drawFrame);
    videoEl.addEventListener("loadeddata", drawFrame);
    videoEl.addEventListener("seeked", drawFrame);

    if (videoEl.readyState >= 2) {
      drawFrame();
    }
    if (!videoEl.paused && !videoEl.ended) {
      handlePlay();
    }

    return () => {
      isRunning = false;
      videoEl.removeEventListener("play", handlePlay);
      videoEl.removeEventListener("pause", drawFrame);
      videoEl.removeEventListener("ended", drawFrame);
      videoEl.removeEventListener("loadeddata", drawFrame);
      videoEl.removeEventListener("seeked", drawFrame);
      if (rvfcId !== null && "cancelVideoFrameCallback" in videoEl) {
        (
          videoEl as unknown as {
            cancelVideoFrameCallback: (id: number) => void;
          }
        ).cancelVideoFrameCallback(rvfcId);
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [hasVideoError]);

  // Cinematic Portal & Digital Scan Sequence
  useEffect(() => {
    if (prefersReducedMotion) {
      setAnimationPhase("settled");
      return;
    }

    const t1 = setTimeout(() => setAnimationPhase("portal"), 800);
    const t2 = setTimeout(() => setAnimationPhase("revealing"), 1600);
    const t3 = setTimeout(() => setAnimationPhase("settled"), 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [prefersReducedMotion]);

  // Trigger initial autoplay when reveal timing and video readiness are satisfied
  useEffect(() => {
    if (autoplayAttemptedRef.current || hasVideoError) return;
    const revealPermits =
      prefersReducedMotion || animationPhase !== "initial";
    if (revealPermits && videoReadyRef.current) {
      startInitialAutoplay();
    }
  }, [animationPhase, prefersReducedMotion, hasVideoError, startInitialAutoplay]);

  // Accessible Sound / Play / Replay Control Handler
  const handleSoundControlClick = useCallback(
    async (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      if (playbackActionLockRef.current) return;
      playbackActionLockRef.current = true;

      try {
        const videoEl = videoRef.current;
        if (!videoEl || !isMountedRef.current || hasVideoError) return;

        // Case A: Playback completed -> Replay introduction with sound from start
        if (playbackStateRef.current === "completed" || videoEl.ended) {
          videoEl.currentTime = 0;
          userManuallyPausedRef.current = false;
          const unmutedOk = await executePlay(true);
          if (!unmutedOk && isMountedRef.current) {
            await executePlay(false);
          }
          return;
        }

        // Case B: Currently playing unmuted -> Mute without pausing or resetting
        if (
          playbackStateRef.current === "playing-unmuted" ||
          (!videoEl.paused && !videoEl.muted)
        ) {
          videoEl.muted = true;
          setIsMuted(true);
          setPlaybackState("playing-muted");
          if (videoEl.paused && !videoEl.ended) {
            videoEl.play().catch(() => {});
          }
          return;
        }

        // Case C: Currently playing muted -> Unmute without pausing or resetting
        if (
          playbackStateRef.current === "playing-muted" ||
          (!videoEl.paused && videoEl.muted)
        ) {
          videoEl.muted = false;
          setIsMuted(false);
          setPlaybackState("playing-unmuted");
          const playPromise = videoEl.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // If unmuted playback is rejected by policy, fallback to muted
              if (!isMountedRef.current) return;
              videoEl.muted = true;
              setIsMuted(true);
              setPlaybackState("playing-muted");
              videoEl.play().catch(() => {});
            });
          }
          return;
        }

        // Case D: Paused, ready, or autoplay blocked -> Use user gesture to play with sound
        userManuallyPausedRef.current = false;
        const unmutedOk = await executePlay(true);
        if (!unmutedOk && isMountedRef.current) {
          const mutedOk = await executePlay(false);
          if (!mutedOk && isMountedRef.current) {
            setPlaybackState("ready");
            setIsMuted(true);
          }
        }
      } finally {
        playbackActionLockRef.current = false;
      }
    },
    [executePlay, hasVideoError]
  );

  // Manual character click to toggle pause/resume
  const handleTogglePlayback = useCallback(
    async (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      const videoEl = videoRef.current;
      if (!videoEl || !isMountedRef.current || hasVideoError) return;

      if (playbackStateRef.current === "completed" || videoEl.ended) {
        await handleSoundControlClick();
        return;
      }

      if (videoEl.paused) {
        userManuallyPausedRef.current = false;
        await executePlay(!videoEl.muted);
      } else {
        userManuallyPausedRef.current = true;
        videoEl.pause();
        setPlaybackState("paused-user");
      }
    },
    [executePlay, handleSoundControlClick, hasVideoError]
  );

  // IntersectionObserver & Document Visibility controller
  useEffect(() => {
    const heroEl = heroRef.current;
    const videoEl = videoRef.current;
    if (!heroEl || !videoEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio >= 0.35) {
            isHeroVisibleRef.current = true;

            // Trigger autoplay if pending
            if (
              !autoplayAttemptedRef.current &&
              videoReadyRef.current &&
              (prefersReducedMotion || animationPhase !== "initial")
            ) {
              startInitialAutoplay();
              return;
            }

            // Resume if previously paused due to visibility, NOT if completed or manually paused
            if (
              (playbackStateRef.current === "paused-hidden" || videoEl.paused) &&
              !userManuallyPausedRef.current &&
              !videoEl.ended &&
              playbackStateRef.current !== "completed"
            ) {
              executePlay(!wasMutedBeforeHiddenRef.current);
            }
          } else {
            isHeroVisibleRef.current = false;
            // Pause playback when hero is out of view
            if (!videoEl.paused && !videoEl.ended) {
              wasMutedBeforeHiddenRef.current = videoEl.muted;
              videoEl.pause();
              setPlaybackState("paused-hidden");
            }
          }
        });
      },
      {
        root: null,
        threshold: [0, 0.35, 1.0],
      }
    );

    observer.observe(heroEl);

    // Tab visibility handling: Pause when tab is hidden, resume when tab is visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (!videoEl.paused && !videoEl.ended) {
          wasMutedBeforeHiddenRef.current = videoEl.muted;
          videoEl.pause();
          setPlaybackState("paused-hidden");
        }
      } else {
        if (
          isHeroVisibleRef.current &&
          (playbackStateRef.current === "paused-hidden" || videoEl.paused) &&
          !userManuallyPausedRef.current &&
          !videoEl.ended &&
          playbackStateRef.current !== "completed"
        ) {
          executePlay(!wasMutedBeforeHiddenRef.current);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [animationPhase, prefersReducedMotion, startInitialAutoplay, executePlay]);

  // Smooth scroll handler for anchor buttons
  const handleScrollTo = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId.replace("#", ""));
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
      window.history.pushState(null, "", targetId);
    }
  };

  const getSoundButtonLabel = () => {
    switch (playbackState) {
      case "completed":
        return "Replay introduction with sound";
      case "playing-unmuted":
        return "Mute introduction sound";
      case "playing-muted":
        return "Unmute introduction sound";
      case "failed":
        return "Audio unavailable";
      default:
        return "Play introduction with sound";
    }
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      data-phase={animationPhase}
      data-playback-state={playbackState}
      data-muted={isMuted ? "true" : "false"}
      className="relative min-h-[96vh] pt-28 pb-16 flex flex-col items-center justify-center overflow-hidden"
      aria-label="Introduction & Overview"
    >
      {/* 1. Large Ghost Name Outline Behind Character */}
      <div
        className="absolute top-[26%] sm:top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none text-transparent text-center font-extrabold uppercase whitespace-nowrap leading-none transition-opacity duration-700"
        style={{
          fontSize: "clamp(4.5rem, 16vw, 13rem)",
          WebkitTextStroke: "1.5px rgba(13, 13, 13, 0.12)",
          letterSpacing: "clamp(0.08em, 1.5vw, 0.2em)",
        }}
        aria-hidden="true"
      >
        ABHIRAM
      </div>

      <div className="container relative z-10 flex flex-col items-center text-center">
        {/* 2. Top Domain & Specialization Tag */}
        <div className="mb-2">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-[var(--mute)]">
            Data Science &bull; Artificial Intelligence &bull; Software Engineering
          </span>
        </div>

        {/* 3. Central Talking Character Video Frame with Cinematic Portal & Digital Scan */}
        <div
          className="relative flex items-center justify-center my-2 select-none"
          style={{ minHeight: "clamp(340px, 54vh, 600px)" }}
        >
          {/* Decorative Cinematic Portal Behind Character */}
          {!prefersReducedMotion && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 400 520"
                className={`w-[clamp(280px,46vh,440px)] h-[clamp(340px,56vh,540px)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  animationPhase === "initial"
                    ? "opacity-0 scale-95"
                    : animationPhase === "portal"
                    ? "opacity-85 scale-100"
                    : animationPhase === "revealing"
                    ? "opacity-60 scale-100"
                    : "opacity-0 scale-105"
                }`}
              >
                {/* Outer subtle portal ellipse with SVG stroke-dash draw */}
                <ellipse
                  cx="200"
                  cy="260"
                  rx="170"
                  ry="235"
                  fill="none"
                  stroke="rgba(13, 13, 13, 0.2)"
                  strokeWidth="1.5"
                  strokeDasharray="1300"
                  strokeDashoffset={animationPhase === "initial" ? 1300 : 0}
                  className="transition-all duration-900 ease-out"
                />
                {/* Inner dashed alignment track */}
                <ellipse
                  cx="200"
                  cy="260"
                  rx="155"
                  ry="215"
                  fill="none"
                  stroke="rgba(13, 13, 13, 0.08)"
                  strokeWidth="1"
                  strokeDasharray="6 8"
                  className="transition-opacity duration-700"
                />
                {/* Subtle cardinal crosshairs */}
                <line
                  x1="200"
                  y1="12"
                  x2="200"
                  y2="28"
                  stroke="rgba(13, 13, 13, 0.25)"
                  strokeWidth="1.5"
                />
                <line
                  x1="200"
                  y1="492"
                  x2="200"
                  y2="508"
                  stroke="rgba(13, 13, 13, 0.25)"
                  strokeWidth="1.5"
                />
                <line
                  x1="18"
                  y1="260"
                  x2="34"
                  y2="260"
                  stroke="rgba(13, 13, 13, 0.25)"
                  strokeWidth="1.5"
                />
                <line
                  x1="366"
                  y1="260"
                  x2="382"
                  y2="260"
                  stroke="rgba(13, 13, 13, 0.25)"
                  strokeWidth="1.5"
                />
              </svg>

              {/* Digital Scan Ray Sweep */}
              {(animationPhase === "portal" ||
                animationPhase === "revealing") && (
                <div
                  className="absolute inset-x-0 w-full flex items-center justify-center pointer-events-none z-10 portal-scan-sweep"
                  aria-hidden="true"
                >
                  <div className="w-[clamp(260px,44vh,420px)] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--ink)] to-transparent opacity-40 shadow-[0_0_8px_rgba(13,13,13,0.12)]" />
                </div>
              )}
            </div>
          )}

          {/* Character Container with Vertical Digital Wipe Reveal */}
          <div
            id="hero-video-frame"
            className={`relative flex items-center justify-center z-10 w-full max-w-[calc(100vw-32px)] sm:w-auto sm:max-w-none transition-all duration-900 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              prefersReducedMotion || animationPhase === "settled"
                ? "opacity-100 scale-100 translate-y-0"
                : animationPhase === "revealing"
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-[0.98] translate-y-2 pointer-events-none"
            }`}
            style={{
              clipPath:
                prefersReducedMotion || animationPhase === "settled"
                  ? "none"
                  : animationPhase === "revealing"
                  ? "inset(0% 0% 0% 0%)"
                  : "inset(0% 0% 100% 0%)",
              transition: prefersReducedMotion
                ? "none"
                : "clip-path 900ms cubic-bezier(0.16, 1, 0.3, 1), opacity 900ms cubic-bezier(0.16, 1, 0.3, 1), transform 900ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {!hasVideoError ? (
              <>
                <video
                  ref={videoRef}
                  src={PROFILE.heroVideo}
                  playsInline
                  preload="auto"
                  muted
                  onLoadedData={handleMediaReady}
                  onCanPlay={handleMediaReady}
                  onEnded={handleEnded}
                  onError={handleError}
                  aria-hidden="true"
                  tabIndex={-1}
                  className="hidden pointer-events-none"
                />
                <canvas
                  ref={canvasRef}
                  role="img"
                  aria-label={`${PROFILE.fullName} talking portfolio introduction character`}
                  onClick={handleTogglePlayback}
                  className="h-[clamp(340px,54vh,600px)] w-auto object-contain select-none cursor-pointer"
                />
              </>
            ) : (
              <img
                src="/id-portrait.png"
                alt={`${PROFILE.fullName} introduction portrait`}
                className="h-[clamp(340px,54vh,600px)] w-auto object-contain mix-blend-multiply select-none"
              />
            )}

            {/* Sound / Replay Control Button */}
            <button
              type="button"
              onClick={handleSoundControlClick}
              aria-label={getSoundButtonLabel()}
              aria-pressed={playbackState === "playing-unmuted"}
              title={getSoundButtonLabel()}
              className={`absolute bottom-3 right-2 sm:bottom-3 sm:right-0 w-[46px] h-[46px] rounded-full bg-[var(--ink)] text-[var(--paper)] border border-white/20 shadow-lg flex items-center justify-center hover:bg-[var(--ink-2)] transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] focus-visible:ring-offset-2 z-20 cursor-pointer ${
                prefersReducedMotion ||
                animationPhase === "revealing" ||
                animationPhase === "settled"
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              {playbackState === "completed" ? (
                <RotateCcw className="w-5 h-5" aria-hidden="true" />
              ) : isMuted ? (
                <VolumeX className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Volume2 className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* 4. Editorial Headline & Identity */}
        <div className="max-w-3xl mx-auto mt-2">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--ink)] leading-[1.05] mb-3">
            {PROFILE.fullName}
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl font-medium text-[var(--ink-2)] tracking-tight mb-4">
            Data Science & Software Engineering{" "}
            <span className="serif-accent">Professional.</span>
          </p>

          <p className="text-sm sm:text-base text-[var(--mute)] max-w-2xl mx-auto leading-relaxed mb-8">
            Specializing in AI, distributed backend systems, and geospatial
            analytics. Currently completing a Master of Data Science at USQ with
            engineering background at Jellyspace.
          </p>

          {/* 5. CTA Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="#work"
              onClick={(e) => handleScrollTo(e, "#work")}
              className="btn btn-primary"
            >
              Explore Work
            </a>

            <a
              href="#contact"
              onClick={(e) => handleScrollTo(e, "#contact")}
              className="btn btn-secondary"
            >
              Let&apos;s Talk
            </a>

            <a
              href={PROFILE.resumePdf}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              aria-label="Open or download résumé PDF"
            >
              Résumé
              <ArrowDownRight
                className="w-4 h-4 ml-0.5 opacity-60"
                aria-hidden="true"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
