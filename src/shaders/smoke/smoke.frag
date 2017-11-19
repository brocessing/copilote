varying float vY;
varying float vLife;
varying float vType;
varying vec2 vRotation;

uniform sampler2D texture;

void main() {
  if (vLife <= 0. || vY < 0.) discard;

  float mid = 0.5;
  vec2 rotated = vec2(
    vRotation.x * (gl_PointCoord.x - mid) + vRotation.y * (gl_PointCoord.y - mid) + mid,
    vRotation.x * (gl_PointCoord.y - mid) - vRotation.y * (gl_PointCoord.x - mid) + mid
  );

  vec4 color = texture2D(texture, rotated);

  if (color.r == 1. && color.g == 0.) discard;
  if (vType == 0.) {
    color.r = color.r + (1. - color.r) * 0.9;
    color.g = color.g + (1. - color.g) * 0.4;
    color.b = color.b - (1. - color.b) * 0.7;
  }
  if (vType == 1.) {
    float life = (1. - vLife) * 0.1;
    color = vec4(color.rgb - life, 1.0);
  }
  if (vType == 2.) {
    float life = max(0., (vLife + 0.03) * 2. - 1.);
    float life2 = max(0., (vLife + 0.03) * 4. - 3.);
    color.r = color.r + (1. - color.r) * (life);
    color.g = color.g + (1. - color.g) * (life2);
  }
  if (vType == 3.) {
    color = vec4(color.rgb * 0.7, 1.0);
  }
  if (vType == 4.) {
    color = vec4(color.rgb + 0.4, 0.8);
  }
  gl_FragColor = color;
}