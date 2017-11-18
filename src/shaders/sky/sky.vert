varying vec2 vUv;
varying float vX;

void main() {
  vUv = uv;
  vX = position.x;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
