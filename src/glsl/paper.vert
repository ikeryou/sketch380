precision highp float;

uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 cameraPosition;
uniform mat3 normalMatrix;
uniform float radOffset;
uniform float rollsOffset;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

uniform float angle;
uniform float progress;

varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vNormal;

mat4 rotationMatrix(vec3 axis, float angle){
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, 0.0,
                oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s, 0.0,
                oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c, 0.0,
                0.0,0.0,0.0,1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle){
    mat4 m = rotationMatrix(axis, angle);
    return (m * vec4(v,1.0)).xyz;
}

void main(void){
  vUv = uv;
  vNormal = normalMatrix * normal;

  float pi = 3.14159265359;
  float finalAngle = angle - 0.0 * 0.13 * sin(progress * 6.0);
  vec3 newPosition = position;

  float rad = 0.075 * radOffset;
  float rolls = 10.0 * rollsOffset;

  newPosition = rotate(newPosition - vec3(-0.5,0.5,0.0),vec3(0.0,0.0,1.0),-finalAngle) + vec3(-0.5,0.5,0.0);

  float offs = (newPosition.x + 0.5) / (sin(finalAngle) + cos(finalAngle));
  float tProgress = clamp((progress - offs * 0.99) / 0.01, 0.0,1.0);

  // vNormal.x = clamp((progress - offs * 0.8) / 0.01, 0.0, 1.0);

  newPosition.z = rad + rad * (1.0 - offs/2.0) * sin(-offs * rolls * pi - 0.5 * pi);
  newPosition.x = -0.5 + rad * (1.0 - offs/2.0) * cos(-offs * rolls * pi + 0.5 * pi);

  newPosition = rotate(newPosition - vec3(-0.5,0.5,0.0),vec3(0.0,0.0,1.0),finalAngle) + vec3(-0.5,0.5,0.0);
  newPosition = rotate(newPosition - vec3(-0.5,0.5,rad),vec3(sin(finalAngle),cos(finalAngle),0.0),-pi*progress*rolls);
  newPosition += vec3(
      -0.5 + progress * cos(finalAngle) * (sin(finalAngle) + cos(finalAngle)),
      0.5 - progress * sin(finalAngle) * (sin(finalAngle) + cos(finalAngle)),
      rad * (1.0 - progress/2.0)
  );
  vec3 finalPosition = mix(newPosition,position,tProgress);

  vec4 mvPosition = modelViewMatrix * vec4(finalPosition, 1.0);
  vViewPosition = mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
