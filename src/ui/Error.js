import { register } from "../register";
import { render, remove, addClass, removeClass, text } from "../util/dom";
import * as events from "../events";
import UI from "../interfaces/UI";

class Error extends UI {
  create(config) {
    super.create(config);
    this._root = render("div", {
      className: "fuse-player-error",
    }, "An error goes here");

    this._off = this._off.bind(this);
    this._on = this._on.bind(this);

    this.on(events.ERROR, this._on);
    this.on(events.RESET_ERROR, this._off);
  }


  _off() {
    removeClass(this._root, "has-error");
  }

  _on() {
    const media = this.$player.currentMedia();
    let message = "";
    if (!media) {
      message = "Error starting player";
    } else if (media.isVideo()) {
      message = "Error during video playback";
    } else {
      message = "Error whilst loading image";
    }
    text(this._root, message);
    addClass(this._root, "has-error");
  }


  mount(container) {
    container.insertBefore(this._root, container.children[0] || null);
  }

  unmount() {
    remove(this._root);
  }


}

Error.defaultConfig = {
};

register("ui:error", Error);
export default Error;
