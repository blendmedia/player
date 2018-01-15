describe("example", () => {
  it("should be able to make a WebGL context", () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("webgl");
    expect(ctx).to.be.ok;
  });
});

