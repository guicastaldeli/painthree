import * as index from './index.js';
import * as data from './data.js';
import { mat4 } from 'gl-matrix';

function setCamera(): void {
    const width = index.canvas.width;
    const height = index.canvas.height;
    
    index.gl.viewport(0, 0, width, height);
    
    const fov = (45 * Math.PI) / 180;
    const aspect = index.canvas.clientWidth / index.canvas.clientHeight;

    const near = 0.1;
    const far = 100.0;

    const projectionMatrix = mat4.create();
    const viewMatrix = mat4.create();

    mat4.perspective(projectionMatrix, fov, aspect, near, far);
    mat4.translate(viewMatrix, viewMatrix, [0.0, 0.0, -6.0]);

    const projectionLoc = index.gl.getUniformLocation(index.shaderProgram!, 'uProjectionMatrix');
    const viewLoc = index.gl.getUniformLocation(index.shaderProgram!, 'uViewMatrix');

    index.gl.uniformMatrix4fv(projectionLoc, false, projectionMatrix);
    index.gl.uniformMatrix4fv(viewLoc, false, viewMatrix);
}

export function render(): void {
    setCamera();
    data.renderMesh(data.MeshType.TRIANGLE);
}