import Media from "../interfaces/Media";
import { register, configure } from "../register";

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
      const image = document.createElement("img");
      this._image = image;
      if (crossOrigin) {
        image.crossOrigin = crossOrigin === true ? "anonymous" : crossOrigin;
      }
      this._src = src;
      return true;
    }
    return false;
  }

  getTexture() {
    return this._image || null;
  }
}

// Register component and setup src configuration mapping
configure((src, original) => {
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

  if (/\.(jpe?g|webp|png|gif|bmp)$/.test(src)) {
    return {
      type: Image,
      options: {
        src,
        crossOrigin: true,
        loop: original.loop,
      },
    };
  }

  // Do not manipulate if no match found
  return null;
}, "src");
register("media:image", Image);
export default Image;
