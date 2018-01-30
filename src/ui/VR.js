import { register } from "../register";
import UI from "../interfaces/UI";
import { ENTER_VR, EXIT_VR } from "../events";
import { render } from "../util/dom";

class VR extends UI {
  constructor(...args) {
    super(...args);
    this._toggleVR = this._toggleVR.bind(this);
  }

  isSupported() {
    return true;
  }

  mount(container) {
    container.appendChild(this._button);
  }

  create(config) {
    super.create(config);
    this._button = render("button", {
      type: "button",
      title: "Enter VR",
      className: "fuse-player-vr-toggle",
      onClick: this._toggleVR,
    }, "Enter VR");
    this._inVR = false;
  }

  _toggleVR() {
    if (this._inVR) {
      this.emit(EXIT_VR);
    } else {
      this.emit(ENTER_VR);
    }
    this._inVR = !this._inVR;
  }

}

VR.defaultConfig = {
  section: "bottom",
};


register("ui:vr", VR);
export default VR;
