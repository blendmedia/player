import { register } from "../register";
import Controller from "../interfaces/Controller";
import { create as vec3, rotateY } from "gl-matrix/vec3";
import { degToRad } from "../util/math";

class Pointer extends Controller {

  apply(rotation) {
    rotateY(rotation, rotation, vec3(), degToRad(0.25));
  }
}

register("controls:pointer", Pointer);
export default Pointer;
