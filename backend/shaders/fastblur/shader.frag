precision mediump float;

varying vec4 vColor;
varying vec2 vUv;
uniform sampler2D uvSampler;
uniform float opacity;

vec4 blur5(sampler2D image, vec2 uv, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.3333333333333333) * direction;
  color += texture2D(image, uv) * 0.29411764705882354;
  color += texture2D(image, uv + (off1 / 512.0)) * 0.35294117647058826;
  color += texture2D(image, uv - (off1 / 512.0)) * 0.35294117647058826;
  return color; 
}

void main(void) {
  vec4 col1 = blur5(uvSampler, vUv, vec2(0.0, -1.0));
  vec4 col2 = blur5(uvSampler, vUv, vec2(1.0,  0.0));
  vec4 col3 = blur5(uvSampler, vUv, vec2(0.0,  1.0));
  vec4 col4 = blur5(uvSampler, vUv, vec2(-1.0, 0.0));
  gl_FragColor = (col1 + col2 + col3 + col4) / 4.0;
  //gl_FragColor = texture2D(uvSampler, vUv);
}