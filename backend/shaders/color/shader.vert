attribute vec3 position;
attribute vec4 color;

uniform vec3 scalePivot;
uniform vec3 rotatePivot;

uniform vec3 scaleVector;
uniform vec3 rotateVector;
uniform vec3 translateVector;

uniform mat4 view;
uniform mat4 projection;

varying vec4 vColor;

void main(void) {
  
  vec3 pos_scale_pivot_relative = position - scalePivot;
  vec3 pos_scaled = scaleVector * pos_scale_pivot_relative + scalePivot;
  
  vec3 pos_rot_pivot_relative = pos_scaled - rotatePivot;
  vec3 pos_scaled_rotated = rotateVector * pos_rot_pivot_relative + rotatePivot;

  gl_Position = projection * view * vec4(translateVector + pos_scaled_rotated, 1);
  vColor = color;
}