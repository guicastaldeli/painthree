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

const CAMERA_POS_X = 0.0;
const CAMERA_POS_Y = 0.0;
const CAMERA_POS_Z = 0.0;

// Set Camera
function setCamera(): void {
    if(!camera) {
        camera = data.setCamera([CAMERA_POS_X, CAMERA_POS_Y, CAMERA_POS_Z]);
        console.log('Camera initialized');
    }
}

/**
 * 
 * Skybox
 * 
 */
const SKYBOX_POS_X = 0.0;
const SKYBOX_POS_Y = 0.0;
const SKYBOX_POS_Z = 0.0;

const SKYBOX_SCALE_X = 100.0;
const SKYBOX_SCALE_Y = 100.0;
const SKYBOX_SCALE_Z = 100.0;

const SKYBOX_COLOR = 1.0;

// Set Skybox
function setSkybox(): void {
    const id = 'skybox';

    data.addMesh(id, data.MeshType.CUBE, 
        vec3.fromValues(SKYBOX_POS_X, SKYBOX_POS_Y, SKYBOX_POS_Z), 
        vec3.fromValues(SKYBOX_COLOR, SKYBOX_COLOR, SKYBOX_COLOR));
    data.setMeshScale(id, 
        SKYBOX_SCALE_X, 
        SKYBOX_SCALE_Y, 
        SKYBOX_SCALE_Z
    )
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

    //data.updateCollision(data.getCameraPosition());
    
    setSkybox();

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