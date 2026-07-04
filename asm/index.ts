// cub3d core — a grid raycaster compiled to WebAssembly.
//
// A spiritual port of the 42 school "cub3d" project (github.com/yhakamay/cub3d):
// the CPU walks the map with DDA and renders every pixel of the frame into a
// framebuffer that lives in WASM memory. The host page only uploads that
// buffer to the screen (WebGPU post-process pass, or Canvas2D fallback).
//
// Colors are packed as little-endian RGBA (R in the low byte), which matches
// both ImageData and an rgba8unorm GPU texture.

const TEX_SIZE: i32 = 256;
const TEX_MASK: i32 = TEX_SIZE - 1;
const TEX_COUNT: i32 = 48;
const MAX_W: i32 = 1664;
const MAX_H: i32 = 416;

const MOVE_SPEED: f64 = 3.6; // map units / second
const PLAYER_RADIUS: f64 = 0.25;
const FOG_DISTANCE: f64 = 16.0;
const REACH: f64 = 3.2; // interaction distance, map units

let frame = new StaticArray<u32>(0);
let texels = new StaticArray<u32>(0);
let map = new StaticArray<u8>(0);

let screenW: i32 = 0;
let screenH: i32 = 0;
let mapW: i32 = 0;
let mapH: i32 = 0;

let posX: f64 = 2.5;
let posY: f64 = 2.5;
let ang: f64 = 0.0;
let pitch: f64 = 0.0; // vertical look, in screen pixels of horizon shear

// Palette (set by the host from the site's CSS custom properties).
let fogR: f64 = 246.0;
let fogG: f64 = 243.0;
let fogB: f64 = 234.0;
let floorCol: u32 = 0xffcfdce0;
let ceilCol: u32 = 0xfff2f9fb;

// Result of the center-screen probe ray, refreshed on every render().
let hitTex: i32 = 0;
let hitX: i32 = -1;
let hitY: i32 = -1;
let hitDist: f64 = 1e9;

// ------------------------------------------------------------------ setup

export function init(): void {
  frame = new StaticArray<u32>(MAX_W * MAX_H);
  texels = new StaticArray<u32>(TEX_COUNT * TEX_SIZE * TEX_SIZE);
}

export function setSize(w: i32, h: i32): void {
  screenW = min(w, MAX_W);
  screenH = min(h, MAX_H);
}

export function loadMap(w: i32, h: i32): void {
  mapW = w;
  mapH = h;
  map = new StaticArray<u8>(w * h);
}

export function setPalette(fog: u32, floor_: u32, ceil_: u32): void {
  fogR = <f64>(fog & 0xff);
  fogG = <f64>((fog >> 8) & 0xff);
  fogB = <f64>((fog >> 16) & 0xff);
  floorCol = floor_ | 0xff000000;
  ceilCol = ceil_ | 0xff000000;
}

export function setPlayer(x: f64, y: f64, a: f64): void {
  posX = x;
  posY = y;
  ang = a;
  pitch = 0.0;
}

export function framePtr(): usize {
  return changetype<usize>(frame);
}

export function texPtr(): usize {
  return changetype<usize>(texels);
}

export function mapPtr(): usize {
  return changetype<usize>(map);
}

export function playerX(): f64 {
  return posX;
}

export function playerY(): f64 {
  return posY;
}

export function playerAngle(): f64 {
  return ang;
}

export function hitTexId(): i32 {
  return hitTex;
}

export function hitCellX(): i32 {
  return hitX;
}

export function hitCellY(): i32 {
  return hitY;
}

export function hitDistance(): f64 {
  return hitDist;
}

// ------------------------------------------------------------------ movement

@inline
function cellAt(x: i32, y: i32): i32 {
  if (x < 0 || y < 0 || x >= mapW || y >= mapH) return 1;
  return <i32>unchecked(map[y * mapW + x]);
}

@inline
function solidAt(x: f64, y: f64): bool {
  return cellAt(<i32>Math.floor(x), <i32>Math.floor(y)) != 0;
}

@inline
function canStand(x: f64, y: f64): bool {
  const r = PLAYER_RADIUS;
  return (
    !solidAt(x - r, y - r) &&
    !solidAt(x + r, y - r) &&
    !solidAt(x - r, y + r) &&
    !solidAt(x + r, y + r)
  );
}

@inline
function clampF(v: f64, lo: f64, hi: f64): f64 {
  return v < lo ? lo : v > hi ? hi : v;
}

/**
 * Advance the simulation. `fwd`/`strafe` are -1..1 input axes, `turn` and
 * `dPitch` are deltas already scaled by the host (radians / pixels).
 */
export function update(
  dt: f64,
  fwd: f64,
  strafe: f64,
  turn: f64,
  dPitch: f64
): void {
  ang += turn;
  pitch = clampF(pitch + dPitch, -0.38 * <f64>screenH, 0.38 * <f64>screenH);

  const dirX = Math.cos(ang);
  const dirY = Math.sin(ang);
  // Right-hand vector (screen y points south on the map).
  const vx = (dirX * fwd - dirY * strafe) * MOVE_SPEED * dt;
  const vy = (dirY * fwd + dirX * strafe) * MOVE_SPEED * dt;

  // Axis-separated collision so the player slides along walls.
  const nx = posX + vx;
  if (canStand(nx, posY)) posX = nx;
  const ny = posY + vy;
  if (canStand(posX, ny)) posY = ny;
}

// ------------------------------------------------------------------ render

@inline
function fogMix(c: u32, t: f64, shade: f64): u32 {
  let r = <f64>(c & 0xff) * shade;
  let g = <f64>((c >> 8) & 0xff) * shade;
  let b = <f64>((c >> 16) & 0xff) * shade;
  r += (fogR - r) * t;
  g += (fogG - g) * t;
  b += (fogB - b) * t;
  return 0xff000000 | (<u32>b << 16) | (<u32>g << 8) | <u32>r;
}

export function render(): void {
  const w = screenW;
  const h = screenH;
  if (w <= 0 || h <= 0 || mapW <= 0) return;

  const dirX = Math.cos(ang);
  const dirY = Math.sin(ang);
  const planeX = -dirY * 0.66;
  const planeY = dirX * 0.66;

  let horizon = h / 2 + <i32>pitch;
  if (horizon < 8) horizon = 8;
  if (horizon > h - 8) horizon = h - 8;

  // --- ceiling & floor: flat paper tones fading into fog at the horizon
  for (let y = 0; y < h; y++) {
    const base = y < horizon ? ceilCol : floorCol;
    let d = y - horizon;
    if (d < 0) d = -d;
    if (d < 1) d = 1;
    const rowDist = (<f64>h * 0.5) / <f64>d;
    const t = clampF(rowDist / FOG_DISTANCE, 0.0, 1.0);
    const c = fogMix(base, t, 1.0);
    const row = y * w;
    for (let x = 0; x < w; x++) {
      unchecked(frame[row + x] = c);
    }
  }

  // --- walls: one DDA ray per screen column
  for (let x = 0; x < w; x++) {
    const camX = (2.0 * <f64>x) / <f64>w - 1.0;
    const rdX = dirX + planeX * camX;
    const rdY = dirY + planeY * camX;

    let mapX = <i32>Math.floor(posX);
    let mapY = <i32>Math.floor(posY);

    const deltaX = rdX == 0.0 ? 1e30 : Math.abs(1.0 / rdX);
    const deltaY = rdY == 0.0 ? 1e30 : Math.abs(1.0 / rdY);

    let stepX: i32;
    let stepY: i32;
    let sideX: f64;
    let sideY: f64;

    if (rdX < 0.0) {
      stepX = -1;
      sideX = (posX - <f64>mapX) * deltaX;
    } else {
      stepX = 1;
      sideX = (<f64>mapX + 1.0 - posX) * deltaX;
    }
    if (rdY < 0.0) {
      stepY = -1;
      sideY = (posY - <f64>mapY) * deltaY;
    } else {
      stepY = 1;
      sideY = (<f64>mapY + 1.0 - posY) * deltaY;
    }

    let side = 0;
    let tex = 0;
    while (true) {
      if (sideX < sideY) {
        sideX += deltaX;
        mapX += stepX;
        side = 0;
      } else {
        sideY += deltaY;
        mapY += stepY;
        side = 1;
      }
      if (mapX < 0 || mapY < 0 || mapX >= mapW || mapY >= mapH) {
        tex = 1;
        break;
      }
      tex = <i32>unchecked(map[mapY * mapW + mapX]);
      if (tex != 0) break;
    }

    let perp = side == 0 ? sideX - deltaX : sideY - deltaY;
    if (perp < 0.01) perp = 0.01;

    const lineH = <i32>(<f64>h / perp);
    let drawStart = horizon - lineH / 2;
    let drawEnd = horizon + lineH / 2;
    if (drawStart < 0) drawStart = 0;
    if (drawEnd > h) drawEnd = h;

    let wallX = side == 0 ? posY + perp * rdY : posX + perp * rdX;
    wallX -= Math.floor(wallX);
    // Mirror faces whose world-axis direction runs against screen-x so
    // poster text reads correctly from every side.
    let texX = <i32>(wallX * <f64>TEX_SIZE);
    if ((side == 0 && rdX < 0.0) || (side == 1 && rdY > 0.0)) {
      texX = TEX_SIZE - 1 - texX;
    }

    if (tex < 1) tex = 1;
    if (tex > TEX_COUNT) tex = 1;
    const texBase = (tex - 1) * TEX_SIZE * TEX_SIZE;

    const step = <f64>TEX_SIZE / <f64>lineH;
    let texPos = <f64>(drawStart - horizon + lineH / 2) * step;
    const shade = side == 1 ? 0.82 : 1.0;
    const t = clampF(perp / FOG_DISTANCE, 0.0, 0.92);

    for (let y = drawStart; y < drawEnd; y++) {
      const texY = <i32>texPos & TEX_MASK;
      texPos += step;
      const c = unchecked(texels[texBase + texY * TEX_SIZE + texX]);
      unchecked(frame[y * w + x] = fogMix(c, t, shade));
    }
  }

  probeCenter(dirX, dirY);
}

/** Cast one ray straight ahead to find the wall the player is looking at. */
function probeCenter(rdX: f64, rdY: f64): void {
  let mapX = <i32>Math.floor(posX);
  let mapY = <i32>Math.floor(posY);

  const deltaX = rdX == 0.0 ? 1e30 : Math.abs(1.0 / rdX);
  const deltaY = rdY == 0.0 ? 1e30 : Math.abs(1.0 / rdY);

  let stepX: i32;
  let stepY: i32;
  let sideX: f64;
  let sideY: f64;

  if (rdX < 0.0) {
    stepX = -1;
    sideX = (posX - <f64>mapX) * deltaX;
  } else {
    stepX = 1;
    sideX = (<f64>mapX + 1.0 - posX) * deltaX;
  }
  if (rdY < 0.0) {
    stepY = -1;
    sideY = (posY - <f64>mapY) * deltaY;
  } else {
    stepY = 1;
    sideY = (<f64>mapY + 1.0 - posY) * deltaY;
  }

  hitTex = 0;
  hitX = -1;
  hitY = -1;
  hitDist = 1e9;

  let side = 0;
  while (true) {
    if (sideX < sideY) {
      sideX += deltaX;
      mapX += stepX;
      side = 0;
    } else {
      sideY += deltaY;
      mapY += stepY;
      side = 1;
    }
    if (mapX < 0 || mapY < 0 || mapX >= mapW || mapY >= mapH) return;

    const tex = <i32>unchecked(map[mapY * mapW + mapX]);
    if (tex != 0) {
      const perp = side == 0 ? sideX - deltaX : sideY - deltaY;
      if (perp <= REACH) {
        hitTex = tex;
        hitX = mapX;
        hitY = mapY;
        hitDist = perp;
      }
      return;
    }
  }
}
