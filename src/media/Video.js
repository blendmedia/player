import Media from "../interfaces/Media";
import { register } from "../register";

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

  create(options) {
    if (!options.src) {
      return false;
    }

    const video = document.createElement("video");
    this._video = video;
    video.preload = "auto";
    this._src = options.src;
  }

  play() {
    if (this._video) {
      Promise.resolve(this._video.play()).catch(() => {
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


register("media:video", Video);
export default Video;
