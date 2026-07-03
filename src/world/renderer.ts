/** Presents the wasm framebuffer on a canvas. */
export interface Renderer {
  /** Human-readable backend name for the HUD badge. */
  readonly name: string;
  /** Internal framebuffer size and canvas backing-store size, in pixels. */
  resize(texW: number, texH: number, outW: number, outH: number): void;
  /** Upload and present one frame of tightly packed RGBA bytes. */
  draw(bytes: Uint8Array, time: number): void;
  destroy(): void;
}
