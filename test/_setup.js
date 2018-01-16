import mp4 from "./files/video-sample.mp4";
import webm from "./files/video-sample.webm";

import bowser from "bowser";

describe("Test Suite Support", () => {
  it("should be able to make a WebGL context", () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("webgl");
    expect(ctx).to.be.ok;
  });

  it("should load a video", () => {
    expect(mp4).to.be.ok;
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "auto";
      video.addEventListener("error", function(e) {
        reject(e);
      });
      video.addEventListener("canplay", resolve);
      const src = bowser.firefox ? webm : mp4;
      video.src = src;
    }).should.be.fulfilled;
  });
});

