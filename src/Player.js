import Listener from "./util/listener";
import { normalize } from "./util/config";
import { resolve } from "./register";
import { changes } from "./util/array";

export const FIXED_TIME_UPDATE = 1000/60;

class Player {
  constructor(config) {
    // Variable Init
    this._events = new Listener;
    this._renderer = null;
    this._controls = [];
    this._ui = [];
    this._lastTime = null;
    this._frame = null;
    this._accumulator = 0;
    this._target = null;
    this._renderTarget = null;
    this._dimensions = "";

    // Method binding
    this._renderLoop = this._renderLoop.bind(this);

    // Initialize
    this._apply(config);
    this._renderLoop();
  }

  _setTarget(target) {
    if (target instanceof HTMLElement) {
      this._target = target;
    } else if ((typeof target) === "string") {
      const select = document.querySelector(target);
      if (!select) {
        return;
      }
      this._target = select;
    } else {
      return;
    }
    this._events.updateDOM(this._target);
  }

  _resolve(list) {
    return normalize(list).map(item => (
      Object.assign({}, item, {
        type: resolve(item.type),
      })
    )).filter(item => !!item.type);
  }

  _setRenderer(renderers) {
    renderers = this._resolve(renderers);
    let replace = null, opts = null;
    for (const { type: Type, options } of renderers) {
      const instance = new Type(this._events);
      if (instance.isSupported(options)) {
        replace = instance;
        opts = options;
        break;
      }
    }

    const existing = this._renderer ? this._renderer.constructor.name : null;
    if (
      replace &&
      replace.constructor.name !== existing
    ) {
      if (this._renderer) {
        this._renderer.destroy();
      }
      replace.create(opts);
      this._renderer = replace;
    }

    const target = this._renderer.getTarget();
    if (target !== this._renderTarget) {
      this._swapRenderTarget(target);
    }
  }

  _swapRenderTarget(target) {
    if (this._renderTarget && this._renderTarget.parentNode) {
      this._renderTarget.parentNode.removeChild(this._renderTarget);
    }
    this._target.appendChild(target);
    this._renderTarget = target;
  }

  _setInterfaces(config, key) {
    if (!this[key]) {
      return;
    }
    const types = this._resolve(config);
    const current = this[key].map(comp => comp.constructor);

    const { added, removed } = changes(current, types);
    this[key] = this[key].filter(component => {
      if (removed.includes(component.constructor)) {
        component.destroy();
        return false;
      }
      return true;
    });

    for (const { type: Type, options } of config) {
      if (added.includes(Type)) {
        const component = new Type(this._events);
        if (!component.isSupported(options)) {
          continue;
        }
        component.create(options);
        this[key].push(component);
      }
    }

  }

  _apply(config) {
    this._setTarget(config.target);
    this._setRenderer(config.renderer);
    // this._setInterfaces(config.renderer, "_renderers");
  }


  _renderLoop(t) {
    if (t === void 0) { // First pass
      this._frame = requestAnimationFrame(this._renderLoop);
      return;
    }

    if (this._lastTime === null) {
      this._lastTime = t;
      this._frame = requestAnimationFrame(this._renderLoop);
      return;
    }

    const dt = t - this._lastTime;
    this._lastTime = t;
    this._accumulator += dt;

    const { width, height } = this._target.getBoundingClientRect();
    const serialized = `${width}x${height}`;
    if (serialized !== this._dimensions) {
      this._dimensions = serialized;
      this._renderer.setSize(width, height);
    }

    this._renderer.update(dt);
    while (this._accumulator > FIXED_TIME_UPDATE) {
      this._accumulator -= FIXED_TIME_UPDATE;
      this._renderer.fixedUpdate(FIXED_TIME_UPDATE);
    }
    this._renderer.render();

    this._frame = requestAnimationFrame(this._renderLoop);
  }

  destroy() {
    cancelAnimationFrame(this._frame);
  }
}

export default Player;
