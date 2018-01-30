export const IS_IOS = (
  /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
);


// Run WebVR polyfill if it exists
if (window.WebVRPolyfill) {
  new window.WebVRPolyfill();
}

// WebVR Detection
let _vrDisplay = null;
export function hmd() {
  return _vrDisplay;
}

if (navigator.getVRDisplays) {
  navigator.getVRDisplays().then(function([display]) {
    _vrDisplay = display ? display : null;
  }).catch(function() {
    // Ignore
  });
}

export function inVR() {
  const headset = hmd();
  return headset && headset.isPresenting;
}
