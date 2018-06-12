/**
 * Base Interface
 * Contains standard lifecycle methods that all interfaces (and implementations)
 * must implement
 */
class Base {

  /**
   * Initialize event listener/emitter for all instances
   * @param  {Listener} listener Event listener/emitter provided by the player
   */
  constructor(listener, player) {
    this.on = listener.on.bind(listener);
    this.off = listener.off.bind(listener);
    this.emit = listener.emit.bind(listener);
    this.send = listener.send.bind(listener);
    this.$player = player;
    this._config = {};
  }

  $config(key) {
    const defaults = this.constructor.defaultConfig || {};
    return key in this._config ? this._config[key] : defaults[key];
  }

  /**
   * Determine if the browser can use the specified component
   * @param  {Object}  config configuration to use during initialization
   * @return {Boolean}
   */
  isSupported(/*config*/) {
    return true;
  }

  /**
   * Run on initialization of the component
   * @param  {Object} config configuration to use when setting up
   * @return boolean Return success of initialization
   */
  create(config) {
    this._config = Object.assign({}, config);
    return true;
  }

  /**
   * Called when the component needs to be re-configured with new data
   * @param  {Object} config New config data to use
   * @return {boolean} Return false when component does not support
   * reconfiguration, or when reconfiguring fails. Falls back to destroy() and
   * create()
   */
  reconfigure(/*config*/) {

  }

  /**
   * Update function called every frame
   * @param  {Number} dt Number of elapsed milliseconds since the last frame
   * @return {void}
   */
  update(/*dt*/) {

  }

  /**
   * Update function called at a fixed interval as defined by the configuration
   * Useful for physics calculations such as acceleration
   * @param  {Number} dt Number of elapsed milliseconds
   * @return {void}
   */
  fixedUpdate(/*dt*/) {

  }

  /**
   * Run on teardown of the component
   * @return {[type]} [description]
   */
  destroy() {

  }
}

export default Base;
