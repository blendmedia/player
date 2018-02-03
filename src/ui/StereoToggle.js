import { register } from "../register";
import UI from "../interfaces/UI";
import { render, text, addClass, removeClass, remove, attr } from "../util/dom";

class StereoToggle extends UI {
  constructor(...args) {
    super(...args);
    this._toggle = this._toggle.bind(this);
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

 hide() {
    attr(this._button, "disabled", true);
  }

  unhide() {
    attr(this._button, "disabled", false);
  }

  create(config) {
    super.create(config);
    this._button = render("button", {
      type: "button",
      className: "fuse-player-button fuse-player-stereo-toggle",
      onClick: this._toggle,
    }, "2D");
  }

  _toggle() {
    const mode = this.$player._stereoView;
    this.$player.stereoView(!mode);
    text(this._button, mode ? "2D" : "3D");
    if (mode) {
      removeClass(this._button, "is-active");
    } else {
      addClass(this._button, "is-active");
    }
  }

  update() {
    if (this.$player._stereo) {
      this._button.style.display = "";
    } else {
      this._button.style.display = "none";
    }
  }

}

StereoToggle.defaultConfig = {
  section: "bottom",
};


register("ui:stereo", StereoToggle);
export default StereoToggle;
