import Base from "./interfaces/Base";

let _store = {};

/**
 * Clear component store
 */
export function reset() {
  _store = {};
}

/**
 * Register a class prototype
 * @param  {String}  name     Name to bind component to
 * @param  {Function}  cls      Class function to store
 * @param  {Boolean} [override=false] If false do not override component
 * if already registered
 * @return {Boolean]}           if registering was successful
 */
export function register(name, cls, override = false) {
  if (!(cls.prototype instanceof Base)) {
    return false;
  }

  if (name in _store && !override) {
    return false;
  }

  _store[name] = cls;
  return true;
}

/**
 * Get a component function from a name. Function values are returned as-is
 * @param  {String|Array<String>} name Name of the component to retrieve,
 * or an array of names
 * @return {Function}
 */
export function resolve(name) {
  if (name instanceof Array) {
    return name.map(resolve);
  }

  if (typeof name === "function") {
    return name;
  }

  return _store[name] || null;
}
