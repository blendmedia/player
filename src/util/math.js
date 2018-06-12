import { fromValues as vec3 } from "gl-matrix/vec3";

export const PI = Math.PI;
export const PI_2 = PI / 2;
export const TWO_PI = PI * 2;
export const RADIAN = PI / 180;
export const DEGREE = 1 / RADIAN;

export const radToDeg = v => v * DEGREE;
export const degToRad = v => v * RADIAN;

export const round = (v, places = 0) => {
  const f = Math.pow(10, places);
  return Math.round(v * f) / f;
};

export const X_AXIS = vec3(1, 0, 0);
export const Y_AXIS = vec3(0, 1, 0);
export const Z_AXIS = vec3(0, 0, 1);

export const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
