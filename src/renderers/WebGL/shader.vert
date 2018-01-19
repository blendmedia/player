/* spec: webgl */
precision mediump float;

attribute vec3 vertPosition;
attribute vec2 vertTexCoord;
varying vec2 fragTexCoord;
uniform mat4 mvp;
uniform float time;

void main()
{
  float r = sin(time + vertPosition[1] - vertPosition[0]);
  float g = cos(time + vertPosition[0] - vertPosition[1]);
  float b = sin(time + vertPosition[0] - vertPosition[1]);
  float x = vertPosition[0] * 2.0 + r * 0.1;
  float y = vertPosition[1] + g * 0.1;
  float z = vertPosition[2] + b * 0.1;

  float u = vertPosition[0] * 0.5 + 0.5;
  float v = 1.0 - (vertPosition[1] * 0.5 + 0.5);
  fragTexCoord = vec2(u, v);
  gl_Position = vec4(x, y, z, 1.0) * mvp;
}
