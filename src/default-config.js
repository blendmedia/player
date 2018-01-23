export default {
  renderer: ["render:webgl"],
  controls: [
    {
      type: "controls:pointer",
      options: {
        acceleration: 0.3,
        deceleration: 0.9,
        speed: 0.5,
        disableVerticalTouch: true,
      },
    },
    {
      type: "controls:keyboard",
      options: {
        deceleration: 0.9,
        speed: 0.2,
      },
    },
  ],
  format: 360,
  stereo: false,
};
