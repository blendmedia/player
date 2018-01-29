export default {
  renderer: ["render:webgl"],
  controls: [
    "controls:vr",
    {
      type: "controls:pointer",
      options: {
        lock: false,
        acceleration: 0.3,
        deceleration: 0.1,
        speed: 0.5,
        disableVerticalTouch: false,
      },
    },
    "controls:keyboard",
    "controls:gamepad",
    "controls:gyro",
  ],
  ui: [
    "ui:vr",
  ],
  format: 360,
  stereo: false,
};
