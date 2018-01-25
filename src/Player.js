import Listener, { addDomListener } from "./util/listener";
import { normalize } from "./util/config";
import { hmd } from "./util/device";
import { resolve, reconfigure } from "./register";
import { changes } from "./util/array";
import { ENTER_VR, EXIT_VR, VR_PRESENT_CHANGE, stop } from "./events";

export const FIXED_TIME_UPDATE = 1000/60;
// If the time between updates goes beyond this value, assume the page
// was in an inactive state
export const MAX_UPDATE = 1000;

class Player {
  constructor(config) {
    // Variable Init
    this._events = new Listener;
    this._renderer = null; // Active renderer
    this._controls = []; // Array of control components
    this._ui = []; // Array of UI components
    this._media = []; // Array of media sources
    this._lastTime = null; // Last time a frame was run
    this._accumulator = 0; // Time accumulator for fixedUpdate
    this._target = null; // Main HTML container to add items to
    this._renderTarget = null; // Where the active renderer is drawing to
    this._dimensions = ""; // Serialized dimensions of the video render
    this._current = 0; // Current media item being played
    this._rotation = { // Current rotation in Euler degrees
      x: 0,
      y: 0,
      z: 0,
    };
    this._updateable = []; // All items that have update/fixedUpdate called

    // Stores frame methods and reference to request for cancelling
    this._requestFrame = window.requestAnimationFrame.bind(window);
    this._cancelFrame = window.cancelAnimationFrame.bind(window);
    this._submit = () => {};
    this._frame = null;

    // Method binding
    this._renderLoop = this._renderLoop.bind(this);
    this._onEnterVR = this._onEnterVR.bind(this);
    this._onExitVR = this._onExitVR.bind(this);
    this._onVRChange = this._onVRChange.bind(this);

    // DOM elements
    this._uiContainer = document.createElement("div");
    this._uiContainer.className = "fuse-ui";
    addDomListener(this._uiContainer, "mousedown", stop);
    addDomListener(this._uiContainer, "mouseup", stop);
    addDomListener(this._uiContainer, "touchstart", stop);
    addDomListener(this._uiContainer, "touchend", stop);
    addDomListener(this._uiContainer, "click", stop);

    // Initialize
    this._apply(config);
    this._renderLoop();

    this._events.on(ENTER_VR, this._onEnterVR);
    this._events.on(EXIT_VR, this._onExitVR);
    this._events.on(VR_PRESENT_CHANGE, this._onVRChange, true);
  }

  _resolve(list) {
    return normalize(list).map(item => (
      Object.assign({}, item, {
        type: resolve(item.type),
      })
    )).filter(item => !!item.type);
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


    this._target.appendChild(this._uiContainer);
    this._events.updateDOM(this._target);
  }

  _swapRenderTarget(target) {
    if (this._renderTarget && this._renderTarget.parentNode) {
      this._renderTarget.parentNode.removeChild(this._renderTarget);
    }
    if (target) {
      this._target.appendChild(target);
    }
    this._renderTarget = target;
  }

  _setInterfaces(config, key) {
    if (!this[key]) {
      return;
    }

    config = this._resolve(config);
    const types = config.map(t => t.type);
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

  _setUpdateable() {
    this._updateable = [
      ...this._controls,
      ...this._ui,
      this._renderer,
    ];
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

  _setMedia(media = [], stereo, degrees = 360, fisheye = false) {
    this._stereo = stereo || false;
    this._degrees = degrees;
    this._setInterfaces(media, "_media");
    this._current = 0;
    if (this._renderer) {
      const current = this.currentMedia();
      this._renderer.setSource(
        current ? current.getTexture() : null,
        this._stereo,
        this._degrees,
        fisheye,
      );
    }
  }

  _setControls(controls = []) {
    this._setInterfaces(controls, "_controls");
  }

  _setUI(ui = []) {
    this._setInterfaces(ui, "_ui");
    for (const ui of this._ui) {
      ui.mount(this._uiContainer);
    }
  }

  _apply(config) {
    config = reconfigure(config);
    this._correction = {
      x: (config.correction ? config.correction.x : 0) || 0,
      y: (config.correction ? config.correction.y : 0) || 0,
      z: (config.correction ? config.correction.z : 0) || 0,
    };
    this._setTarget(config.target);
    this._setRenderer(config.renderer);
    this._setMedia(config.src, config.stereo, config.degrees, config.fisheye);
    this._setControls(config.controls);
    this._setUI(config.ui);
    this._setUpdateable();
  }

  _updateSize(force) {
    const { width, height } = this._target.getBoundingClientRect();
    const serialized = `${width}x${height}`;
    if (force || serialized !== this._dimensions) {
      this._dimensions = serialized;
      this._renderer.setSize(width, height);
    }
  }

  _onEnterVR() {
    const display = hmd();
    if (!display) {
      return;
    }
    display.requestPresent([{ source: this._renderTarget }]).then(() => {
      display.resetPose();

      // Set canvas size
      const right = display.getEyeParameters("right");
      const left = display.getEyeParameters("left");

      const width = Math.max(left.renderWidth, right.renderWidth) * 2;
      const height = Math.max(left.renderHeight, right.renderHeight);
      this._renderer.setSize(width, height);
      this._vrDisplay = display;
      this._cancelFrame(this._frame);
      this._requestFrame = display.requestAnimationFrame.bind(display);
      this._cancelFrame = display.cancelAnimationFrame.bind(display);
      this._submit = display.submitFrame.bind(display);
      this._frame = null;
      this._renderer.enableVR(display);
      this._renderLoop();
    }).catch(e => {
      // ignore
      console.warn(e);
    });
  }

  _onExitVR() {
    if (this._vrDisplay) {
      this._vrDisplay.exitPresent();
      this._cancelFrame(this._frame);
      this._requestFrame = window.requestAnimationFrame.bind(window);
      this._cancelFrame = window.cancelAnimationFrame.bind(window);
      this._frame = null;
      this._renderer.disableVR();
      this._vrDisplay = null;
      this._updateSize(true);
      this._submit = () => {};
      this._renderLoop();

    }
  }

  _onVRChange() {
    // Exit VR if mode was cancelled
    if (this._vrDisplay && !this._vrDisplay.isPresenting) {
      this._onExitVR();
    }
  }

  _renderLoop(t) {
    if (t === void 0) { // First pass
      this._frame = this._requestFrame(this._renderLoop);
      return;
    }

    if (this._lastTime === null) {
      this._lastTime = t;
      this._frame = this._requestFrame(this._renderLoop);
      return;
    }

    const dt = t - this._lastTime;
    this._lastTime = t;

    if (dt >= MAX_UPDATE) {
      this._frame = this._requestFrame(this._renderLoop);
      return;
    }

    this._accumulator += dt;
    let frameData = null;
    if (!this._vrDisplay) {
      this._updateSize();
    } else {
      frameData = new window.VRFrameData();
      this._vrDisplay.getFrameData(frameData);
    }

    for (const component of this._updateable) {
      component.update(dt);
    }
    while (this._accumulator > FIXED_TIME_UPDATE) {
      this._accumulator -= FIXED_TIME_UPDATE;
      for (const component of this._updateable) {
        component.fixedUpdate(FIXED_TIME_UPDATE);
      }
    }

    let rot = Object.assign({}, this._rotation);
    for (const controller of this._controls) {
      const result = controller.apply(rot);
      if (result) {
        rot = result;
      }
      rot.x = Math.max(-90, Math.min(90, rot.x));
      rot.y = rot.y % 360;
      if (controller.isLast()) {
        break;
      }
    }

    this._rotation = rot;
    this._renderer.render(rot, this._correction, !!frameData, frameData);
    this._frame = this._requestFrame(this._renderLoop);
    this._submit();
  }

  currentMedia() {
    return this._media[this._current] || null;
  }

  suspend() {
    this._suspended = true;
    cancelAnimationFrame(this._frame);
  }

  resume() {
    if (!this._suspended) {
      return;
    }
    this._suspended = false;
    this._lastTime = null;
    this._accumulator = 0;
    this._renderLoop();
  }

  destroy() {
    this._cancelFrame(this._frame);
    this._events.off(ENTER_VR, this._onEnterVR);
    this._events.off(EXIT_VR, this._onExitVR);
    this.suspend();
    this._swapRenderTarget(null);
    if (this._renderer) {
      this._renderer.destroy();
    }
  }
}

export default Player;

