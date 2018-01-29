import { register } from "../register";
import Controller from "../interfaces/Controller";
import { KEY_DOWN, KEY_UP } from "../events";
import { hmd } from "../util/device";
import { accelerator } from "../util/animation";

class Keyboard extends Controller {
  constructor(...args) {
    super(...args);
    this._onStart = this._onStart.bind(this);
    this._onEnd = this._onEnd.bind(this);
  }

  create(config) {
    super.create(config);
    this.on(KEY_DOWN, this._onStart, true, false);
    this.on(KEY_UP, this._onEnd, true, false);

    this.x = accelerator(
      this.config("deceleration"),
      this.config("maxSpeed")
    );

    this.y = accelerator(
      this.config("deceleration"),
      this.config("maxSpeed")
    );

    this._snapY = 0;
    this._snapX = 0;
  }

  destroy() {
    this.off(KEY_DOWN, this._onStart, true);
    this.off(KEY_UP, this._onEnd, true);
  }

  _getAxis(key) {
    switch (key) {
      case "w":
      case "ArrowUp":
        return ["x", 1];
      case "a":
      case "ArrowLeft":
        return ["y", 1];
      case "s":
      case "ArrowDown":
        return ["x", -1];
      case "d":
      case "ArrowRight":
        return ["y", -1];
    }

    return [null, null];
  }

  _onStart(e) {
    const vr = hmd();
    const { key, repeat } = e;
    const [axis, dir] = this._getAxis(key);
    if (!axis) {
      return;
    }
    e.preventDefault();
    if (repeat) {
      return;
    }

    if (vr && vr.isPresenting) {
      this[axis].reset();
      this[axis].move(this.config("snap") * dir);
    } else {
      this[axis].accelerate(this.config("speed") * dir);
    }
  }

  _onEnd({ key }) {
    const [axis] = this._getAxis(key);
    if (!axis) {
      return;
    }
    this[axis].acceleration = 0;
  }

  fixedUpdate(dt) {
    this.x.tick(dt);
    this.y.tick(dt);
  }

  apply({ x, y, z }) {
    x += this.x.apply();
    y += this.y.apply();
    return {
      x,
      y,
      z,
    };
  }
}

Keyboard.defaultConfig = {
  deceleration: 0.1,
  maxSpeed: 3,
  speed: 0.05,
  snap: 30,
};

register("controls:keyboard", Keyboard);
export default Keyboard;
