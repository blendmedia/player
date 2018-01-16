import Base from "./interfaces/Base";

let _store = {};
export function reset() {
  _store = {};
}

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

export function resolve(name) {
  if (name instanceof Array) {
    return name.map(resolve);
  }

  if (typeof name !== "string") {
    return name;
  }

  return _store[name] || null;
}
