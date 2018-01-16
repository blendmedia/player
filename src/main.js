import { create as vec3 } from "gl-matrix/vec3";
import { create as mat4 } from "gl-matrix/mat4";
import { create as vec2 } from "gl-matrix/vec2";
import vert from "./renderers/WebGL/shader.vert";
import frag from "./renderers/WebGL/shader.frag";

export const vector3 = vec3();
export const vector2 = vec2();
export const matrix = mat4();
export { vert, frag };
