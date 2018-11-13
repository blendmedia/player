import Renderer from "../../interfaces/Renderer";
import { register } from "../../register";
import * as webgl from "../../util/gl";

import equirectangularVertex from "./equirectangular.vert";
import equirectangularFragment from "./equirectangular.frag";
import cubemapVertex from "./cubemap.vert";
import cubemapFragment from "./cubemap.frag";

import { degToRad, X_AXIS, Y_AXIS } from "../../util/math";
import {
  create as mat4, perspective, translate, multiply, fromRotation, transpose,
} from "gl-matrix/mat4";
import { fromValues as vec3 } from "gl-matrix/vec3";


let isSupported = null;
const CLEAR_COLOR = [0, 0, 0];
class WebGLRenderer extends Renderer {
  constructor(...args) {
    super(...args);
    this._t = 0;
    // Canvas element used for rendering
    this._canvas = document.createElement("canvas");
    this._gl = null; // WebGL canvas context
    this._program = null; // Compiled GPU program
    this._perspective = mat4();
    this._world = mat4();
    this._uScale = 1;
    this._vScale = 1;
    this._phi = 360;
  }

  _createGL() {

    if (!this._gl) {
      this._gl = this._canvas.getContext("webgl");
    }

    return this._gl;
  }

  _createShaders(gl) {
    if (!gl) {
      return false;
    }

    let vertex = equirectangularVertex;
    let fragment = equirectangularFragment;
    if (this._isCube(true)) {
      vertex = cubemapVertex;
      fragment = cubemapFragment;
    }

    const vert = webgl.shader(gl, vertex, webgl.VERTEX);
    const frag = webgl.shader(gl, fragment, webgl.FRAGMENT);
    const { program, uniforms, attributes } = webgl.program(
      gl, vert, frag, ["media", "mvp"], ["xyz", "uv"],
    );

    this._vert = vert;
    this._frag = frag;
    this._program = program;
    this._uniforms = uniforms;
    this._attributes = attributes;
    return true;
  }

  _isCube(imageOnly = false) {
    return this.projection === "cubemap" && (
      !imageOnly ||
      !this._media.isVideo()
    );
  }

  _createGeometry() {
    if (this._geometry) {
      return this._geometry;
    }

    const geom = {
      left: null,
      right: null,
    };

    const sphereConfig = {
      gl: this._gl,
      radius: 1500,
      segments: this._segments,
      rows: this._rows,
      uScale: this._uScale,
      vScale: this._vScale,
      PHI: degToRad(this.fov),
      fisheye: this._fisheye,
    };

    const cubeConfig = {
      gl: this._gl,
      size: 100,
      uScale: this._uScale,
      vScale: this._vScale,
    };

    const creator = this._isCube() ? webgl.cube : webgl.sphere;
    const config = this._isCube() ? cubeConfig : sphereConfig;

    // Create left eye geometry
    geom.left = creator(cubeConfig);
    if (this.stereo) {
      geom.right = creator(Object.assign({}, config, {
        uOffset: 1 - this._uScale,
        vOffset: 1 - this._vScale,
      }));
    }

    return this._geometry = geom;
  }

  _use() {
    this._gl.useProgram(this._program);
  }

  isSupported() {
    if (isSupported !== null) {
      return isSupported;
    }
    return isSupported = !!this._createGL();
  }

  create(config) {
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
  }

  setMedia(media) {
    super.setMedia(media);
    let uScale = 1, vScale = 1;
    switch (this.stereo) {
      case "ou":
      case "tb":
        vScale = 0.5;
        break;
      case "sbs":
      case "lr":
        uScale = 0.5;
        break;
    }
    this.texture = null;
    this._uScale = uScale;
    this._vScale = vScale;
    this._geometry = null;
    this._fisheye = this.projection === "fisheye";
    this._createGL();
    this._createShaders(this._gl);
  }

  _renderGeom(gl, eye, stereo = false, view, model, y) {
    const geom = this._geometry[eye] || this._geometry.left;
    if (!geom) {
      return;
    }
    webgl.attributeArray(gl, this._attributes.xyz, geom.vertices);
    webgl.attributeArray(gl, this._attributes.uv, geom.uvs, 2);
    webgl.attributeArray(gl, null, geom.indicies, 2);

    const width = stereo ? gl.drawingBufferWidth / 2 : gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    const size = eye === "left" ? 0 : 1;

    const left = width * size;
    gl.viewport(left, 0, width, height);
    if (stereo) {
      gl.scissor(left, 0, width, height);
    }

    const perspect = mat4();
    const mvp = mat4();

    // VR Mode
    if (window.VRFrameData && view instanceof window.VRFrameData) {
      transpose(perspect, view[`${eye}ProjectionMatrix`]);
      transpose(view, view[`${eye}ViewMatrix`]);
      const rot = fromRotation(mat4(), degToRad(y) , Y_AXIS);
      multiply(view, rot, view);
    } else {
      perspective(
        perspect,
        degToRad(45), // y fov
        width / height, // aspect ratio
        1, // near
        2000, // far
      );
    }

    // Update model-view-projection matrix
    multiply(mvp, multiply(mat4(), model, view), perspect);
    webgl.uniform(gl, this._uniforms.mvp, mvp, webgl.MATRIX_4);
    gl.drawElements(gl.TRIANGLES, geom.size, gl.UNSIGNED_SHORT, 0);
  }

  _createTexture() {
    if (this.texture) {
      return this.texture;
    }

    return this.texture = webgl.createTexture(
      this._gl,
      this.source,
      void 0,
      this._isCube(true),
    );
  }

  render(rotation, position, useStereo, vrFrame) {
    if (!this.texture && !this.source) {
      return;
    }

    const gl = this._createGL();
    let view = vrFrame;
    this._createGeometry();
    this._createTexture();

    const model = multiply(
      mat4(),
      fromRotation(mat4(), degToRad(position.y) , Y_AXIS),
      fromRotation(mat4(), degToRad(position.x) , X_AXIS),
    );

    if (!view) {
      const pose = `${rotation.y}:${rotation.x}:${useStereo ? "s" : "m"}`;
      if (
        pose === this._lastPose &&
        this.texture.type === "image" &&
        this.texture.applied
      ) {
        return;
      }
      this._lastPose = pose;
      // Create view matrix from euler rotation
      const rot = multiply(
        mat4(),
        fromRotation(mat4(), degToRad(rotation.y) , Y_AXIS),
        fromRotation(mat4(), degToRad(rotation.x) , X_AXIS),
      );
      view = multiply(
        mat4(),
        rot,
        translate(mat4(), mat4(), vec3(0, 0, -1))
      );
    }
    this.texture = webgl.updateTexture(gl, this.texture);

    // Clear display for next frame
    gl.clearColor(...CLEAR_COLOR, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Re-activate shader for frame
    this._use();
    webgl.useTexture(gl, this.texture, this._uniforms.media);

    if (useStereo) {
      gl.enable(gl.SCISSOR_TEST);
    }
    this._renderGeom(gl, "left", useStereo, view, model, rotation.y);
    if (useStereo) {
      this._renderGeom(gl, "right", useStereo, view, model, rotation.y);
    }
    gl.disable(gl.SCISSOR_TEST);
  }

  destroy() {
    this._canvas = null;
    if (this._gl) {
      const g = this._gl;
      if (this.texture) {
        g.deleteTexture(this.texture.pointer);
      }
      g.deleteProgram(this._program);
      g.deleteShader(this._vert);
      g.deleteShader(this._frag);

      if (this._geometry) {
        if (this._geometry.left) {
          g.deleteBuffer(this._geometry.left.vertices.data);
          g.deleteBuffer(this._geometry.left.indicies.data);
          g.deleteBuffer(this._geometry.left.uvs.data);
        }

        if (this._geometry.right) {
          g.deleteBuffer(this._geometry.right.vertices.data);
          g.deleteBuffer(this._geometry.right.indicies.data);
          g.deleteBuffer(this._geometry.right.uvs.data);
        }
      }

      try {
        g.getExtension("WEBGL_lose_context").loseContext();
      } catch (e) {
        console.warn("Could not force context destruction", e);
      }
    }
    this._gl = null;
    this.texture = null;
    this._program = null;
    this._uniforms = null;
    this._attributes = null;
    this._geometry = null;
  }

}

register("render:webgl", WebGLRenderer);
export default WebGLRenderer;
