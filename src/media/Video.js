import Media from "../interfaces/Media";
import { register, registerMedia } from "../register";
import * as events from "../events";
import { attr, render } from "../util/dom";
import { addDomListener } from "../util/listener";

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
    // Ensure iPhone devices do not play video in Quicktime
    attr(video, "playsinline", true),
    attr(video, "webkit-playsinline", true),
    this._events = [
      addDomListener(video, "pause", this.send(events.PAUSED)),
      addDomListener(video, "playing", this.send(events.PLAYING)),
      addDomListener(video, "timeupdate", this.send(events.TIME_UPDATE)),
      addDomListener(video, "canplay", this.send(events.LOADED)),
      addDomListener(video, "stalled", this.send(events.BUFFERING)),
      addDomListener(video, "waiting", this.send(events.BUFFERING)),
      addDomListener(video, events.ERROR, this.send(events.ERROR)),
    ];
  }

  create(opts) {
    super.create(opts);
    const { src, crossOrigin, loop, autoplay } = opts;
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
      const video = render("video", {
        preload: "auto",
        loop: !!loop,
        autoplay: autoplay || null,
        crossOrigin: crossOrigin === true ? "anonymous" : crossOrigin || null,
      });
      this._video = video;
      this._src = src;
    } else {
      return false;
    }

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
      this._setupVideo(this._video);
      attr(this._video, "src", this._src);
      this._video.load();
    }
  }

  unload() {
    for (const off of this._events || []) {
      off();
    }
    attr(this._video, "src", null);
    this._video.pause();
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
registerMedia(
  src => (
    src instanceof HTMLVideoElement ||
    /\.(mp4|webm|ogv|mov)(\?.*?)?$/.test(src)
  ),
  Video, {
    crossOrigin: true,
  }, [
    "loop",
    "autoplay",
    "fov",
    "stereo",
    "projection",
  ],
);
register("media:video", Video);
export default Video;
