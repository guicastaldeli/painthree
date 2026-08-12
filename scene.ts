import * as index from './index.js';
import * as data from './data.js';
import { mat4 } from 'gl-matrix';

/**
 * 
 * Camera
 * 
 */
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

/**
 * 
 * Render
 * 
 */
let angle = 0;
export function render(): void {
    angle += 0.01;
    setCamera();

    const pyramid = data.MeshType.CUBE;
    data.setMeshColor(pyramid, [0.2, 0.8, 1.0]);
    data.setMeshRotation(pyramid, 0, angle, 0);
    data.setMeshPosition(pyramid, 0.8, 0.5, 0);
    data.renderMesh(pyramid);
}