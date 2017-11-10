uniform sampler2D texture;
uniform float angle;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  uv.x = mod(uv.x * 3. + -angle * 2.1, 1.);
  uv.y = mod(uv.y - 0.12, 1.);
  gl_FragColor = texture2D(texture, uv);
  // gl_FragColor = vec4(vUv.x, vUv.y, 0., 1.);
}