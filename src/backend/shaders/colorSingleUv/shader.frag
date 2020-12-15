precision mediump float;

varying vec4 vColor;
varying vec2 vUv;
uniform sampler2D uvSampler;
uniform float opacity;

void main(void) {
  vec4 sample = texture2D(uvSampler, vUv).rgba;
  //gl_FragColor = vec4(vColor.rgb * sample.rgb, opacity * sample.a);
  gl_FragColor = vec4(sample.rgb, sample.a);
}