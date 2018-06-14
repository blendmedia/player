/**
 * Web GL utility functions and constants
 */

import { TWO_PI } from "./math";
import debug from "../debug";
const log = debug("webgl");

export const VERTEX = 0;
export const FRAGMENT = 1;

/**
 * Create and compile a shader from source
 * @param  {WebGLRenderingContext} gl Contex to create and compile the shader
 * @param  {String} source Source code for the shader
 * @param  {Number} type  Type of shader to create. VERTEX or FRAGMENT
 * @return {WebGLShader} Compiled shader, or null if failed
 */
export function shader(gl, source, type) {
  let t = null;
  switch (type) {
    case VERTEX:
      t = gl.VERTEX_SHADER;
      break;
    case FRAGMENT:
      t = gl.FRAGMENT_SHADER;
      break;
    default:
      return null;
  }

  const shader = gl.createShader(t);
  if (!shader) {
    log("Could not create shader");
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    log("Shader compilation failed");
    log(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

/**
 * Link and validate a vertex and fragment shader into a program
 * and finally retrieve the locations of given uniforms
 * @param  {WebGLRenderingContext} gl WebGL context to link with
 * @param  {WebGLShader} vertex   Compiled vertex shader
 * @param  {WebGLShader} fragment Compiled fragment shader
 * @param {Array<String>} uniforms A list of uniform names to get locations of
 * @return {WebGLProgram} Linked and validated program
 */
export function program(gl, vertex, fragment, uniforms = [], attributes = []) {
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    log("Could not link program");
    log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    log("Could not validate program");
    log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  const pointers = {};
  for (const varName of uniforms) {
    const location = gl.getUniformLocation(program, varName);
    if (!location) {
      log("Could not get location of uniform `%s`", varName);
    } else {
      pointers[varName] = location;
    }
  }

  const aPointers = {};
  for (const attrName of attributes) {
    const location = gl.getAttribLocation(program, attrName);
    if (location === -1) {
      log("Could not get location of attribute `%s`", attrName);
    } else {
      aPointers[attrName] = location;
    }
  }

  return {
    program,
    uniforms: pointers,
    attributes: aPointers,
  };
}

// Uniform type constants
export const INT = "1i";
export const FLOAT = "1f";
export const VECTOR_FLOAT_4 = "4fv";
export const VECTOR_FLOAT_3 = "3fv";
export const VECTOR_FLOAT_2 = "2fv";
export const VECTOR_INT_4 = "4iv";
export const VECTOR_INT_3 = "3iv";
export const VECTOR_INT_2 = "2iv";
export const MATRIX_4 = "Matrix4fv";
export const MATRIX_3 = "Matrix3fv";
export const MATRIX_2 = "Matrix2fv";

/**
 * Set uniform data for a shader
 * @param  {WebGLRenderingContext} gl
 * @param  {GLuint} uniform Location of uniform
 * @param  {Mixed} data  Data to assign to the uniform
 * @param  {String} type    Type of data to store in the uniform
 * @return {void}
 */
export function uniform(gl, uniform, data, type) {
  const method = `uniform${type}`;
  if (!gl[method]) {
    log("Invalid uniform type `%s`", type);
    return false;
  }
  if (/^Matrix/.test(type)) {
    gl[method](uniform, false, data);
  } else {
    gl[method](uniform, data);
  }
}

/**
 * Create a GL buffer and register it's data
 * @param  {WebGLRenderingContext} gl   Context to create the buffer with
 * @param  {Float32Array|Uint16Array} data Data to bind to the buffer
 * @param  {GLint} type Type of buffer
 * @return {Object}  Buffer object and it's type
 */
export function buffer(gl, data, type = gl.ARRAY_BUFFER) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(type, buffer);
  gl.bufferData(type, data, gl.STATIC_DRAW);

  return {
    data: buffer,
    type,
  };
}

/**
 * Bind buffer into a shader attribute
 * @param  {WebGLRenderingContext} gl  Context to bind to
 * @param  {GLint} attr     Pointer to attribute to register. null when
 * setting indicies buffer
 * @param  {Object} Buffer returned by buffer()
 * @param  {Number} elements Number of items per element
 * @param  {Number} type     Type of buffer we're binding
 */
export function attributeArray(
  gl, attr, { data, type }, elements = 3
) {
  gl.bindBuffer(type, data);
  // Set attribute interpolation data
  if (type === gl.ARRAY_BUFFER) {
    gl.vertexAttribPointer(
      attr,
      elements,
      gl.FLOAT,
      gl.FALSE,
      elements * Float32Array.BYTES_PER_ELEMENT,
      0,
    );
    gl.enableVertexAttribArray(attr);
  }
}

function setTex(gl, type, width, height, data) {
  if (
    data instanceof HTMLImageElement ||
    data instanceof HTMLVideoElement
  ) {
    gl.texImage2D(
      type,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      data,
    );

    if (isPowerOf2(width) && isPowerOf2(height)) {
      gl.generateMipmap(type);
    } else {
      gl.texParameteri(type, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(type, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(type, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  } else {
    gl.texImage2D(
      type,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      data,
    );
  }
}

export function bindAndSetTexture(gl, pointer, cube, data, w, h) {
  gl.bindTexture(cube ? gl.TEXTURE_CUBE_MAP : gl.TEXTURE_2D, pointer);
  if (cube) {
    setTex(gl, gl.TEXTURE_CUBE_MAP_POSITIVE_X, w, h, data.right || data);
    setTex(gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, w, h, data.left || data);
    setTex(gl, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, w, h, data.top || data);
    setTex(gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, w, h, data.down || data);
    setTex(gl, gl.TEXTURE_CUBE_MAP_POSITIVE_Z, w, h, data.front || data);
    setTex(gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, w, h, data.back || data);
  } else {
    setTex(gl, gl.TEXTURE_2D, w, h, data);
  }
}

export function createTexture(
  gl,
  media,
  fallbackColor = new Uint8Array([0, 0, 0, 255]),
  cube = false
) {
  const texture = gl.createTexture();
  if (!texture) {
    log("Could not create texture");
  }

  // Setup fallback color whilst resource loads
  bindAndSetTexture(gl, texture, cube, fallbackColor, 1, 1);
  let initialized = false;
  let type = "image";
  if (!media) {
    log("No media item supplied for texture");
  } else if (media instanceof HTMLVideoElement) {
    media._renderable = !!media.videoWidth || false;
    media.addEventListener("canplay", function() {
      media._renderable = true;
    });
    initialized = !!media._renderable;
    type = "video";
  } else if (media instanceof HTMLImageElement) {
    media._renderable = media._renderable || false;
    media.addEventListener("load", function() {
      media._renderable = true;
    });
    initialized = !!media._renderable;
  }

  return {
    pointer: texture,
    media,
    initialized,
    type,
    cube,
  };
}

export const isPowerOf2 = val => !(Math.log2(val) % 1);

export function updateTexture(gl, texture) {
  const { pointer, media, applied, cube } = texture;
  let { initialized } = texture;
  if (!media) {
    return;
  }

  if (!initialized) {
    initialized = media._renderable;
  }

  if (!initialized || (media instanceof HTMLImageElement && applied)) {
    return texture;
  }

  const width = media.naturalWidth || media.videoWidth;
  const height = media.naturalHeight || media.videoHeight;

  bindAndSetTexture(gl, pointer, cube, media, width, height);

  return Object.assign({}, texture, {
    initialized,
    applied: true,
  });
}

export function useTexture(gl, { pointer, cube }, uniform, unit = 0) {
  if (unit < 0 || unit >= 8) {
    log("WebGL only supports texture units 0 to 7");
  }
  gl.activeTexture(gl.TEXTURE0 + unit);
  if (cube) {
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, pointer);
  } else {
    gl.bindTexture(gl.TEXTURE_2D, pointer);
  }
  gl.uniform1i(uniform, unit);
}

export const DEFAULT_SPHERE = {
  rows: 30,
  segments: 30,
  PHI: TWO_PI,
  uScale: 1,
  vScale: 1,
  uOffset: 0,
  vOffset: 0,
  radius: 1500,
  fisheye: false,
};

export function sphere(config) {
  const {
    gl,
    radius,
    rows = 30,
    segments = 30,
    PHI = TWO_PI,
    uScale = 1,
    vScale = 1,
    uOffset = 0,
    vOffset = 0,
    fisheye,
  } = Object.assign({}, DEFAULT_SPHERE, config);

  // Position & color
  const vertex = [];
  // Vertex order
  const indices = [];
  // UV mapping
  const uvs = [];

  const { PI, sin, cos } = Math;

  const R = 1 / (rows - 1);
  const S = 1 / (segments - 1);
  const offset = PI - (PHI - PI) / 2;
  for (let r = 0; r < rows; ++r) {
    for (let s = 0; s < segments; ++s) {
      const rr = r * R;
      // Ensure last element rese
      const sr = s * S;
      const theta = rr * PI; // angle of z axis
      const phi = (offset + sr * PHI) % TWO_PI; // angle of y axis
      const sinTheta = sin(theta);
      const sinPhi = sin(phi);
      const cosTheta = cos(theta);
      const cosPhi = cos(phi);
      const x = cosPhi * sinTheta;
      const y = cosTheta;
      const z = sinPhi * sinTheta;
      vertex.push(
        x * radius,
        y * radius,
        z * radius
      );

      let u = sr;
      let v = rr;
      if (fisheye) {
        // http://paulbourke.net/dome/fish2/
        // Fisheye to (partial) spherical projection
        const fov = PHI;
        const destU = u;
        const destV = v;

        let theta = PHI * (destU - 0.5);
        let phi = PI * (destV - 0.5);
        const x = Math.cos(phi) * Math.sin(theta);
        const y = Math.cos(phi) * Math.cos(theta);
        const z = Math.sin(phi);

        theta = Math.atan2(z, x);
        phi = Math.atan2(Math.sqrt(x*x + z*z), y);
        const R = phi / fov;
        u = 0.5 + R * Math.cos(theta);
        v = 0.5 + R * Math.sin(theta);

      }

      uvs.push(
        u * uScale + uOffset,
        v * vScale + vOffset,
      );
    }
  }

  for (let r = 0; r < rows - 1; ++r) {
    for (let s = 0; s < segments - 1; ++s) {
      indices.push(
        (r * segments) + s,
        (r * segments) + s + 1,
        (r+1) * segments + s + 1,
        (r+1) * segments + s + 1,
        (r+1) * segments + s,
        (r * segments) + s,
      );
    }
  }

  return {
    vertices: buffer(gl, new Float32Array(vertex)),
    indicies: buffer(gl, new Uint16Array(indices), gl.ELEMENT_ARRAY_BUFFER),
    uvs:      buffer(gl, new Float32Array(uvs)),
    size:     indices.length,
  };
}
