export const vert = `
attribute vec3 position;
attribute vec4 color;
attribute vec2 uv;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

varying vec4 vColor;
varying vec2 vUv;

void main(void) {
  gl_Position = projection * view * model * vec4(position, 1);
  vColor = color;
  vUv = uv;
}
`;

export const frag = `
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
`;