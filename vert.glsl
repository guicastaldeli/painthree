#version 300 es

in vec3 aPos;
in vec2 aTexCoord;
in vec3 aNormal;

uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uModelMatrix;
uniform bool uIsHud;
uniform vec2 uHudScale;

out vec2 vTexCoord;

out vec3 vNormal;
out vec3 vFragPos;

void main() {
    vTexCoord = aTexCoord;
    if(uIsHud) {
        gl_Position = vec4(aPos.xy * uHudScale, 0.0, 1.0);
    } else {
        vNormal = mat3(transpose(inverse(uModelMatrix))) * aNormal;

        vec4 worldPos = uModelMatrix * vec4(aPos, 1.0);
        vFragPos = worldPos.xyz;
        gl_Position = uProjectionMatrix* uViewMatrix * worldPos;
    }
}