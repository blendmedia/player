import Renderer from "../../interfaces/Renderer";
import { register } from "../../register";
import * as webgl from "../../util/gl";

import vertex from "./shader.vert";
import fragment from "./shader.frag";

import { degToRad } from "../../util/math";
import { create as mat4, perspective, lookAt, multiply } from "gl-matrix/mat4";
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

  _createGeometry(gl) {
    const { vertices, indicies, uvs } = webgl.sphere(2000);

    // Bind vertex, uv, and indicies data to attribute buffers
    webgl.attributeArray(gl, this._attributes.xyz, vertices);
    webgl.attributeArray(gl, this._attributes.uv, uvs, 2);
    webgl.attributeArray(gl, null, indicies, 2, gl.ELEMENT_ARRAY_BUFFER);

    this._geometry = {
      indicies,
      vertices,
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
      mat4(),
      degToRad(45), // y fov
      width / height, // aspect ratio
      1, // near
      2000, // far
    );
  }

  setSource(src) {
    super.setSource(src);
    this.texture = webgl.createTexture(this._gl, src);
  }

  render(rotation) {
    const gl = this._gl;
    const view = mat4();
    lookAt(view, vec3(0, 0, 0), rotation, vec3(0, 1, 0));
    const mvp = mat4();
    multiply(mvp, view, this._perspective);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(...CLEAR_COLOR, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this._use();
    webgl.uniform(
      this._gl, this._uniforms.mvp, mvp, webgl.MATRIX_4
    );
    this.texture = webgl.updateTexture(this._gl, this.texture);
    webgl.useTexture(this._gl, this.texture, this._uniforms.media);
    gl.drawElements(
      gl.TRIANGLES, this._geometry.indicies.length, gl.UNSIGNED_SHORT, 0
    );
  }
}

register("render:webgl", WebGLRenderer);
export default WebGLRenderer;
