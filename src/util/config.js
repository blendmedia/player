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
