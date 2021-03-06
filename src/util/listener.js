import detect from "detect-it";

// DOM Events
const DOM_EVENTS = [
  "mouseup",
  "mousedown",
  "mousemove",
  "click",
  "touchstart",
  "touchend",
  "touchmove",
  "resize",
  "keyup",
  "keydown",
  "devicemotion",
  "vrdisplaypresentchange",
];

/**
 * Attach an event listener to a DOM element, detecting passive support
 * @param {HTMLElement}   target   DOM element to add listener to
 * @param {String}   event    event name to subscribe to
 * @param {Function} callback Function to execute as the event listener
 */
export function addDomListener(target, event, callback, passive = true) {
  const options = detect.passiveEvents ? {
    passive,
    capture: false,
  } : false;
  target.addEventListener(event, callback, options);
  return function() {
    target.removeEventListener(event, callback);
  };
}

/**
 * Listener Class
 * Basic subscription based event system
 */
class Listener {
  constructor(domElement) {
    this._suspended = false;
    this._listeners = {};
    this._domListeners = [];
    this._windowListeners = [];
    this._domElement = domElement || document.createElement("span");
  }

  /**
   * Replace DOM node for event binding
   * @param  {HTMLElement} next New DOM node to use
   * @return {void}
   */
  updateDOM(next) {
    for (const [name, callback] of this._domListeners) {
      this._domElement.removeEventListener(name, callback);
      addDomListener(next, name, callback);
    }
    this._domElement = next;
  }

  /**
   * Register an event listener
   * @param  {String}   event    name of the event to subscribe to
   * @param  {Function} callback Function to run when an event is emitted
   * @param {Boolean} [onWidnow] Should the event be applied to the Winodow if
   * it is a DOM event
   * @return {Function} A function to call to unregister the listener
   */
  on(event, callback, onWindow = false, passive = true) {
    if (typeof callback !== "function") {
      return false;
    }

    if (DOM_EVENTS.includes(event)) {
      const target = onWindow ? window : this._domElement;
      if (!onWindow) {
        this._domListeners.push([event, callback, passive]);
      } else {
        this._windowListeners.push([event, callback, passive]);
      }
      addDomListener(target, event, callback, passive);
    } else {
      if (!(event in this._listeners)) {
        this._listeners[event] = [];
      }
      this._listeners[event].push(callback);
    }
    return () => this.off(event, callback, onWindow);
  }

  /**
   * Unregister an event listener
   * @param  {String}   event    The name of the event to unsubscribe from
   * @param  {Function} callback Callback to remove
   * @param {Boolean} [onWidnow] Should the event be applied to the Winodow if
   * it is a DOM event
   * @return {void}
   */
  off(event, callback, onWindow) {
    if (DOM_EVENTS.includes(event)) {
      const target = onWindow ? window : this._domElement;
      target.removeEventListener(event, callback);
      if (!onWindow) {
        this._domListeners = this._domListeners.filter(([name, cb]) => (
          name !== event && cb !== callback
        ));
      } else {
        this._windowListeners = this._windowListeners.filter(([name, cb]) => (
          name !== event && cb !== callback
        ));
      }
    } else if (event in this._listeners) {
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
    if (this._suspended) {
      return;
    }
    if (event in this._listeners) {
      for (const callback of this._listeners[event]) {
        callback(data);
      }
    }
  }

  suspend() {
    for (const [event, listener] of this._domListeners) {
      this._domElement.removeEventListener(event, listener);
    }
    for (const [event, listener] of this._windowListeners) {
      window.removeEventListener(event, listener);
    }
    this._suspended = true;
  }

  resume() {
    for (const [event, listener, passive] of this._domListeners) {
      addDomListener(this._domElement, event, listener, passive);
    }
    for (const [event, listener, passive] of this._windowListeners) {
      addDomListener(window, event, listener, passive);
    }
    this._suspended = false;
  }

  /**
   * Returns a function that emits the given event type
   * @param  {String} type Event name
   * @return {Function}
   */
  send(type) {
    return e => {
      this.emit(type, e);
    };
  }

}

export default Listener;
