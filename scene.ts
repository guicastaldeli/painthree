import * as index from './index';
import { Buffers } from './data';
import { mat4 } from 'gl-matrix';

function setCamera(gl: WebGL2RenderingContext, buffers: Buffers): void {
    const fov = (45 * Math.PI) / 180;
    const aspect = index.canvas.clientWidth / index.canvas.clientHeight;

    const near = 0.1;
    const far = 100.0;

    const projectionMatrix = mat4.create();
    const modelViewMatrix = mat4.create();

    mat4.perspective(projectionMatrix, fov, aspect, near, far);
    mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);

    const numComponents = 2;
    const type = index.gl.FLOAT;

    const normalize = false;
    const stride = 0;
    const poffset = 0;

    index.gl.bindBuffer(index.gl.ARRAY_BUFFER, buffers.position);
    index.gl.vertexAttribPointer(index.shaderProgram.vertexPosition, numComponents, type, normalize, stride, poffset);
    index.gl.enableVertexAttribArray(index.shaderProgram.attribLocations.vertexPosition);

    index.gl.useProgram(index.shaderProgram.programInfo);

    index.gl.uniformMatrix4fv(index.shaderProgram.uniformLocations.projectionMatrix, false, projectionMatrix);
    index.gl.uniformMatrix4fv(index.shaderProgram.modelViewMatrix, false, modelViewMatrix);

    const offset = 0;
    const vertexCount = 4;
    index.gl.drawArrays(index.gl.TRIANGLE_STRIP, offset, vertexCount);


}

export function render(): void {
    
}