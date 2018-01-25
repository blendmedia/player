import { register } from "../register";
import UI from "../interfaces/UI";
import { ENTER_VR, EXIT_VR } from "../events";
import { hmd } from "../util/device";

class VR extends UI {
  constructor(...args) {
    super(...args);
    this._toggleVR = this._toggleVR.bind(this);
  }

  isSupported() {
    return !!hmd();
  }

  mount(container) {
    container.appendChild(this._button);
  }

  create() {
    this._button = document.createElement("button");
    this._button.type = "button";
    this._button.textContent = "Enter VR";
    this._button.title = "Enter VR";
    this._button.addEventListener("click", this._toggleVR);
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

register("ui:vr", VR);
export default VR;
