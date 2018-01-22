import { fromValues as vec3 } from "gl-matrix/vec3";

export const PI = Math.PI;
export const PI_2 = PI / 2;
export const TWO_PI = PI * 2;
export const RADIAN = PI / 180;
export const DEGREE = 1 / RADIAN;

export const radToDeg = v => v * DEGREE;
export const degToRad = v => v * RADIAN;

export const X_AXIS = vec3(1, 0, 0);
export const Y_AXIS = vec3(0, 1, 0);
export const Z_AXIS = vec3(0, 0, 1);

// https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles
export const quatToEuler = ([x, y, z, w]) => {
  const ysqr = y * y;

  const t0 = +2.0 * (w * x + y * z);
  const t1 = +1.0 - 2.0 * (x * x + ysqr);
  const X = radToDeg(Math.atan2(t0, t1));

  let t2 = +2.0 * (w * y - z * x);
  t2 = Math.max(-1, Math.min(1, t2));
  const Y = radToDeg(Math.asin(t2));

  const t3 = +2.0 * (w * z + x * y);
  const t4 = +1.0 - 2.0 * (ysqr + z * z);
  const Z = radToDeg(Math.atan2(t3, t4));

  return {
    x: X,
    y: Y,
    z: Z,
  };
};
