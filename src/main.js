import Player from "./Player";
import DEFAULT_CONFIG from "./default-config.js";

import * as events from "./events";
import * as renderers from "./renderers";
import * as media from "./media";
import * as controls from "./controls";
import * as ui from "./ui";

export function factory(base) {
  return function(config) {
    return new Player(Object.assign({}, base, config));
  };
}

export const create = factory(DEFAULT_CONFIG);
export { events, renderers, media, controls, ui };
