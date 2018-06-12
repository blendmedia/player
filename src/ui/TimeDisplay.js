import { register } from "../register";
import { render, remove, text } from "../util/dom";
import UI from "../interfaces/UI";

class TimeDisplay extends UI {
  isSupported() {
    return true;
  }

  usesVideo() {
    return true;
  }

  create(config) {
    super.create(config);
    this._root = render("time", {
      className: "fuse-player-time",
    }, "00:00 / 00:00");
  }

  mount(container) {
    container.appendChild(this._root);
  }

  unmount() {
    remove(this._root);
  }

  hide() {
    this._root.style.display = "none";
  }

  unhide() {
    this._root.style.display = "";
  }

  _prefixZero(n) {
    const s = n.toString();
    return s.length < 2 ? `0${s}` : s;
  }

  _format(seconds, showHours = false) {
    const secs = Math.floor(seconds) % 60;
    const minutes = Math.floor(seconds / 60) % 60;
    const hours = Math.floor(seconds / 3600);

    let time = "";
    if (hours || showHours) {
      time += `${this._prefixZero(hours)}:`;
    }

    time += `${this._prefixZero(minutes)}:${this._prefixZero(secs)}`;
    return time;
  }

  update() {
    const media = this.$player.currentMedia();
    if (!media) {
      return;
    }

    const duration = media.duration();
    if (isNaN(duration)) {
      return;
    }
    const time = media.currentTime();

    const durString = this._format(duration);
    const timeStr = this._format(time, duration >= 3600);
    text(this._root, `${timeStr} / ${durString}`);
  }
}

TimeDisplay.defaultConfig = {
  section: "bottom",
};

register("ui:time", TimeDisplay);
export default TimeDisplay;
