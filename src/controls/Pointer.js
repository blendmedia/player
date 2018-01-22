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

  _onEnd() {
    const unlock = (
      document.exitPointerLock || document.mozExitPointerLoc
    );
    if (unlock) {
      unlock.call(document);
    }
    this._running = false;
  }

  _onMove(e) {
    if (!this._running) {
      return;
    }
    const { screenX: x, screenY: y } = e;
    let diffX = 0, diffY = 0;
    if ("movementX" in e) {
      diffX = e.movementX;
      diffY = e.movementY;
    } else {
      diffX = this.last[0] - x;
      diffY = this.last[1] - y;
    }

    this._rotateY = diffX / (2 / this._speed);
    this._rotateX = diffY / (2 / this._speed);
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
