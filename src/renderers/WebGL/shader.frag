/* spec: webgl */
precision mediump float;

varying vec2 frag_uv;
uniform sampler2D media;

void main()
{
  gl_FragColor = texture2D(media, frag_uv);
}
