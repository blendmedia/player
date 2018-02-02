import { register } from "../register";
import { render, remove } from "../util/dom";
import UI from "../interfaces/UI";
import { round } from "../util/math";
import { normalizeXY } from "../events";

class Scrubber extends UI {
  isSupported() {
    return true;
  }

  usesVideo() {
    return true;
  }

  hide() {
    this._root.style.display = "none";
  }

  unhide() {
    this._root.style.display = "";
  }

  create(config) {
    super.create(config);
    this._root = render("div", {
      className: "fuse-player-scrubber",
      onMouseLeave: this._clearTarget.bind(this),
      onPointerMove: this._setTarget.bind(this),
      onClick: this._seek.bind(this),
    }, [
      this._scrubTarget = render("div", {
        className: "fuse-player-scrubber-target",
      }),
      this._playbackCursor = render("div", {
        className: "fuse-player-scrubber-position",
      }),
      this._handle = render("div", {
        className: "fuse-player-scrubber-handle",
      }),
    ]);

    this._bufferBars = [];
    this._target = 0;
  }

  _clearTarget() {
    this._target = 0;
    this._scrubTarget.style.transform = "scaleX(0)";
  }

  _setTarget(e) {
    const { x } = normalizeXY(e);
    this._target = round(x, 4);
    this._scrubTarget.style.transform = `scaleX(${this._target})`;
  }

  _seek(e) {
    const media = this.$player.currentMedia();
    if (!media) {
      return;
    }
    const target = normalizeXY(e).x * media.duration();
    media.seek(target);
  }

  update() {
    const media = this.$player.currentMedia();
    if (!media) {
      return;
    }
    const duration = media.duration();
    const currentTime = media.currentTime();
    const buffer = media.buffered();
    const position = round(duration ? currentTime / duration : 0, 4);

    // Clean up undeeded elements
    for (const bar of this._bufferBars.slice(buffer.length)) {
      remove(bar);
    }
    // Determine which buffer sequence we're playing from
    let offset = 0;

    if (duration) {
      this._bufferBars = this._bufferBars.slice(0, buffer.length);
      for (let i = 0; i < buffer.length; i++) {
        const start = round(buffer.start(i) / duration, 4);
        const end = round(buffer.end(i) / duration, 4);
        if (buffer.start(i) < currentTime && buffer.end(i) >= currentTime) {
          offset = start;
        }
        const size = end - start;
        let bar = this._bufferBars[i];
        if (!bar) {
          bar = render("div", {
            className: "fuse-player-scrubber-buffered",
          });
          this._bufferBars.push(bar);
          this._root.appendChild(bar);
        }
        bar.style.transform = `translateX(${start*100}%) scaleX(${size})`;
      }

      this._playbackCursor.style.transform = (
        `translateX(${offset * 100}%) scaleX(${position - offset})`
      );
      this._handle.style.left = `${position*100}%`;
    }

  }

  mount(container) {
    container.appendChild(this._root);
  }

  unmount() {
    remove(this._root);
  }

}

Scrubber.defaultConfig = {
  section: "bottom",
};


register("ui:scrubber", Scrubber);
export default Scrubber;
