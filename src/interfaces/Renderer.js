import Base from "./Base";

/**
 * Renderer interface
 * Implements base lifecycle methods with additional render() method
 */
class Renderer extends Base {
  /**
   * Method to draw current state on the screen
   * @param {Float32Array} rotation A Vec3 representing where the camera
   * is currently looking
   * @param {Float32Array} rotation A Vec3 representing where the camera
   * is currently placed
   * @return void
   */
  render(/*rotation, position*/) {

  }
}

export default Renderer;
