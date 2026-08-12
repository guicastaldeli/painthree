#version 300 es

in vec3 aPos;
in vec3 aColor;

out vec3 vColor;

uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
    gl_Position = uProjectionMatrix* uViewMatrix * vec4(aPos, 1.0);
    vColor = aColor;
}