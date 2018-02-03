import Base from "./Base";

class Media extends Base {
  isSupported() {
    return false;
  }

  isVideo() {
    return false;
  }

  isPlaying() {
    return false;
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
