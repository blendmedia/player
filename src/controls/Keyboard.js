import { register } from "../register";
import Controller from "../interfaces/Controller";
import { KEY_DOWN, KEY_UP } from "../events";
import { clamp } from "../util/math";

class Keyboard extends Controller {
  constructor(...args) {
    super(...args);
    this._onStart = this._onStart.bind(this);
    this._onEnd = this._onEnd.bind(this);
  }

  create(config) {
    this.on(KEY_DOWN, this._onStart, true);
    this.on(KEY_UP, this._onEnd, true);
    this._rotateY = 0;
    this._rotateX = 0;
    this._running = false;
    this._speed = config.speed || 1;
    this._maxSpeed = config.maxSpeed || 7;
    this._deceleration = config.deceleration || 0.9;
    this._accY = 0;
    this._accX = 0;
  }

  destroy() {
    this.off(KEY_DOWN, this._onStart, true);
    this.off(KEY_UP, this._onEnd, true);
  }

  _getAxis(key) {
    switch (key) {
      case "w":
      case "ArrowUp":
        return ["X", 1];
      case "a":
      case "ArrowLeft":
        return ["Y", 1];
      case "s":
      case "ArrowDown":
        return ["X", -1];
      case "d":
      case "ArrowRight":
        return ["Y", -1];
    }

    return [null, null];
  }

  _onStart({ key }) {
    const [axis, dir] = this._getAxis(key);
    if (!axis) {
      return;
    }
    this[`_acc${axis}`] = this._speed * dir;
  }

  _onEnd({ key }) {
    const [axis] = this._getAxis(key);
    if (!axis) {
      return;
    }
    this[`_acc${axis}`] = 0;
  }

  fixedUpdate() {
    if (this._running) {
      return;
    }

    if (this._accY) {
      this._rotateY = clamp(
        this._rotateY + this._accY, -this._maxSpeed, this._maxSpeed
      );
    } else {
      this._rotateY *= this._deceleration;
      if (Math.abs(this._rotateY) <= 0.1) {
        this._rotateY = 0;
      }
    }

    if (this._accX) {
      this._rotateX = clamp(
        this._rotateX + this._accX, -this._maxSpeed, this._maxSpeed
      );
    } else {
      this._rotateX *= this._deceleration;
      if (Math.abs(this._rotateX) <= 0.1) {
        this._rotateX = 0;
      }
    }
  }

  apply({ x, y, z }) {
    x += this._rotateX;
    y += this._rotateY;
    return {
      x,
      y,
      z,
    };
  }
}

register("controls:keyboard", Keyboard);
export default Keyboard;
