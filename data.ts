import * as index from './index.js';
import { mat4, vec3 } from 'gl-matrix';

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