precision highp float;

uniform sampler2D tDiffuse;
uniform vec2 range;
uniform vec3 col;

varying vec2 vUv;

void main(void) {
  if(vUv.x < range.x || vUv.x > range.y) {
    discard;
  }

  vec4 texl = texture2D(tDiffuse, vUv);
  if(texl.a <= 0.1) {
    discard;
  }

  vec3 color;

  // 裏側は見せない
  if(gl_FrontFacing == false) {
    color = col * 0.25;
  } else {
    color = col;
  }

  vec3 last = color;

  gl_FragColor = vec4(last, texl.a);
}
