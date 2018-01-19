import Renderer from "../../interfaces/Renderer";
import { register } from "../../register";
import * as webgl from "../../util/gl";

import vertex from "./shader.vert";
import fragment from "./shader.frag";

import { degToRad } from "../../util/math";
import { create, perspective } from "gl-matrix/mat4";

const CLEAR_COLOR = [0, 0, 0];
class WebGLRenderer extends Renderer {
  constructor(...args) {
    super(...args);

    this._canvas = null; // Canvas element used for rendering
    this._gl = null; // WebGL canvas context
    this._program = null; // Compiled GPU program
    this._perspective = create();
  }

  _createGL() {
    if (!this._canvas) {
      this._canvas = document.createElement("canvas");
    }
    if (!this._gl) {
      this._gl = this._canvas.getContext("webgl");
    }

    if (!this._createShaders(this._gl)) {
      return false;
    }

    return this._gl;
  }

  _createShaders(gl) {
    if (!gl) {
      return false;
    }

    const vert = webgl.shader(gl, vertex, webgl.VERTEX);
    const frag = webgl.shader(gl, fragment, webgl.FRAGMENT);
    const { program, uniforms } = webgl.program(
      gl, vert, frag, ["time", "media", "mvp"]
    );
    this._program = program;
    this._uniforms = uniforms;
    return true;
  }

  _createGeometry(gl, program) {
    const points = new Float32Array(4*3);
    // Top left
    points[0] = -1;
    points[1] = -1;
    points[2] = -3;
    // Top right
    points[3] = 1;
    points[4] = -1;
    points[5] = -2;
    // Bottom right
    points[6] = 1;
    points[7] = 1;
    points[8] = -2;
    // Bottom left
    points[9] = -1;
    points[10] = 1;
    points[11] = -2;

    const indicies = new Uint16Array(6);
    indicies[0] = 0;
    indicies[1] = 1;
    indicies[2] = 2;
    indicies[3] = 0;
    indicies[4] = 3;
    indicies[5] = 2;

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicies, gl.STATIC_DRAW);

    const vertexPointer = gl.getAttribLocation(
      program, "vertPosition"
    );
    gl.vertexAttribPointer(
      vertexPointer, // Attribute location
      3, // Number of elements per attribute
      gl.FLOAT, // Type of elements
      gl.FALSE,
      3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
      0 // Offset from the beginning of a single vertex to this attribute
    );
    gl.enableVertexAttribArray(vertexPointer);
    this._geometry = {
      indicies,
      points,
    };
  }

  _use() {
    this._gl.useProgram(this._program);
  }

  isSupported() {
    return !!this._createGL();
  }

  create() {
    this._createGL();
    this._createGeometry(this._gl, this._program);
    this.t = 0;
    this.colors = [0, 0, 0];
  }

  getTarget() {
    return this._canvas;
  }

  setSize(width, height) {
    this._canvas.width = width;
    this._canvas.height = height;
    this._perspective = perspective(
      create(),
      degToRad(45), // y fov
      width / height, // aspect ratio
      1, // near
      2000, // far
    );
  }

  fixedUpdate(dt) {
    this.t += dt / 1000;
    this.t %= 1000;
    this._use();
    webgl.uniform(
      this._gl, this._uniforms.time, this.t, webgl.FLOAT
    );
  }

  setSource(src) {
    super.setSource(src);
    this.texture = webgl.createTexture(this._gl, src);
  }

  update() {
    this._use();
    webgl.uniform(
      this._gl, this._uniforms.mvp, this._perspective, webgl.MATRIX_4
    );
  }

  render() {
    const gl = this._gl;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(...CLEAR_COLOR, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this._use();
    this.texture = webgl.updateTexture(this._gl, this.texture);
    webgl.useTexture(this._gl, this.texture, this._uniforms.media);
    gl.drawElements(
      gl.TRIANGLE_STRIP, this._geometry.indicies.length, gl.UNSIGNED_SHORT, 0
    );
  }
}

register("render:webgl", WebGLRenderer);
export default WebGLRenderer;
