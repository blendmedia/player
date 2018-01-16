/**
 * Listener Class
 * Basic subscription based event system
 */
class Listener {
  constructor() {
    this._listeners = {};
  }

  /**
   * Register an event listener
   * @param  {String}   event    name of the event to subscribe to
   * @param  {Function} callback Function to run when an event is emitted
   * @return {Function} A function to call to unregister the listener
   */
  on(event, callback) {
    if (typeof callback !== "function") {
      return false;
    }
    if (!(event in this._listeners)) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  /**
   * Unregister an event listener
   * @param  {String}   event    The name of the event to unsubscribe from
   * @param  {Function} callback Callback to remove
   * @return {void}
   */
  off(event, callback) {
    if (event in this._listeners) {
      this._listeners[event] = (
        this._listeners[event].filter(fn => fn !== callback)
      );
    }
  }

  /**
   * Dispatch an event
   * @param  {String} event Event type to dispatch
   * @param  {Object} [data]  Data to attach to the event
   */
  emit(event, data = {}) {
    if (event in this._listeners) {
      for (const callback of this._listeners[event]) {
        callback(data);
      }
    }
  }
}

export default Listener;
