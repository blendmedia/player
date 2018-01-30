import { register } from "../register";
import { TOGGLE_FULLSCREEN } from "../events";
import UI from "../interfaces/UI";
import { render } from "../util/dom";

class Fullscreen extends UI {
  constructor(...args) {
    super(...args);
    this._toggleFullscreen = this._toggleFullscreen.bind(this);
  }

  isSupported() {
    return true;
  }

  mount(container) {
    container.appendChild(this._button);
  }

  create() {
    this._button = render("button", {
      type: "button",
      title: "Enter Fullscreen",
      className: "fuse-player-vr-toggle",
      onClick: this._toggleFullscreen,
    }, "Enter Fullscreen");
    this._inVR = false;
  }

  _toggleFullscreen() {
    this.emit(TOGGLE_FULLSCREEN);
  }

}

register("ui:fullscreen", Fullscreen);
export default Fullscreen;
