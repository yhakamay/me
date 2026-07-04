"use client";

/// <reference types="@webgpu/types" />

import { useEffect, useRef } from "react";

/**
 * Suminagashi (墨流し) — a WebGPU compute-shader fluid simulation behind the
 * classic edition. A stable-fluids solver (advect → divergence → pressure
 * Jacobi → gradient subtract → dye advect) runs entirely on the GPU; the
 * cursor is the brush, and an ambient brush keeps the ink drifting when the
 * pointer rests. Ink colors come from the site's paper/ink CSS tokens.
 *
 * Progressive enhancement: without WebGPU (or with reduced motion) the page
 * simply keeps its plain paper background.
 */

const SIM_SHADER = /* wgsl */ `
struct U {
  point : vec2f,   // brush position, sim pixels
  delta : vec2f,   // brush velocity impulse, sim px/s
  ink : f32,       // dye injection strength
  radius : f32,    // splat radius, sim pixels
  dt : f32,
  time : f32,
};

@group(0) @binding(0) var samp : sampler;
@group(0) @binding(1) var<uniform> u : U;
@group(0) @binding(2) var srcA : texture_2d<f32>;
@group(0) @binding(3) var srcB : texture_2d<f32>;
@group(0) @binding(4) var dst : texture_storage_2d<rgba16float, write>;

fn tl(t : texture_2d<f32>, c : vec2i, size : vec2i) -> vec4f {
  return textureLoad(t, clamp(c, vec2i(0, 0), size - vec2i(1, 1)), 0);
}

fn splat(p : vec2f) -> f32 {
  let d = p - u.point;
  return exp(-dot(d, d) / (u.radius * u.radius));
}

// srcA = velocity in, dst = velocity out
@compute @workgroup_size(8, 8)
fn advect_vel(@builtin(global_invocation_id) gid : vec3u) {
  let size = vec2i(textureDimensions(dst));
  if (gid.x >= u32(size.x) || gid.y >= u32(size.y)) { return; }
  let p = vec2f(gid.xy) + vec2f(0.5, 0.5);
  let sz = vec2f(size);

  let vel = textureSampleLevel(srcA, samp, p / sz, 0.0).xy;
  let back = (p - vel * u.dt) / sz;
  var v = textureSampleLevel(srcA, samp, back, 0.0).xy * 0.999;

  // brush impulse
  v += u.delta * splat(p) * u.dt * 60.0;

  // slow ambient swirl so resting ink keeps breathing
  let n = sin(p.x * 0.013 + u.time * 0.21) * cos(p.y * 0.011 - u.time * 0.17);
  let swirl = vec2f(
    -sin(p.y * 0.017 + u.time * 0.13),
    sin(p.x * 0.015 - u.time * 0.11)
  );
  v += swirl * n * 5.0 * u.dt;

  textureStore(dst, vec2i(gid.xy), vec4f(v, 0.0, 1.0));
}

// srcA = velocity, dst = divergence
@compute @workgroup_size(8, 8)
fn divergence(@builtin(global_invocation_id) gid : vec3u) {
  let size = vec2i(textureDimensions(dst));
  if (gid.x >= u32(size.x) || gid.y >= u32(size.y)) { return; }
  let c = vec2i(gid.xy);
  let l = tl(srcA, c + vec2i(-1, 0), size).x;
  let r = tl(srcA, c + vec2i(1, 0), size).x;
  let t = tl(srcA, c + vec2i(0, -1), size).y;
  let b = tl(srcA, c + vec2i(0, 1), size).y;
  textureStore(dst, c, vec4f(0.5 * (r - l + b - t), 0.0, 0.0, 1.0));
}

// srcA = pressure in, srcB = divergence, dst = pressure out
@compute @workgroup_size(8, 8)
fn jacobi(@builtin(global_invocation_id) gid : vec3u) {
  let size = vec2i(textureDimensions(dst));
  if (gid.x >= u32(size.x) || gid.y >= u32(size.y)) { return; }
  let c = vec2i(gid.xy);
  let l = tl(srcA, c + vec2i(-1, 0), size).x;
  let r = tl(srcA, c + vec2i(1, 0), size).x;
  let t = tl(srcA, c + vec2i(0, -1), size).x;
  let b = tl(srcA, c + vec2i(0, 1), size).x;
  let div = tl(srcB, c, size).x;
  textureStore(dst, c, vec4f((l + r + t + b - div) * 0.25, 0.0, 0.0, 1.0));
}

// srcA = velocity, srcB = pressure, dst = velocity out
@compute @workgroup_size(8, 8)
fn gradient(@builtin(global_invocation_id) gid : vec3u) {
  let size = vec2i(textureDimensions(dst));
  if (gid.x >= u32(size.x) || gid.y >= u32(size.y)) { return; }
  let c = vec2i(gid.xy);
  let l = tl(srcB, c + vec2i(-1, 0), size).x;
  let r = tl(srcB, c + vec2i(1, 0), size).x;
  let t = tl(srcB, c + vec2i(0, -1), size).x;
  let b = tl(srcB, c + vec2i(0, 1), size).x;
  var v = tl(srcA, c, size).xy;
  v -= 0.5 * vec2f(r - l, b - t);
  textureStore(dst, c, vec4f(v, 0.0, 1.0));
}

// srcA = dye in, srcB = velocity, dst = dye out
@compute @workgroup_size(8, 8)
fn advect_dye(@builtin(global_invocation_id) gid : vec3u) {
  let size = vec2i(textureDimensions(dst));
  if (gid.x >= u32(size.x) || gid.y >= u32(size.y)) { return; }
  let p = vec2f(gid.xy) + vec2f(0.5, 0.5);
  let sz = vec2f(size);

  let vel = textureSampleLevel(srcB, samp, p / sz, 0.0).xy;
  let back = (p - vel * u.dt) / sz;
  var d = textureSampleLevel(srcA, samp, back, 0.0).x * 0.998;

  d += u.ink * splat(p) * u.dt * 12.0;

  textureStore(dst, vec2i(gid.xy), vec4f(clamp(d, 0.0, 1.4), 0.0, 0.0, 1.0));
}
`;

const DRAW_SHADER = /* wgsl */ `
struct DrawU {
  ink : vec3f,
  strength : f32,
  paper : vec3f,
  _pad : f32,
};

@group(0) @binding(0) var samp : sampler;
@group(0) @binding(1) var dye : texture_2d<f32>;
@group(0) @binding(2) var<uniform> u : DrawU;

struct VSOut {
  @builtin(position) pos : vec4f,
  @location(0) uv : vec2f,
};

@vertex
fn vs(@builtin(vertex_index) vi : u32) -> VSOut {
  var p = array<vec2f, 3>(
    vec2f(-1.0, -3.0),
    vec2f(3.0, 1.0),
    vec2f(-1.0, 1.0),
  );
  var out : VSOut;
  out.pos = vec4f(p[vi], 0.0, 1.0);
  out.uv = vec2f(p[vi].x * 0.5 + 0.5, 0.5 - p[vi].y * 0.5);
  return out;
}

@fragment
fn fs(in : VSOut) -> @location(0) vec4f {
  let d = textureSampleLevel(dye, samp, in.uv, 0.0).x;
  // Gentle S-curve: thin washes stay airy, dense ink pools stay readable.
  let a = clamp(pow(clamp(d, 0.0, 1.0), 1.35), 0.0, 1.0) * u.strength;
  // Opaque canvas: paint the paper tone ourselves and lay ink on top.
  // (A transparent premultiplied canvas can wedge some compositors.)
  return vec4f(mix(u.paper, u.ink, a), 1.0);
}
`;

const JACOBI_ITERATIONS = 14;
const IDLE_AFTER_MS = 2200;

type Cleanup = () => void;

async function start(
  canvas: HTMLCanvasElement,
  isCancelled: () => boolean
): Promise<Cleanup | null> {
  if (!("gpu" in navigator)) return null;
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter || isCancelled()) return null;
  const device = await adapter.requestDevice();
  // Never configure the canvas from a doomed instance: two devices
  // configuring one canvas (React StrictMode's double-mount) can deadlock
  // the compositor when the losing device is destroyed.
  if (isCancelled()) {
    device.destroy();
    return null;
  }
  const context = canvas.getContext("webgpu");
  if (!context) {
    device.destroy();
    return null;
  }

  device.addEventListener("uncapturederror", (e) => {
    console.error(
      "suminagashi webgpu error:",
      (e as GPUUncapturedErrorEvent).error.message
    );
  });

  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: "opaque" });
  canvas.width = Math.max(1, Math.round(window.innerWidth));
  canvas.height = Math.max(1, Math.round(window.innerHeight));

  // Sim grid: capped, matching the viewport aspect.
  const aspect = window.innerWidth / Math.max(1, window.innerHeight);
  const simW = 320;
  const simH = Math.max(96, Math.min(400, Math.round(simW / aspect)));

  const makeTex = () =>
    device.createTexture({
      size: { width: simW, height: simH },
      format: "rgba16float",
      usage:
        GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING,
    });
  const vel = [makeTex(), makeTex()];
  const dye = [makeTex(), makeTex()];
  const prs = [makeTex(), makeTex()];
  const div = makeTex();

  const sampler = device.createSampler({
    magFilter: "linear",
    minFilter: "linear",
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge",
  });

  const simUniform = device.createBuffer({
    size: 32,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const drawUniform = device.createBuffer({
    size: 32,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const simLayout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.COMPUTE, sampler: {} },
      { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: {} },
      { binding: 2, visibility: GPUShaderStage.COMPUTE, texture: {} },
      { binding: 3, visibility: GPUShaderStage.COMPUTE, texture: {} },
      {
        binding: 4,
        visibility: GPUShaderStage.COMPUTE,
        storageTexture: { format: "rgba16float" },
      },
    ],
  });
  const simModule = device.createShaderModule({ code: SIM_SHADER });
  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [simLayout],
  });
  const passes = {} as Record<string, GPUComputePipeline>;
  for (const entry of [
    "advect_vel",
    "divergence",
    "jacobi",
    "gradient",
    "advect_dye",
  ]) {
    passes[entry] = device.createComputePipeline({
      layout: pipelineLayout,
      compute: { module: simModule, entryPoint: entry },
    });
  }

  const group = (a: GPUTexture, b: GPUTexture, out: GPUTexture) =>
    device.createBindGroup({
      layout: simLayout,
      entries: [
        { binding: 0, resource: sampler },
        { binding: 1, resource: { buffer: simUniform } },
        { binding: 2, resource: a.createView() },
        { binding: 3, resource: b.createView() },
        { binding: 4, resource: out.createView() },
      ],
    });

  // Static ping-pong bind groups (velocity/dye each flip once per frame).
  const groups = {
    advectVel: group(vel[0], vel[0], vel[1]),
    divergence: group(vel[1], vel[1], div),
    jacobi: [group(prs[0], div, prs[1]), group(prs[1], div, prs[0])],
    gradient: group(vel[1], prs[0], vel[0]),
    advectDye: group(dye[0], vel[0], dye[1]),
    advectDyeBack: group(dye[1], vel[0], dye[0]),
  };

  const drawModule = device.createShaderModule({ code: DRAW_SHADER });
  const drawPipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: { module: drawModule, entryPoint: "vs" },
    fragment: {
      module: drawModule,
      entryPoint: "fs",
      targets: [{ format }],
    },
    primitive: { topology: "triangle-list" },
  });
  const drawGroups = [
    device.createBindGroup({
      layout: drawPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: sampler },
        { binding: 1, resource: dye[0].createView() },
        { binding: 2, resource: { buffer: drawUniform } },
      ],
    }),
    device.createBindGroup({
      layout: drawPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: sampler },
        { binding: 1, resource: dye[1].createView() },
        { binding: 2, resource: { buffer: drawUniform } },
      ],
    }),
  ];

  /** Clear-present one frame so the swap chain is never left configured
   *  but unpresented — compositors can deadlock waiting on that. */
  const present = (drawGroup: GPUBindGroup) => {
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
        },
      ],
    });
    pass.setPipeline(drawPipeline);
    pass.setBindGroup(0, drawGroup);
    pass.draw(3);
    pass.end();
    device.queue.submit([encoder.finish()]);
  };

  // ------------------------------------------------------------- palette

  const hexToRgb = (hex: string): [number, number, number] => {
    const h = hex.replace("#", "");
    const full =
      h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
    const n = parseInt(full, 16);
    return [((n >> 16) & 0xff) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255];
  };

  const updateInk = () => {
    const style = getComputedStyle(document.documentElement);
    const fg = hexToRgb(style.getPropertyValue("--fg").trim() || "#1c1a15");
    const bg = hexToRgb(style.getPropertyValue("--bg").trim() || "#f6f3ea");
    const accent = hexToRgb(
      style.getPropertyValue("--color-accent").trim() || "#7a3b1f"
    );
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    // Mostly sumi ink with a whisper of the accent pigment.
    const ink = fg.map((v, i) => v * 0.82 + accent[i] * 0.18) as [
      number,
      number,
      number,
    ];
    device.queue.writeBuffer(
      drawUniform,
      0,
      new Float32Array([...ink, dark ? 0.34 : 0.4, ...bg, 0])
    );
  };
  updateInk();
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  darkQuery.addEventListener("change", updateInk);

  // -------------------------------------------------------------- brush

  const pointer = { x: simW / 2, y: simH / 2, dx: 0, dy: 0, lastMove: 0 };
  const toSim = (clientX: number, clientY: number): [number, number] => [
    (clientX / window.innerWidth) * simW,
    (clientY / window.innerHeight) * simH,
  ];
  const onPointerMove = (e: PointerEvent) => {
    const [sx, sy] = toSim(e.clientX, e.clientY);
    pointer.dx += sx - pointer.x;
    pointer.dy += sy - pointer.y;
    pointer.x = sx;
    pointer.y = sy;
    pointer.lastMove = performance.now();
  };
  const onPointerDown = (e: PointerEvent) => {
    const [sx, sy] = toSim(e.clientX, e.clientY);
    pointer.x = sx;
    pointer.y = sy;
    pointer.dx += (Math.random() - 0.5) * 6;
    pointer.dy += (Math.random() - 0.5) * 6;
    pointer.lastMove = performance.now();
  };
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerDown, { passive: true });

  // --------------------------------------------------------------- loop

  const uniformData = new Float32Array(8);
  let raf = 0;
  let last = performance.now();
  let destroyed = false;

  const frame = (now: number) => {
    if (destroyed) return;
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    const time = now / 1000;

    // Match the swap chain to the viewport (cheap no-op when unchanged).
    const w = Math.max(1, Math.round(window.innerWidth));
    const h = Math.max(1, Math.round(window.innerHeight));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const idle = now - pointer.lastMove > IDLE_AFTER_MS;
    let px = pointer.x;
    let py = pointer.y;
    let dx = pointer.dx / Math.max(dt, 1 / 240);
    let dy = pointer.dy / Math.max(dt, 1 / 240);
    let ink = Math.min(1, Math.hypot(pointer.dx, pointer.dy) * 0.22);
    let radius = simW * 0.02;
    if (idle) {
      // The ambient brush: a slow lissajous drift laying thin washes.
      px = simW * (0.5 + 0.36 * Math.sin(time * 0.11 + 1.7));
      py = simH * (0.5 + 0.32 * Math.sin(time * 0.073));
      dx = Math.cos(time * 0.11 + 1.7) * simW * 0.02;
      dy = Math.cos(time * 0.073) * simH * 0.02;
      ink = 0.09;
      radius = simW * 0.035;
    }
    pointer.dx = 0;
    pointer.dy = 0;

    const speed = Math.hypot(dx, dy);
    const maxSpeed = simW * 2.5;
    if (speed > maxSpeed) {
      dx = (dx / speed) * maxSpeed;
      dy = (dy / speed) * maxSpeed;
    }

    uniformData.set([px, py, dx, dy, ink, radius, dt, time]);
    device.queue.writeBuffer(simUniform, 0, uniformData);

    const encoder = device.createCommandEncoder();
    const compute = encoder.beginComputePass();
    const wgX = Math.ceil(simW / 8);
    const wgY = Math.ceil(simH / 8);
    const run = (pipeline: GPUComputePipeline, g: GPUBindGroup) => {
      compute.setPipeline(pipeline);
      compute.setBindGroup(0, g);
      compute.dispatchWorkgroups(wgX, wgY);
    };
    run(passes.advect_vel, groups.advectVel);
    run(passes.divergence, groups.divergence);
    for (let i = 0; i < JACOBI_ITERATIONS; i++) {
      run(passes.jacobi, groups.jacobi[i % 2]);
    }
    run(passes.gradient, groups.gradient);
    run(passes.advect_dye, groups.advectDye);
    compute.end();
    device.queue.submit([encoder.finish()]);
    present(drawGroups[1]);

    // Flip dye for the next frame.
    const swap = groups.advectDye;
    groups.advectDye = groups.advectDyeBack;
    groups.advectDyeBack = swap;
    const dswap = drawGroups[1];
    drawGroups[1] = drawGroups[0];
    drawGroups[0] = dswap;

    raf = requestAnimationFrame(frame);
  };
  // First present happens right here, synchronously after configure() —
  // before the rAF loop, which never fires while the tab is hidden.
  present(drawGroups[1]);
  raf = requestAnimationFrame(frame);

  return () => {
    destroyed = true;
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerdown", onPointerDown);
    darkQuery.removeEventListener("change", updateInk);
    for (const t of [...vel, ...dye, ...prs, div]) t.destroy();
    simUniform.destroy();
    drawUniform.destroy();
    device.destroy();
  };
}

export function Suminagashi() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let cleanup: Cleanup | null = null;
    // Deferred start so StrictMode's throwaway first mount never touches
    // the GPU at all — its cleanup clears the timer before this fires.
    const timer = window.setTimeout(() => {
      start(canvas, () => cancelled)
        .then((c) => {
          if (cancelled) {
            c?.();
          } else {
            cleanup = c;
          }
        })
        .catch(() => {
          // No WebGPU — the paper stays still.
        });
    }, 80);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      cleanup?.();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      // z-0 (not negative): WebGPU canvases behind the document root can
      // wedge frame capture in some Chromium embedders. Page content sits
      // above via its own stacking context.
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
