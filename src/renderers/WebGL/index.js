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

  getTarget() {
    return this._canvas;
  }

  setSize(width, height) {
    this._canvas.width = width;
    this._canvas.height = height;
  }
}

register("render:webgl", WebGLRenderer);
export default WebGLRenderer;
