#version 300 es

in vec3 aPos;

uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uModelMatrix;

void main() {
    gl_Position = uProjectionMatrix* uViewMatrix * uModelMatrix* vec4(aPos, 1.0);
}