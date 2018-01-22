import Base from "./Base";

/**
 * Controller interface
 * Implements base lifecycle methods with an apply method to
 * manage look target and camera position
 */
class Controller extends Base {
  /**
   * Apply method that should manipulate the rotation/position vectors passed in
   * @param {Float32Array} rotation A Vec3 representing where the camera
   * is currently looking
   * @return void
   */
  apply(/*rotation*/) {

  }

  /**
   * If this method returns true, subsequent controllers are not run
   * @return {Boolean} [description]
   */
  isLast() {
    return false;
  }

}

export default Controller;
