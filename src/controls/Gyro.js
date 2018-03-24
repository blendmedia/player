import { IS_CHROME, CHROME_VERSION } from "../util/device";
import { DEGREE } from "../util/math";
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
    this._speedX = 0;
    this._speedY = 0;
  }

  destroy() {
    this.off(DEVICE_MOTION, this._onMove, true);
  }

  _onMove(e) {
    const { rotationRate } = e;
    if (IS_CHROME && CHROME_VERSION === 65) {
      return;
    }
    let { alpha, beta } = rotationRate;
    if (alpha === null || beta === null) {
      return;
    }

    if (IS_CHROME && CHROME_VERSION < 65) {
      alpha *= DEGREE;
      beta *= DEGREE;
    }

    switch (orientation.angle) {
      case 0:
        this._speedX = alpha;
        this._speedY = beta;
        break;
      case 90:
        this._speedX = -beta;
        this._speedY = alpha;
        break;
      case -90:
      case 270:
        this._speedX = beta;
        this._speedY = -alpha;
        break;
      case 180:
        this._speedX = beta;
        this._speedY = -alpha;
        break;
    }
  }

  fixedUpdate(dt) {
    this._moveX += this._speedX * (dt / 1000);
    this._moveY += this._speedY * (dt / 1000);
  }

  apply({ x, y, z}) {
    x += this._moveX;
    y += this._moveY;

    this._moveX = 0;
    this._moveY = 0;
    this._speedX = 0;
    this._speedY = 0;

    return { x, y, z };
  }
}

register("controls:gyro", Gyro);
export default Gyro;
