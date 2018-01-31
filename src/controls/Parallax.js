import { register } from "../register";
import Controller from "../interfaces/Controller";
import { POINTER_DOWN, POINTER_UP, POINTER_MOVE } from "../events";

class Parallax extends Controller {
  constructor(...args) {
    super(...args);
    this._onStart = this._onStart.bind(this);
    this._onEnd = this._onEnd.bind(this);
    this._onMove = this._onMove.bind(this);
  }

  create(config) {
    super.create(config);
    this.on(POINTER_DOWN, this._onStart, true);
    this.on(POINTER_UP, this._onEnd, true);
    this.on(POINTER_MOVE, this._onMove, false);
    this._lastDiff = [0, 0];
    this._dragging = false;

    this._x = 0;
    this._y = 0;
  }

  destroy() {
    this.off(POINTER_DOWN, this._onStart);
    this.off(POINTER_UP, this._onEnd, true);
    this.off(POINTER_MOVE, this._onMove, true);
  }

  _onStart() {
    this._dragging = true;
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

  _onEnd() {
    if (!this._dragging) {
      return;
    }
    this._dragging = false;
  }

  _onMove(e) {
    if (this._dragging) {
      return;
    }

    const { screenX, screenY, currentTarget } = this._normalize(e);
    const { top, left, width, height } = currentTarget.getBoundingClientRect();

    const x = Math.max(0, Math.min(1, (screenX - left) / width)) - 0.5;
    const y = Math.max(0, Math.min(1, (screenY - top) / height)) - 0.5;

    this._x = y * this.$config("magnitude");
    this._y = x * this.$config("magnitude");

  }

  apply({ x, y, z }) {
    x += this._x;
    y += this._y;
    return {
      x,
      y,
      z,
    };
  }

  isAccumulator() {
    return false;
  }
}

Parallax.defaultConfig = {
  magnitude: 5,
};

register("controls:parallax", Parallax);
export default Parallax;
