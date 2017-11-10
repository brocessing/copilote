varying float vFall;
varying vec2 vUv;
varying vec3 vPos;
uniform sampler2D texture;

void main() {
  if (vFall < -0.3) discard;
  gl_FragColor = texture2D(texture, vUv);
  // gl_FragColor = vec4(vPos.x, vPos.y, vPos.z, 1.);
  
}