import { register } from "../register";
import UI from "../interfaces/UI";
import { render, text, addClass, removeClass, remove, attr } from "../util/dom";
import * as events from "../events";

class PlayPause extends UI {
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
      className: "fuse-player-button fuse-player-play",
      onClick: this._toggle,
    }, "Play");

    this.on(events.PAUSED, this._onPause.bind(this));
    this.on(events.PLAYING, this._onPlay.bind(this));
  }

  _onPlay() {
    addClass(this._button, "fuse-player-pause");
    removeClass(this._button, "fuse-player-play");
    text(this._button, "Pause");
  }

  _onPause() {
    addClass(this._button, "fuse-player-play");
    removeClass(this._button, "fuse-player-pause");
    text(this._button, "Play");
  }

  _toggle() {
    this.$player.togglePlayback();
  }

}

PlayPause.defaultConfig = {
  section: "bottom",
};


register("ui:play-pause", PlayPause);
export default PlayPause;
