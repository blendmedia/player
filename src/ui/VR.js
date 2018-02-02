import { register } from "../register";
import UI from "../interfaces/UI";
import { ENTER_VR, EXIT_VR } from "../events";
import { render, attr, text, addClass, removeClass, remove } from "../util/dom";
import { hmd } from "../util/device";

class VR extends UI {
  constructor(...args) {
    super(...args);
    this._toggleVR = this._toggleVR.bind(this);
    this._onEnter = this._onEnter.bind(this);
    this._onExit = this._onExit.bind(this);
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

  update() {
    if (!hmd()) {
      this._button.style.display = "none";
    } else {
      this._button.style.display = "";
    }
  }

  create(config) {
    super.create(config);
    this._button = render("button", {
      type: "button",
      title: "Enter VR",
      className: "fuse-player-button fuse-player-vr-toggle",
      onClick: this._toggleVR,
    }, "Enter VR");

    this.on(ENTER_VR, this._onEnter);
    this.on(EXIT_VR, this._onExit);
  }

  _onEnter() {
    addClass(this._button, "is-active");
    text(this._button, "Exit VR");
    attr(this._button, "title", "Exit VR");
  }

  _onExit() {
    removeClass(this._button, "is-active");
    text(this._button, "Enter VR");
    attr(this._button, "title", "Enter VR");
  }

  _toggleVR() {
    this.$player.toggleVR();
  }

}

VR.defaultConfig = {
  section: "bottom",
};


register("ui:vr", VR);
export default VR;
