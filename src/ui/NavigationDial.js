import { register } from "../register";
import UI from "../interfaces/UI";
import { render, remove } from "../util/dom";
import { round, degToRad } from "../util/math";
import { LOOK_AT } from "../events";

class NavigationDial extends UI {
  isSupported() {
    return true;
  }

  mount(container) {
    container.appendChild(this._root);
  }

  unmount() {
    remove(this._root);
  }

  create(options) {
    super.create(options);
    this._root = render("div", {
      className: "fuse-player-dial",
      onClick: () => {
        this.emit(LOOK_AT, {
          x: 0,
          y: 0,
        });
      },
    }, [
      this._fovDisplay = render("svg", {
        className: "fuse-player-dial-fov",
        height: 200,
        width: 200,
        viewBox: "0 0 200 200",
        xmlns: "http://www.w3.org/2000/svg",
        fill: "#FFF",
      }),
    ]);
  }

  _drawSVG() {
    const radius = this._fovDisplay.getAttribute("width") / 2;
    const angle = this._hFov;
    const rad = degToRad(this._hFov);
    const x = -Math.sin(rad) * radius;
    const y = -Math.cos(rad) * radius;
    const large = angle > 180 ? 1 : 0;
    const path = [
      `M ${radius} ${radius}`,
      `L ${radius} 0`,
      `A ${radius} ${radius} 0 ${large} ${large} ${radius+x} ${radius+y}`,
      `L ${radius} ${radius}`,
    ];
    this._fovDisplay.innerHTML = (
      `<g transform="
        translate(${radius}, ${radius})
        rotate(${angle/2})
        translate(-${radius}, -${radius})">
        <path d="${path.join(" ")}" />
      </g>`
    );
  }

  update() {
    const { width, height } = this.$player.size();
    const horizontalFov = this.$config("verticalFov") * (width / height);
    if (horizontalFov !== this._hFov) {
      this._hFov = horizontalFov;
      this._drawSVG();
    }
    const { y } = this.$player._rotation || { y: 0 };
    this._root.style.transform = `rotate(${round(-y, 4)}deg)`;
  }
}

NavigationDial.defaultConfig = {
  verticalFov: 45,
};

register("ui:dial", NavigationDial);
export default NavigationDial;
