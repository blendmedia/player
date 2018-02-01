import { register } from "../register";
import Controller from "../interfaces/Controller";
import { LOOK_AT } from "../events";

class Target extends Controller {
  create(config) {
    super.create(config);
    this._timeLeft = 0;
    this._listener = this.on(LOOK_AT, this._target.bind(this));
    this._setX = 0;
    this._setY = 0;
  }

  destroy() {
    this._listener();
  }

  _target({ x = 0, y = 0, duration }) {
    const start = this.$player._rotation;
    duration = duration || this.$config("defaultDuration");
    this._start = Object.assign({}, start);
    if (this._start.y < -180) {
      this._start.y += 360;
    } else if (this._start.y > 180) {
      this._start.y -= 360;
    }
    this._duration = duration;
    this._timeLeft = duration;
    this._target = { x, y };
    this._enabled = true;
  }

  isLast() {
    return this._enabled;
  }

  update(dt) {
    if (this._timeLeft) {
      this._timeLeft = Math.max(0, this._timeLeft - dt);
      const ratio = (this._duration - this._timeLeft) / this._duration;
      const x = this._start.x + (this._target.x - this._start.x) * ratio;
      const y = this._start.y + (this._target.y - this._start.y) * ratio;
      this._setX = x;
      this._setY = y;
    } else {
      this._enabled = false;
    }
  }

  apply({ x, y, z }) {
    if (this._enabled) {
      x = this._setX;
      y = this._setY;
    }

    return {
      x,
      y,
      z,
    };
  }
}

Target.defaultConfig = {
  defaultDuration: 750,
};

register("controls:target", Target);
export default Target;
