import * as scene from "./scene.js";
import * as input from "./input.js";
import * as data from "./data.js";
import * as tools from "./tools.js";

export const canvas = <HTMLCanvasElement>document.getElementById('content');
export const gl = <WebGL2RenderingContext>canvas.getContext('webgl2');
export let shaderProgram: WebGLProgram | null = null!;

/**
 * 
 * Shader
 * 
 */
// Load
async function loadShader(gl: WebGL2RenderingContext, type: number, url: string): Promise<WebGLShader> {
    const res = await fetch(url);
    if(!res.ok) throw new Error(`Failed to load shader: ${url}`);

    const src = await res.text();
    console.log(`[${url}]:\n${src}`);
    if(!src) throw new Error('Source error');

    const shader = gl.createShader(type);
    if(!shader) throw new Error('shader error');
    
    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);

        throw new Error(`Shader compile error (${url}): ${info}`);
    }

    return shader;
}

// Set Shader Program
async function setShaderProgram(gl: WebGL2RenderingContext): Promise<WebGLProgram> {
    const [vertexShader, fragShader] = await Promise.all([
        loadShader(gl, gl.VERTEX_SHADER, './vert.glsl'),
        loadShader(gl, gl.FRAGMENT_SHADER, './frag.glsl')
    ]);

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);

    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(shaderProgram);
        gl.deleteProgram(shaderProgram);

        throw new Error(`Program link error: ${info}`);
    }

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragShader);

    return shaderProgram;
}

// Create Shader Program
async function createShaderProgram(): Promise<void> {
    if(gl == null) {
        console.error('gl error!'); 
        return;
    }

    try {
        shaderProgram = await setShaderProgram(gl);
        console.log('Shader program created successfully');
    } catch(err) {
        console.error(err);
        return;
    }
}

/**
 * 
 * Tick
 * 
 */
let lastTime = 0;
let deltaTime = 0;

function tick(): number {
    const currentTime = performance.now();
    deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    return deltaTime;
}

export function getDeltaTime(): number {
    const val = deltaTime;
    return val;
}

/**
 * 
 * Render
 * 
 */
// Resize
function resize(): void {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    const width = Math.floor(displayWidth * dpr);
    const height = Math.floor(displayHeight * dpr);
    if(canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;

        if(gl) gl.viewport(0, 0, width, height);
    }
}

// Render
function setRender(): void {
    const time = getDeltaTime();

    gl.useProgram(shaderProgram);
    resize();

    if(!data.getScreenTexture()) {
        data.createScreenTexture();
    }

    const framebuffer = data.getScreenFramebuffer();
    if(framebuffer) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);
        gl.clearColor(1.0, 0.3, 0.5, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        scene.renderScene();
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.clearColor(1.0, 0.3, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    scene.renderScene();
    scene.renderHud();

    input.processKeyboard(time);
}

function render() {
    tick();
    setRender();
    requestAnimationFrame(render);
}

/**
 * 
 * Init
 * 
 */
async function init(): Promise<void> {
    if(gl == null) {
        console.error('Unable to init WebGL!...');
        return;
    }

    await createShaderProgram();

    input.setupControls();

    window.addEventListener('resize', resize);

    tools.openToolMenu();
    
    render();
}

init();