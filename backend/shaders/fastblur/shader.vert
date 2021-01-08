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