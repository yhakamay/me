import type { Renderer } from "@/world/renderer";

/**
 * Canvas2D fallback presenter for browsers without WebGPU: the framebuffer
 * is blitted at internal resolution, then upscaled with nearest-neighbor
 * sampling. The print grain/vignette comes from the CSS overlay instead.
 */
export function create2DRenderer(canvas: HTMLCanvasElement): Renderer | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const buffer = document.createElement("canvas");
  const bufferCtx = buffer.getContext("2d");
  if (!bufferCtx) return null;

  let texW = 0;
  let texH = 0;

  return {
    name: "Canvas2D",
    resize(tw, th, ow, oh) {
      texW = tw;
      texH = th;
      buffer.width = tw;
      buffer.height = th;
      canvas.width = ow;
      canvas.height = oh;
      ctx.imageSmoothingEnabled = false;
    },
    draw(bytes) {
      if (!texW || !texH) return;
      // Non-shared wasm memory is a plain ArrayBuffer.
      const pixels = new Uint8ClampedArray(
        bytes.buffer as ArrayBuffer,
        bytes.byteOffset,
        bytes.byteLength
      );
      bufferCtx.putImageData(new ImageData(pixels, texW, texH), 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);
    },
    destroy() {
      // Nothing to release.
    },
  };
}
