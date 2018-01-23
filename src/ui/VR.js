import { register } from "../register";
import UI from "../interfaces/UI";
import { ENTER_VR, EXIT_VR } from "../events";

class VR extends UI {
  constructor(...args) {
    super(...args);
    this._toggleVR = this._toggleVR.bind(this);
  }

  isSupported() {
    return !!navigator.getVRDisplays;
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

    navigator.getVRDisplays().then(([display]) => {
      this._display = display;
    }).catch(() => {
      // ignore
    });
  }

  _toggleVR() {
    if (this._inVR) {
      this.emit(EXIT_VR);
      return;
    }
    if (this._display) {
      this.emit(ENTER_VR, this._display);
    }
  }

}

register("ui:vr", VR);
export default VR;
