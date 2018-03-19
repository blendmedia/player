import { addDomListener } from "./listener";
import * as events from "../events";

let _classes = {};
export function classNames(classes = {}) {
  _classes = Object.assign({}, _classes, classes);
}

export function render(type = "div", props = {}, children = []) {
  let element, isSVG = false;
  if (type === "svg") {
    isSVG = true;
    element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  } else {
    element = document.createElement(type);
  }

  for (const prop in props) {
    const value = props[prop];
    if (prop === "className") {
      const names = (value || "").split(" ").map(n => _classes[n] || n);
      if (isSVG) {
        element.className.baseVal = names.join(" ");
      } else {
        element.className = names.join(" ");
      }
      continue;
    }

    const handler = prop.match(/^on(.*?)$/);
    if (handler) {
      let event = handler[1].toLowerCase();
      switch (event) {
        case "pointerstart":
        case "pointerdown":
          event = events.POINTER_START;
          break;
        case "pointerend":
        case "pointerup":
          event = events.POINTER_END;
          break;
        case "pointermove":
          event = events.POINTER_MOVE;
          break;
      }
      addDomListener(element, event, value);
      continue;
    }

    attr(element, prop, value);
  }

  if (children) {
    if (!Array.isArray(children)) {
      children = [children];
    }
    for (const child of children) {
      if (child instanceof Element) {
        element.appendChild(child);
        continue;
      }

      const text = document.createTextNode(child);
      element.appendChild(text);
    }
  }

  return element;
}

export function addClass(element, className) {
  const name = _classes[className] || className;
  element.classList.add(name);
}

export function removeClass(element, className) {
  const name = _classes[className] || className;
  element.classList.remove(name);
}

export function hasClass(element, className) {
  const name = _classes[className] || className;
  return element.classList.contains(name);
}

export function toggleClass(element, className) {
  if (hasClass(element, className)) {
    removeClass(element, className);
  } else {
    addClass(element, className);
  }
}

export function text(element, text) {
  element.textContent = text;
}

export function attr(element, attr, value) {
  if (value === null) {
    element.removeAttribute(attr);
    return;
  }
  element.setAttribute(attr, value);
}

export function remove(element) {
  if (element.parentNode) {
    element.parentNode.removeChild(element);
  }
}
