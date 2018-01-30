import Listener, { addDomListener } from "./util/listener";
import { normalize } from "./util/config";
import { render } from "./util/dom";
import { hmd } from "./util/device";
import { resolve, reconfigure } from "./register";
import { changes } from "./util/array";
import * as events from "./events";
import debounce from "debounce";
import fscreen from "fscreen";

export const FIXED_TIME_UPDATE = 1000/60;
// If the time between updates goes beyond this value, assume the page
// was in an inactive state
export const MAX_UPDATE = 1000;

class Player {
  constructor(config) {
    // Variable Init
    this._suspended = false;
    this._pauseOnSuspend = config.pauseOnSuspend;
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
    this.fullscreen = this.fullscreen.bind(this);
    this._renderLoop = this._renderLoop.bind(this);
    this._onEnterVR = this._onEnterVR.bind(this);
    this._onExitVR = this._onExitVR.bind(this);
    this._onVRChange = this._onVRChange.bind(this);
    this._checkVisible = this._checkVisible.bind(this);

    // DOM elements
    this._uiSections = {
      top: render("div", {
        className: "fuse-player-ui-top",
      }),
      bottom: render("div", {
        className: "fuse-player-ui-bottom",
      }),
      left: render("div", {
        className: "fuse-player-ui-left",
      }),
      right: render("div", {
        className: "fuse-player-ui-right",
      }),
    };

    this._uiContainer = render("div", {
      className: "fuse-player-ui",
      onMousedown: events.stop,
      onMouseup: events.stop,
      onTouchstart: events.stop,
      onTouchend: events.stop,
      onClick: events.stop,
    }, [
      this._uiSections.top,
      this._uiSections.bottom,
      this._uiSections.left,
      this._uiSections.right,
    ]);

    this._root = render("div", {
      className: "fuse-player",
    }, [
      this._uiContainer,
    ]);


    // Initialize
    this._apply(config);
    // Run autosuspend before first render loop and after target initialization
    if (config.autoSuspend) {
      addDomListener(window, "scroll", debounce(this._checkVisible, 50));
      this._checkVisible();
    }

    if (!this._suspended) {
      this._renderLoop();
    }

    this._events.on(events.ENTER_VR, this._onEnterVR);
    this._events.on(events.EXIT_VR, this._onExitVR);
    this._events.on(events.VR_PRESENT_CHANGE, this._onVRChange, true);
    this._events.on(events.TOGGLE_FULLSCREEN, this.fullscreen);
  }

  _checkVisible() {
    if (!this._target) { // No HTML node available
      return;
    }

    const {
      top,
      left,
      right,
      bottom,
      width,
      height,
    } = this._target.getBoundingClientRect();

    const wHeight = window.innerHeight;
    const wWidth = window.innerWidth;
    const isVisible = (
      width  > 0      &&
      height > 0      &&
      bottom > 0      &&
      right  > 0      &&
      left   < wWidth &&
      top    < wHeight
    );

    if (isVisible) {
      this.resume();
    } else {
      this.suspend();
    }
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


    this._target.appendChild(this._root);
    this._events.updateDOM(this._target);
  }

  _swapRenderTarget(target) {
    if (this._renderTarget && this._renderTarget.parentNode) {
      this._renderTarget.parentNode.removeChild(this._renderTarget);
    }
    if (target) {
      this._root.appendChild(target);
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
      const section = ui._mountPoint;
      let target = this._uiContainer;
      if (section in this._uiSections) {
        target = this._uiSections[section];
      }
      ui.mount(target);
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
    let width, height;
    if (fscreen.fullscreenElement === this._root) {
      width = this._root.clientWidth;
      height = this._root.clientHeight;
    } else {
      width = this._target.clientWidth;
      height = this._target.clientHeight;
    }
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

  fullscreen() {
    if (!this._root.parentNode) {
      return;
    }

    if (!fscreen.fullscreenEnabled) {
      return;
    }

    if (fscreen.fullscreenElement) {
      fscreen.exitFullscreen();
    } else {
      fscreen.requestFullscreen(this._root);
    }
  }

  currentMedia() {
    return this._media[this._current] || null;
  }

  suspend() {
    if (this._suspended) {
      return;
    }
    this._suspended = true;
    this._cancelFrame(this._frame);
    if (this._pauseOnSuspend) {
      const media = this.currentMedia();
      if (media) {
        console.log("Pausing media");
        media.pause();
      }
    }
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
    this._events.off(events.ENTER_VR, this._onEnterVR);
    this._events.off(events.EXIT_VR, this._onExitVR);
    this.suspend();
    this._swapRenderTarget(null);
    if (this._renderer) {
      this._renderer.destroy();
    }
  }
}

export default Player;

