import * as data from "./data.js";
import * as index from "./index.js";
import { vec3 } from "gl-matrix";

interface Ray {
    origin: vec3;
    direction: vec3;
}

interface Plane {
    normal: vec3;
    d: number;
}

export interface Result {
    vertices: Float32Array;
    indices: Uint16Array;
}

// Get Ray
export function getRay(): Ray {
    const camera = data.getCamera();
    return {
        origin: vec3.clone(camera.position),
        direction: vec3.clone(camera.front)
    };
}

// Plane Side
function planeSide(point: vec3, plane: Plane): number {
    const val = vec3.dot(point, plane.normal) - plane.d;
    return val;
}

// Intersect Edge Plane
function intersectEdgePlane(a: vec3, b: vec3, plane: Plane): vec3 {
    const da = planeSide(a, plane);
    const db = planeSide(b, plane);
    const t = da / (da - db);
    
    return vec3.fromValues(
        a[0] + t * (b[0] - a[0]),
        a[1] + t * (b[1] - a[1]),
        a[2] + t * (b[2] - a[2])
    );
}

// Get Cube Planes
function getCubePlanes(center: vec3, size: number): Plane[] {
    const half = size / 2;
    return [
        { normal: vec3.fromValues( 1,  0,  0), d:  center[0] + half },
        { normal: vec3.fromValues(-1,  0,  0), d: -(center[0] - half) },
        { normal: vec3.fromValues( 0,  1,  0), d:  center[1] + half },
        { normal: vec3.fromValues( 0, -1,  0), d: -(center[1] - half) },
        { normal: vec3.fromValues( 0,  0,  1), d:  center[2] + half },
        { normal: vec3.fromValues( 0,  0, -1), d: -(center[2] - half) },
    ];
}

// Triangulate Polygon
function triangulatePolygon(polygon: vec3[]): vec3[][] {
    const triangles: vec3[][] = [];
    for(let i = 1; i < polygon.length - 1; i++) {
        triangles.push([
            polygon[0],
            polygon[i],
            polygon[i+1]
        ]);
    }

    return triangles;
}

// Subtract Cube
export function subtractCube(vertices: Float32Array, indices: Uint16Array | Uint32Array, center: vec3, size: number): Result {
    const planes = getCubePlanes(center, size);
    const newVertices: number[] = [];
    const newIndices: number[] = [];

    function addVertex(v: vec3): number {
        for(let i = 0; i < newVertices.length; i += 3) {
            const f = 0.0001;

            if(Math.abs(newVertices[i] - v[0]) < f &&
                Math.abs(newVertices[i+1] - v[1]) < f &&
                Math.abs(newVertices[i+2] - v[2]) < f) {
                    return i / 3;
            }
        }

        newVertices.push(v[0], v[1], v[2]);
        return (newVertices.length / 3) - 1;
    }

    for(let i = 0; i < indices.length; i += 3) {
        const i0 = indices[i] * 3;
        const i1 = indices[i+1] * 3;
        const i2 = indices[i+2] * 3;

        const v0 = vec3.fromValues(vertices[i0], vertices[i0+1], vertices[i0+2]);
        const v1 = vec3.fromValues(vertices[i1], vertices[i1+1], vertices[i1+2]);
        const v2 = vec3.fromValues(vertices[i2], vertices[i2+1], vertices[i2+2]);
    
        const insidePlanes = planes.filter(plane => {
            return planeSide(v0, plane) <= 0 &&
                planeSide(v1, plane) <= 0 &&
                planeSide(v2, plane) <= 0;
        });
        if(insidePlanes.length === 6) {
            continue;
        }

        const outsideFragments: vec3[][] = [];
        collectOutsideFragments([v0, v1, v2], planes, 0, outsideFragments);
        for(const frag of outsideFragments) {
            const tris = triangulatePolygon(frag);
            for(const tri of tris) {
                if(tri.length < 3) continue;
                const idx0 = addVertex(tri[0]);
                const idx1 = addVertex(tri[1]);
                const idx2 = addVertex(tri[2]);
                newIndices.push(idx0, idx1, idx2);
            }
        }
    }

    return {
        vertices: new Float32Array(newVertices),
        indices: new Uint16Array(newIndices)
    };
}

// Collect Outside Fragments
function collectOutsideFragments(
    polygon: vec3[],
    planes: Plane[],
    planeIndex: number,
    result: vec3[][]
): void {
    if(polygon.length < 3) return;
    if(planeIndex >= planes.length) return;

    const plane = planes[planeIndex];

    const inside: vec3[] = [];
    const outside: vec3[] = [];

    for(let i = 0; i < polygon.length; i++) {
        const a = polygon[i];
        const b = polygon[(i + 1) % polygon.length];
        const da = planeSide(a, plane);
        const db = planeSide(b, plane);

        if(da >= 0) inside.push(a);
        else outside.push(a);

        if((da > 0 && db < 0) || (da < 0 && db > 0)) {
            const intersection = intersectEdgePlane(a, b, plane);
            inside.push(intersection);
            outside.push(intersection);
        }
    }

    if(outside.length >= 3) result.push(outside);
    if(inside.length >= 3) {
        collectOutsideFragments(inside, planes, planeIndex + 1, result);
    }
}

/**
 * 
 * Intersections
 * 
 */
// Far Plane
export function __farPlane(ray: Ray): vec3 | null {
    if(Math.abs(ray.direction[1]) < 0.0001) return null;

    const t = -ray.origin[1] / ray.direction[1];
    if(t < 0) return null;

    return vec3.fromValues(
        ray.origin[0] + ray.direction[0] * t,
        0,
        ray.origin[2] + ray.direction[2] * t
    );
}

// At Distance
export function __atDistance(ray: Ray, distance: number): vec3 {
    return vec3.fromValues(
        ray.origin[0] + ray.direction[0] * distance,
        ray.origin[1] + ray.direction[1] * distance,
        ray.origin[2] + ray.direction[2] * distance
    );
}

// AABB
export function __AABB(ray: Ray, mesh: data.Buffer): boolean {
    const min = vec3.fromValues(
        mesh.position[0] + mesh.data.minBounds[0] * mesh.scale[0],
        mesh.position[1] + mesh.data.minBounds[1] * mesh.scale[1],
        mesh.position[2] + mesh.data.minBounds[2] * mesh.scale[2]
    );
    const max = vec3.fromValues(
        mesh.position[0] + mesh.data.maxBounds[0] * mesh.scale[0],
        mesh.position[1] + mesh.data.maxBounds[1] * mesh.scale[1],
        mesh.position[2] + mesh.data.maxBounds[2] * mesh.scale[2]
    );

    let tmin = -Infinity;
    let tmax = Infinity;

    for(let i = 0; i < 3; i++) {
        if(Math.abs(ray.direction[i]) < 0.0001) {
            if(ray.origin[i] < min[i] || ray.origin[i] > max[i]) return false;
        } else {
            let t1 = (min[i] - ray.origin[i]) / ray.direction[i];
            let t2 = (max[i] - ray.origin[i]) / ray.direction[i];
            if(t1 > t2) [t1, t2] = [t2, t1];

            tmin = Math.max(tmin, t1);
            tmax = Math.min(tmax, t2);
            if(tmin > tmax) return false;
        }
    }

    return tmax > 0;
}