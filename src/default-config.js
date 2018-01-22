export default {
  renderer: ["render:webgl"],
  controls: [
    {
      type: "controls:pointer",
      options: {
        acceleration: 0.3,
        deceleration: 0.9,
      },
    },
  ],
  format: 360,
  stereo: false,
};
