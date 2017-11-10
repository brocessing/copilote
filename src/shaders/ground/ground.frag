varying vec3 vPos;
varying float vFall;
float random (vec2 s) {
  return fract(sin(dot(s.xy,vec2(12.9898,78.233)))*43758.5453123);
}

void main() {
  // if (vFall < 0.) discard;
  vec3 sand = vec3(1.000, 0.855, 0.282);

  vec2 uv = vPos.xz;

  vec2 px = floor(uv * 50.0);
  float r1 = random(px);

  float c1 = max(0., step(r1, 0.02)) * 0.2;

  vec2 px2 = floor(uv * 80.);
  float r2 = random(px2);

  float c2 = max(0., r2 - 0.6) * 0.3;


  vec3 color = sand +
    vec3(0., -c2 * 0.2, c2 * -0.8) +
    vec3(0., -c1 * 0.2, -c1 * 0.6);

  gl_FragColor = vec4(color, 1.);
}