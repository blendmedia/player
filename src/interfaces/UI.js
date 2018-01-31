import Base from "./Base";

/**
 * UI interface
 */
class UI extends Base {
  create(options) {
    super.create(options);
    this._mountPoint = this.$config("section") || null;
  }

  /**
   * Return true when this UI component is only used in video media
   * @return {[type]} [description]
   */
  usesVideo() {
    return false;
  }

  mount(/*container*/) {

  }

  unmount() {

  }

  hide() {

  }

  unhide() {

  }
}

export default UI;
