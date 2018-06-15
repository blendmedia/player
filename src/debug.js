export default function(type) {
  if (process.env.NODE_ENV === "production") {
    return () => {};
  }

  let time = Date.now();
  return function(string, ...vars) {
    const dTime = Date.now() - time;
    time = Date.now();
    let count = 0;
    string = string.split("%s").reduce((str, part) => {
      return str + part + (vars[count++] || "");
    }, "");
    console.log(`[${type}] ${string} (+${dTime}ms)`);
  };
}
