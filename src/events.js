// Event constants
import detect from "detect-it";

// Standard DOM events
export const MOUSE_UP    = "mouseup";
export const MOUSE_DOWN  = "mousedown";
export const MOUSE_MOVE  = "mousemove";
export const CLICK       = "click";
export const TOUCH_START = "touchstart";
export const TOUCH_END   = "touchend";
export const TOUCH_MOVE  = "touchmove";

// Keyboard events
export const KEY_DOWN = "keydown";
export const KEY_UP = "keyup";

// Device events
export const DEVICE_MOTION = "devicemotion";

// Pointer events based on primary interaction mechanism
export const POINTER_DOWN = (
  detect.primaryInput === "touch" ? TOUCH_START : MOUSE_DOWN
);
export const POINTER_START = POINTER_DOWN;
export const POINTER_UP = (
  detect.primaryInput === "touch" ? TOUCH_END : MOUSE_UP
);
export const POINTER_END = POINTER_DOWN;
export const POINTER_MOVE = (
  detect.primaryInput === "touch" ? TOUCH_MOVE : MOUSE_MOVE
);

// Media Events
// Playback started
export const PLAYING       = "playing";
// Video paused
export const PAUSED        = "paused";
// Playback can begin/image loaded
export const LOADED        = "loaded";
// Buffer empty
export const BUFFERING     = "buffering";
// Video download progress changed
export const PROGRESS      = "progress";
// Video time changed
export const TIME_UPDATE   = "timeupdate";
// Volume updated
export const VOLUME_UPDATE = "volumeupdate";
// Muted
export const MUTED         = "mute";
// Unmuted
export const UNMUTED       = "unmute";
// Player Events
export const INIT          = "init";
export const SUSPEND       = "suspend";
export const DESTROY       = "destroy";
export const RECONFIGURE   = "reconfigure";
export const PRE_RENDER    = "prerender";
export const POST_RENDER   = "postrender";
export const ERROR         = "error";

// VR events
export const ENTER_VR = "entervr";
export const EXIT_VR = "exitvr";
export const VR_PRESENT_CHANGE = "vrdisplaypresentchange";

// Helper listeners
export const stop = e => e.stopPropagation();
