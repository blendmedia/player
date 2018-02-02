import { register } from "../register";
import UI from "../interfaces/UI";
import { render, text, addClass, removeClass, remove } from "../util/dom";
import { round } from "../util/math";
import { normalizeXY, POINTER_END } from "../events";

class Volume extends UI {

  isSupported() {
    return true;
  }

  usesVideo() {
    return true;
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

  create(config) {
    super.create(config);
    this.on(POINTER_END, () => this._dragging = false, false, true);
    this._dragging = false;
    this._root = render("div", {
      className: "fuse-player-volume",
    }, [
      this._mute = render("button", {
        type: "button",
        onClick: this._toggleMute.bind(this),
        className: "fuse-player-button fuse-player-volume-mute",
      }),
      this._slider = render("div", {
        className: "fuse-player-volume-slider",
        onClick: this._setVolume.bind(this),
        onPointerEnd: () => this._dragging = false,
        onPointerStart: () => this._dragging = true,
        onPointerMove: e => {
          this._dragging && this._setVolume(e);
        },
      }, [
        this._currentVolume = render("div", {
          className: "fuse-player-volume-current",
        }),
        this._currentVolumeHandle = render("div", {
          className: "fuse-player-volume-handle",
        }),
      ]),
    ]);
  }

  _setVolume(e) {
    const { x } = normalizeXY(e);
    this.$player.mute(false);
    this.$player.volume(x);
  }

  _toggleMute() {
    const mode = this.$player.mute();
    this.$player.mute(!mode);
  }

  update() {
    const volume = this.$player.volume();
    removeClass(this._root, "volume-level-low");
    removeClass(this._root, "volume-level-med");
    removeClass(this._root, "volume-level-high");

    let magnitude = "";
    if (volume < 0.2) {
      magnitude = "low";
    } else if (volume < 0.7) {
      magnitude = "med";
    } else {
      magnitude = "high";
    }
    addClass(this._root, `volume-level-${magnitude}`);

    this._currentVolume.style.transform = `scaleX(${round(volume, 4)})`;
    this._currentVolumeHandle.style.left = `${round(volume*100, 4)}%`;

    if (this.$player.mute()) {
      addClass(this._root, "is-muted");
      text(this._mute, "Unmute");
    } else {
      removeClass(this._root, "is-muted");
      text(this._mute, "Mute");
    }
  }

}

Volume.defaultConfig = {
  section: "bottom",
};


register("ui:volume", Volume);
export default Volume;
