import * as scene from './scene';

export const canvas = <HTMLCanvasElement>document.getElementById('content');
export const gl = <WebGL2RenderingContext>canvas.getContext('webgl');
export let shaderProgram: WebGLProgram | null = null!;

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

async function createShaderProgram(gl: WebGL2RenderingContext): Promise<WebGLProgram> {
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

async function render(): Promise<void> {
    try {
        shaderProgram = await createShaderProgram(gl);
        gl.useProgram(shaderProgram);
    } catch(err) {
        console.error(err);
    }

    gl.clearColor(1.0, 0.3, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    scene.render();
}

async function init(): Promise<void> {
    if(gl == null) {
        console.error('Unable to init WebGL!...');
        return;
    }

    await render();
}

init();