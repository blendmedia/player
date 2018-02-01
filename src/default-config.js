export default {
  renderer: ["render:webgl"],
  controls: [
    "controls:target",
    "controls:pointer",
    "controls:keyboard",
    "controls:gamepad",
    "controls:gyro",
  ],
  ui: [
    "ui:play-pause",
    "ui:time",
    "ui:scrubber",
    "ui:fullscreen",
    "ui:stereo",
    "ui:vr",
    "ui:dial",
  ],
  format: 360,
  stereo: false,
  autoSuspend: true,
  autoHideUI: true,
};
