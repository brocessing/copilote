varying vec3 vPos;
uniform sampler2D texture;

float random (vec2 s, float offset) {
  return fract(sin(dot(mod(s.xy, 50.) + offset,vec2(12.9898,78.233)))*43758.5453123);
}

void main() {
  // if (vFall < 0.) discard;

  vec2 uv = vec2(0, 0);
  uv.x = mod(vPos.x * 0.08, .0625);
  uv.y = mod(vPos.z * 0.08, .0625) + .3125;

  gl_FragColor = texture2D(texture, uv);

  // vec3 sand = vec3(1.000, 0.855, 0.282);

  // vec2 uv = vPos.xz;

  // vec2 px = floor(uv * 50.0);
  // float r1 = random(px, 1000.);

  // float c1 = max(0., step(r1, 0.02)) * 0.4;

  // vec2 px2 = floor(uv * 80.);
  // float r2 = random(px2, 3000.);

  // float c2 = max(0., r2 - 0.6) * 0.5;


  // vec3 color = sand +
  //   vec3(0., -c2 * 0.2, c2 * -0.8) +
  //   vec3(0., -c1 * 0.2, -c1 * 0.6);

  // gl_FragColor = vec4(color, 1.);
}