uniform sampler2D tDiffuse;

varying vec2 vUv;


void main(void) {

  vec4 dest = texture2D(tDiffuse, vUv);
  if(dest.a <= 0.12) {
    discard;
  }

  gl_FragColor = dest;

}
