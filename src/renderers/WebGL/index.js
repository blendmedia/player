import Renderer from "../../interfaces/Renderer";
import { register } from "../../register";
import * as webgl from "../../util/gl";

import vertex from "./shader.vert";
import fragment from "./shader.frag";

import { degToRad, X_AXIS, Y_AXIS } from "../../util/math";
import {
  create as mat4, perspective, translate, multiply, fromRotation,
} from "gl-matrix/mat4";
import { fromValues as vec3 } from "gl-matrix/vec3";


const CLEAR_COLOR = [0, 0, 0];
class WebGLRenderer extends Renderer {
  constructor(...args) {
    super(...args);

    this._t = 0;
    this._canvas = null; // Canvas element used for rendering
    this._gl = null; // WebGL canvas context
    this._program = null; // Compiled GPU program
    this._perspective = mat4();
    this._world = mat4();
    this._uScale = 1;
    this._vScale = 1;
    this._phi = 360;
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
    const { program, uniforms, attributes } = webgl.program(
      gl, vert, frag, ["media", "mvp"], ["xyz", "uv"],
    );

    this._program = program;
    this._uniforms = uniforms;
    this._attributes = attributes;
    return true;
  }

  _createGeometry() {
    const geom = webgl.sphere(
      2000,
      this._segments,
      this._rows,
      degToRad(this._phi),
      this._uScale,
      this._vScale
    );
    this._geometry = [geom];
  }

  _use() {
    this._gl.useProgram(this._program);
  }

  isSupported() {
    return !!this._createGL();
  }

  create(config) {
    this._createGL();
    this._createGeometry(this._gl, this._program);
    this.t = 0;
    this._segments = config.segments || 30;
    this._rows = config.rows || 30;
    this.colors = [0, 0, 0];
  }

  getTarget() {
    return this._canvas;
  }

  setSize(width, height) {
    this._canvas.width = width;
    this._canvas.height = height;
    this._perspective = perspective(
      mat4(),
      degToRad(45), // y fov
      width / height, // aspect ratio
      1, // near
      2000, // far
    );
  }

  setSource(src, stereo) {
    super.setSource(src, stereo);
    this.texture = webgl.createTexture(this._gl, src);
    let uScale = 1, vScale = 1;
    switch (stereo) {
      case "ou":
      case "tb":
        vScale = 0.5;
        break;
      case "sbs":
      case "lr":
        uScale = 0.5;
        break;
    }
    this._uScale = uScale;
    this._vScale = vScale;
    this._createGeometry(this._gl, this._program);
  }

  render(rotation) {
    const rot = mat4();
    const pitch = fromRotation(mat4(), degToRad(rotation.x) , X_AXIS);
    const yaw = fromRotation(mat4(), degToRad(rotation.y) , Y_AXIS);
    multiply(rot, yaw, pitch);

    const gl = this._gl;
    const view = mat4();
    const eye = mat4();
    translate(eye, mat4(), vec3(0, 0, 1));
    multiply(view, rot, eye);

    const mvp = mat4();
    multiply(mvp, view, this._perspective);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(...CLEAR_COLOR, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this._use();
    webgl.uniform(
      gl, this._uniforms.mvp, mvp, webgl.MATRIX_4
    );
    this.texture = webgl.updateTexture(gl, this.texture);
    webgl.useTexture(gl, this.texture, this._uniforms.media);
    for (const { vertices, uvs, indicies } of this._geometry) {
      // Bind vertex, uv, and indicies data to attribute buffers
      webgl.attributeArray(gl, this._attributes.xyz, vertices);
      webgl.attributeArray(gl, this._attributes.uv, uvs, 2);
      webgl.attributeArray(gl, null, indicies, 2, gl.ELEMENT_ARRAY_BUFFER);
      gl.drawElements(
        gl.TRIANGLES, indicies.length, gl.UNSIGNED_SHORT, 0
      );
    }
  }
}

register("render:webgl", WebGLRenderer);
export default WebGLRenderer;
