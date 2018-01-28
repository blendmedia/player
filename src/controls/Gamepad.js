import { register } from "../register";
import Controller from "../interfaces/Controller";
import { hmd } from "../util/device";

class Gamepad extends Controller {
  isSupported() {
    return !!navigator.getGamepads;
  }

  constructor(...args) {
    super(...args);
    this._scan = this._scan.bind(this);
  }

  _scan() {
    const gamepads = navigator.getGamepads();
    for (const pad of gamepads) {
      if (!pad) {
        continue;
      }

      if (!(pad.index in this._gamepads)) {
        this._gamepads[pad.index] = pad;
      }
    }
  }

  create(config) {
    this._gamepads = {};
    this._checkInterval = setInterval(this._scan, 1000);
    this._deadZone = config.deadzone || 0.1;
    this._snapDeadZone = config.snapDeadzone || 0.5;
    this._speed = config.speed || 3;
    this._scan();
    this._accX = this._accY = this._moveX = this._moveY = 0;
    this._invertY = config.invertY ? 1 : -1;
    const shouldSnap = "snapInVR" in config ? config.snapInVR : true;
    this._snap = shouldSnap ? (config.snap || 30) : false;

    this.isSnappedX = false;
    this.isSnappedY = false;
  }

  destroy() {
    this._gamepads = false;
  }

  normalizeAxis(value) {
    const dz = this._deadZone;
    const sign = value < 0 ? -1 : 1;
    const abs = Math.abs(value);
    const normalized = abs < this._deadZone ? 0 : (abs - dz) / (1 - dz);
    return normalized * sign;
  }

  _checkSnap(value, axis, invert = 1) {
    const sign = value < 0 ? -1 : 1;
    const shouldSnap = Math.abs(value) >= this._snapDeadZone;
    if (shouldSnap) {
      if (!this[`isSnapped${axis}`]) {
        this[`_move${axis}`] = this._snap * sign * invert;
      }
      this[`isSnapped${axis}`] = true;
    } else {
      this[`isSnapped${axis}`] = false;
    }
  }

  update() {
    const headset = hmd();
    const inVR = headset && headset.isPresenting;
    const pads = navigator.getGamepads();
    for (const index in this._gamepads) {
      const pad = pads[index];
      if (pad) {
        const [x, y] = pad.axes;
        if (inVR && this._snap) {
          this._checkSnap(x, "X", -1);
          this._accX = 0;
          this._accY = 0;
        } else {
          this._accX = this.normalizeAxis(x);
          this._accY = this.normalizeAxis(y);
        }
        return;
      }
    }

    this._accX = 0;
    this._accY = 0;
  }

  fixedUpdate() {
    this._moveX -= this._accX * this._speed;
    this._moveY += this._accY * this._invertY * this._speed;
  }

  apply({ x, y, z }) {
    x += this._moveY;
    y += this._moveX;

    this._moveX = 0;
    this._moveY = 0;

    return { x, y, z };
  }

}


register("controls:gamepad", Gamepad);
export default Gamepad;
