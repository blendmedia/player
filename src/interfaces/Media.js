import Base from "./Base";

class Media extends Base {
  isSupported() {
    return false;
  }

  isVideo() {
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

  getTexture() {
    return null;
  }
}

export default Media;
