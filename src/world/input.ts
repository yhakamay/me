const MOUSE_SENS = 0.0022;
const TOUCH_LOOK_SENS = 0.006;
const KEY_TURN_SPEED = 2.4; // rad/s
const PAD_LOOK_SPEED = 2.6; // rad/s
const PITCH_SENS = 0.55; // horizon pixels per mouse pixel

export type InputFrame = {
  fwd: number;
  strafe: number;
  turn: number;
  dPitch: number;
  interact: boolean;
};

/**
 * Collects keyboard, pointer-lock mouse, touch (virtual stick + look drag)
 * and gamepad input into one per-frame sample.
 */
export class Input {
  private keys = new Set<string>();
  private mouseDX = 0;
  private mouseDY = 0;
  private lookDX = 0;
  private lookDY = 0;
  private interactQueued = false;
  private padInteractHeld = false;

  private moveTouchId: number | null = null;
  private moveOrigin = { x: 0, y: 0 };
  /** Virtual stick axes, -1..1. Public so the UI can render the stick. */
  joy = { x: 0, y: 0, active: false, originX: 0, originY: 0 };

  private lookTouchId: number | null = null;
  private lookLast = { x: 0, y: 0 };

  private el: HTMLElement | null = null;
  private detachFns: Array<() => void> = [];

  attach(el: HTMLElement): void {
    this.el = el;
    const on = <K extends keyof WindowEventMap>(
      target: Window | HTMLElement,
      type: K | string,
      fn: (e: never) => void,
      opts?: AddEventListenerOptions
    ) => {
      target.addEventListener(type, fn as EventListener, opts);
      this.detachFns.push(() =>
        target.removeEventListener(type, fn as EventListener, opts)
      );
    };

    on(window, "keydown", (e: KeyboardEvent) => {
      if (e.repeat) return;
      this.keys.add(e.code);
      if (e.code === "KeyE" || e.code === "Enter" || e.code === "KeyF") {
        this.interactQueued = true;
      }
    });
    on(window, "keyup", (e: KeyboardEvent) => this.keys.delete(e.code));
    on(window, "blur", () => this.keys.clear());

    on(window, "mousemove", (e: MouseEvent) => {
      if (document.pointerLockElement !== this.el) return;
      this.mouseDX += e.movementX;
      this.mouseDY += e.movementY;
    });
    on(el, "mousedown", (e: MouseEvent) => {
      if (document.pointerLockElement === this.el && e.button === 0) {
        this.interactQueued = true;
      }
    });

    on(el, "touchstart", (e: TouchEvent) => {
      e.preventDefault();
      for (const t of Array.from(e.changedTouches)) {
        if (t.clientX < window.innerWidth / 2 && this.moveTouchId === null) {
          this.moveTouchId = t.identifier;
          this.moveOrigin = { x: t.clientX, y: t.clientY };
          this.joy = {
            x: 0,
            y: 0,
            active: true,
            originX: t.clientX,
            originY: t.clientY,
          };
        } else if (this.lookTouchId === null) {
          this.lookTouchId = t.identifier;
          this.lookLast = { x: t.clientX, y: t.clientY };
        }
      }
    }, { passive: false });
    on(el, "touchmove", (e: TouchEvent) => {
      e.preventDefault();
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === this.moveTouchId) {
          const dx = (t.clientX - this.moveOrigin.x) / 48;
          const dy = (t.clientY - this.moveOrigin.y) / 48;
          this.joy.x = Math.max(-1, Math.min(1, dx));
          this.joy.y = Math.max(-1, Math.min(1, dy));
        } else if (t.identifier === this.lookTouchId) {
          this.lookDX += t.clientX - this.lookLast.x;
          this.lookDY += t.clientY - this.lookLast.y;
          this.lookLast = { x: t.clientX, y: t.clientY };
        }
      }
    }, { passive: false });
    const endTouch = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === this.moveTouchId) {
          this.moveTouchId = null;
          this.joy = { x: 0, y: 0, active: false, originX: 0, originY: 0 };
        } else if (t.identifier === this.lookTouchId) {
          this.lookTouchId = null;
        }
      }
    };
    on(el, "touchend", endTouch);
    on(el, "touchcancel", endTouch);
  }

  detach(): void {
    for (const fn of this.detachFns) fn();
    this.detachFns = [];
    this.el = null;
    this.keys.clear();
  }

  queueInteract(): void {
    this.interactQueued = true;
  }

  /** Sample and reset per-frame deltas. `dt` in seconds. */
  sample(dt: number): InputFrame {
    let fwd = 0;
    let strafe = 0;
    let turnAxis = 0;

    const k = this.keys;
    if (k.has("KeyW") || k.has("ArrowUp")) fwd += 1;
    if (k.has("KeyS") || k.has("ArrowDown")) fwd -= 1;
    if (k.has("KeyD")) strafe += 1;
    if (k.has("KeyA")) strafe -= 1;
    if (k.has("ArrowRight")) turnAxis += 1;
    if (k.has("ArrowLeft")) turnAxis -= 1;
    const run = k.has("ShiftLeft") || k.has("ShiftRight") ? 1.6 : 1;

    // Virtual stick.
    fwd -= this.joy.y;
    strafe += this.joy.x;

    // Gamepad.
    let padTurn = 0;
    let padPitch = 0;
    const pads = typeof navigator.getGamepads === "function"
      ? navigator.getGamepads()
      : [];
    const pad = pads && pads[0];
    if (pad) {
      const dz = (v: number) => (Math.abs(v) < 0.16 ? 0 : v);
      strafe += dz(pad.axes[0] ?? 0);
      fwd -= dz(pad.axes[1] ?? 0);
      padTurn = dz(pad.axes[2] ?? 0);
      padPitch = dz(pad.axes[3] ?? 0);
      const pressed = !!pad.buttons[0]?.pressed;
      if (pressed && !this.padInteractHeld) this.interactQueued = true;
      this.padInteractHeld = pressed;
    }

    const turn =
      this.mouseDX * MOUSE_SENS +
      this.lookDX * TOUCH_LOOK_SENS +
      (turnAxis + padTurn) * KEY_TURN_SPEED * dt;
    const dPitch =
      -(this.mouseDY * PITCH_SENS + this.lookDY * PITCH_SENS * 1.4) -
      padPitch * PAD_LOOK_SPEED * dt * 60;

    this.mouseDX = 0;
    this.mouseDY = 0;
    this.lookDX = 0;
    this.lookDY = 0;

    const interact = this.interactQueued;
    this.interactQueued = false;

    return {
      fwd: Math.max(-1, Math.min(1, fwd)) * run,
      strafe: Math.max(-1, Math.min(1, strafe)) * run,
      turn,
      dPitch,
      interact,
    };
  }
}
