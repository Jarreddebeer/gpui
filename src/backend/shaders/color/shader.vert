attribute vec3 position;
attribute vec4 color;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

varying vec4 vColor;

void main(void) {
  gl_Position = projection * view * model * vec4(position, 1);
  vColor = color;
}