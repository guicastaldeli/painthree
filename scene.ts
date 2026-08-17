import * as index from "./index.js";
import * as data from "./data.js";
import * as input from "./index.js";
import * as raycast from "./raycast.js";
import { vec3 } from "gl-matrix";

/**
 * 
 * Camera
 * 
 */
let camera: data.Camera | null = null;

const POS_X = 0.0;
const POS_Y = 0.0;
const POS_Z = 0.0;

// Set Camera
function setCamera(): void {
    if(!camera) {
        camera = data.setCamera([POS_X, POS_Y, POS_Z]);
        console.log('Camera initialized');
    }
}

/**
 * 
 * Render
 * 
 */
let angle = 0;

export function render(): void {
    setCamera();
    data.updateCamera();

    data.updateCollision(data.getCameraPosition());
    
    angle += 0.01;

    data.addMesh('cube', data.MeshType.CUBE, vec3.fromValues(0.8, 0.5, 0), vec3.fromValues(0.2, 0.8, 1.0));
    data.setMeshRotation('cube', 0, angle, 0);

    data.renderAllMeshes();

    const ray = raycast.getRay();
    for(const mesh of data.getAllMeshes()) {
        if(raycast.__AABB(ray, mesh)) {
            //console.log(data.getMeshId(mesh));
        }
    }
}