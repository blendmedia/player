import Base from "./Base";

/**
 * UI interface
 */
class UI extends Base {
  create(options) {
    super.create(options);
    this._mountPoint = this.$config("section") || null;
  }

  mount(/*container*/) {

  }

  unmount(/*container*/) {

  }
}

export default UI;
