import Media from "../interfaces/Media";
import { register, configure } from "../register";
import { render } from "../util/dom";
import { LOADED, ERROR } from "../events";
import { addDomListener } from "../util/listener";

class Image extends Media {
  constructor(...args) {
    super(...args);
  }

  isSupported() {
    return true;
  }

  create({ src, crossOrigin }) {
    if (!src) {
      return false;
    }

    if (src instanceof HTMLImageElement) {
      if (src.parentNode) {
        src.parentNode.removeChild(src);
        this._originalParent = src.parentNode;
      }
      src = src.getAttribute("src");
    }

    if (typeof src === "string") {
      this._image = render("img", {
        crossOrigin: crossOrigin === true ? "anonymous" : crossOrigin,
        onLoad: () => {
          this._image._renderable = true;
        },
      });
      this._src = src;
    } else {
      return false;
    }
  }

  load() {
    this._events = [
      addDomListener(this._image, LOADED, this.send(LOADED)),
      addDomListener(this._image, ERROR, this.send(ERROR)),
    ];
    this._image.src = this._src;
  }

  unload() {
    for (const off of this._events) {
      off();
    }
  }

  destroy() {
    if (this._originalParent) {
      this._originalParent.appendChild(this._image);
    }
  }

  getTexture() {
    return this._image || null;
  }
}

// Register component and setup src configuration mapping
configure(src => {
  if (!src) {
    return null;
  }

  if (typeof src === "string" || src instanceof HTMLVideoElement) {
    src = [src];
  }

  if (!Array.isArray(src)) {
    return null;
  }

  return src.map(src => {
    if (src instanceof HTMLImageElement) {
      return {
        type: Image,
        options: {
          src,
        },
      };
    }
    // Only parse string src configurations
    if (typeof src !== "string") {
      return src;
    }

    if (/\.(jpe?g|webp|png|gif|bmp)(\?.*)?$/.test(src)) {
      return {
        type: Image,
        options: {
          src,
          crossOrigin: true,
        },
      };
    }
    return src;
  });

}, "src");
register("media:image", Image);
export default Image;
