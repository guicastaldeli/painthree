import * as data from "./data.js";
import * as index from "./index.js";
import { vec3 } from "gl-matrix";

interface Ray {
    origin: vec3;
    direction: vec3;
}

// Get Ray
export function getRay(): Ray {
    const camera = data.getCamera();
    return {
        origin: vec3.clone(camera.position),
        direction: vec3.clone(camera.front)
    };
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

    let txmin = (min[0] - ray.origin[0]) / ray.direction[0];
    let txmax = (max[0] - ray.origin[0]) / ray.direction[0];
    if(txmin > txmax) [txmin, txmax] = [txmax, txmin];

    let tymin = (min[1] - ray.origin[1]) / ray.direction[1];
    let tymax = (max[1] - ray.origin[1]) / ray.direction[1];
    if(tymin > tymax) [tymin, tymax] = [tymax, tymin];

    if(txmin > tymax || tymax > txmax) return false;
    if(tymax > txmax) txmin = tymin;
    if(tymax < txmax) txmax = tymax;

    let tzmin = (min[2] - ray.origin[2]) / ray.direction[2];
    let tzmax = (max[2] - ray.origin[2]) / ray.direction[2];
    if(tzmin > tzmax) [tzmin, tzmax] = [tzmax, tzmin];

    if(txmin > tzmax || tzmin > txmax) return false;

    return true;
}