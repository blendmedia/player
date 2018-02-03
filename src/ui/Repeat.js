import { register } from "../register";
import UI from "../interfaces/UI";
import { render, text, addClass, removeClass, remove, attr } from "../util/dom";

class Repeat extends UI {
  constructor(...args) {
    super(...args);
    this._toggle = this._toggle.bind(this);
  }

  isSupported() {
    return true;
  }

  usesVideo() {
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
      className: "fuse-player-button fuse-player-repeat",
      onClick: this._toggle,
    }, "2D");
  }

  _toggle() {
    const mode = this.$player.repeat();
    this.$player.repeat(!mode);
  }

  update() {
    if (this.$player.repeat()) {
      addClass(this._button, "is-active");
      text(this._button, "Repeat On");
    } else {
      removeClass(this._button, "is-active");
      text(this._button, "Repeat Off");
    }
  }

}

Repeat.defaultConfig = {
  section: "bottom",
};


register("ui:repeat", Repeat);
export default Repeat;
