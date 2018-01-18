import Renderer from "../../interfaces/Renderer";
import { register } from "../../register";

class WebGLRenderer extends Renderer {
  _createGL() {
    if (!this._canvas) {
      this._canvas = document.createElement("canvas");
    }
    if (!this._gl) {
      this._gl = this._canvas.getContext("webgl");
    }
    return this._gl;
  }

  isSupported() {
    return !!this._createGL();
  }

  create() {
    this._createGL();
    this.t = 0;
    this.colors = [0, 0, 0];
  }

  getTarget() {
    return this._canvas;
  }

  setSize(width, height) {
    this._canvas.width = width;
    this._canvas.height = height;
  }

  fixedUpdate(dt) {
    this.t += dt / 1000;
    this.t %= 1000;
    this.colors = [
      Math.abs(Math.sin(this.t)),
      Math.abs(Math.cos(this.t)),
      Math.abs(Math.sin(Math.sqrt(this.t))),
    ];
  }

  render() {
    const gl = this._gl;
    const [r, g, b] = this.colors;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(r, g, b, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }
}

register("render:webgl", WebGLRenderer);
export default WebGLRenderer;
