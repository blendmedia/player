/* spec: webgl */
precision mediump float;

varying vec2 fragTexCoord;
uniform sampler2D media;

void main()
{
  gl_FragColor = texture2D(media, fragTexCoord);
}
