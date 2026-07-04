import {
  buildMapCells,
  buildPois,
  MAP_H,
  MAP_W,
  SPAWN,
  type Poi,
  type WorldData,
} from "@/world/level";
import { Input } from "@/world/input";
import type { Renderer } from "@/world/renderer";
import { create2DRenderer } from "@/world/renderer-2d";
import { createWebGPURenderer } from "@/world/renderer-webgpu";
import {
  buildAtlas,
  mixHex,
  packColor,
  readPalette,
  TEX_COUNT,
  TEX_SIZE,
  type Palette,
} from "@/world/textures";

const INTERNAL_H = 360;
const MAX_INTERNAL_W = 1664;

type WasmExports = {
  memory: WebAssembly.Memory;
  init(): void;
  setSize(w: number, h: number): void;
  loadMap(w: number, h: number): void;
  setPalette(fog: number, floor: number, ceil: number): void;
  setPlayer(x: number, y: number, ang: number): void;
  framePtr(): number;
  texPtr(): number;
  mapPtr(): number;
  playerX(): number;
  playerY(): number;
  playerAngle(): number;
  hitTexId(): number;
  hitDistance(): number;
  update(dt: number, fwd: number, strafe: number, turn: number, dPitch: number): void;
  render(): void;
};

export type EngineCallbacks = {
  onPrompt(poi: Poi | null): void;
  onStats(renderer: string, fps: number): void;
};

export class Engine {
  readonly input = new Input();
  readonly rendererName: string;

  private wasm: WasmExports;
  private renderer: Renderer;
  private canvas: HTMLCanvasElement;
  private minimap: HTMLCanvasElement | null;
  private callbacks: EngineCallbacks;
  private pois: Map<number, Poi>;
  private mapCells: Uint8Array;
  private data: WorldData;

  private raf = 0;
  private running = false;
  private lastTime = 0;
  private startTime = 0;
  private internalW = 640;
  private internalH = INTERNAL_H;
  private lastHitTex = -1;
  private currentPoi: Poi | null = null;
  private fpsAccum = 0;
  private fpsFrames = 0;
  private fpsLast = 0;
  private resizeObserver: ResizeObserver;
  private darkQuery: MediaQueryList;
  private onThemeChange = () => {
    void this.applyTheme();
  };

  private constructor(opts: {
    wasm: WasmExports;
    renderer: Renderer;
    canvas: HTMLCanvasElement;
    minimap: HTMLCanvasElement | null;
    data: WorldData;
    callbacks: EngineCallbacks;
    mapCells: Uint8Array;
  }) {
    this.wasm = opts.wasm;
    this.renderer = opts.renderer;
    this.rendererName = opts.renderer.name;
    this.canvas = opts.canvas;
    this.minimap = opts.minimap;
    this.callbacks = opts.callbacks;
    this.pois = buildPois(opts.data);
    this.mapCells = opts.mapCells;
    this.data = opts.data;

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.canvas);
    this.darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    this.darkQuery.addEventListener("change", this.onThemeChange);
  }

  static async create(
    canvas: HTMLCanvasElement,
    minimap: HTMLCanvasElement | null,
    data: WorldData,
    callbacks: EngineCallbacks
  ): Promise<Engine> {
    const response = await fetch("/cub3d.wasm");
    const { instance } = await WebAssembly.instantiate(
      await response.arrayBuffer(),
      { env: { abort: () => undefined } }
    );
    const wasm = instance.exports as unknown as WasmExports;

    wasm.init();
    wasm.loadMap(MAP_W, MAP_H);

    const mapCells = buildMapCells();
    new Uint8Array(wasm.memory.buffer, wasm.mapPtr(), MAP_W * MAP_H).set(
      mapCells
    );

    const palette = readPalette();
    applyPalette(wasm, palette);
    const atlas = new Uint8Array(
      wasm.memory.buffer,
      wasm.texPtr(),
      TEX_COUNT * TEX_SIZE * TEX_SIZE * 4
    );
    await buildAtlas(atlas, data, palette);

    wasm.setPlayer(SPAWN.x, SPAWN.y, SPAWN.ang);

    const renderer =
      (await createWebGPURenderer(
        canvas,
        hexTriple(palette.fg),
        palette.dark
      ).catch(() => null)) ?? create2DRenderer(canvas);
    if (!renderer) throw new Error("No canvas renderer available");

    const engine = new Engine({
      wasm,
      renderer,
      canvas,
      minimap,
      data,
      callbacks,
      mapCells,
    });
    engine.handleResize();
    engine.renderFrame(0, 1 / 60); // paint one frame behind the intro overlay
    return engine;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.input.attach(this.canvas);
    this.lastTime = performance.now();
    if (!this.startTime) this.startTime = this.lastTime;
    const loop = (t: number) => {
      if (!this.running) return;
      const dt = Math.min((t - this.lastTime) / 1000, 0.1);
      this.lastTime = t;
      this.step(t, dt);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.input.detach();
  }

  destroy(): void {
    this.stop();
    this.resizeObserver.disconnect();
    this.darkQuery.removeEventListener("change", this.onThemeChange);
    this.renderer.destroy();
  }

  interact(): boolean {
    const poi = this.currentPoi;
    if (!poi?.url) return false;
    if (poi.internal) {
      if (document.pointerLockElement) document.exitPointerLock();
      window.location.assign(poi.url);
    } else {
      window.open(poi.url, "_blank", "noopener,noreferrer");
    }
    return true;
  }

  // ---------------------------------------------------------------- private

  private step(t: number, dt: number): void {
    const frame = this.input.sample(dt);
    this.wasm.update(dt, frame.fwd, frame.strafe, frame.turn, frame.dPitch);
    if (frame.interact) this.interact();
    this.renderFrame((t - this.startTime) / 1000, dt);
  }

  private renderFrame(time: number, dt: number): void {
    this.wasm.render();
    const bytes = new Uint8Array(
      this.wasm.memory.buffer,
      this.wasm.framePtr(),
      this.internalW * this.internalH * 4
    );
    this.renderer.draw(bytes, time);
    this.drawMinimap();

    const hit = this.wasm.hitTexId();
    if (hit !== this.lastHitTex) {
      this.lastHitTex = hit;
      this.currentPoi = this.pois.get(hit) ?? null;
      this.callbacks.onPrompt(this.currentPoi);
    }

    this.fpsAccum += dt;
    this.fpsFrames += 1;
    if (time - this.fpsLast > 0.5 && this.fpsAccum > 0) {
      this.fpsLast = time;
      this.callbacks.onStats(
        this.rendererName,
        Math.round(this.fpsFrames / this.fpsAccum)
      );
      this.fpsAccum = 0;
      this.fpsFrames = 0;
    }
  }

  private handleResize(): void {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const outW = Math.max(1, Math.round(rect.width * dpr));
    const outH = Math.max(1, Math.round(rect.height * dpr));

    const aspect = rect.width / rect.height;
    // WebGPU requires bytesPerRow % 256 == 0, i.e. width % 64 == 0.
    const iw = Math.min(
      MAX_INTERNAL_W,
      Math.max(320, Math.round((aspect * INTERNAL_H) / 64) * 64)
    );
    this.internalW = iw;
    this.internalH = INTERNAL_H;
    this.wasm.setSize(iw, INTERNAL_H);
    this.renderer.resize(iw, INTERNAL_H, outW, outH);
  }

  private async applyTheme(): Promise<void> {
    const palette = readPalette();
    applyPalette(this.wasm, palette);
    const atlas = new Uint8Array(
      this.wasm.memory.buffer,
      this.wasm.texPtr(),
      TEX_COUNT * TEX_SIZE * TEX_SIZE * 4
    );
    await buildAtlas(atlas, this.data, palette);
  }

  private drawMinimap(): void {
    const canvas = this.minimap;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = 6;
    const w = MAP_W * scale;
    const h = MAP_H * scale;
    if (canvas.width !== w) {
      canvas.width = w;
      canvas.height = h;
    }
    const style = getComputedStyle(document.documentElement);
    const card = style.getPropertyValue("--card").trim() || "#fbf9f2";
    const fg = style.getPropertyValue("--fg").trim() || "#1c1a15";
    const accent = style.getPropertyValue("--color-accent").trim() || "#7a3b1f";

    ctx.fillStyle = card;
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const cell = this.mapCells[y * MAP_W + x];
        if (!cell) continue;
        ctx.fillStyle = cell >= 10 ? accent : fg;
        ctx.globalAlpha = cell >= 10 ? 0.9 : 0.55;
        ctx.fillRect(x * scale, y * scale, scale - 1, scale - 1);
      }
    }
    ctx.globalAlpha = 1;

    const px = this.wasm.playerX() * scale;
    const py = this.wasm.playerY() * scale;
    const ang = this.wasm.playerAngle();

    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + Math.cos(ang) * 10, py + Math.sin(ang) * 10);
    ctx.stroke();

    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function applyPalette(wasm: WasmExports, p: Palette): void {
  wasm.setPalette(
    packColor(p.bg),
    packColor(mixHex(p.bg, p.fg, 0.1)),
    packColor(mixHex(p.bg, p.fg, 0.035))
  );
}

function hexTriple(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full =
    h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  const n = parseInt(full, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}
