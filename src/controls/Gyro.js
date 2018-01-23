import { IS_IOS } from "../util/device";
import { register } from "../register";
import Controller from "../interfaces/Controller";
import { DEVICE_MOTION } from "../events";

// https://github.com/immersive-web/
// cardboard-vr-display/blob/master/src/pose-sensor.js
let orientation = {};
if (screen.orientation) {
  orientation = screen.orientation;
} else if (screen.msOrientation) {
  orientation = screen.msOrientation;
} else {
  Object.defineProperty(orientation, "angle", {
    get: () => window.orientation || 0,
  });
}

class Gyro extends Controller {
  constructor(...args) {
    super(...args);
    this._onMove = this._onMove.bind(this);
  }

  create() {
    this.on(DEVICE_MOTION, this._onMove, true);
    this._moveX = 0;
    this._moveY = 0;
  }

  destroy() {
    this.off(DEVICE_MOTION, this._onMove, true);
  }

  _onMove(e) {
    const { interval, rotationRate } = e;
    let { alpha, beta } = rotationRate;
    if (alpha === null || beta === null) {
      return;
    }
    if (IS_IOS) {
      alpha *= interval;
      beta *= interval;
    }
    switch (orientation.angle) {
      case 0:
        this._moveX = alpha;
        this._moveY = beta;
        break;
      case 90:
        this._moveX = -beta;
        this._moveY = alpha;
        break;
      case -90:
      case 270:
        this._moveX = beta;
        this._moveY = -alpha;
        break;
      case 180:
        this._moveX = beta;
        this._moveY = -alpha;
        break;
    }
  }

  apply({ x, y, z}) {
    x += this._moveX;
    y += this._moveY;

    // this._moveX = 0;
    // this._moveY = 0;

    return { x, y, z };
  }
}

register("controls:gyro", Gyro);
export default Gyro;
