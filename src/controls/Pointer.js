import { register } from "../register";
import Controller from "../interfaces/Controller";
import { POINTER_DOWN, POINTER_UP, POINTER_MOVE } from "../events";
import { accelerator } from "../util/animation";

class Pointer extends Controller {
  constructor(...args) {
    super(...args);
    this._onStart = this._onStart.bind(this);
    this._onEnd = this._onEnd.bind(this);
    this._onMove = this._onMove.bind(this);
  }

  create(config) {
    super.create(config);

    this.on(POINTER_DOWN, this._onStart);
    this.on(POINTER_UP, this._onEnd, true);
    this.on(POINTER_MOVE, this._onMove, true, false);
    this._lastDiff = [0, 0];
    this._dragging = false;

    this.x = accelerator(
      this.config("deceleration"),
      this.config("maxSpeed")
    );
    this.y = accelerator(
      this.config("deceleration"),
      this.config("maxSpeed")
    );

  }

  destroy() {
    this.off(POINTER_DOWN, this._onStart);
    this.off(POINTER_UP, this._onEnd, true);
    this.off(POINTER_MOVE, this._onMove, true);
  }

  _onStart(e) {
    const { currentTarget, screenX: x, screenY: y } = this._normalize(e);
    const lock = (
      currentTarget.requestPointerLock || currentTarget.mozRequestPointerLock
    );
    if (lock && this.config("lock")) {
      lock.call(currentTarget);
    }
    this._last = [x, y];
    this._dragging = true;
    this.x.reset();
    this.y.reset();
  }

  _normalize(e) {
    if (e.touches) {
      return Object.assign(e, {
        screenX: e.touches[0].screenX,
        screenY: e.touches[0].screenY,
      });
    }
    return e;
  }

  _diff(e) {
    let diffX = 0, diffY = 0;
    if ("movementX" in e) {
      diffX = e.movementX;
      diffY = e.movementY;
    } else {
      const { screenX: x, screenY: y } = this._normalize(e);
      diffX = x - this._last[0];
      diffY = y - this._last[1];
      this._last = [x, y];
    }

    if (e.shiftKey || (e.touches && this.config("disableVerticalTouch"))) {
      diffY = 0;
    }
    if (e.altKey) {
      diffX = 0;
    }

    const reverse = this.config("reverse") ? -1 : 1;
    return [diffX * reverse, diffY * reverse];
  }

  _onEnd() {
    if (!this._dragging) {
      return;
    }

    const unlock = (
      document.exitPointerLock || document.mozExitPointerLoc
    );
    if (unlock && this.config("lock")) {
      unlock.call(document);
    }
    this._dragging = false;

    if (this.config("momentum")) {
      const [diffX, diffY] = this._lastDiff;
      if (Math.abs(diffY) >= this.config("minSpeed")) {
        this.x.velocity = this.config("speed") * diffY;
      }
      if (Math.abs(diffX) >= this.config("minSpeed")) {
        this.y.velocity = this.config("speed") * diffX;
      }
    }
    this._lastDiff = [0, 0];
  }

  _onMove(e) {
    if (!this._dragging) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    const [diffX, diffY] = this._diff(e);
    this._lastDiff = [diffX, diffY];
    this.x.move(diffY * this.config("speed"));
    this.y.move(diffX * this.config("speed"));
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

Pointer.defaultConfig = {
  momentum: true,
  speed: 0.3,
  lock: false,
  reverse: false,
  disableVerticalTouch: false,
  deceleration: 0.1,
  maxSpeed: 5,
  minSpeed: 5,
};

register("controls:pointer", Pointer);
export default Pointer;
