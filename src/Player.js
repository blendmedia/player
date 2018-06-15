import Listener, { addDomListener } from "./util/listener";
import { normalize } from "./util/config";
import { render, removeClass, addClass, attr } from "./util/dom";
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
    this._startEvent = config.autoStart;
    this._started = config.autoStart === true || config.autoStart === void 0;
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
    this._current = -1; // Current media item being played
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
    this._onVRChange = this._onVRChange.bind(this);
    this._showUI = this._showUI.bind(this);
    this._checkVisible = this._checkVisible.bind(this);
    this._startPlayer = this._startPlayer.bind(this);
    this._hideEvents = [];

    // DOM elements
    this._uiSections = {
      top: render("div", {
        className: "fuse-player-ui-bar fuse-player-ui-top",
      }),
      bottom: render("div", {
        className: "fuse-player-ui-bar fuse-player-ui-bottom",
      }),
      left: render("div", {
        className: "fuse-player-ui-bar fuse-player-ui-left",
      }),
      right: render("div", {
        className: "fuse-player-ui-bar fuse-player-ui-right",
      }),
    };

    this._uiContainer = render("div", {
      className: "fuse-player-ui fuse-player-ui-hidden",
      onMousedown: events.stop,
      onMouseup: events.stop,
      onTouchstart: events.stop,
      onTouchend: events.stop,
      onClick: events.stop,
      onMouseEnter: this._disableAutoHide.bind(this),
      onMouseLeave: this._enableAutoHide.bind(this),
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
    this._hideDelay = config.uiHideDelay || 2000;

    if (!this._suspended) {
      this._renderLoop();
    }

    this._enableAutoHide();
    this._events.on(events.VR_PRESENT_CHANGE, this._onVRChange, true);
    fscreen.addEventListener("fullscreenchange", () => {
      this._events.emit(events.TOGGLE_FULLSCREEN, !!fscreen.fullscreenElement);
    });

    if (!this._started) {
      let event = this._startEvent || [events.POINTER_UP, events.PLAY];
      if (!Array.isArray(event)) {
        event = [event];
      }

      for (const e of event) {
        this._events.on(e, this._startPlayer);
      }
    }
  }

  _startPlayer() {
    this._started = true;
  }

  _stopPlayer() {
    this._started = true;
  }

  _enableAutoHide() {
    // UI setup
    clearTimeout(this._hider);
    if (this._config.autoHideUI) {
      this._hideEvents = [
        addDomListener(this._root, events.POINTER_MOVE, this._showUI),
        addDomListener(this._root, events.POINTER_END, this._showUI),
      ];
      addClass(this._uiContainer, "fuse-player-ui-hidden");
    } else {
      removeClass(this._uiContainer, "fuse-player-ui-hidden");
    }
  }

  _disableAutoHide() {
    clearTimeout(this._hider);
    removeClass(this._uiContainer, "fuse-player-ui-hidden");
    for (const off of this._hideEvents) {
      off();
    }
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
        const component = new Type(this._events, this);
        if (!component.isSupported(options)) {
          continue;
        }
        component.create(options, this._config);
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
    let replace = null;
    for (const { type: Type, options } of renderers) {
      const instance = new Type(this._events);
      if (instance.isSupported(options)) {
        instance.create(options);
        replace = instance;
        break;
      }
    }

    if (this._renderer) {
      this._renderer.destroy();
    }
    this._renderer = replace;

    const target = this._renderer.getTarget();
    if (target !== this._renderTarget) {
      this._swapRenderTarget(target);
    }
  }

  setCurrentMedia(n, resume = false) {
    if (n === this._current) {
      return;
    }
    const prev = this.currentMedia();
    const volume = this.volume();
    const mute = this.mute();
    let position = 0;
    let playing = false;
    if (prev) {
      position = prev.currentTime();
      playing = prev.isPlaying();
      prev.unload();
    }
    this._current = n;
    const current = this.currentMedia();
    if (current) {
      current.load();
      if (resume) {
        current.seek(position);
        if (playing) {
          current.play();
        }
      } else {
        this._events.emit(events.PAUSED);
      }

      if (this._renderer) {
        this._renderer.setMedia(current);
      }
    }

    const isVideo = current ? current.isVideo() : false;
    for (const ui of this._ui) {
      if (ui.usesVideo()) {
        if (isVideo) {
          ui.unhide();
        } else {
          ui.hide();
        }
      }
    }

    // Re-apply volume/mute to new source
    if (prev) {
      this.volume(volume);
      this.mute(mute);
    }
    this._events.emit(events.MEDIA_CHANGE);

  }

  _setMedia(media = [], stereo, degrees = 360, fisheye = false) {
    this._stereo = stereo || false;
    this._degrees = degrees;
    this._fisheye = fisheye || false;
    this._setInterfaces(media, "_media");
    this.setCurrentMedia(0);
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
    this._config = config = reconfigure(config);
    this._correction = {
      x: (config.correction ? config.correction.x : 0) || 0,
      y: (config.correction ? config.correction.y : 0) || 0,
      z: (config.correction ? config.correction.z : 0) || 0,
    };
    this._setTarget(config.target);
    this._setRenderer(config.renderer);
    this._setControls(config.controls);
    this._setUI(config.ui);
    this._setMedia(config.src, config.stereo, config.degrees, config.fisheye);
    this._setUpdateable();

    if (!this.currentMedia()) {
      this._events.emit(events.ERROR);
      return false;
    }

    return true;
  }

  size() {
    let width, height;
    if (this._isFullScreen || fscreen.fullscreenElement === this._root) {
      width = this._root.clientWidth;
      height = this._root.clientHeight;
    } else {
      width = this._target.clientWidth;
      height = this._target.clientHeight;
    }

    return { width, height };
  }

  _updateSize(force) {
    let { width, height } = this.size();
    width = Math.ceil(width);
    height = Math.ceil(height);
    const serialized = `${width}x${height}`;
    if (force || serialized !== this._dimensions) {
      this._dimensions = serialized;
      this._renderer.setSize(width, height);
    }
  }

  _enterVR() {
    const display = hmd();
    if (!display) {
      return;
    }
    display.requestPresent([{ source: this._renderTarget }]).then(() => {
      if (this._isFullScreen) {
        this.toggleFullscreen();
      }
      display.resetPose();
      // Set canvas size
      const right = display.getEyeParameters("right");
      const left = display.getEyeParameters("left");

      // Update renderer to use VR display size
      const width = Math.max(left.renderWidth, right.renderWidth) * 2;
      const height = Math.max(left.renderHeight, right.renderHeight);
      this._renderer.setSize(width, height);
      this._vrDisplay = display;

      // Cancel current animation frame and bootstrap VR displays frames
      this._cancelFrame(this._frame);
      this._requestFrame = display.requestAnimationFrame.bind(display);
      this._cancelFrame = display.cancelAnimationFrame.bind(display);
      this._submit = display.submitFrame.bind(display);
      this._frame = null;
      this._renderer.enableVR(display);
      this._events.emit(events.ENTER_VR);
      this._renderLoop();
    }).catch(e => {
      // ignore
      console.warn(e);
    });
  }

  _exitVR() {
    if (this._vrDisplay && this._vrDisplay.isPresenting) {
      this._vrDisplay.exitPresent();
    }
    attr(this._renderTarget, "style", "");

    this._cancelFrame(this._frame);
    this._requestFrame = window.requestAnimationFrame.bind(window);
    this._cancelFrame = window.cancelAnimationFrame.bind(window);
    this._frame = null;
    this._renderer.disableVR();
    this._vrDisplay = null;
    this._updateSize(true);
    this._submit = () => {};
    this._events.emit(events.EXIT_VR);
    this._renderLoop();
  }

  toggleVR() {
    if (this._vrDisplay) {
      this._exitVR();
    } else {
      this._enterVR();
    }
  }

  _showUI() {
    removeClass(this._uiContainer, "fuse-player-ui-hidden");
    clearTimeout(this._hider);
    this._hider = setTimeout(() => {
      addClass(this._uiContainer, "fuse-player-ui-hidden");
    }, this._hideDelay);
  }

  _onVRChange() {
    // Exit VR if mode was cancelled
    if (this._vrDisplay && !this._vrDisplay.isPresenting) {
      this._exitVR();
      this._events.emit(events.EXIT_VR);
      if (!fscreen.fullscreenEnabled) {
        removeClass(document.documentElement, "fuse-player-is-in-vr");
      }
      return;
    }
    this._events.emit(events.ENTER_VR);
    if (!fscreen.fullscreenEnabled) {
      addClass(document.documentElement, "fuse-player-is-in-vr");
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


    const rewind = {
      x: 0,
      y: 0,
    };
    let rot = Object.assign({}, this._rotation);
    let cancel = false;
    for (const controller of this._controls) {
      if (cancel) { // Cancel any remaining controllers when last is true
        controller.cancel();
        continue;
      }
      const result = controller.apply(Object.assign({}, rot));
      if (result) {
        if (!controller.isAccumulator()) {
          const diffY = rot.y - result.y;
          const diffX = rot.x - result.x;
          rewind.x += diffX;
          rewind.y += diffY;
        }
        rot = result;
      }
      rot.x = Math.max(-90, Math.min(90, rot.x));
      rot.y = rot.y % 360;
      if (controller.isLast()) {
        cancel = true;
      }
    }

    // Element has not been interacted with and autoStart is false
    if (this._started) {
      this._renderer.render(
        rot, this._correction, this._stereoView || !!frameData, frameData
      );
    }


    rot.x += rewind.x;
    rot.y += rewind.y;
    this._rotation = rot;
    this._frame = this._requestFrame(this._renderLoop);
    this._submit();
  }

  toggleFullscreen() {
    if (!this._root.parentNode) {
      return;
    }

    if (!fscreen.fullscreenEnabled) {
      // iOS mode
      if (this._isFullScreen) {
        removeClass(this._root, "fuse-player-is-fullscreen");
        removeClass(document.documentElement, "fuse-player-is-fullscreen");
      } else {
        addClass(this._root, "fuse-player-is-fullscreen");
        addClass(document.documentElement, "fuse-player-is-fullscreen");
      }
      this._isFullScreen = !this._isFullScreen;
      this._events.emit(events.TOGGLE_FULLSCREEN, this._isFullScreen);
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
    this._events.suspend();
    this._cancelFrame(this._frame);
    if (this._pauseOnSuspend) {
      const media = this.currentMedia();
      if (media) {
        media.pause();
      }
    }
  }

  stereoView(mode = false) {
    this._stereoView = mode;
  }

  resume() {
    if (!this._suspended) {
      return;
    }
    this._events.resume();
    this._suspended = false;
    this._lastTime = null;
    this._accumulator = 0;
    this._renderLoop();
  }

  play() {
    const media = this.currentMedia();
    if (!media) {
      return;
    }
    media.play();
    this._events.emit(events.PLAY);
  }

  pause() {
    const media = this.currentMedia();
    if (!media) {
      return;
    }
    media.pause();
  }

  repeat(...args) {
    const media = this.currentMedia();
    if (media) {
      return media.repeat(...args);
    }
    return false;
  }

  mute(...args) {
    const media = this.currentMedia();
    if (media) {
      return this._muteVal = media.mute(...args);
    }
    return false;
  }

  volume(...args) {
    const media = this.currentMedia();
    if (media) {
      return this._volume = media.volume(...args);
    }
    return 0;
  }

  togglePlayback() {
    const media = this.currentMedia();
    if (!media) {
      return;
    }

    if (media.isPlaying()) {
      media.pause();
    } else {
      media.play();
    }
  }

  destroy() {
    this._cancelFrame(this._frame);
    this._events.off(events.ENTER_VR, this._onEnterVR);
    this._events.off(events.EXIT_VR, this._onExitVR);
    this.suspend();
    this._swapRenderTarget(null);

    for (const media of this._media) {
      media.unload();
    }

    for (const ui of this._ui) {
      ui.unmount();
    }

    if (this._renderer) {
      this._renderer.destroy();
    }

    // Clear interfaces
    this._renderer = null;
    this._controls = [];
    this._ui = [];
    this._media = [];
  }
}

export default Player;

