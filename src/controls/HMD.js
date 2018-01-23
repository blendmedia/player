import { register } from "../register";
import Controller from "../interfaces/Controller";

class HMD extends Controller {
  isSupported() {
    return !!navigator.getVRDisplays;
  }
}

register("controls:hmd", HMD);
register("controls:vr", HMD);
export default HMD;
