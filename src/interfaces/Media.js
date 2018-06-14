import Base from "./Base";

class Media extends Base {
  create({ projection, stereo, fov }) {
    this.projection(projection);
    this.stereo(stereo);
    this.fov(fov);
  }

  isSupported() {
    return false;
  }

  isVideo() {
    return false;
  }

  isPlaying() {
    return false;
  }

  projection(value) {
    if (value !== void 0) {
      this._projection = value;
    }
    return this._projection || "equirectangular";
  }

  stereo(value) {
    if (value !== void 0) {
      this._stereo = value;
    }
    return this._stereo || false;
  }

  fov(value) {
    if (value !== void 0) {
      this._fov = value;
    }
    return this._fov || 360;
  }

  play() {

  }

  pause() {

  }

  load() {

  }

  unload() {

  }

  /**
   * [seek description]
   * @param  {[type]} seconds [description]
   * @return {[type]}         [description]
   */
  seek(/*seconds*/) {
    return false;
  }

  currentTime() {
    return null;
  }

  duration() {
    return 0;
  }

  buffered() {
    return [];
  }

  getTexture() {
    return null;
  }

  volume() {
    return 0;
  }

  mute() {
    return false;
  }

  repeat() {
    return false;
  }

}

export default Media;
