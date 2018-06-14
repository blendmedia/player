/* spec: webgl */

attribute vec3 xyz;
attribute vec2 uv;
varying vec2 frag_uv;
uniform mat4 mvp;
uniform float time;

void main()
{
  frag_uv = uv;
  gl_Position = vec4(xyz, 1.0) * mvp;
}
