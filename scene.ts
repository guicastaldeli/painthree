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
export function setCamera(): void {
    if(!camera) {
        camera = data.setCamera([CAMERA_POS_X, CAMERA_POS_Y, CAMERA_POS_Z]);
        console.log('Camera initialized');
    }
}

// Render Camera Hud
export function renderCameraHud(): void {
    const sizeX = 24;
    const sizeY = 24;
    data.renderHud('aim', 'aim.png', true, [sizeX, sizeY]);
}

/**
 * 
 * Skybox
 * 
 */
const SKYBOX_POS_X = 0.0;
const SKYBOX_POS_Y = 0.0;
const SKYBOX_POS_Z = 0.0;

const SKYBOX_SCALE_X = 300.0;
const SKYBOX_SCALE_Y = 300.0;
const SKYBOX_SCALE_Z = 300.0;

const SKYBOX_COLOR_BASE = 1.0;
const SKYBOX_COLOR_TOP = 1.0;
const SKYBOX_COLOR_BOTTOM = 0.7;

// Set Skybox
function setSkybox(): void {
    const id = 'skybox';

    data.addMesh(id, data.MeshType.SPHERE, 
        vec3.fromValues(SKYBOX_POS_X, SKYBOX_POS_Y, SKYBOX_POS_Z), 
        vec3.fromValues(SKYBOX_COLOR_BASE, SKYBOX_COLOR_BASE, SKYBOX_COLOR_BASE));
    data.setMeshScale(id, 
        SKYBOX_SCALE_X, 
        SKYBOX_SCALE_Y, 
        SKYBOX_SCALE_Z
    );
    data.setMeshGradient(id, true, 
        vec3.fromValues(SKYBOX_COLOR_TOP, SKYBOX_COLOR_TOP, SKYBOX_COLOR_TOP),
        vec3.fromValues(SKYBOX_COLOR_BOTTOM, SKYBOX_COLOR_BOTTOM, SKYBOX_COLOR_BOTTOM)
    );
    data.setMeshUnlit(id, true);
}

/**
 * 
 * Render
 * 
 */
let lightingInitialized = false;

function setLighting(): void {
    if(lightingInitialized) return;

    const ambientColor = vec3.fromValues(0.4, 0.4, 0.4);
    data.setAmbientLight(ambientColor, 1.0);

    const direction = vec3.fromValues(-1.0, -2.0, -1.0);
    const color = vec3.fromValues(1.0, 1.0, 1.0);
    vec3.normalize(direction, direction);
    data.setDirectionalLight(direction, color, 1.2);

    lightingInitialized = true;
    console.log('Lighting initialized');
}

let angle = 0;

export function renderScene(): void {
    setCamera();
    data.updateCamera();

    setLighting();
    
    setSkybox();
    
    angle += 0.01;
    /*data.addMesh('cube', data.MeshType.CUBE, vec3.fromValues(0.8, 0.5, 0), vec3.fromValues(0.2, 0.8, 1.0));
    data.setMeshRotation('cube', 0, angle, 0);
    */
    data.renderAllMeshes();

    data.updateCollision(data.getCameraPosition());

    const ray = raycast.getRay();
    for(const mesh of data.getAllMeshes()) {
        if(raycast.__AABB(ray, mesh)) {
            //console.log(data.getMeshId(mesh));
        }
    }
}

export function renderHud(): void {
    index.gl.disable(index.gl.DEPTH_TEST);
    index.gl.enable(index.gl.BLEND);
    index.gl.blendFunc(index.gl.SRC_ALPHA, index.gl.ONE_MINUS_SRC_ALPHA);
       
    renderCameraHud();
       
    index.gl.disable(index.gl.BLEND);
    index.gl.enable(index.gl.DEPTH_TEST);
}