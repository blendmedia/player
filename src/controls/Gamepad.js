import { register } from "../register";
import Controller from "../interfaces/Controller";
import { inVR } from "../util/device";
import { accelerator } from "../util/animation";

class Gamepad extends Controller {
  isSupported() {
    return !!navigator.getGamepads;
  }

  create() {
    this.x = accelerator(
      0,
      this.$config("maxSpeed"),
    );
    this.y = accelerator(
      0,
      this.$config("maxSpeed"),
    );
  }

  normalizeAxis(value) {
    const dz = this.$config("deadzone");
    const sign = value < 0 ? -1 : 1;
    const abs = Math.abs(value);
    const normalized = abs < dz ? 0 : (abs - dz) / (1 - dz);
    return normalized * sign;
  }

  cancel() {
    this.x.reset();
    this.y.reset();
  }

  update() {
    const pads = Array.from(navigator.getGamepads());
    const invertY = this.$config("invertY") ? 1 : -1;
    // Sum the 0/1 axis of all gamepads
    const [x, y] = pads.reduce(([x, y], pad) => {
      if (pad) {
        const [aX, aY] = pad.axes;
        // Apply deadzone per stick to prevent error accumulation
        x += this.normalizeAxis(aX);
        y += this.normalizeAxis(aY);
      }
      return [x, y];
    }, [0, 0]);

    if (inVR() && this.$config("snapInVR")) {
      const dir = x < 0 ? 1 : -1;
      this.x.reset(false);
      this.y.reset(false);
      this.y.snap(
        this.$config("snapAngle") * dir,
        Math.abs(x) >= this.$config("snapDeadzone")
      );
    } else {
      this.x.velocity = y * this.$config("speed") * invertY;
      this.y.velocity = x * this.$config("speed") * -1;
    }
  }

  fixedUpdate(dt) {
    this.x.tick(dt);
    this.y.tick(dt);
  }

  apply({ x, y, z }) {
    x += this.x.apply();
    y += this.y.apply();

    return { x, y, z };
  }
}

Gamepad.defaultConfig = {
  deadzone: 0.1,
  speed: 3,
  maxSpeed: Infinity,
  invertY: false,
  snapInVR: true,
  snapDeadzone: 0.5,
  snapAngle: 30,
};

register("controls:gamepad", Gamepad);
export default Gamepad;
