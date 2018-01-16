import Base from "../src/interfaces/Base";
import { reset, register, resolve } from "../src/register";

describe("Component registration", () => {
  class TestInterface extends Base {}
  class TestInterface2 extends Base {}
  class InvalidInterface {}

  beforeEach(() => {
    reset();
  });

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
