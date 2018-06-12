import Base from "../src/interfaces/Base";
import {
  reset, register, resolve, configure, reconfigure,
} from "../src/register";

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

  describe("configure()/reconfigure()", () => {
    const testTransform = config => Object.assign({}, config, {
      world: "hello",
    });
    const testTransform2 = config => Object.assign({}, config, {
      foo: "bar",
    });
    const testFalseTransform = () => false;

    it("should transform the entire configuration object", () => {
      const config = {
        hello: "world",
      };
      configure(testTransform);
      const result = reconfigure(config);
      expect(result).to.eql({
        hello: "world",
        world: "hello",
      });
      expect(result).to.not.equal(config);
    });

    it("should transform a subtree of the configuration if it exists", () => {
      const config = {
        hello: "world",
        src: {},
      };
      configure(testTransform, "src");
      const result = reconfigure(config);
      expect(result).to.eql({
        hello: "world",
        src: {
          world: "hello",
        },
      });
      expect(result).to.not.equal(config);
    });

    it("should ignore a subtree if not defined", () => {
      const config = {
        hello: "world",
      };
      configure(testTransform, "src");
      const result = reconfigure(config);
      expect(result).to.eql({
        hello: "world",
      });
      expect(result).to.equal(config);
    });

    it("should ignore a transform if it returns falsey values", () => {
      const config = Object.freeze({
        hello: "world",
      });
      configure(testFalseTransform, "src");
      configure(testFalseTransform);
      expect(reconfigure(config)).to.equal(config);
    });

    it("should parse multiple registrations", () => {
      const config = {
        hello: "world",
      };
      configure(testTransform);
      configure(testTransform2);
      const result = reconfigure(config);
      expect(result).to.eql({
        hello: "world",
        world: "hello",
        foo: "bar",
      });
      expect(result).to.not.equal(config);
    });

    it("should receieve a copy of the full configuration object", () => {
      const transform = function(src, config) {
        return {
          random: config.random,
        };
      };
      const config = {
        random: Math.random(),
        src: "",
      };
      configure(transform, "src");
      const result = reconfigure(config);
      expect(result).to.eql({
        random: config.random,
        src: {
          random: config.random,
        },
      });
    });
  });

});
