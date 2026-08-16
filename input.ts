import * as data from "./data.js";
import * as tools from "./tools.js";
import * as index from "./index.js";
import * as raycast from "./raycast.js";
import { mat4, vec3 } from "gl-matrix";

export const Keys: { [key: string]: boolean } = {};

let isPointerLocked = false;
let mouseMovement = { x: 0, y: 0 };

const MAX_DISTANCE = 2;

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

    document.addEventListener('pointerlockchange', () => {
        isPointerLocked = document.pointerLockElement === index.canvas;
    });
    document.addEventListener('mousemove', (e) => {
        if(isPointerLocked) {
            mouseMovement.x += e.movementX;
            mouseMovement.y += e.movementY;
        }
    });

    index.canvas.addEventListener('click', () => {
        if(!isPointerLocked && !tools.isToolMenuOpen()) {
            index.canvas.requestPointerLock();
            return;
        }

        if(!isPointerLocked) return;

        if(tools.isToolAddMesh(tools.getActiveTool())) onPlace();
        else if(tools.isToolEraser(tools.getActiveTool())) onErase();
    });
}

// On Place
function onPlace(): void {
    if(!tools.isToolAddMesh(tools.getActiveTool())) return;
    const tool = tools.getActiveTool() as tools.tool_ToolAddMesh;

    const ray = raycast.getRay();
    const point = raycast.__atDistance(ray, MAX_DISTANCE);
    if(!point) return;

    const id = crypto.randomUUID();
    data.addMesh(id, tool.type, point);
}

// On Erase
function onErase(): void {
    const ray = raycast.getRay();
    const center = raycast.__atDistance(ray, MAX_DISTANCE);
    
    let nearestMesh: data.Buffer | null = null;
    let nearestDist = Infinity;

    for(const mesh of data.getAllMeshes()) {
        if(!raycast.__AABB(ray, mesh)) continue;

        const dist = vec3.distance(ray.origin, mesh.position);
        if(dist < nearestDist) {
            nearestDist = dist;
            nearestMesh = mesh;
        }
    }

    if(!nearestMesh) return;

    const meshId = data.getMeshId(nearestMesh);
    if(!meshId) throw new Error('No mesh id!');

    const invModel = mat4.invert(mat4.create(), nearestMesh.modelMatrix);
    const localCenter = vec3.transformMat4(vec3.create(), center, invModel!);

    data.eraseMesh(raycast.subtractCube(nearestMesh.data.vertices, nearestMesh.data.indices as Uint16Array, localCenter, 2.0), meshId);
}