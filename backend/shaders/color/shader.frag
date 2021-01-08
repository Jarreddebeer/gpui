precision mediump float;

varying vec4 vColor;
uniform float opacity;

void main(void) {
  gl_FragColor = vec4(vColor.rgb, opacity);
}