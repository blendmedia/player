import Media from "../interfaces/Media";
import { register, registerMedia } from "../register";
import { render } from "../util/dom";
import { LOADED, ERROR } from "../events";
import { addDomListener } from "../util/listener";

class ImageCubemap extends Media {
  constructor(...args) {
    super(...args);
    this.handleLoaded = this.handleLoaded.bind(this);
  }

  isSupported() {
    return true;
  }

  handleLoaded(e) {
    this._loaded++;
    if (this._loaded === 6) {
      this.emit(LOADED, e);
    }
  }

  create(opts) {
    super.create(opts);
    const { src } = opts;
    this._images = {
      top: null,
      down: null,
      left: null,
      right: null,
      front: null,
      back: null,
    };
    this._loaded = 0;
    for (const key of Object.keys(this._images)) {
      this._images[key] = render("img", {
        crossOrigin: "anonymous",
        onLoad: () => {
          this._images[key]._renderable = true;
        },
      });
    }
    this._src = src;
  }

  load() {
    this._events = [];
    for (const [face, img] of Object.entries(this._images)) {
      img.src = this._src[face];
      this._events.push(
        addDomListener(img, LOADED, this.handleLoaded),
        addDomListener(img, ERROR, this.send(ERROR)),
      );
    }
  }

  unload() {
    for (const off of this._events) {
      off();
    }
  }

  getTexture() {
    return this._images || null;
  }
}

// Register component and setup src configuration mapping
registerMedia(
  src => {
    if (
      src.top &&
      src.down &&
      src.left &&
      src.right &&
      src.front &&
      src.back
    ) {
      return { projection: "cubemap" };
    }
    return false;
  },
  ImageCubemap, {
    crossOrigin: true,
  },
  ["fov", "stereo"]
);
register("media:image-cubemap", ImageCubemap);
export default ImageCubemap;
