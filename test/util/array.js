import * as arrays from "../../src/util/array";

describe("Array utils", () => {
  describe("changes", () => {
    it("should return 2 empty arrays for identical arrays", () => {
      expect(arrays.changes([1, 2, 3], [1, 2, 3])).to.eql({
        added: [],
        removed: [],
        common: [1, 2, 3],
      });
    });

    it("should ignore order", () => {
      expect(arrays.changes([1, 3, 2], [1, 2, 3])).to.eql({
        added: [],
        removed: [],
        common: [1, 3, 2],
      });
    });

    it("should ignore duplicates", () => {
      expect(arrays.changes([1, 3, 3, 2, 1, 2], [1, 2, 3])).to.eql({
        added: [],
        removed: [],
        common: [1, 3, 3, 2, 1, 2],
      });
    });

    it("should calculate added items", () => {
      expect(arrays.changes([1, 2, 3], [1, 2, 3, 4, 5, 6])).to.eql({
        added: [4, 5, 6],
        removed: [],
        common: [1, 2, 3],
      });
    });

    it("should calculate removed items", () => {
      expect(arrays.changes([1, 2, 3, 4, 5, 6], [1, 2, 3])).to.eql({
        added: [],
        removed: [4, 5, 6],
        common: [1, 2, 3],
      });
    });

    it("should calculate added and removed items", () => {
      expect(arrays.changes([1, 2, 3, 4, 5, 6], [1, 2, 3, 7, 8, 9])).to.eql({
        added: [7, 8, 9],
        removed: [4, 5, 6],
        common: [1, 2, 3],
      });
    });
  });
});
