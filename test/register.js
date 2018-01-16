import Base from "../src/interfaces/Base";
import { reset, register, resolve } from "../src/register";

describe("Component registration", () => {
  class TestInterface extends Base {}
  class TestInterface2 extends Base {}
  class InvalidInterface {}

  beforeEach(() => {
    reset();
  });

  describe("register()", () => {
    it("should register component prototypes", () => {
      expect(register("test", TestInterface)).to.be.true;
      expect(resolve("test")).to.equal(TestInterface);
    });

    it("should reject items that do not extend Base", () => {
      expect(register("test", InvalidInterface)).to.be.false;
      expect(resolve("test")).to.be.null;
    });

    it("should not override existing items when override = false", () => {
      expect(register("test", TestInterface)).to.be.true;
      expect(register("test", TestInterface2)).to.be.false;
      expect(resolve("test")).to.equal(TestInterface);
    });

    it("should override existing items when override = true", () => {
      expect(register("test", TestInterface)).to.be.true;
      expect(register("test", TestInterface2, true)).to.be.true;
      expect(resolve("test")).to.equal(TestInterface2);
    });
  });

  describe("resolve()", () => {
    it("should resolve a single item", () => {
      register("test", TestInterface);
      expect(resolve("test")).to.equal(TestInterface);
    });

    it("should resolve an array of items", () => {
      register("test", TestInterface);
      register("test2", TestInterface2);
      expect(resolve(["test", "test2"])).to.eql([
        TestInterface,
        TestInterface2,
      ]);
    });

    it("should return the same item back if not a string", () => {
      register("test", TestInterface);
      expect(resolve(TestInterface)).to.equal(TestInterface);
      expect(resolve([
        TestInterface,
        "test",
      ])).to.eql([
        TestInterface,
        TestInterface,
      ]);
    });
  });

});
