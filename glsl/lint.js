const child_process = require("child_process");
const { promisify } = require("util");
const path = require("path");
const glob = require("glob");
const SRC_DIR = path.resolve(__dirname, "../src/");

// Promise functions
const execFile = promisify(child_process.execFile);

let exe = "./bin/essl_to_glsl_";
switch (process.platform) {
  case "darwin":
    exe += "osx";
    break;
  case "linux":
    exe += "linux";
    break;
  case "win32":
    exe += "_win.exe";
    break;
}
exe = path.resolve(__dirname, exe);

glob("**/*.@(frag|vert)", {
  cwd: SRC_DIR,
}, async function (err, files) {
  if (err) {
    console.error("Could not glob for shader files");
    return;
  }

  let finalCode = 0;
  for (const file of files) {
    console.log("Processing", file);
    const fullpath = path.resolve(SRC_DIR, file);
    try {
      const { stdout } = await execFile(exe, [fullpath]);
      console.log(stdout);
    } catch (e) {
      console.warn("Failed with code", e.code);
      console.warn(e.stdout);
      finalCode = 1;
    }
  }

  process.exit(finalCode);
});
