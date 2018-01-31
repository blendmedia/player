import { register } from "../register";
import { render, remove } from "../util/dom";
import UI from "../interfaces/UI";
import { round } from "../util/math";

class Scrubber extends UI {
  isSupported() {
    return true;
  }

  usesVideo() {
    return true;
  }

  create(config) {
    super.create(config);
    this._root = render("div", {
      className: "fuse-player-scrubber",
      onMouseLeave: this._clearTarget.bind(this),
      onMouseMove: this._setTarget.bind(this),
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
    this._start = 0;
    this._target = 0;
  }

  _ratio({ screenX, currentTarget }) {
    const { left, width } = currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, ((screenX - left) / width)));
    return ratio;
  }

  _clearTarget() {
    this._target = 0;
    this._scrubTarget.style.transform = "scaleX(0)";
  }

  _setTarget(e) {
    this._target = round(this._ratio(e), 4);
    this._scrubTarget.style.transform = `scaleX(${this._target})`;
  }

  _seek(e) {
    const media = this.$player.currentMedia();
    if (!media) {
      return;
    }
    const target = this._ratio(e) * media.duration();
    const buffered = media.buffered();
    let available = false;
    for (let i = 0; i < buffered.length; i++) {
      if (target >= buffered.start(i) && target <= buffered.end(i)) {
        available = true;
        break;
      }
    }

    if (!available) {
      this._start = target;
    } else {
      this._start = 0;
    }
    media.seek(target);
  }

  update() {
    const media = this.$player.currentMedia();
    if (!media) {
      return;
    }
    const duration = media.duration();
    const currentTime = media.currentTime();
    const position = round(duration ? currentTime / duration : 0, 4);
    if (currentTime < this._lastTime) {
      this._start = 0; // Reset on loop
    }
    this._lastTime = currentTime;
    const start = this._start / duration;
    const buffer = media.buffered();
    this._playbackCursor.style.transform = (
      `translateX(${start * 100}%) scaleX(${position - start})`
    );
    this._handle.style.left = `${position*100}%`;

    for (const bar of this._bufferBars.slice(buffer.length)) {
      remove(bar);
    }

    if (duration) {
      this._bufferBars = this._bufferBars.slice(0, buffer.length);
      for (let i = 0; i < buffer.length; i++) {
        const start = round(buffer.start(i) / duration, 4);
        const end = round(buffer.end(i) / duration, 4);
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
