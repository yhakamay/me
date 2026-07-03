"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { site } from "@/lib/site";
import type { Article } from "@/types/article";
import type { Repo } from "@/types/repo";
import { Engine } from "@/world/engine";
import type { Poi, WorldData } from "@/world/level";

type Phase = "loading" | "ready" | "playing" | "paused" | "failed";

export function World({
  repos,
  articles,
  autoEnter = false,
}: {
  repos: Repo[];
  articles: Article[];
  /** Skip the intro and start walking as soon as the engine is ready. */
  autoEnter?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const minimapRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const phaseRef = useRef<Phase>("loading");

  const [phase, setPhaseState] = useState<Phase>("loading");
  const [poi, setPoi] = useState<Poi | null>(null);
  const [stats, setStats] = useState<{ renderer: string; fps: number } | null>(
    null
  );
  const touch = useSyncExternalStore(
    subscribeCoarsePointer,
    getCoarsePointer,
    () => false
  );

  const setPhase = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    const data: WorldData = {
      repos,
      articles,
      journey: site.journey.map(({ city, jp, label, note }) => ({
        city,
        jp,
        label,
        note,
      })),
      socials: [...site.socials],
      intro: site.intro,
      skills: [...site.skills],
      name: site.name,
      role: site.role,
      tagline: site.tagline,
    };

    Engine.create(canvas, minimapRef.current, data, {
      onPrompt: setPoi,
      onStats: (renderer, fps) => setStats({ renderer, fps }),
    })
      .then((engine) => {
        if (cancelled) {
          engine.destroy();
          return;
        }
        engineRef.current = engine;
        if (autoEnter) {
          // /play: no user gesture yet, so walking starts immediately and
          // pointer lock is picked up on the first canvas click.
          engine.start();
          setPhase("playing");
        } else {
          setPhase("ready");
        }
      })
      .catch((err) => {
        console.error("world: engine failed to start", err);
        if (!cancelled) setPhase("failed");
      });

    const onLockChange = () => {
      const locked = document.pointerLockElement === canvas;
      if (!locked && phaseRef.current === "playing" && !window.matchMedia("(pointer: coarse)").matches) {
        engineRef.current?.stop();
        setPhase("paused");
      }
    };
    document.addEventListener("pointerlockchange", onLockChange);

    return () => {
      cancelled = true;
      document.removeEventListener("pointerlockchange", onLockChange);
      engineRef.current?.destroy();
      engineRef.current = null;
    };
    // The data props are fetched once on the server; safe to init once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enter = useCallback(() => {
    const engine = engineRef.current;
    const canvas = canvasRef.current;
    if (!engine || !canvas) return;
    engine.start();
    setPhase("playing");
    if (!window.matchMedia("(pointer: coarse)").matches) {
      // Chrome returns a promise that rejects when pointer lock is not
      // available (iframes, permissions) — the keyboard still works then.
      try {
        void Promise.resolve(canvas.requestPointerLock?.()).catch(
          () => undefined
        );
      } catch {
        // Older engines throw synchronously; walking works regardless.
      }
    }
  }, [setPhase]);

  const pause = useCallback(() => {
    engineRef.current?.stop();
    if (document.pointerLockElement) document.exitPointerLock();
    setPhase("paused");
  }, [setPhase]);

  const interact = useCallback(() => {
    engineRef.current?.interact();
  }, []);

  return (
    <div className="fixed inset-0 select-none overflow-hidden bg-(--bg)">
      <canvas
        ref={canvasRef}
        onClick={() => {
          // Grab pointer lock on the first click after an auto-entered
          // (/play) session, or whenever the lock was lost without pausing.
          if (
            phaseRef.current !== "playing" ||
            document.pointerLockElement ||
            window.matchMedia("(pointer: coarse)").matches
          ) {
            return;
          }
          try {
            void Promise.resolve(
              canvasRef.current?.requestPointerLock?.()
            ).catch(() => undefined);
          } catch {
            // Pointer lock unavailable — keyboard walking still works.
          }
        }}
        className="h-full w-full touch-none"
        aria-label="A walkable 3D gallery of Yusuke Hakamaya's work"
      />

      {/* Print-style vignette on top of both render paths. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.22) 100%)",
        }}
      />

      {/* Minimap + renderer badge. Always mounted so the engine can bind
          the canvas at startup; only shown while walking. */}
      <div
        className={`absolute right-4 top-4 flex flex-col items-end gap-2 ${
          phase === "playing" ? "" : "pointer-events-none invisible"
        }`}
      >
        <div className="glass p-1.5">
          <canvas ref={minimapRef} className="block h-auto w-36" />
        </div>
        {stats && (
          <p className="eyebrow text-right">
            {stats.renderer} · WASM · {stats.fps} fps
          </p>
        )}
        <button
          type="button"
          onClick={pause}
          tabIndex={phase === "playing" ? 0 : -1}
          className="glass eyebrow cursor-pointer px-3 py-1.5 transition-colors hover:text-(--color-accent)"
        >
          Menu (Esc)
        </button>
      </div>

      {/* ------------------------------------------------ HUD (playing) */}
      {phase === "playing" && (
        <>
          {/* Crosshair */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-(--bg) bg-(--fg)/80"
          />

          {/* Masthead */}
          <div className="pointer-events-none absolute left-4 top-4">
            <p className="eyebrow">{site.handle}.me — Interactive Edition</p>
          </div>

          {/* Controls hint */}
          {!touch && (
            <p className="eyebrow pointer-events-none absolute bottom-4 left-4">
              WASD move · Mouse look · E open
            </p>
          )}

          {/* Interaction prompt */}
          {poi && (
            <div className="absolute bottom-8 left-1/2 w-full max-w-md -translate-x-1/2 px-4">
              <div className="glass px-5 py-4 text-center">
                <p className="eyebrow mb-1">
                  {poi.kind === "exit"
                    ? "Doorway"
                    : poi.kind === "info"
                      ? "Exhibit"
                      : "On this wall"}
                </p>
                <p className="text-base font-medium leading-snug">
                  {poi.label}
                </p>
                {poi.sub && (
                  <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-(--muted)">
                    {poi.sub}
                  </p>
                )}
                {poi.url &&
                  (touch ? (
                    <button
                      type="button"
                      onClick={interact}
                      className="rule-link mt-3 inline-block cursor-pointer text-sm text-(--color-accent)"
                    >
                      {poi.internal ? "Step through →" : "Open ↗"}
                    </button>
                  ) : (
                    <p className="mt-2 text-xs text-(--muted)">
                      Press{" "}
                      <kbd className="glass px-1.5 py-0.5 font-mono text-[10px]">
                        E
                      </kbd>{" "}
                      {poi.internal ? "to step through" : "to open"}
                    </p>
                  ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* --------------------------------------------- Overlay screens */}
      {phase !== "playing" && (
        <div className="absolute inset-0 flex items-center justify-center bg-(--bg)/80 p-5 backdrop-blur-[2px]">
          <div className="glass w-full max-w-lg p-8 sm:p-10">
            {phase === "failed" ? (
              <>
                <p className="eyebrow">yhakamay.me</p>
                <h1 className="mt-4 text-3xl font-medium">
                  The gallery could not open.
                </h1>
                <p className="mt-3 leading-relaxed text-(--muted)">
                  Your browser refused either WebAssembly or the canvas. The
                  classic edition has everything, in plain print.
                </p>
                <Link
                  href="/classic"
                  className="rule-link mt-6 inline-block text-(--color-accent)"
                >
                  Read the classic edition →
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-baseline justify-between border-b border-(--rule) pb-3">
                  <p className="eyebrow">{site.handle}.me</p>
                  <p className="text-xs text-(--muted)">Interactive Edition</p>
                </div>
                <h1 className="mt-6 text-balance text-3xl font-medium leading-tight sm:text-4xl">
                  {phase === "paused"
                    ? "Paused, mid-stroll."
                    : "A portfolio you can walk through."}
                </h1>
                <p className="mt-4 leading-relaxed text-(--muted)">
                  {phase === "paused"
                    ? "The gallery waits. Pick up where you left off, or step out to the print version."
                    : "My 42 Tokyo raycaster, cub3d, reborn as WebAssembly — every frame is ray-cast in WASM and pressed onto the page by a WebGPU halftone pass. Inside: my work, writing, and the places that made me."}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={enter}
                    disabled={phase === "loading"}
                    className="cursor-pointer border border-(--fg) bg-(--fg) px-6 py-3 text-sm font-medium text-(--bg) transition-opacity hover:opacity-80 disabled:cursor-wait disabled:opacity-50"
                  >
                    {phase === "loading"
                      ? "Setting the type…"
                      : phase === "paused"
                        ? "Resume →"
                        : "Enter the gallery →"}
                  </button>
                  <Link
                    href="/classic"
                    className="rule-link text-sm text-(--muted)"
                  >
                    Classic edition
                  </Link>
                </div>

                <div className="mt-8 border-t border-(--rule) pt-4">
                  <p className="text-xs leading-relaxed text-(--muted)">
                    {touch
                      ? "Left thumb to walk · right thumb to look · tap prompts to open."
                      : "WASD to walk · mouse to look · E to open what you face · Esc for this menu."}{" "}
                    Gamepads welcome.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Virtual stick indicator (touch) */}
      {phase === "playing" && touch && <TouchStick engineRef={engineRef} />}
    </div>
  );
}

function subscribeCoarsePointer(onChange: () => void): () => void {
  const mq = window.matchMedia("(pointer: coarse)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getCoarsePointer(): boolean {
  return window.matchMedia("(pointer: coarse)").matches;
}

/** Renders the virtual-stick origin/knob while the left thumb is down. */
function TouchStick({
  engineRef,
}: {
  engineRef: React.RefObject<Engine | null>;
}) {
  const [joy, setJoy] = useState({
    active: false,
    originX: 0,
    originY: 0,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const j = engineRef.current?.input.joy;
      if (j) {
        setJoy((prev) =>
          prev.active !== j.active ||
          prev.x !== j.x ||
          prev.y !== j.y ||
          prev.originX !== j.originX
            ? { active: j.active, originX: j.originX, originY: j.originY, x: j.x, y: j.y }
            : prev
        );
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [engineRef]);

  if (!joy.active) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-(--rule) bg-(--card)/40"
      style={{ left: joy.originX, top: joy.originY }}
    >
      <div
        className="absolute left-1/2 top-1/2 h-8 w-8 rounded-full bg-(--fg)/70"
        style={{
          transform: `translate(calc(-50% + ${joy.x * 24}px), calc(-50% + ${joy.y * 24}px))`,
        }}
      />
    </div>
  );
}
