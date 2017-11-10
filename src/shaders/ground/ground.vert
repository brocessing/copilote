varying float vFall;
varying vec2 vUv;
varying vec3 vPos;

void main() {
  vec4 wpos = modelMatrix * vec4( position, 1.0 );
  vec3 cpos = cameraPosition.xyz;

  vUv = uv;
  vPos = wpos.xyz;

  // float attenuate = 0.0005;
  // float spread = 20.;

  // float dx = wpos.x - cpos.x;
  // float dz = wpos.z - cpos.z;
  // float p = (dx * dx + dz * dz);

  // float distz = max(0., abs(attenuate - p) - spread);
  // wpos.y -= distz * distz * attenuate;


  vFall = 0.05 + wpos.y;

  gl_Position = projectionMatrix * viewMatrix * wpos;
}