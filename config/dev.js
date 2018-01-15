import common from "./common";
import resolve from "rollup-plugin-node-resolve";

export default Object.assign({}, common, {
  plugins: [
    resolve({
      jsnext: true,
      module: true,
      main: true,
      browser: true,
      modulesOnly: false,
    }),
    ...common.plugins,
  ],
});
