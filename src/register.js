import Base from "./interfaces/Base";

let _store = {};

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


let _configure = {
  "*": [],
};
/**
 * Register a configuration override/parser for a comonent
 * @param  {Function} fn  Configuration callback
 * @param  {String}   key Sub-key of configuration to attach to, defaults to all
 * @param {Boolean} replace If true, remove all pre-existing callbacks under
 * `key`
 */
export function configure(fn, key = "*", replace = false) {
  if (!(key in _configure) || replace) {
    _configure[key] = [];
  }
  _configure[key].push(fn);
}

/**
 * Configure a source detector function
 * @param  {Function} fn
 */
export function registerMedia(matcher, type, opts = {}, copy = []) {
  configure((src, original) => {
    if (src === null) {
      return;
    }

    if (!Array.isArray(src)) {
      src = [src];
    }

    return src.map(src => {
      if (!matcher(src)) { // Do nothing to non-matches
        return src;
      }

      return {
        type,
        options: Object.assign(
          { src },
          opts,
          // Copy necessary data from original config
          copy.reduce(
            (o, key) => Object.assign(o, { [key]: original[key] }), {}
          ),
        ),
      }
    });
  }, "src");
}

/**
 * Map configuration object through registered configuration hooks
 * @param  {Object} config Configuration object to manipulate
 * @return {Object}        remapped configuration
 */
export function reconfigure(config) {
  let output = config;
  for (const key in _configure) {
    for (const fn of _configure[key]) {
      const tree = key === "*" ? output : output[key];
      if (tree === void 0) { // Ignore undefined trees
        continue;
      }
      const result = fn(tree, config);
      if (result) {
        if (key === "*") {
          output = result;
        } else {
          output = Object.assign({}, output, {
            [key]: result,
          });
        }
      }
    }
  }

  return output;
}

/**
 * Clear component store
 */
export function reset(store = true, configure = true) {
  if (store) {
    _store = {};
  }
  if (configure) {
    _configure = {
      "*": [],
    };
  }
}
