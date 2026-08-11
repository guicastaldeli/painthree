attribute vec4 aPos;

uniform mat4 uModel;
uniform mat4 uProjectionMatrix;

void main() {
    gl_Position = uProjectionMatrix* uModel * aPos;
}