import * as data from "./data.js";
import * as tools from "./tools.js";
import * as index from "./index.js";
import * as raycast from "./raycast.js";
import { vec3 } from "gl-matrix";

export const Keys: { [key: string]: boolean } = {};

let isPointerLocked = false;
let mouseMovement = { x: 0, y: 0 };

// Is Key Pressed
function isKeyPressed(key: string): boolean {
    const val = Keys[key.toLowerCase()] || Keys[key.toUpperCase()] || false;
    return val;
}

// Cosume Key
function consumeKey(key: string): boolean {
    const pressed = isKeyPressed(key);
    if(pressed) {
        Keys[key] = false;
        Keys[key.toLowerCase()] = false;
        Keys[key.toUpperCase()] = false;
    }
    return pressed;
}

// Process Keyboard
export function processKeyboard(deltaTime: number): void {
    const camera = data.getCamera();

    const speed = 10.0 * deltaTime;
    const sensv = 0.5;
    
    const v = 89.0;

    const front = vec3.clone(camera.front);
    front[1] = 0;
    vec3.normalize(front, front);

    const right = vec3.clone(camera.right);
    right[1] = 0;
    vec3.normalize(right, right);

    /* Front */ if(isKeyPressed('w')) vec3.scaleAndAdd(camera.position, camera.position, front, speed);
    /* Back */ if(isKeyPressed('s')) vec3.scaleAndAdd(camera.position, camera.position, front, -speed);
    /* Right */ if(isKeyPressed('d')) vec3.scaleAndAdd(camera.position, camera.position, right, speed);
    /* Left */ if(isKeyPressed('a')) vec3.scaleAndAdd(camera.position, camera.position, right, -speed);
    /* Down */ if(isKeyPressed('shift')) camera.position[1] -= speed;
    /* Up */ if(isKeyPressed(' ')) camera.position[1] += speed;
    /* Menu */ if(consumeKey('e')) tools.openToolMenu();

    if(isPointerLocked) {
        camera.yaw += mouseMovement.x * sensv;
        camera.pitch -= mouseMovement.y * sensv;

        if(camera.pitch > v) camera.pitch = v;
        if(camera.pitch < -v) camera.pitch = -v;

        mouseMovement.x = 0;
        mouseMovement.y = 0;

        data.updateCameraVectors();
    }
}

// Setup Controls
export function setupControls(): void {
    window.addEventListener('keydown', (e) => {
        Keys[e.key] = true;
        Keys[e.key.toLowerCase()] = true;
        Keys[e.key.toUpperCase()] = true;
    });
    window.addEventListener('keyup', (e) => {
        Keys[e.key] = false;
        Keys[e.key.toLowerCase()] = false;
        Keys[e.key.toUpperCase()] = false;
    });

    index.canvas.addEventListener('click', () => {
        if(!isPointerLocked) {
            index.canvas.requestPointerLock();
        }
    });

    document.addEventListener('pointerlockchange', () => {
        isPointerLocked = document.pointerLockElement === index.canvas;
    });
    document.addEventListener('mousemove', (e) => {
        if(isPointerLocked) {
            mouseMovement.x += e.movementX;
            mouseMovement.y += e.movementY;
        }
    });
}

// On Place
function onPlace(): void {
    const ray = raycast.getRay();
    const point = raycast.__farPlane(ray);
    if(!point) return;
    
}

// On Select
function onSelect(): void {
    
}