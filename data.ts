import * as index from './index.js';

/**
 * 
 * Buffers
 * 
 */
export interface Buffer {
    vao: WebGLVertexArrayObject;
    indexCount: number;
    data: MeshData;
    
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
    QUAD
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
            0.0,  0.5, 0.0
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
            0.5,  0.5, 0.0,
            -0.5,  0.5, 0.0
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
            1.0,  1.0, 0.0,
            -1.0,  1.0, 0.0
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
    }
};

export function getMeshData(type: MeshType): MeshData {
    const val = MeshData[type];
    return val;
}

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
        data
    };
}

export function renderMesh(meshType: MeshType): void {
    if(!index.shaderProgram) {
        console.error('Shader program not initialized');
        return;
    }

    let mesh = meshCache.get(meshType);
    if(!mesh) {
        const data = getMeshData(meshType);
        mesh = createMesh(data);
        meshCache.set(meshType, mesh);
    }

    index.gl.useProgram(index.shaderProgram);

    index.gl.bindVertexArray(mesh.vao);

    index.gl.drawElements(index.gl.TRIANGLES, mesh.indexCount, index.gl.UNSIGNED_SHORT, 0);
    index.gl.bindVertexArray(null);
}