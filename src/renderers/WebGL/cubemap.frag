/* spec: webgl */
precision mediump float;

varying vec3 frag_xyz;
uniform samplerCube media;

void main()
{
  gl_FragColor = textureCube(media, frag_xyz);
}
