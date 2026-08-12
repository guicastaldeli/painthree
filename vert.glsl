attribute vec4 aPos;

uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
    gl_Position = uProjectionMatrix* uViewMatrix * aPos;
}