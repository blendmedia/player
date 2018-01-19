import debug from "debug";
import Player from "./Player";
import DEFAULT_CONFIG from "./default-config.js";

import * as events from "./events";
import * as renderers from "./renderers";
import * as media from "./media";

if (process.env.NODE_ENV === "development") {
  debug.enable("*");
}

export function factory(base) {
  return function(config) {
    return new Player(Object.assign({}, base, config));
  };
}

export const create = factory(DEFAULT_CONFIG);
export { events, renderers, media };
