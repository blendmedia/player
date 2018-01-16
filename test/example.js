import mp4 from "./files/video-black.mp4";

describe("example", () => {
  it("should be able to make a WebGL context", () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("webgl");
    expect(ctx).to.be.ok;
  });

  it("should load the mp4", () => {
    expect(mp4).to.be.ok;
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "auto";
      video.addEventListener("error", function(e) {
        reject(e);
      });
      video.addEventListener("canplay", resolve);
      video.src = mp4;
    }).should.be.fulfilled;
  });
});

