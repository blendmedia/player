import { addDomListener } from "./listener";

let _classes = {};
export function classNames(classes = {}) {
  _classes = Object.assign({}, _classes, classes);
}

export function render(type = "div", props = {}, children = []) {
  const element = document.createElement(type);

  for (const prop in props) {
    const value = props[prop];
    if (prop === "className") {
      const names = (value || "").split(" ").map(n => _classes[n] || n);
      element.className = names.join(" ");
      continue;
    }

    const handler = prop.match(/^on(.*?)$/);
    if (handler) {
      const event = handler[1].toLowerCase();
      addDomListener(element, event, value);
      continue;
    }

    element.setAttribute(prop, value);
  }

  if (!Array.isArray(children)) {
    children = [children];
  }
  for (const child of children) {
    if (child instanceof HTMLElement) {
      element.appendChild(child);
      continue;
    }

    const text = document.createTextNode(child);
    element.appendChild(text);
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

export function text(element, text) {
  element.textContent = text;
}

export function attr(element, attr, value) {
  element.setAttribute(attr, value);
}

export function remove(element) {
  if (element.parentNode) {
    element.parentNode.removeChild(element);
  }
}
