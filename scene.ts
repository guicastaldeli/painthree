import * as index from './index';
import { mat4 } from 'gl-matrix';

function setCamera(gl: WebGL2RenderingContext, buffers: Buffer): void {
    const fov = (45 * Math.PI) / 180;
    const aspect = index.canvas.clientWidth / index.canvas.clientHeight;

    const near = 0.1;
    const far = 100.0;

    const projectionMatrix = mat4.create();
    const viewMatrix = mat4.create();

    mat4.perspective(projectionMatrix, fov, aspect, near, far);
    mat4.translate(viewMatrix, viewMatrix, [-0.0, 0.0, -6.0]);

    const projectionLoc = gl.getUniformLocation(index.shaderProgram!, 'uProjectionMatrix');
    const viewLoc = gl.getUniformLocation(index.shaderProgram!, 'uViewMatrix');

    gl.uniformMatrix4fv(projectionLoc, false, projectionMatrix);
    gl.uniformMatrix4fv(viewLoc, false, viewMatrix);
}

export function render(): void {
    
}