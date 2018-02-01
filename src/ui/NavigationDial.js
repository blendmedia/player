import { register } from "../register";
import UI from "../interfaces/UI";
import { render, remove } from "../util/dom";
import { round } from "../util/math";

class NavigationDial extends UI {
  isSupported() {
    return true;
  }

  mount(container) {
    container.appendChild(this._root);
  }

  unmount() {
    remove(this._root);
  }

  create(options) {
    super.create(options);
    this._root = render("div", {
      className: "fuse-player-dial",
    });
  }

  update() {
    const { y } = this.$player._rotation || { y: 0 };
    this._root.style.transform = `rotate(${round(-y, 4)}deg)`;
  }
}

NavigationDial.defaultConfig = {
};

register("ui:dial", NavigationDial);
export default NavigationDial;
