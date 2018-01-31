export default {
  renderer: ["render:webgl"],
  controls: [
    "controls:pointer",
    "controls:keyboard",
    "controls:gamepad",
    "controls:gyro",
  ],
  ui: [
    "ui:play-pause",
    "ui:scrubber",
    "ui:vr",
    "ui:fullscreen",
  ],
  format: 360,
  stereo: false,
  autoSuspend: true,
  autoHideUI: true,
};
