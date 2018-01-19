/**
 * Web GL utility functions and constants
 */

import debug from "debug";
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
export function program(gl, vertex, fragment, uniforms = []) {
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
  return {
    program,
    uniforms: pointers,
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


export function createTexture(
  gl,
  media,
  fallbackColor = new Uint8Array([0, 0, 0, 255]),
) {
  const texture = gl.createTexture();
  if (!texture) {
    log("Could not create texture");
  }

  // Setup fallback color whilst resource loads
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0, // Full resolution
    gl.RGBA, // Pixel format
    1, // width
    1, // height
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    fallbackColor,
  );

  let initialized = false;
  if (!media) {
    log("No media item supplied for texture");
  } else if (media instanceof HTMLVideoElement) {
    initialized = media.readyState >= 2;
  }

  return {
    pointer: texture,
    media,
    initialized,
  };
}

export const isPowerOf2 = val => !(Math.log2(val) % 1);

export function updateTexture(gl, { pointer, media, initialized }) {
  if (!media) {
    return;
  }

  if (!initialized) {
    initialized = media.complete || media.readyState >= 2;
    if (!initialized) {
      return {
        pointer,
        media,
        initialized,
      };
    }
  }

  const width = media.naturalWidth || media.videoWidth;
  const height = media.naturalHeight || media.videoHeight;

  gl.bindTexture(gl.TEXTURE_2D, pointer);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0, // Full resolution
    gl.RGBA, // Pixel format
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    media,
  );

  if (isPowerOf2(width) && isPowerOf2(height)) {
    gl.generateMipmap(gl.TEXTURE_2D);
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }
  return {
    pointer,
    media,
    initialized,
  };
}

export function useTexture(gl, { pointer }, uniform, unit = 0) {
  if (unit < 0 || unit >= 8) {
    log("WebGL only supports texture units 0 to 7");
  }
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, pointer);
  gl.uniform1i(uniform, unit);
}
