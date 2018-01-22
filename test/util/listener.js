import Listener, { addDomListener } from "../../src/util/listener";
import detect from "detect-it";

const noop = () => function() {};
const domStub = () => ({
  addEventListener: sinon.spy(),
  removeEventListener: sinon.spy(),
});

describe("Listener", () => {
  const add = window.addEventListener;
  const remove = window.removeEventListener;

  let l = null;
  let target = null;
  beforeEach(() => {
    // DOM Stub
    target = domStub();
    l = new Listener(target);
    // Window STUB
    window.addEventListener = sinon.spy(window, "addEventListener");
    window.removeEventListener = sinon.spy(window, "removeEventListener");
  });

  afterEach(() => {
    window.addEventListener = add;
    window.removeEventListener = remove;
    detect.update();
  });

  it("should initialize it's store on construction", () => {
    expect(l._listeners).to.eql({});
  });

  it("should create it's own DOM node if not specified", () => {
    const l = new Listener;
    expect(l._domElement).to.be.instanceof(HTMLElement);
  });

  it("should store the provided DOM node", () => {
    expect(l._domElement).to.be.equal(target);
  });

  describe("custom events", () => {
    it("should create a new array of listeners when a new event type is subscribed to", () => {
      const fn = noop();
      l.on("myevent", fn);
      expect(l._listeners.myevent).to.eql([fn]);
    });

    it("should add to the existing array when subscribing to the same event", () => {
      const fn = noop();
      const fn2 = noop();
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

  describe("DOM events", () => {
    it("should register to the target when a DOM event is supplied", () => {
      const fn = noop();
      l.on("mousedown", fn);
      expect(target.addEventListener.called).to.be.true;
      expect(target.addEventListener.args[0][0]).to.equal("mousedown");
      expect(target.addEventListener.args[0][1]).to.equal(fn);
    });

    it("should unregister the event listener correctly", () => {
      const fn = noop();
      l.on("mousedown", fn);
      l.off("mousedown", fn);
      expect(target.removeEventListener.args[0][0]).to.equal("mousedown");
      expect(target.removeEventListener.args[0][1]).to.equal(fn);
    });

    it("should unregister correctly when using the returned callback", () => {
      const fn = noop();
      const off = l.on("mousedown", fn);
      off();
      expect(target.removeEventListener.args[0][0]).to.equal("mousedown");
      expect(target.removeEventListener.args[0][1]).to.equal(fn);
    });

    it("should rebind all events when switching", () => {
      const fn = noop();
      const fn2 = noop();
      const fn3 = noop();
      const fn4 = noop();
      const nextTarget = domStub();
      l.on("mouseup", fn);
      l.on("mousedown", fn2);
      l.on("mousemove", fn3);

      // Add and remove one immediately
      const off = l.on("touchstart", fn4);
      off();

      l.updateDOM(nextTarget);

      expect(target.removeEventListener.args[1][0]).to.equal("mouseup");
      expect(target.removeEventListener.args[1][1]).to.equal(fn);
      expect(target.removeEventListener.args[2][0]).to.equal("mousedown");
      expect(target.removeEventListener.args[2][1]).to.equal(fn2);
      expect(target.removeEventListener.args[3][0]).to.equal("mousemove");
      expect(target.removeEventListener.args[3][1]).to.equal(fn3);

      expect(nextTarget.addEventListener.args[0][0]).to.equal("mouseup");
      expect(nextTarget.addEventListener.args[0][1]).to.equal(fn);
      expect(nextTarget.addEventListener.args[1][0]).to.equal("mousedown");
      expect(nextTarget.addEventListener.args[1][1]).to.equal(fn2);
      expect(nextTarget.addEventListener.args[2][0]).to.equal("mousemove");
      expect(nextTarget.addEventListener.args[2][1]).to.equal(fn3);
      expect(nextTarget.addEventListener.args[3]).to.be.undefined;
    });

    it("should be able to bind to the window", () => {
      const fn = noop();
      l.on("click", fn, true);
      expect(target.addEventListener.called).to.be.false;
      expect(window.addEventListener.called).to.be.true;
      expect(window.addEventListener.args[0][0]).to.be.equal("click");
      expect(window.addEventListener.args[0][1]).to.be.equal(fn);
    });

    it("should be able to remove listeners from the window", () => {
      const fn = noop();
      l.on("click", fn, true);
      l.off("click", fn, true);
      expect(target.addEventListener.called).to.be.false;
      expect(target.removeEventListener.called).to.be.false;
      expect(window.removeEventListener.called).to.be.true;
      expect(window.removeEventListener.args[0][0]).to.be.equal("click");
      expect(window.removeEventListener.args[0][1]).to.be.equal(fn);
    });

    it("should be able to remove listeners from the window via the returned callback", () => {
      const fn = noop();
      const off = l.on("click", fn, true);
      off();
      expect(target.addEventListener.called).to.be.false;
      expect(target.removeEventListener.called).to.be.false;
      expect(window.removeEventListener.called).to.be.true;
      expect(window.removeEventListener.args[0][0]).to.be.equal("click");
      expect(window.removeEventListener.args[0][1]).to.be.equal(fn);
    });

    it("should not reapply window listeners when changing DOM nodes", () => {
      const fn = noop();
      const nextTarget = domStub();
      l.on("click", fn, true);
      l.updateDOM(nextTarget);
      expect(nextTarget.addEventListener.called).to.be.false;
      expect(window.addEventListener.calledOnce).to.be.true;

    });

  });

  describe("addDomListener()", () => {
    it("should set the passive flag when supported", () => {
      detect.passiveEvents = true;
      const element = domStub();
      const fn = noop();
      addDomListener(element, "click", fn);
      expect(element.addEventListener.calledOnce).to.be.true;
      expect(element.addEventListener.args[0][2]).to.eql({
        passive: true,
        capture: false,
      });
    });

    it("should set capture to false when passive flag is not supported", () => {
      detect.passiveEvents = false;
      const element = domStub();
      const fn = noop();
      addDomListener(element, "click", fn);
      expect(element.addEventListener.calledOnce).to.be.true;
      expect(element.addEventListener.args[0][2]).to.be.false;
    });
  });

});
