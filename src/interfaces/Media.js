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
}

export default Media;
