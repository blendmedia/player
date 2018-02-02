import Media from "../interfaces/Media";
import { register, configure } from "../register";
import * as events from "../events";

class Video extends Media {
  constructor(...args) {
    super(...args);
  }

  isSupported() {
    return true;
  }

  isVideo() {
    return true;
  }

  _setupVideo(video) {
    video.setAttribute("playsinline", true);
    video.setAttribute("webkit-playsinline", true);
    video.addEventListener("pause", () => this.emit(events.PAUSED));
    video.addEventListener("playing", () => this.emit(events.PLAYING));
    video.addEventListener("timeupdate", () => this.emit(events.TIME_UPDATE));
  }

  create({ src, crossOrigin, loop }) {
    if (!src) {
      return false;
    }

    if (src instanceof HTMLVideoElement) {
      if (src.parentNode) {
        src.parentNode.removeChild(src);
        this._originalParent = src.parentNode;
      }
      this._video = src;
      this._src = this._video.getAttribute("src");
    } else if (typeof src === "string") {
      const video = document.createElement("video");
      this._video = video;
      video.preload = "auto";
      video.loop = !!loop;
      if (crossOrigin) {
        video.crossOrigin = crossOrigin === true ? "anonymous" : crossOrigin;
      }
      this._src = src;
    } else {
      return false;
    }

    this._setupVideo(this._video);
    this.load();
    return true;
  }

  play() {
    if (this._video) {
      return Promise.resolve(this._video.play()).catch((e) => {
        console.warn("Playback failed", e);
      });
    }
  }

  pause() {
    if (this._video) {
      this._video.pause();
    }
  }

  isPlaying() {
    return this._video ? !this._video.paused : false;
  }

  load() {
    if (this._video) {
      this._video.src = this._src;
      this._video.load();
    }
  }

  seek(time) {
    if (this._video) {
      this._video.currentTime = time;
    }
  }

  currentTime() {
    if (this._video) {
      return this._video.currentTime;
    }

    return 0;
  }

  duration() {
    if (this._video) {
      return this._video.duration;
    }

    return 0;
  }

  buffered() {
    if (!this._video) {
      return [];
    }
    return this._video.buffered;
  }

  repeat(val) {
    if (val !== void 0) {
      this._video.loop = !!val;
    }
    return this._video.loop;
  }

  volume(val) {
    if (val !== void 0) {
      this._video.volume = val;
    }
    return this._video.volume;
  }

  mute(val) {
    if (val !== void 0) {
      this._video.muted = !!val;
    }
    return this._video.muted;
  }

  getTexture() {
    return this._video || null;
  }
}

// Register component and setup src configuration mapping
configure((src, original) => {
  if (src instanceof HTMLVideoElement) {
    return {
      type: Video,
      options: {
        src,
      },
    };
  }
  // Only parse string src configurations
  if (typeof src !== "string") {
    return null;
  }

  if (/\.(mp4|webm|ogv|mov)(\?.*?)$/.test(src)) {
    return {
      type: Video,
      options: {
        src,
        crossOrigin: true,
        loop: original.loop,
      },
    };
  }

  // Do not manipulate if no match found
  return null;
}, "src");
register("media:video", Video);
export default Video;
