varying vec2 vUv;
// varying vec3 vPos;
varying float vFall;
uniform sampler2D texture;

void main() {
  if (vFall < -0.4) discard;
  gl_FragColor = texture2D(texture, vUv);
}