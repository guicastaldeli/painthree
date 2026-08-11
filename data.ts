/**
 * 
 * Mesh
 * 
 */
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

/**
 * 
 * Buffers
 * 
 */
export enum BufferType {
    POSITION = 'position',
    INDEX = 'index',
    COLOR = 'color',
    NORMAL = 'normal',
    TEX_COORD = 'texCoord'
}

