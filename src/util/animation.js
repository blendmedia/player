import { clamp } from "./math";

export function accelerator(
  drag = 0.03,
  maxV = Infinity,
  minV = 0.05,
  maxAcc = Infinity,
) {
  let a = 0;
  let v = 0;
  let d = drag;
  let p = 0;
  let snapped = false;

  return {
    get acceleration() {
      return a;
    },
    get velocity() {
      return v;
    },
    get speed() {
      return v;
    },
    set drag(v) {
      d = v;
    },
    set acceleration(v) {
      a = clamp(v, -maxAcc, maxAcc);
    },
    set velocity(va) {
      v = clamp(va, -maxV, maxV);
    },
    accelerate(dA) {
      a = clamp(a + dA, -maxAcc, maxAcc);
    },
    move(v) {
      p += v;
    },
    snap(amount, triggered){
      if (triggered) {
        if (snapped) {
          return;
        }
        snapped = true;
        p += amount;
      } else {
        snapped = false;
      }
    },
    tick(time) {
      v += a * time;
      v = clamp(v * (1 - d), -maxV, maxV);
      if (Math.abs(v) <= minV) {
        v = 0;
      }
      p += v;
    },
    apply() {
      const r = p;
      p = 0;
      return r;
    },
    reset(includeSnap = true) {
      a = 0;
      v = 0;
      p = 0;
      if (includeSnap) {
        snapped = false;
      }
    },
  };
}
