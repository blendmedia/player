import { register } from "../register";
import { render, remove, addClass, removeClass } from "../util/dom";
import * as events from "../events";
import UI from "../interfaces/UI";

class Loader extends UI {
  create(config) {
    super.create(config);
    this._root = render("div", {
      className: "fuse-player-loader is-loading",
    });
    this._root.innerHTML = this.$config("html");

    this._off = this._off.bind(this);
    this._on = this._on.bind(this);

    this.on(events.LOADED, this._off);
    this.on(events.PLAYING, this._off);
    this.on(events.ERROR, this._off);
    this.on(events.BUFFERING, this._on);
  }


  _off() {
    removeClass(this._root, "is-loading");
  }

  _on() {
    addClass(this._root, "is-loading");
  }


  mount(container) {
    container.appendChild(this._root);
  }

  unmount() {
    remove(this._root);
  }


}

Loader.defaultConfig = {
  html: "<span></span><span></span><span></span><span></span><span></span>",
};

register("ui:loader", Loader);
export default Loader;
