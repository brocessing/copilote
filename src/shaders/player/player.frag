varying vec2 vUv;
uniform sampler2D texture;
uniform float life;

void main() {
  float offset = max(sign(life), 0.0) * 0.5;

  vec4 cleanCar = texture2D(texture, vUv);
  vec4 badCar = texture2D(texture, vec2(vUv.x + 0.5, vUv.y - offset));
  vec4 dmgMap = texture2D(texture, vec2(vUv.x, vUv.y - 0.5));

  float t = (1. - max(sign(dmgMap.r - life), 0.0));

  gl_FragColor = cleanCar * t + (1. - t) * badCar;
}