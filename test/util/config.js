import * as configUtils from "../../src/util/config";

describe("config utils", () => {
  describe("normalize()", () => {
    it("should spread out an array of types", () => {
      const options = {
        item1: "",
        item2: "",
      };
      const config = {
        type: [0, 1, 2, 3, 4],
        options,
      };

      const result = configUtils.normalize(config);
      expect(result).to.be.instanceof(Array);
      for (let i = 0; i <= 4; i++) {
        expect(result[i].type).to.equal(i);
        expect(result[i].options).to.equal(options);
      }
    });

    it("should turn a single type+options into an array of length 1", () => {
      const config = {
        type: "vr",
        options: {
          item1: "",
          item2: "",
        },
      };

      const result = configUtils.normalize(config);
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.length(1);
      expect(result[0]).to.eql(config);
    });

    it("should be able to handle arrays and non-arrays of types together", () => {
      const options = {};
      const config = [
        {
          type: [0, 1, 2, 3, 4],
          options,
        },
        {
          type: 5,
          options,
        },
      ];
      const result = configUtils.normalize(config);
      for (let i = 0; i <= 5; i++) {
        expect(result[i].type).to.equal(i);
        expect(result[i].options).to.equal(options);
      }
    });

    it("should create an empty options object if non given", () => {
      const config = {
        type: "",
      };
      const result = configUtils.normalize(config);
      expect(result[0]).to.eql({
        type: "",
        options: {},
      });
    });

    it("should parse non-objects and create a type and options object", () => {
      const config = "vr";
      const result = configUtils.normalize(config);
      expect(result[0]).to.eql({
        type: "vr",
        options: {},
      });
      const config2 = [0, 1, 2, 3, 4];
      const result2 = configUtils.normalize(config2);
      for (let i = 0; i <= 4; i++) {
        expect(result2[i]).to.eql({
          type: i,
          options: {},
        });
      }
    });
  });

  describe("shallowCheck()", () => {
    it("should check primitives", () => {
      expect(configUtils.shallowCheck(1, 2)).to.be.false;
      expect(configUtils.shallowCheck(1, 1)).to.be.true;
      expect(configUtils.shallowCheck(true, false)).to.be.false;
      expect(configUtils.shallowCheck("a", "b")).to.be.false;
      expect(configUtils.shallowCheck("a", "a")).to.be.true;
    });

    it("should check arrays", () => {
      expect(configUtils.shallowCheck([], [])).to.be.true;
      expect(configUtils.shallowCheck([1], [1])).to.be.true;
      expect(configUtils.shallowCheck([2, "a"], [2, "a"])).to.be.true;
      expect(configUtils.shallowCheck(["a", "b"], ["b", "a"])).to.be.false;
      expect(configUtils.shallowCheck([1], [2])).to.be.false;
    });

    it("should check objects", () => {
      expect(configUtils.shallowCheck({}, {})).to.be.true;
      expect(configUtils.shallowCheck({a:1}, {a:1})).to.be.true;
      expect(configUtils.shallowCheck({b:"a"}, {b:"a"})).to.be.true;
      expect(configUtils.shallowCheck({a:2}, {a:1})).to.be.false;
      expect(configUtils.shallowCheck({a:1}, {a:1,b:2})).to.be.false;
      expect(configUtils.shallowCheck({a:1,b:2}, {b:2,a:1})).to.be.true;
    });
  });
});
