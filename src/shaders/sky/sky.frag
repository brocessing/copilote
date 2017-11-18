uniform sampler2D texture;
uniform float angle;

varying float vX;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  uv.x = mod(uv.x * 3. + -angle * 2.1, 1.);
  float ny = uv.y - 0.1;
  uv.y = mod(ny, 1.);

  uv.y -= abs(cos(vX)) * 0.15 - 0.15;

  gl_FragColor = texture2D(texture, uv);
  if (ny > 1.0 || ny < 0.0) gl_FragColor = vec4(0.549, 0.820, 0.612, 1.);
  // gl_FragColor = vec4(vUv.x, vUv.y, 0., 1.);
}