import Base from "./Base";

/**
 * Renderer interface
 * Implements base lifecycle methods with additional render() method
 */
class Renderer extends Base {
  /**
   * Determines if this renderer can play the given media format
   * @param  {String} format Format of the media such as 180,360
   * @param  {String|Boolean} stereo If the media is stereo such as SBS/OU
   * @return {[type]}        [description]
   */
  canPlayType(/*format, stereo*/) {
    return true;
  }

  /**
   * Method to draw current state on the screen
   * @param {Float32Array} rotation A Quaternion representing where the camera
   * is currently rotation
   * @return void
   */
  render(/*rotation*/) {

  }

  /**
   * Retrieve the DOMElement that the render is writing data to
   * @return {HTMLElement}
   */
  getTarget() {
    return null;
  }

  /**
   * Set source texture (video or image)
   * @param {HTMLMediaElement} source
   * @param {String|Boolean} stereo Stereo format of media (if any)
   */
  setSource(source, stereo) {
    this._source = source;
    this._stereo = stereo;
  }

  /**
   * Set viewport size
   * @param {number} width  [description]
   * @param {number} height [description]
   */
  setSize(/*width, height*/) {

  }
}

export default Renderer;
