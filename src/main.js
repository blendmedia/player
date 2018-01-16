import Player from "./Player";
import DEFAULT_CONFIG from "./default-config.js";

export function factory(base) {
  return function(config) {
    return new Player(Object.assign({}, base, config));
  };
}

export const create = factory(DEFAULT_CONFIG);
