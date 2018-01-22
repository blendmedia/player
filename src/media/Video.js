import Media from "../interfaces/Media";
import { register, configure } from "../register";

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
      return true;
    }
    return false;
  }

  play() {
    if (this._video) {
      return Promise.resolve(this._video.play()).catch(() => {
        console.warn("Playback failed");
      });
    }
  }

  pause() {
    if (this._video) {
      this._video.pause();
    }
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

  if (/\.(mp4|webm|ogv|mov)$/.test(src)) {
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
