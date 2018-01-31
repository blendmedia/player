import { register } from "../register";
import { TOGGLE_FULLSCREEN } from "../events";
import UI from "../interfaces/UI";
import { render, attr, text, addClass, removeClass, remove } from "../util/dom";

class Fullscreen extends UI {
  constructor(...args) {
    super(...args);
    this._toggleFullscreen = this._toggleFullscreen.bind(this);
    this._onFullscreenChange = this._onFullscreenChange.bind(this);
  }

  isSupported() {
    return true;
  }

  mount(container) {
    container.appendChild(this._button);
  }

  unmount() {
    remove(this._button);
  }

  create(options) {
    super.create(options);
    this._button = render("button", {
      type: "button",
      title: "Enter Fullscreen",
      className: "fuse-player-fullscreen-toggle",
      onClick: this._toggleFullscreen,
    }, "Enter Fullscreen");
    this._inVR = false;
    this.on(TOGGLE_FULLSCREEN, this._onFullscreenChange);
  }

  _toggleFullscreen() {
    this.$player.toggleFullscreen();
  }

  _onFullscreenChange(isFullscreen) {
    console.log(isFullscreen);
    if (isFullscreen) {
      addClass(this._button, "is-active");
      text(this._button, "Exit Fullscreen");
      attr(this._button, "title", "Exit Fullscreen");
    } else {
      removeClass(this._button, "is-active");
      text(this._button, "Enter Fullscreen");
      attr(this._button, "title", "Exit Fullscreen");
    }
  }

}

Fullscreen.defaultConfig = {
  section: "bottom",
};

register("ui:fullscreen", Fullscreen);
export default Fullscreen;
