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
   * @param {Boolean} isStereo Whether or not to render in stereo
   * @param {VRFrameData} vrFrame frame data from active VRDisplay if it exists
   * @return void
   */
  render(/*rotation, isStereo, vrFrame */) {

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
   * @param {Number} degrees Number of degrees that the media takes up
   */
  setSource(source, stereo, degrees = 360) {
    this._source = source;
    this._stereo = stereo;
    this._degrees = degrees;
  }

  /**
   * Set viewport size
   * @param {number} width  [description]
   * @param {number} height [description]
   */
  setSize(/*width, height*/) {

  }

  enableVR(display) {
    this._vr = true;
    this._vrDisplay = display;
  }

  disableVR() {
    this._vr = false;
    this._vrDisplay = null;
  }
}

export default Renderer;
