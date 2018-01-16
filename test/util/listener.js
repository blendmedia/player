import Listener from "../../src/util/listener";

describe("Listener", () => {
  let l = null;
  beforeEach(() => {
    l = new Listener;
  });
  it("should initialize it's store on construction", () => {
    expect(l._listeners).to.eql({});
  });

  it("should create a new array of listeners when a new event type is subscribed to", () => {
    const fn = function() {};
    l.on("myevent", fn);
    expect(l._listeners.myevent).to.eql([fn]);
  });

  it("should add to the existing array when subscribing to the same event", () => {
    const fn = function() {};
    const fn2 = function() {};
    l.on("myevent", fn);
    l.on("myevent", fn2);
    expect(l._listeners.myevent).to.eql([fn, fn2]);
  });

  it("should not call the function until an emit() is called", () => {
    const fn = sinon.spy();
    l.on("myevent", fn);
    expect(fn.called).to.be.false;
    l.emit("myevent");
    expect(fn.called).to.be.true;
  });

  it("should send the correct data to a callback", () => {
    const fn = sinon.spy();
    const data = {};
    l.on("myevent", fn);
    l.emit("myevent", data);
    expect(fn.args[0][0]).to.equal(data);
  });

  it("should unregister a callback when using off()", () => {
    const fn = sinon.spy();
    l.on("myevent", fn);
    l.off("myevent", fn);
    l.emit("myevent");
    expect(fn.called).to.be.false;
  });

  it("should unregister when executing the return function", () => {
    const fn = sinon.spy();
    const unregister = l.on("myevent", fn);
    unregister();
    l.emit("myevent");
    expect(fn.called).to.be.false;
  });

  it("should not allow non-functions to be passed as a callback", () => {
    const response = l.on("myevent", {});
    expect(l._listeners.myevent).to.be.undefined;
    expect(response).to.be.false;
  });

});
