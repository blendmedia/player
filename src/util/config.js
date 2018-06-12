/**
 * Converts an object or array of objects to always be in the format of
 * [{ type: InterfaceClass, options: {...}, ...]
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 */
export function normalize(config) {
  if (!(config instanceof Array)) {
    return normalize([config]);
  }

  return config.reduce((arr, item) => {
    if (typeof item !== "object") {
      item = {
        type: item,
        options: {},
      };
    }
    const types = item.type instanceof Array ? item.type : [item.type];
    return [...arr, ...types.map(type => ({
      type,
      options: item.options || {},
    }))];
  }, []);
}

/**
 * Compare 2 items shallowly and return if they have changed
 * @param  {any} a First item to compare
 * @param  {any} b Second item to compare
 * @return {Boolean}  Returns true if the items are the same (shallow)
 */
export function shallowCheck(a, b) {
  if (a === b) {
    return true;
  }

  let type = typeof a;
  if (type !== typeof b) {
    return false;
  }

  type = (a instanceof Array) ? "array" : type;
  switch (type) {
    case "object":
      if (!shallowCheck(Object.keys(a).sort(), Object.keys(b).sort())) {
        return false;
      }
      for (const key in a) {
        if (a[key] !== b[key]) {
          return false;
        }
      }
      return true;
    case "array":
      if (a.length !== b.length) {
        return false;
      }
      return a.every((v, i) => b[i] === v);
    default:
      return a === b;
  }

}
