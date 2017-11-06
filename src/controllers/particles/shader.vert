attribute float life;
attribute vec3 bornData;

varying float vY;
varying float vLife;
varying float vType;
varying vec2 vRotation;

#pragma glslify: when_eq = require(glsl-conditionals/when_eq)

void main() {
  vType = bornData.x;
  vLife = life;
  vY = (modelMatrix * vec4(position, 1.0)).y;

  float l = vLife * bornData.z;
  float scale = (
    when_eq(vType, 0.) * 2. * (1. - (max(0.05, abs(vLife - 0.5)) - 0.05) / 0.45) + 0.2
    + when_eq(vType, 1.) * 1. * (1. - (max(0.1, abs(vLife - 0.5)) - 0.1) / 0.4)
    + when_eq(vType, 2.) * 2.0 * vLife
    + when_eq(vType, 3.) * 0.5 * vLife
    + when_eq(vType, 4.) * 0.6 * (1. - (max(0.05, abs(vLife - 0.5)) - 0.05) / 0.45) + 0.2
  );

  if (vLife > 0.) {
    vRotation = vec2( cos(l + bornData.z), sin(l + bornData.z) );
  }

  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_PointSize = scale * ( 100.0 / -mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;
}