import * as math from "../../src/util/math";

describe("Math utils", () => {
  describe("radToDeg", () => {
    it("should be able to convert positive values", () => {
      const deg = math.radToDeg(Math.PI / 2);
      expect(deg).to.equal(90);
      const deg2 = math.radToDeg(Math.PI);
      expect(deg2).to.equal(180);
    });

    it("should be able to convert negative values", () => {
      const deg = math.radToDeg(-Math.PI / 2);
      expect(deg).to.equal(-90);
      const deg2 = math.radToDeg(-Math.PI);
      expect(deg2).to.equal(-180);
    });
  });

  describe("degToRad", () => {
    it("should be able to convert positive values", () => {
      const deg = math.degToRad(90);
      expect(deg).to.equal(Math.PI / 2);
      const deg2 = math.degToRad(180);
      expect(deg2).to.equal(Math.PI);
    });

    it("should be able to convert negative values", () => {
      const deg = math.degToRad(-90);
      expect(deg).to.equal(-Math.PI / 2);
      const deg2 = math.degToRad(-180);
      expect(deg2).to.equal(-Math.PI);
    });
  });
});
