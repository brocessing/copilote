varying vec3 vPos;
varying vec3 vNorm;

void main() {
	vPos = (modelMatrix * vec4( position, 1.0 )).xyz;
	vNorm = normal;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
