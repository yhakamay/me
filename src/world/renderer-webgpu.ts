/// <reference types="@webgpu/types" />

import type { Renderer } from "@/world/renderer";

/**
 * WebGPU presenter: the wasm framebuffer is uploaded as a texture each frame
 * and drawn through a print-style post-process — nearest-neighbor upscale,
 * a rotated halftone screen driven by luminance, and paper grain — all at
 * native device resolution.
 */
const SHADER = /* wgsl */ `
struct U {
  ink : vec3f,
  dark : f32,
  time : f32,
  strength : f32,
  _pad : vec2f,
};

@group(0) @binding(0) var samp : sampler;
@group(0) @binding(1) var frame_tex : texture_2d<f32>;
@group(0) @binding(2) var<uniform> u : U;

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

fn hash(p : vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453123);
}

@fragment
fn fs(in : VSOut) -> @location(0) vec4f {
  var color = textureSampleLevel(frame_tex, samp, in.uv, 0.0).rgb;

  // Rotated halftone screen in device pixels.
  let lum = dot(color, vec3f(0.299, 0.587, 0.114));
  let a = 0.6435;
  let rot = mat2x2f(cos(a), -sin(a), sin(a), cos(a));
  let cell = fract((rot * in.pos.xy) / 4.0) - vec2f(0.5, 0.5);
  let coverage = select(1.0 - lum, lum, u.dark > 0.5);
  let radius = coverage * 0.58;
  var dotv = 1.0 - smoothstep(radius - 0.2, radius + 0.06, length(cell));
  // Fade the screen out entirely where coverage is low, otherwise the
  // smoothstep's soft edge stamps a faint dot into every cell center.
  dotv = dotv * smoothstep(0.03, 0.14, radius);
  color = mix(color, u.ink, dotv * u.strength);

  // Paper grain, re-seeded every frame.
  let g = hash(in.pos.xy + vec2f(fract(u.time) * 61.7, fract(u.time) * 12.9));
  color += (g - 0.5) * 0.045;

  return vec4f(color, 1.0);
}
`;

export async function createWebGPURenderer(
  canvas: HTMLCanvasElement,
  ink: [number, number, number],
  dark: boolean
): Promise<Renderer | null> {
  if (!("gpu" in navigator)) return null;
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) return null;
  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu");
  if (!context) return null;

  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: "opaque" });

  const shaderModule = device.createShaderModule({ code: SHADER });
  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: { module: shaderModule, entryPoint: "vs" },
    fragment: { module: shaderModule, entryPoint: "fs", targets: [{ format }] },
    primitive: { topology: "triangle-list" },
  });

  const sampler = device.createSampler({
    magFilter: "nearest",
    minFilter: "nearest",
  });

  const uniforms = device.createBuffer({
    size: 32,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const uniformData = new Float32Array(8);
  uniformData[0] = ink[0] / 255;
  uniformData[1] = ink[1] / 255;
  uniformData[2] = ink[2] / 255;
  uniformData[3] = dark ? 1 : 0;
  uniformData[5] = dark ? 0.09 : 0.13; // halftone strength

  let texW = 0;
  let texH = 0;
  let texture: GPUTexture | null = null;
  let bindGroup: GPUBindGroup | null = null;
  let destroyed = false;

  const ensureTexture = (w: number, h: number) => {
    if (texture && w === texW && h === texH) return;
    texture?.destroy();
    texW = w;
    texH = h;
    texture = device.createTexture({
      size: { width: w, height: h },
      format: "rgba8unorm",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });
    bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: sampler },
        { binding: 1, resource: texture.createView() },
        { binding: 2, resource: { buffer: uniforms } },
      ],
    });
  };

  return {
    name: "WebGPU",
    resize(tw, th, ow, oh) {
      canvas.width = ow;
      canvas.height = oh;
      ensureTexture(tw, th);
    },
    draw(bytes, time) {
      if (destroyed || !texture || !bindGroup) return;
      device.queue.writeTexture(
        { texture },
        bytes as unknown as BufferSource,
        { bytesPerRow: texW * 4, rowsPerImage: texH },
        { width: texW, height: texH }
      );
      uniformData[4] = time;
      device.queue.writeBuffer(uniforms, 0, uniformData);

      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            loadOp: "clear",
            storeOp: "store",
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
          },
        ],
      });
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.draw(3);
      pass.end();
      device.queue.submit([encoder.finish()]);
    },
    destroy() {
      destroyed = true;
      texture?.destroy();
      uniforms.destroy();
      device.destroy();
    },
  };
}
