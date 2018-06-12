export default function(type) {
  if (process.env.NODE_ENV === "production") {
    return () => {};
  }

  let time = Date.now();
  return function(string) {
    const dTime = Date.now() - time;
    time = Date.now();
    console.log(`[${type}] ${string} (+${dTime}ms)`);
  };
}
