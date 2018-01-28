export default {
  renderer: ["render:webgl"],
  controls: [
    "controls:vr",
    {
      type: "controls:pointer",
      options: {
        lock: false,
        acceleration: 0.3,
        deceleration: 0.9,
        speed: 0.5,
        disableVerticalTouch: false,
      },
    },
    {
      type: "controls:keyboard",
      options: {
        deceleration: 0.9,
        speed: 0.2,
      },
    },
    "controls:gamepad",
    "controls:gyro",
  ],
  ui: [
    "ui:vr",
  ],
  format: 360,
  stereo: false,
};
