import { register } from "../register";
import UI from "../interfaces/UI";
import { render, text, addClass, removeClass, remove } from "../util/dom";
import * as events from "../events";

class VR extends UI {
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
    this._button.style.display = "none";
  }

  unhide() {
    this._button.style.display = "";
  }

  create(config) {
    super.create(config);
    this._button = render("button", {
      type: "button",
      className: "fuse-player-play",
      onClick: this._toggle,
    }, "Play");

    this.on(events.PAUSED, this._onPause.bind(this));
    this.on(events.PLAYING, this._onPlay.bind(this));
  }

  _onPlay() {
    addClass(this._button, "fuse-player-play");
    removeClass(this._button, "fuse-player-pause");
    text(this._button, "Pause");
  }

  _onPause() {
    addClass(this._button, "fuse-player-pause");
    removeClass(this._button, "fuse-player-play");
    text(this._button, "Play");
  }

  _toggle() {
    this.$player.togglePlayback();
  }

}

VR.defaultConfig = {
  section: "bottom",
};


register("ui:play-pause", VR);
export default VR;
