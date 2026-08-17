import * as index from "./index.js";
import { mat4, vec3 } from "gl-matrix";

/**
 * 
 * Watcher
 * 
 */
const State: Record<string, any> = {};
const StateWatchers: Set<(key: string, value: any) => void> = new Set();

// Set
export function SetValue(key: string, value: any): any {
    State[key] = value;
    for(const watcher of StateWatchers) watcher(key, value);
    return value;
}

// Get
export function GetValue(key: string): any {
    const val = State[key];
    return val;
}

// Watch
export function Watch(fn: (key: string, value: any) => void): () => void {
    StateWatchers.add(fn);
    return () => StateWatchers.delete(fn);
}

/**
 * 
 * Buffers
 * 
 */
export interface Buffer {
    id: string;
    selected: boolean;
    
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
const meshCache: Map<string, Buffer> = new Map();
const hudIds: Set<string> = new Set();
let selectedMesh: Buffer | null = null;

export enum MeshType {
    TRIANGLE,
    SQUARE,
    QUAD,
    PYRAMID,
    CUBE,
    SPHERE
}

export interface MeshData {
    vertices: Float32Array;
    indices: Uint16Array | Uint32Array;
    color?: [number, number, number];
    texCoords?: Float32Array;
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
        color: [
            1.0, 0.0, 0.0
        ],
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
        color: [
            1.0, 0.0, 0.0
        ],
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
            -0.5, -0.5, 0.0,
            0.5, -0.5, 0.0,
            0.5,  0.5, 0.0,
            -0.5,  0.5, 0.0
        ]),
        indices: new Uint16Array([
            0, 1, 2,
            0, 2, 3
        ]),
        texCoords: new Float32Array([
            0.0, 1.0,
            1.0, 1.0,
            1.0, 0.0,
            0.0, 0.0
        ]),
        minBounds: [
            -1.0, -1.0, 0.0
        ],
        maxBounds: [
            1.0, 1.0, 0.0
        ]
    },
    // Pyramid
    [MeshType.PYRAMID]: (() => {
        const vertices = new Float32Array([
            -0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            0.0,  0.5, 0.0,

            0.5, -0.5, 0.5,
            0.5, -0.5, -0.5,
            0.0,  0.5, 0.0,

            0.5, -0.5, -0.5,
            -0.5, -0.5, -0.5,
            0.0,  0.5, 0.0,

            -0.5, -0.5, -0.5,
            -0.5, -0.5, 0.5,
            0.0,  0.5, 0.0,

            -0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            0.5, -0.5, -0.5,
            -0.5, -0.5, -0.5
        ]);
        
        const indices = new Uint16Array([
            0, 1, 2,
            3, 4, 5,
            6, 7, 8,
            9, 10, 11,
            12, 13, 14,
            12, 14, 15
        ]);
        
        const normals = new Float32Array(vertices.length);
        for(let i = 0; i < indices.length; i += 3) {
            const a = indices[i] * 3;
            const b = indices[i + 1] * 3;
            const c = indices[i + 2] * 3;
            
            const ax = vertices[a], ay = vertices[a + 1], az = vertices[a + 2];
            const bx = vertices[b], by = vertices[b + 1], bz = vertices[b + 2];
            const cx = vertices[c], cy = vertices[c + 1], cz = vertices[c + 2];
            
            const ex1 = bx - ax, ey1 = by - ay, ez1 = bz - az;
            const ex2 = cx - ax, ey2 = cy - ay, ez2 = cz - az;
            
            let nx = ey1 * ez2 - ez1 * ey2;
            let ny = ez1 * ex2 - ex1 * ez2;
            let nz = ex1 * ey2 - ey1 * ex2;
            
            const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
            if(len > 0) {
                nx /= len;
                ny /= len;
                nz /= len;
            }
            
            normals[a] += nx;
            normals[a + 1] += ny;
            normals[a + 2] += nz;
            normals[b] += nx;
            normals[b + 1] += ny;
            normals[b + 2] += nz;
            normals[c] += nx;
            normals[c + 1] += ny;
            normals[c + 2] += nz;
        }
        
        for(let i = 0; i < normals.length; i += 3) {
            const x = normals[i];
            const y = normals[i + 1];
            const z = normals[i + 2];
            const len = Math.sqrt(x * x + y * y + z * z);
            if(len > 0) {
                normals[i] = x / len;
                normals[i + 1] = y / len;
                normals[i + 2] = z / len;
            }
        }
        
        return {
            vertices,
            normals,
            indices,
            color: [1.0, 0.0, 0.0],
            texCoords: new Float32Array([
                0.0, 0.0, 1.0, 0.0, 0.5, 1.0,
                0.0, 0.0, 1.0, 0.0, 0.5, 1.0,
                0.0, 0.0, 1.0, 0.0, 0.5, 1.0,
                0.0, 0.0, 1.0, 0.0, 0.5, 1.0,
                0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0
            ]),
            minBounds: [-0.5, -0.5, -0.5],
            maxBounds: [0.5, 0.5, 0.5]
        };
    })(),
    // Cube
    [MeshType.CUBE]: {
        vertices: new Float32Array([
            -0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            0.5,  0.5, 0.5,
            -0.5,  0.5, 0.5,

            -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5,
            0.5,  0.5, -0.5,
            -0.5,  0.5, -0.5,

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
            0.5,  0.5, -0.5,
            0.5,  0.5, 0.5,

            -0.5, -0.5, 0.5,
            -0.5, -0.5, -0.5,
            -0.5,  0.5, -0.5,
            -0.5,  0.5, 0.5
        ]),
        normals: new Float32Array([
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,

            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,

            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,

            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,

            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,

            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0
        ]),
        indices: new Uint16Array([
            0, 1, 2,
            0, 2, 3,

            4, 5, 6,
            4, 6, 7,

            8, 9, 10,
            8, 10, 11,

            12, 13, 14,
            12, 14, 15,

            16, 17, 18,
            16, 18, 19,

            20, 21, 22,
            20, 22, 23
        ]),
        color: [
            1.0, 0.0, 0.0
        ],
        texCoords: new Float32Array([
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0
        ]),
        minBounds: [ 
            -0.5, -0.5, -0.5 
        ],
        maxBounds: [ 
            0.5, 0.5, 0.5 
        ]
    },
    // Sphere
    [MeshType.SPHERE]: (() => {
        const radius = 0.5;
        const segments = 32;
        const vertices: number[] = [];
        const normals: number[] = [];
        const texCoords: number[] = [];
        const indices: number[] = [];

        for(let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for(let j = 0; j <= segments; j++) {
                const phi = (j / segments) * 2 * Math.PI;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                vertices.push(
                    radius * sinTheta * cosPhi,
                    radius * cosTheta,
                    radius * sinTheta * sinPhi
                );

                normals.push(
                    sinTheta * cosPhi,
                    cosTheta,
                    sinTheta * sinPhi
                );

                texCoords.push(j / segments, i / segments);
            }
        }

        for(let i = 0; i < segments; i++) {
            for(let j = 0; j < segments; j++) {
                const a = i * (segments + 1) + j;
                const b = i * (segments + 1) + j + 1;
                const c = (i + 1) * (segments + 1) + j;
                const d = (i + 1) * (segments + 1) + j + 1;

                indices.push(a, b, c);
                indices.push(b, d, c);
            }
        }

        return {
            vertices: new Float32Array(vertices),
            normals: new Float32Array(normals),
            texCoords: new Float32Array(texCoords),
            indices: new Uint16Array(indices),
            color: [1.0, 0.0, 0.0],
            minBounds: [-radius, -radius, -radius],
            maxBounds: [radius, radius, radius]
        };
    })()
};

// Get Mesh
export function getMeshData(type: MeshType): MeshData {
    const val = MeshData[type];
    return val;
}

export function getMesh(id: string): Buffer | null {
    const val = meshCache.get(id) ?? null;
    return val;
}

export function getAllMeshes(): Buffer[] {
    const val = Array.from(meshCache.values());
    return val;
}

export function getMeshId(mesh: Buffer): string | null {
    for(const [id, m] of meshCache.entries()) {
        if(m === mesh) return id;
    }

    return null;
}

// Remove Mesh
export function removeMesh(id: string): void {
    const mesh = meshCache.get(id);
    if(!mesh) return;
    if(selectedMesh === mesh) selectedMesh = null;

    meshCache.delete(id);
}

// Select Mesh
export function selectMesh(mesh: Buffer | null): void {
    if(selectedMesh) selectedMesh.selected = false;
    selectedMesh = mesh;
    if(mesh) mesh.selected = true;
}

export function getSelectedMesh(): Buffer | null {
    const val = selectedMesh;
    return val;
}

// Set Mesh Roation
export function setMeshRotation(id: string, x: number, y: number, z: number): void {
    const mesh = getMesh(id);
    if(!mesh) return;

    vec3.set(mesh.rotation, x, y, z);
    updateModelMatrix(mesh);
}

// Set Mesh Position
export function setMeshPosition(id: string, x: number, y: number, z: number): void {
    const mesh = getMesh(id);
    if(!mesh) return;

    vec3.set(mesh.position, x, y, z);
    updateModelMatrix(mesh);
}

// Set Mesh Scale
export function setMeshScale(id: string, x: number, y: number, z: number): void {
    const mesh = getMesh(id);
    if(!mesh) return;
    
    vec3.set(mesh.scale, x, y, z);
    updateModelMatrix(mesh);
}

// Set Mesh Color
export function setMeshColor(id: string, color: vec3): void {
    const mesh = getMesh(id);
    if(!mesh) return;
    vec3.copy(mesh.color, color);
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
        index.gl.bufferData(index.gl.ARRAY_BUFFER, data, index.gl.DYNAMIC_DRAW);

        const loc = index.gl.getAttribLocation(index.shaderProgram!, name);
        if(loc !== -1) {
            index.gl.enableVertexAttribArray(loc);
            index.gl.vertexAttribPointer(loc, size, index.gl.FLOAT, false, 0, 0);
        }

        return buffer;
    }

    const positionBuffer = setupAttribute('aPos', 3, data.vertices);
    const normalBuffer = setupAttribute('aNormal', 3, data.normals);

    const indexBuffer = index.gl.createBuffer();
    if(!indexBuffer) throw new Error('Failed to create index buffer');

    index.gl.bindBuffer(index.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    index.gl.bufferData(index.gl.ELEMENT_ARRAY_BUFFER, data.indices, index.gl.DYNAMIC_DRAW);

    index.gl.bindVertexArray(null);
    index.gl.bindBuffer(index.gl.ARRAY_BUFFER, null);
    index.gl.bindBuffer(index.gl.ELEMENT_ARRAY_BUFFER, null);

    return {
        id: crypto.randomUUID(),
        selected: false,
        vao,
        positionBuffer: positionBuffer!,
        indexBuffer,
        normalBuffer,
        indexCount: data.indices.length,
        data: {
            ...data,
            vertices: new Float32Array(data.vertices),
            indices: new Uint16Array(data.indices),
            texCoords: data.texCoords ? new Float32Array(data.texCoords) : undefined,
            normals: data.normals ? new Float32Array(data.normals) : undefined
        },
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
export function renderMesh(mesh: Buffer): void {
    if(!index.shaderProgram) {
        console.error('Shader program not initialized');
        return;
    }

    const colorLoc = index.gl.getUniformLocation(index.shaderProgram, 'uColor');
    index.gl.uniform3fv(colorLoc, mesh.selected ? vec3.fromValues(0.5, 0.5, 0.5) : mesh.color);

    const modelMatrix = index.gl.getUniformLocation(index.shaderProgram, 'uModelMatrix');
    index.gl.uniformMatrix4fv(modelMatrix, false, mesh.modelMatrix);

    index.gl.bindVertexArray(mesh.vao);
    index.gl.drawElements(index.gl.TRIANGLES, mesh.indexCount, index.gl.UNSIGNED_SHORT, 0);
    
    index.gl.bindVertexArray(null);
}

export function renderAllMeshes(): void {
    updateLightUniform();

    for(const [id, mesh] of meshCache.entries()) {
        if(hudIds.has(id)) continue;
        renderMesh(mesh);
    }
}

export function renderHud(id: string, textureName: string, inverted: boolean = false, pixelSize: [number, number]): void {
    hudIds.add(id);

    if(!index.shaderProgram) return;

    const scaleX = pixelSize[0] / index.canvas.width;
    const scaleY = pixelSize[1] / index.canvas.height;

    addMesh(id, MeshType.QUAD, vec3.fromValues(0, 0, 0));

    const isHudLoc = index.gl.getUniformLocation(index.shaderProgram, 'uIsHud');
    const useTexLoc = index.gl.getUniformLocation(index.shaderProgram, 'uUseTexture'); // missing
    const texLoc = index.gl.getUniformLocation(index.shaderProgram, 'uTexture');
    const hudScaleLoc = index.gl.getUniformLocation(index.shaderProgram, 'uHudScale');
    const isInvertedLoc = index.gl.getUniformLocation(index.shaderProgram, 'uIsInverted');
    const screenTexLoc = index.gl.getUniformLocation(index.shaderProgram, 'uScreenTexture');
    const canvasSizeLoc = index.gl.getUniformLocation(index.shaderProgram, 'uCanvasSize');

    index.gl.uniform1i(isHudLoc, 1);
    index.gl.uniform1i(useTexLoc, 1);
    index.gl.uniform1i(texLoc, 0);
    index.gl.uniform2f(hudScaleLoc, scaleX, scaleY);
    index.gl.uniform1i(isInvertedLoc, inverted ? 1 : 0);

    loadTexture(textureName);

    if(inverted) {
        const screenTex = getScreenTexture();
        if(screenTex) {
            index.gl.bindFramebuffer(index.gl.FRAMEBUFFER, null);

            index.gl.activeTexture(index.gl.TEXTURE1);
            index.gl.bindTexture(index.gl.TEXTURE_2D, screenTex);
            index.gl.uniform1i(screenTexLoc, 1);
        }

        index.gl.uniform2f(canvasSizeLoc, index.canvas.width, index.canvas.height);
    }

    const mesh = getMesh(id);
    if(mesh) renderMesh(mesh);

    index.gl.uniform1i(isHudLoc, 0);
    index.gl.uniform1i(useTexLoc, 0);

    index.gl.activeTexture(index.gl.TEXTURE0);
    index.gl.bindTexture(index.gl.TEXTURE_2D, null);
    index.gl.activeTexture(index.gl.TEXTURE1);
    index.gl.bindTexture(index.gl.TEXTURE_2D, null);
}

// Add Mesh
export function addMesh(id: string, type: MeshType, position: vec3, color?: vec3): Buffer {
    if(meshCache.has(id)) return meshCache.get(id)!;

    const data = getMeshData(type);
    const mesh = createMesh(data);

    meshCache.set(id, mesh);

    setMeshColor(id, color ?? (data.color ? vec3.fromValues(...data.color) : vec3.fromValues(1, 1, 1)));
    setMeshPosition(id, position[0], position[1], position[2]);

    return mesh;
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

/**
 * 
 * Palette
 * 
 */
let activeColor: [number, number, number] = [0.0, 0.0, 0.0];
let newColor: [number, number, number] = [0.5, 0.5, 0.5];

export const Palette = {
    get _(): [number, number, number][] {
        return [
            activeColor, // Active Color
            [0.0, 0.0, 0.0], // Black (default)
            [1.0, 1.0, 1.0], // White
            [1.0, 0.0, 0.0], // Red
            [0.0, 1.0, 0.0], // Green
            [0.0, 0.0, 1.0], // Blue
            [1.0, 1.0, 0.0], // Yellow
            [1.0, 0.5, 0.0], // Orange
            [0.5, 0.0, 0.5], // Purple
            [0.0, 1.0, 1.0], // Cyan
            [1.0, 0.0, 1.0], // Magenta
            newColor // New Color
        ];
    } 
}

// Get Active Color
export function getActiveColor(): [number, number, number] {
    const val = activeColor;
    return val;
}

// Set Active Color
export function setActiveColor(color: [number, number, number]): void {
    activeColor = color;
}

// Set New Color
export function setNewColor(color: [number, number, number]): void {
    newColor = color;
}

// Rgb to Hex
export function rgbToHex(rgb: [number, number, number]): string {
    const hex = rgb.map(c => Math.round(c * 255).toString(16).padStart(2, '0')).join('');
    return `#${hex}`;
}

// Hex to Rgb
export function hexToRgb(hex: string): [number, number, number] {
    const regex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
    
    const result = regex.exec(hex);
    if(!result) return [0, 0, 0];

    return [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
    ];
}

/**
 * 
 * Texture
 * 
 */
const TEXTURE_PATH = './resource/texture';
const textureCache: Map<string, { texture: WebGLTexture, unit: number }> = new Map();
let textureUnit: number = 0;

// Load Texture
export function loadTexture(textureName: string): WebGLTexture {
    if(!textureCache.has(textureName)) {
        const unit = textureUnit++;

        const texture = index.gl.createTexture();
        if(!texture) throw new Error(`Failed to create texture for ${textureName}`);
    
        index.gl.activeTexture(index.gl.TEXTURE0 + unit);
        index.gl.bindTexture(index.gl.TEXTURE_2D, texture);
        index.gl.texImage2D(
            index.gl.TEXTURE_2D, 0, index.gl.RGBA, 1, 1, 0,
            index.gl.RGBA, index.gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 0, 255])
        );

        const image = new Image();
        image.src = `${TEXTURE_PATH}/${textureName}`;
        image.onload = () => {
            index.gl.activeTexture(index.gl.TEXTURE0 + unit);
            index.gl.bindTexture(index.gl.TEXTURE_2D, texture);
            index.gl.texImage2D(
                index.gl.TEXTURE_2D, 0, index.gl.RGBA,
                index.gl.RGBA, index.gl.UNSIGNED_BYTE, image
            );
            index.gl.generateMipmap(index.gl.TEXTURE_2D);
            index.gl.texParameteri(index.gl.TEXTURE_2D, index.gl.TEXTURE_WRAP_S, index.gl.REPEAT);
            index.gl.texParameteri(index.gl.TEXTURE_2D, index.gl.TEXTURE_WRAP_T, index.gl.REPEAT);
            index.gl.texParameteri(index.gl.TEXTURE_2D, index.gl.TEXTURE_MIN_FILTER, index.gl.NEAREST);
            index.gl.texParameteri(index.gl.TEXTURE_2D, index.gl.TEXTURE_MAG_FILTER, index.gl.NEAREST);
        };
        image.onerror = () => { throw new Error(`Failed to load texture: ${textureName}`); };
    
        textureCache.set(textureName, { texture, unit });
    }

    const { texture, unit } = textureCache.get(textureName)!;
    index.gl.activeTexture(index.gl.TEXTURE0 + unit);
    index.gl.bindTexture(index.gl.TEXTURE_2D, texture);

    return texture;
}

/**
 * 
 * Collision
 * 
 */
const COLL_SIZE = 10;
let boundary: number = COLL_SIZE;

// Get Collision
export function getCollision(): number {
    const val = boundary;
    return val;
}

// Apply Collision
function applyCollision(position: vec3): void {
    if(boundary === 0) return;

    const half = boundary / 2;
    position[0] = Math.max(-half, Math.min(half, position[0]));
    position[1] = Math.max(-half, Math.min(half, position[1]));
    position[2] = Math.max(-half, Math.min(half, position[2]));
}

// Update Collision
export function updateCollision(position: vec3): void {
    applyCollision(position);
}

/**
 * 
 * Screen Texture
 * 
 */
let screenTexture: WebGLTexture | null = null;
let screenFramebuffer: WebGLFramebuffer | null = null;

// Create Screen Texture
export function createScreenTexture(): void {
    index.gl.bindFramebuffer(index.gl.FRAMEBUFFER, null);
    index.gl.activeTexture(index.gl.TEXTURE0);
    index.gl.bindTexture(index.gl.TEXTURE_2D, null);
    
    screenFramebuffer = index.gl.createFramebuffer();
    index.gl.bindFramebuffer(index.gl.FRAMEBUFFER, screenFramebuffer);

    screenTexture = index.gl.createTexture();
    index.gl.bindTexture(index.gl.TEXTURE_2D, screenTexture);

    index.gl.texImage2D(index.gl.TEXTURE_2D, 0, index.gl.RGBA, index.canvas.width, index.canvas.height, 0, index.gl.RGBA, index.gl.UNSIGNED_BYTE, null);
    index.gl.texParameteri(index.gl.TEXTURE_2D, index.gl.TEXTURE_MIN_FILTER, index.gl.LINEAR);
    index.gl.texParameteri(index.gl.TEXTURE_2D, index.gl.TEXTURE_MAG_FILTER, index.gl.LINEAR);
    index.gl.texParameteri(index.gl.TEXTURE_2D, index.gl.TEXTURE_WRAP_S, index.gl.CLAMP_TO_EDGE);
    index.gl.texParameteri(index.gl.TEXTURE_2D, index.gl.TEXTURE_WRAP_T, index.gl.CLAMP_TO_EDGE);

    index.gl.framebufferTexture2D(index.gl.FRAMEBUFFER, index.gl.COLOR_ATTACHMENT0, index.gl.TEXTURE_2D, screenTexture, 0);

    const status = index.gl.checkFramebufferStatus(index.gl.FRAMEBUFFER);
    if(status !== index.gl.FRAMEBUFFER_COMPLETE) {
        console.error('Framebuffer is not complete:', status);
    } else {
        console.log('Framebuffer is complete');
    }

    index.gl.bindFramebuffer(index.gl.FRAMEBUFFER, null);
    index.gl.bindTexture(index.gl.TEXTURE_2D, null);
}

// Get Screen Texture
export function getScreenTexture(): WebGLTexture | null {
    const val = screenTexture;
    return val;
}

// Get Screen Framebuffer
export function getScreenFramebuffer(): WebGLFramebuffer | null {
    const val = screenFramebuffer;
    return val;
}

/**
 * 
 * Lighting
 * 
 */
export interface Lighting {
    ambient: {
        color: vec3;
        intensity: number;
    };
    directional: {
        direction: vec3;
        color: vec3;
        intensity: number;
    };
}

let lightingInstance: Lighting = {
    ambient: {
        color: vec3.fromValues(0.2, 0.2, 0.2),
        intensity: 1.0
    },
    directional: {
        direction: vec3.fromValues(-1.0, -1.0, -1.0),
        color: vec3.fromValues(1.0, 1.0, 1.0),
        intensity: 1.0
    }
};

// Get Lighting
export function getLighting(): Lighting {
    const val = lightingInstance;
    return val;
}

// Set Ambient Light
export function setAmbientLight(color: vec3, intensity: number = 1.0): void {
    vec3.copy(lightingInstance.ambient.color, color);
    lightingInstance.ambient.intensity = intensity;
}

// Set Directional Light
export function setDirectionalLight(direction: vec3, color: vec3, intensity: number = 1.0): void {
    vec3.copy(lightingInstance.directional.direction, direction);
    vec3.copy(lightingInstance.directional.color, color);
    lightingInstance.directional.intensity = intensity;
}

// Update Light Uniforms
export function updateLightUniform(): void {
    if(!index.shaderProgram) return;

    // Ambient
    const ambientColorLoc = index.gl.getUniformLocation(index.shaderProgram, 'uLightAmbient');
    const ambientIntensityLoc = index.gl.getUniformLocation(index.shaderProgram, 'uLightAmbientIntensity');
    index.gl.uniform3fv(ambientColorLoc, lightingInstance.ambient.color);
    index.gl.uniform1f(ambientIntensityLoc, lightingInstance.ambient.intensity);

    // Directional
    const dirLoc = index.gl.getUniformLocation(index.shaderProgram, 'uLightDirection');
    const dirColorLoc = index.gl.getUniformLocation(index.shaderProgram, 'uLightColor');
    const dirIntensityLoc = index.gl.getUniformLocation(index.shaderProgram, 'uLightIntensity');
    index.gl.uniform3fv(dirLoc, lightingInstance.directional.direction);
    index.gl.uniform3fv(dirColorLoc, lightingInstance.directional.color);
    index.gl.uniform1f(dirIntensityLoc, lightingInstance.directional.intensity);
}