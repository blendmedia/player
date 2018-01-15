import common from "./rollup.common.config";
import resolve from "rollup-plugin-node-resolve";

export default Object.assign({}, common, {
  plugins: [
    ...common.plugins,
    resolve({
      jsnext: true,
      module: true,
      main: true,
      browser: true,
      modulesOnly: false,
    }),
  ],
});
