import { register } from "../register";
import Controller from "../interfaces/Controller";
import { POINTER_DOWN, POINTER_UP, POINTER_MOVE } from "../events";

class Pointer extends Controller {
  constructor(...args) {
    super(...args);
    this._onStart = this._onStart.bind(this);
    this._onEnd = this._onEnd.bind(this);
    this._onMove = this._onMove.bind(this);
  }

  create(config) {
    this.on(POINTER_DOWN, this._onStart);
    this.on(POINTER_UP, this._onEnd, true);
    this.on(POINTER_MOVE, this._onMove, true);
    this._rotateY = 0;
    this._rotateX = 0;
    this._running = false;
    this._speed = config.speed || 1;
    this._acceleration = config.acceleration || false;
    this._deceleration = config.deceleration || 0.9;
    this._velY = 0;
    this._velX = 0;
    this._lastDiff = [0, 0];
  }

  destroy() {
    this.off(POINTER_DOWN, this._onStart);
    this.off(POINTER_UP, this._onEnd, true);
    this.off(POINTER_MOVE, this._onMove, true);
  }

  _onStart({ currentTarget, screenX: x, screenY: y }) {
    const lock = (
      currentTarget.requestPointerLock || currentTarget.mozRequestPointerLock
    );
    if (lock) {
      lock.call(currentTarget);
    }

    this._last = [x, y];
    this._running = true;
  }

  _diff(e) {
    let diffX = 0, diffY = 0;
    if ("movementX" in e) {
      diffX = e.movementX;
      diffY = e.movementY;
    } else {
      const { screenX: x, screenY: y } = e;
      diffX = this.last[0] - x;
      diffY = this.last[1] - y;
      this.last = [x, y];
    }

    if (e.shiftKey) {
      diffY = 0;
    }

    if (e.altKey) {
      diffX = 0;
    }

    return [diffX, diffY];
  }

  _onEnd() {
    if (!this._running) {
      return;
    }
    const unlock = (
      document.exitPointerLock || document.mozExitPointerLoc
    );
    if (unlock) {
      unlock.call(document);
    }
    this._running = false;
    if (this._acceleration) {
      const [diffX, diffY] = this._lastDiff;
      this._velY = diffX * this._acceleration;
      this._velX = diffY * this._acceleration;
    }
    this._lastDiff = [0, 0];
  }

  _onMove(e) {
    if (!this._running) {
      return;
    }
    const [diffX, diffY] = this._diff(e);
    this._lastDiff = [diffX, diffY];
    this._rotateY = diffX / (2 / this._speed);
    this._rotateX = diffY / (2 / this._speed);
  }

  fixedUpdate() {
    if (this._running) {
      return;
    }

    this._rotateY = this._velY;
    this._rotateX = this._velX;

    this._velX *= this._deceleration;
    if (Math.abs(this._velX) <= 0.1) {
      this._velX = 0;
    }
    this._velY *= this._deceleration;
    if (Math.abs(this._velY) <= 0.1) {
      this._velY = 0;
    }
  }

  apply({ x, y, z }) {
    x += this._rotateX;
    y += this._rotateY;

    this._rotateY = this._rotateX = 0;
    return {
      x,
      y,
      z,
    };
  }
}

register("controls:pointer", Pointer);
export default Pointer;
