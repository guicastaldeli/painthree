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