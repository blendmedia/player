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
   * @param {Float32Array} rotation A Vec3 representing where the camera
   * is currently looking
   * @param {Float32Array} position A Vec3 representing where the camera
   * is currently placed
   * @return void
   */
  render(/*rotation, position*/) {

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
   */
  setSource(source) {
    this._source = source;
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
