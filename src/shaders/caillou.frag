varying vec3 vPos;
varying vec3 vNorm;

uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;

float random (vec2 s) {
  return fract(sin(dot(s.xy,vec2(12.9898,78.233)))*43758.5453123);
}

void main() {
	vec3 wpos = vPos;
	// vec3 normal = normalize(cross(dFdx(vPos), dFdy(vPos)));
	vec3 normal = vNorm;
	

	vec2 uv = wpos.xz; 
	if(abs(normal.x) > 0.5) uv = wpos.zy;
    if(abs(normal.z) > 0.5) uv = wpos.xy;
	
	vec3 cSand = vec3(1., 0.865, 0.400);
  	vec3 cRock = vec3(0.506, 0.506, 0.443);
	vec3 cRoof = vec3(0.651, 0.651, 0.565) * 0.83;

	vec2 px = floor(uv * 160.0);
	vec2 px2 = floor(uv * 90.0);

	
    float r = random(px);
	float r2 = random(px2);
	float r3 = r * max(sign(r - 0.1), 0.0);

	
	float gradientValue = max(0., 1. - floor(wpos.y * 4.0) * .2) * 0.1;
  float sandValue = max(0., min(1., (1. - floor((wpos.y - 0.01) * 80.0 + 2.0 * r) * .4)));
	float roofValue = min(1., max(0., r * floor(smoothstep(0., 1.0, normal.x) * r2 * 15.) * 1.5))- sandValue;
	float rockValue = max(0., (1.0 - r2 * 0.05) - sandValue - roofValue);
	// vec3(0.08, 0.08, 0.08) * damier + 
	// cSand * sandValue + 
	// cRoof * roofValue + cSand * sandValue + 
	vec3 color = (
    cRock * rockValue + cSand * sandValue + cRoof * roofValue 
    - vec3(0, r * 0.1, r * 0.4) * sandValue * 0.7
    - vec3(0.1, r * 0.3, r * 0.7) * 0.2 * (1. - sandValue)
  );

	gl_FragColor = vec4(color, 1.0 );
	float depth = gl_FragCoord.z / gl_FragCoord.w;
	float fogFactor = smoothstep( fogNear, fogFar, depth );
	gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );
}