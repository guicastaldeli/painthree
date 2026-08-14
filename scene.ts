import * as index from "./index.js";
import * as data from "./data.js";
import * as input from "./index.js";

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
    
    angle += 0.01;

    const pyramid = data.MeshType.CUBE;
    data.setMeshColor(pyramid, [0.2, 0.8, 1.0]);
    data.setMeshRotation(pyramid, 0, angle, 0);
    data.setMeshPosition(pyramid, 0.8, 0.5, 0);
    data.renderMesh(pyramid);
}