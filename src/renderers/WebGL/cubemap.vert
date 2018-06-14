/* spec: webgl */

attribute vec3 xyz;
attribute vec2 uv;
varying vec3 frag_xyz;
uniform mat4 mvp;
uniform float time;

void main()
{
  vec3 normalized = xyz / 5000.0;
  frag_xyz = normalized * vec3(-1.0, 1.0, -1.0);
  gl_Position = vec4(uv, 1, 1);
  gl_Position = vec4(xyz, 1.0) * mvp;
}
