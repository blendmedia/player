import { register } from "../register";
import UI from "../interfaces/UI";
import {
  render, remove, toggleClass, addClass, removeClass,
} from "../util/dom";

class SourceSelector extends UI {
  constructor(...args) {
    super(...args);
    this._toggle = this._toggle.bind(this);
  }

  isSupported() {
    return true;
  }

  mount(container) {
    if (this._labels.length > 1) {
      container.appendChild(this._root);
    }
  }

  unmount() {
    remove(this._root);
  }

  create(config, options) {
    super.create(config, options);
    this._labels = options.labels || [];
    const sources = Array.isArray(options.src) ? options.src.length : 1;
    while (this._labels.length < sources) {
      const n = this._labels.length + 1;
      this._labels.push(`Source #${n}`);
    }
    this._root = render("button", {
      type: "button",
      className: "fuse-player-button fuse-player-source-selector",
      onClick: this._toggle,
    }, render("div", {
      className: "fuse-player-source-selector-menu",
    }, this._opts = (
      this._labels.map((label, index) => render("button", {
        onClick: this._select(index),
        className: "fuse-player-source-selector-menu-option",
      }, label))
    )));
  }

  _select(index) {
    return () => {
      this.$player.setCurrentMedia(index);
    };
  }

  _toggle() {
    toggleClass(this._root, "is-active");
  }

  update() {
    const current = this.$player._current;
    for (let i = 0; i < this._opts.length; i++) {
      const l = this._opts[i];
      if (i === current) {
        addClass(l, "is-active");
      } else {
        removeClass(l, "is-active");
      }
    }
  }

}

SourceSelector.defaultConfig = {
  section: "bottom",
};


register("ui:source", SourceSelector);
export default SourceSelector;
