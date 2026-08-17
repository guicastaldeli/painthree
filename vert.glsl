#version 300 es

in vec3 aPos;
in vec2 aTexCoord;

uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uModelMatrix;
uniform bool uIsHud;
uniform vec2 uHudScale;

out vec2 vTexCoord;

void main() {
    vTexCoord = aTexCoord;
    if(uIsHud) {
        gl_Position = vec4(aPos.xy * uHudScale, 0.0, 1.0);
    } else {
        gl_Position = uProjectionMatrix* uViewMatrix * uModelMatrix* vec4(aPos, 1.0);
    }
}