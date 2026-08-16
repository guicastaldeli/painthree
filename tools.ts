import * as data from "./data.js";
import * as ui from "./ui.js";
import * as index from "./index.js";

/**
 * 
 * Add Mesh
 * 
 */
export const category_ToolAddMesh = 'Add Mesh' as const;

export interface tool_ToolAddMesh extends Tool {
    type: data.MeshType;
    category: typeof category_ToolAddMesh;
}

export const ToolAddMesh: tool_ToolAddMesh[] = [
    { 
        id: 'cube',
        label: 'Cube',
        category: category_ToolAddMesh,
        type: data.MeshType.CUBE
    },
    { 
        id: 'pyramid',
        label: 'Pyramid',
        category: category_ToolAddMesh,
        type: data.MeshType.PYRAMID
    },
    /*{ ADD LATER.... 
        id: 'sphere',
        label: 'Sphere',
        type: data.MeshType.SPHERE
    }*/
]

export function isToolAddMesh(tool: Tool | null): tool is tool_ToolAddMesh {
    const val = tool !== null && 'type' in tool;
    return val;
}
/**
 * 
 */

/**
 * 
 * Eraser
 * 
 */
export const category_ToolEraser = 'Eraser' as const;

export interface tool_ToolEraser extends Tool {
    category: typeof category_ToolEraser;
}

export const ToolEraser: tool_ToolEraser[] = [
    {
        id: 'eraser',
        label: 'Eraser',
        category: category_ToolEraser
    }
];

export function isToolEraser(tool: Tool | null): tool is tool_ToolEraser {
    const val = tool !== null && tool.category === category_ToolEraser;
    return val;
}
/**
 * 
 */

/**
 * 
 * Palette
 * 
 */
export const category_ToolPalette = 'Palette' as const;

const PaletteRenderer = (tool: tool_ToolPalette, rgb: string) => 
    `<button class="tool-btn palette-btn" data-tool="${tool.id}" style="background-color: rgb(${rgb})"></button>`;

export interface tool_ToolPalette extends Tool {
    color: [number, number, number];
    category: typeof category_ToolPalette;
}

export const ToolPalette: tool_ToolPalette[] = data.Palette.map((color, i) => ({
    id: `palette_${i}`,
    label: `Color ${i}`,
    category: category_ToolPalette,
    color
}));

export function isToolPalette(tool: Tool | null): tool is tool_ToolPalette {
    const val = tool !== null && tool.category === category_ToolPalette;
    return val;
}

function activePalette(tool: Tool): void {
    const paletteTool = tool as tool_ToolPalette;
    data.setActiveColor(paletteTool.color);
    
    console.log(`Color selected: ${paletteTool.color}`);
}

function ToolPaletteRenderer(tool: Tool) {
    const t = tool as tool_ToolPalette;
    const v = 255;
    const rgb = t.color.map(c => Math.round(c * v)).join(',');
    
    const renderer = PaletteRenderer(t, rgb);
    return renderer;
}
/**
 * 
 */


export interface Tool {
    id: string;
    label: string;
    category: string;
}

export const Tools: Tool[] = [
    ...ToolAddMesh,
    ...ToolEraser,
    ...ToolPalette
];

let activeTool: Tool | null = null;

// Get Active Tool
export function getActiveTool(): Tool | null {
    const val = activeTool;
    return val;
}

// Set Active Tool
export function setActiveTool(tool: Tool | null): void {
    activeTool = tool;
}

// Find Tool
export function findTool(id: string): Tool | null {
    const val = Tools.find(t => t.id === id) ?? null;
    return val;
}

/**
 * 
 * Tool Menu
 * 
 */
const elToolMenu = 'el_tool_menu';

/* Renderer */
    const DefaultRenderer = (tool: Tool) => 
        `<button class="tool-btn" data-tool="${tool.id}">${tool.label}</button>`;

    const ToolRenderers: Map<string, (tool: Tool) => string> = new Map([
        [category_ToolAddMesh, DefaultRenderer],
        [category_ToolEraser, DefaultRenderer],
        [category_ToolPalette, (tool) => ToolPaletteRenderer(tool)]
    ]);

    function RenderTool(tool: Tool): string {
        const val = (ToolRenderers.get(tool.category) ?? DefaultRenderer)(tool);
        return val;
    }
/**/

/* Elements */
    ui.register(elToolMenu, {
        id: elToolMenu,
        html: `
            <div class="${elToolMenu}--main">
                <div id="${elToolMenu}--content">
                    ${buildTool().map(g => `
                        ${g.tools.map(t => RenderTool(t)).join('')}
                    `).join('')}
                </div>
            </div>
        `,
        onOpen: () => {
            onOpened();
        },
        onClose: () => {
            onClosed();
        }
    });
/**/

// On Opened
function onOpened(): void {
    const content = document.getElementById(`${elToolMenu}--content`);
    if(!content) return;

    content.addEventListener('click', (e) => {
        const btn = (e.target as HTMLElement).closest('[data-tool]');
        if(!btn) throw new Error('button error');

        const id = btn.getAttribute('data-tool');
        if(!id) throw new Error('id error');

        const tool = findTool(id);
        if(tool) {
            if(isToolPalette(tool)) {
                activePalette(tool);
                return;
            }
            setActiveTool(tool);
        }
    });
}

// On Closed
function onClosed(): void {
    index.canvas.requestPointerLock();
}

// Build Tool
function buildTool(): { category: string, tools: Tool[] }[] {
    const categories = [...new Set(Tools.map(t => t.category))]
    return categories.map(cat => ({
        category: cat,
        tools: Tools.filter(t => t.category === cat)
    }));
}

// Open Tool Menu
export function openToolMenu(): void {
    if(document.pointerLockElement) document.exitPointerLock();
    ui.toggle(elToolMenu);
}

// Is Tool Menu Open
export function isToolMenuOpen(): boolean {
    const val = ui.isOpen(elToolMenu);
    return val;
}