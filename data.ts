import * as index from "./index.js";
import { mat4, vec3 } from "gl-matrix";

/**
 * 
 * Buffers
 * 
 */
export interface Buffer {
    vao: WebGLVertexArrayObject;
    indexCount: number;
    data: MeshData;
    modelMatrix: mat4;

    rotation: vec3; 
    position: vec3;
    scale: vec3; 
    color: vec3;
    
    positionBuffer: WebGLBuffer;
    indexBuffer: WebGLBuffer;
    colorBuffer?: WebGLBuffer;
    normalBuffer?: WebGLBuffer;
}

interface AttributeConfig {
    name: string;
    size: number;
    data: Float32Array | undefined;
}

/**
 * 
 * Mesh
 * 
 */
const meshCache: Map<MeshType, Buffer> = new Map();

export enum MeshType {
    TRIANGLE,
    SQUARE,
    QUAD,
    PYRAMID,
    CUBE
}

export interface MeshData {
    vertices: Float32Array;
    indices: Uint16Array | Uint32Array;
    colors?: Float32Array;
    normals?: Float32Array;
    minBounds: [number, number, number];
    maxBounds: [number, number, number];
}

export const MeshData: Record<MeshType, MeshData> = {
    // Triangle
    [MeshType.TRIANGLE]: {
        vertices: new Float32Array([
            -0.5, -0.5, 0.0,
            0.5, -0.5, 0.0,
            0.0, 0.5, 0.0
        ]),
        indices: new Uint16Array([
            0, 1, 2
        ]),
        colors: new Float32Array([
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
        ]),
        minBounds: [
            -0.5, -0.5, 0.0
        ],
        maxBounds: [
            0.5, 0.5, 0.0
        ]
    },
    // Square
    [MeshType.SQUARE]: {
        vertices: new Float32Array([
            -0.5, -0.5, 0.0,
            0.5, -0.5, 0.0,
            0.5, 0.5, 0.0,
            -0.5, 0.5, 0.0
        ]),
        indices: new Uint16Array([
            0, 1, 2,
            0, 2, 3
        ]),
        colors: new Float32Array([
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0,
            1.0, 1.0, 0.0
        ]),
        minBounds: [
            -0.5, -0.5, 0.0
        ],
        maxBounds: [
            0.5, 0.5, 0.0
        ]
    },
    // Quad
    [MeshType.QUAD]: {
        vertices: new Float32Array([
            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0,
            1.0, 1.0, 0.0,
            -1.0, 1.0, 0.0
        ]),
        indices: new Uint16Array([
            0, 1, 2,
            0, 2, 3
        ]),
        minBounds: [
            -1.0, -1.0, 0.0
        ],
        maxBounds: [
            1.0, 1.0, 0.0
        ]
    },
    [MeshType.PYRAMID]: {
        vertices: new Float32Array([
            -0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            0.0, 0.5, 0.0,
            
            0.5, -0.5, 0.5,
            0.5, -0.5, -0.5,
            0.0, 0.5, 0.0,
            
            0.5, -0.5, -0.5,
            -0.5, -0.5, -0.5,
            0.0, 0.5, 0.0,
            
            -0.5, -0.5, -0.5,
            -0.5, -0.5, 0.5,
            0.0, 0.5, 0.0,
            
            -0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            0.5, -0.5, -0.5,
            -0.5, -0.5, -0.5
        ]),
        indices: new Uint16Array([
            0, 1, 2,
            3, 4, 5,
            6, 7, 8,
            9, 10, 11,
            12, 13, 14, 12, 14, 15
        ]),
        colors: new Float32Array([
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,

            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,

            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,

            1.0, 1.0, 0.0,
            1.0, 1.0, 0.0,
            1.0, 1.0, 0.0,

            0.5, 0.0, 0.5,
            0.5, 0.0, 0.5,
            0.5, 0.0, 0.5,
            0.5, 0.0, 0.5
        ]),
        minBounds: [
            -0.5, -0.5, -0.5
        ],
        maxBounds: [
            0.5, 0.5, 0.5
        ]
    },
    [MeshType.CUBE]: {
        vertices: new Float32Array([
            -0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            0.5, 0.5, 0.5,
            -0.5, 0.5, 0.5,

            -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5,
            0.5, 0.5, -0.5,
            -0.5, 0.5, -0.5,

            -0.5, 0.5, 0.5,
            0.5, 0.5, 0.5,
            0.5, 0.5, -0.5,
            -0.5, 0.5, -0.5,

            -0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            0.5, -0.5, -0.5,
            -0.5, -0.5, -0.5,

            0.5, -0.5, 0.5,
            0.5, -0.5, -0.5,
            0.5, 0.5, -0.5,
            0.5, 0.5, 0.5,

            -0.5, -0.5, 0.5,
            -0.5, -0.5, -0.5,
            -0.5, 0.5, -0.5,
            -0.5, 0.5, 0.5 
        ]),
        indices: new Uint16Array([
            0, 1, 2, 0, 2, 3,
            4, 5, 6, 4, 6, 7,
            8, 9, 10, 8, 10, 11,
            12, 13, 14, 12, 14, 15,
            16, 17, 18, 16, 18, 19,
            20, 21, 22, 20, 22, 23
        ]),
        colors: new Float32Array([
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,

            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,

            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,

            1.0, 1.0, 0.0,
            1.0, 1.0, 0.0,
            1.0, 1.0, 0.0,
            1.0, 1.0, 0.0,

            0.5, 0.0, 0.5,
            0.5, 0.0, 0.5,
            0.5, 0.0, 0.5,
            0.5, 0.0, 0.5,

            1.0, 0.5, 0.0,
            1.0, 0.5, 0.0,
            1.0, 0.5, 0.0,
            1.0, 0.5, 0.0
        ]),
        minBounds: [
            -0.5, -0.5, -0.5
        ],
        maxBounds: [
            0.5, 0.5, 0.5
        ]
    }
};

// Get Mesh
export function getMeshData(type: MeshType): MeshData {
    const val = MeshData[type];
    return val;
}

export function getMesh(type: MeshType): Buffer {
    let mesh = meshCache.get(type);
    if(!mesh) {
        const data = getMeshData(type);
        mesh = createMesh(data);
        meshCache.set(type, mesh);
    }
    return mesh;
}

// Set Mesh Roation
export function setMeshRotation(meshType: MeshType, x: number, y: number, z: number): MeshType {
    const mesh = getMesh(meshType);
    vec3.set(mesh.rotation, x, y, z);
    
    updateModelMatrix(mesh);

    return meshType;
}

// Set Mesh Position
export function setMeshPosition(meshType: MeshType, x: number, y: number, z: number): MeshType {
    const mesh = getMesh(meshType);
    vec3.set(mesh.position, x, y, z);

    updateModelMatrix(mesh);

    return meshType;
}

// Set Mesh Scale
export function setMeshScale(meshType: MeshType, x: number, y: number, z: number): MeshType {
    const mesh = getMesh(meshType);
    vec3.set(mesh.scale, x, y, z);

    updateModelMatrix(mesh);

    return meshType;
}

// Set Mesh Color
export function setMeshColor(meshType: MeshType, color: vec3): MeshType {
    const mesh = getMesh(meshType);
    vec3.copy(mesh.color, color);

    if(!mesh.colorBuffer) {
        const buffer = index.gl.createBuffer();
        if(!buffer) throw new Error('Failed to create color buffer');
        mesh.colorBuffer = buffer;
    }

    const vertexCount = mesh.data.vertices.length / 3;
    const colors = new Float32Array(vertexCount * 3);
    for(let i = 0; i < vertexCount; i++) {
        colors[i*3] = mesh.color[0];
        colors[i*3+1] = mesh.color[1];
        colors[i*3+2] = mesh.color[2];
    }
    
    index.gl.bindBuffer(index.gl.ARRAY_BUFFER, mesh.colorBuffer);
    index.gl.bufferData(index.gl.ARRAY_BUFFER, colors, index.gl.STATIC_DRAW);

    const loc = index.gl.getAttribLocation(index.shaderProgram!, 'aColor');
    if(loc !== -1) {
        index.gl.enableVertexAttribArray(loc);
        index.gl.vertexAttribPointer(loc, 3, index.gl.FLOAT, false, 0, 0);
    }

    index.gl.bindBuffer(index.gl.ARRAY_BUFFER, null);

    return meshType;
}

// Create Mesh
function createMesh(data: MeshData): Buffer {
    const vao = index.gl.createVertexArray();
    if(!vao) throw new Error('Failed to create VAO');
    index.gl.bindVertexArray(vao);

    function setupAttribute(name: string, size: number, data: Float32Array | undefined): WebGLBuffer | undefined {
        if(!data || data.length === 0) return undefined;

        const buffer = index.gl.createBuffer();
        if(!buffer) throw new Error(`Failed to create buffer for ${name}`);

        index.gl.bindBuffer(index.gl.ARRAY_BUFFER, buffer);
        index.gl.bufferData(index.gl.ARRAY_BUFFER, data, index.gl.STATIC_DRAW);

        const loc = index.gl.getAttribLocation(index.shaderProgram!, name);
        if(loc !== -1) {
            index.gl.enableVertexAttribArray(loc);
            index.gl.vertexAttribPointer(loc, size, index.gl.FLOAT, false, 0, 0);
        }

        return buffer;
    }

    const positionBuffer = setupAttribute('aPos', 3, data.vertices);
    const colorBuffer = setupAttribute('aColor', 3, data.colors);

    const indexBuffer = index.gl.createBuffer();
    if(!indexBuffer) throw new Error('Failed to create index buffer');

    index.gl.bindBuffer(index.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    index.gl.bufferData(index.gl.ELEMENT_ARRAY_BUFFER, data.indices, index.gl.STATIC_DRAW);

    index.gl.bindVertexArray(null);
    index.gl.bindBuffer(index.gl.ARRAY_BUFFER, null);
    index.gl.bindBuffer(index.gl.ELEMENT_ARRAY_BUFFER, null);

    return {
        vao,
        positionBuffer: positionBuffer!,
        indexBuffer,
        colorBuffer,
        //normalBuffer,
        indexCount: data.indices.length,
        data,
        modelMatrix: mat4.create(),
        rotation: vec3.create(),
        position: vec3.create(),
        scale: vec3.fromValues(1, 1, 1),
        color: vec3.fromValues(1, 1, 1)
    };
}

// Update Model Matrix
function updateModelMatrix(mesh: Buffer): void {
    const modelMatrix = mat4.create();

    mat4.translate(modelMatrix, modelMatrix, mesh.position);

    mat4.rotateX(modelMatrix, modelMatrix, mesh.rotation[0]);
    mat4.rotateY(modelMatrix, modelMatrix, mesh.rotation[1]);
    mat4.rotateZ(modelMatrix, modelMatrix, mesh.rotation[2]);

    mat4.scale(modelMatrix, modelMatrix, mesh.scale);

    mesh.modelMatrix = modelMatrix;
}

// Render
export function renderMesh(meshType: MeshType): void {
    if(!index.shaderProgram) {
        console.error('Shader program not initialized');
        return;
    }

    const mesh = getMesh(meshType);

    index.gl.useProgram(index.shaderProgram);

    const modelMatrix = index.gl.getUniformLocation(index.shaderProgram, 'uModelMatrix');
    index.gl.uniformMatrix4fv(modelMatrix, false, mesh.modelMatrix);

    index.gl.bindVertexArray(mesh.vao);
    index.gl.drawElements(index.gl.TRIANGLES, mesh.indexCount, index.gl.UNSIGNED_SHORT, 0);
    
    index.gl.bindVertexArray(null);
}

/**
 * 
 * Camera
 * 
 */
export interface Camera {
    position: vec3;
    front: vec3;
    up: vec3;
    right: vec3;
    worldUp: vec3;

    yaw: number;
    pitch: number;

    fov: number;
    near: number;
    far: number;
    aspect: number;

    viewMatrix: mat4;
    projectionMatrix: mat4;
}

let cameraInstance: Camera | null = null;

// Get Camera
export function getCamera(): Camera {
    if(!cameraInstance) throw new Error('Camera not initialized. Call setCamera() first.');
    return cameraInstance;
}

// Get Camera Position
export function getCameraPosition(): vec3 {
    const camera = getCamera();
    const val = camera.position;
    return val;
}

// Set Camera Position
export function setCameraPosition(x: number, y: number, z: number): void {
    const camera = getCamera();
    vec3.set(camera.position, x, y, z);
}

// Set Camera
export function setCamera(position: [number, number, number] = [0, 0, 0]): Camera {
    const pos = vec3.fromValues(position[0], position[1], position[2]);
    const fov = 90;
    const yaw = -90;
    const pitch = 0;
    const near = 0.1;
    const far = 100.0;
    const front = vec3.fromValues(0, 0, -1);
    const up = vec3.fromValues(0, 1, 0);
    const worldUp = vec3.fromValues(0, 1, 0);
    const right = vec3.create();
    const aspect = index.canvas.width / index.canvas.height;
    const viewMatrix = mat4.create();
    const projectionMatrix = mat4.create();
    vec3.cross(right, front, up);

    const camera: Camera = {
        position: pos,
        front: front,
        up: up,
        right: right,
        worldUp: worldUp,
        yaw: yaw,
        pitch: pitch,
        fov: fov * Math.PI / 180,
        near: near,
        far: far,
        aspect: aspect,
        viewMatrix: viewMatrix,
        projectionMatrix: projectionMatrix
    };

    cameraInstance = camera;
    return camera;
}

// Update Camera 
export function updateCameraVectors(): void {
    const camera = getCamera();

    const front = vec3.create();
    front[0] = Math.cos(camera.yaw * Math.PI / 180) * Math.cos(camera.pitch * Math.PI / 180);
    front[1] = Math.sin(camera.pitch * Math.PI / 180);
    front[2] = Math.sin(camera.yaw * Math.PI / 180) * Math.cos(camera.pitch * Math.PI / 180);
    
    vec3.normalize(camera.front, front);
    vec3.cross(camera.right, camera.front, camera.worldUp);
    vec3.cross(camera.up, camera.right, camera.front);
    vec3.normalize(camera.up, camera.up);
}

// Update Camera Matrices
export function updateCameraMatrices(): void {
    const camera = getCamera();

    camera.aspect = index.canvas.width / index.canvas.height;
    
    const target = vec3.create();
    vec3.add(target, camera.position, camera.front);
    mat4.lookAt(camera.viewMatrix, camera.position, target, camera.up);
    
    mat4.perspective(camera.projectionMatrix, camera.fov, camera.aspect, camera.near, camera.far);
    
    const viewLoc = index.gl.getUniformLocation(index.shaderProgram!, 'uViewMatrix');
    const projLoc = index.gl.getUniformLocation(index.shaderProgram!, 'uProjectionMatrix');
    
    index.gl.uniformMatrix4fv(viewLoc, false, camera.viewMatrix);
    index.gl.uniformMatrix4fv(projLoc, false, camera.projectionMatrix);
}

// Update Camera
export function updateCamera(): void {
    updateCameraMatrices();
}