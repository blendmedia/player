import { register } from "../register";
import UI from "../interfaces/UI";
import {
  render, remove, addClass,
} from "../util/dom";
import * as events from "../events";

class Poster extends UI {
  constructor(...args) {
    super(...args);
    this._play = this._play.bind(this);
    this._close = this._close.bind(this);
  }

  isSupported() {
    return true;
  }

  mount(container) {
    console.log("Mount poster", this._src);
    if (this._src) {
      container.appendChild(this._root);
    }
  }

  unmount() {
    remove(this._root);
  }

  create(config, options) {
    super.create(config, options);
    this._src = options.poster;
    // Try to get one from the media element
    if (!this._src) {
      const element = this.$player.currentMedia().getTexture();
      if (element) {
        this._src = element.getAttribute("poster");
      }
    }

    if (!this._src) {
      return;
    }

    this._root = render("div", {
      className: "fuse-player-poster",
      onClick: this._play,
    }, this._image = render("img", {
      src: this._src,
      onLoad: this._handleReady.bind(this),
      onError: this._handleError.bind(this),
    }));

    this.on(events.PLAYING, this._close);
  }

  _select(index) {
    return () => {
      this.$player.setCurrentMedia(index);
    };
  }

  _handleReady() {
    addClass(this._root, "is-active");
  }

  _handleError() {
    addClass(this._root, "has-error");
  }

  _play() {
    this.$player.play();
    this._close();
  }

  _close() {
    this.unmount();
  }
}


register("ui:poster", Poster);
export default Poster;
