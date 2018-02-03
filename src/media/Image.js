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
      this._image = src;
      this._src = this._image.getAttribute("src");
    } else if (typeof src === "string") {
      this._image = render("img", {
        crossOrigin: crossOrigin === true ? "anonymous" : crossOrigin,
      });
      this._src = src;
    } else {
      return false;
    }

    addDomListener(this._image, LOADED, this.send(LOADED));
    addDomListener(this._image, ERROR, this.send(ERROR));

    // Retrigger events
    this._image.src = this._src;
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
    return null;
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

  // Do not manipulate if no match found
  return null;
}, "src");
register("media:image", Image);
export default Image;
