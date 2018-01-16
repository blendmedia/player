import Base from "./Base";

/**
 * Controls interface
 * Implements base lifecycle methods with an apply method to
 * manage look target and camera position
 */
class Controls extends Base {
  /**
   * Apply method that should manipulate the rotation/position vectors passed in
   * @param {Float32Array} rotation A Vec3 representing where the camera
   * is currently looking
   * @param {Float32Array} camera A Vec3 representing where the camera
   * is currently positioned
   * @return void
   */
  apply(/*rotation, position*/) {

  }
}

export default Controls;
