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

const PaletteRenderer = (tool: tool_ToolPalette, rgb: string, hex: string, showColorPicker: boolean) => 
    `<button class="tool-btn palette-btn" data-tool="${tool.id}" style="background-color: rgb(${rgb})"></button>
        ${showColorPicker ? `<input type="color" class="color-picker" value="${hex}" data-tool="${tool.id}" onclick="event.stopPropagation()">` : '' }
        `;

export interface tool_ToolPalette extends Tool {
    color: [number, number, number];
    category: typeof category_ToolPalette;
}

export const ToolPalette = {
    get _(): tool_ToolPalette[] {
        return data.Palette._.map((color, i) => ({
            id: `palette_${i}`,
            label: `Color ${i}`,
            category: category_ToolPalette,
            color
        }));
    }
}

export function isToolPalette(tool: Tool | null): tool is tool_ToolPalette {
    const val = tool !== null && tool.category === category_ToolPalette;
    return val;
}

function activePalette(tool: Tool): void {
    const paletteTool = tool as tool_ToolPalette;
    data.setActiveColor(paletteTool.color);
    
    console.log(`Color selected: ${paletteTool.color}`);
}

function ToolPaletteRenderer(tool: Tool, isLast: boolean): string {
    const t = tool as tool_ToolPalette;
    const v = 255;
    const rgb = t.color.map(c => Math.round(c * v)).join(',');
    
    const renderer = PaletteRenderer(t, rgb, data.rgbToHex(t.color), isLast);
    return renderer;
}

function updateColor(content: HTMLElement): void {
    // Active Color
    document.addEventListener('active-color-updated', (e) => {
        const { color } = (e as CustomEvent).detail;
        const btn = content.querySelector('[data-tool="palette_0"]') as HTMLElement;
        if(btn) btn.style.backgroundColor = `rgb(${color.map((c: number) => Math.round(c * 255)).join(',')})`;
    });

    // Color Picker
    content.addEventListener('input', (e) => {
        const picker = (e.target as HTMLElement).closest('.color-picker') as HTMLInputElement;
        if(!picker) return;

        const rgb = data.hexToRgb(picker.value);
        data.setNewColor(rgb);
        data.setActiveColor(rgb);

        picker.dispatchEvent(new CustomEvent('palette-updated', {
            bubbles: true,
            detail: { rgb }
        }));
    });
    content.addEventListener('palette-updated', (e) => {
        const { rgb } = (e as CustomEvent).detail;
        const btn = content.querySelector('.palette-btn:last-of-type') as HTMLElement;
        if(btn) btn.style.backgroundColor = `rgb(${rgb.map((c: number) => Math.round(c * 255)).join(',')})`;
    });
}
/**
 * 
 */


export interface Tool {
    id: string;
    label: string;
    category: string;
}

export const Tools = {
    get data(): Tool[] {
        return [
            ...ToolAddMesh,
            ...ToolEraser,
            ...ToolPalette._
        ]
    }
}

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
    const val = Tools.data.find(t => t.id === id) ?? null;
    return val;
}

/**
 * 
 * Tool Menu
 * 
 */
const elToolMenu = 'el_tool_menu';

/* Renderer */
    const DefaultRenderer = (tool: Tool, _index: number, _arr: Tool[]) => 
        `<button class="tool-btn" data-tool="${tool.id}">${tool.label}</button>`;

    const ToolRenderers: Map<string, (tool: Tool, index: number, arr: Tool[]) => string> = new Map([
        [category_ToolAddMesh, DefaultRenderer],
        [category_ToolEraser, DefaultRenderer],
        [category_ToolPalette, (tool, index, arr) => ToolPaletteRenderer(tool, index === arr.length - 1)]
    ]);

    function RenderTool(tool: Tool, index: number, arr: Tool[]): string {
        const val = (ToolRenderers.get(tool.category) ?? DefaultRenderer)(tool, index, arr);
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
                        ${g.tools.map((t, i, arr) => RenderTool(t, i, arr)).join('')}
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

    updateColor(content);

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
    const categories = [...new Set(Tools.data.map(t => t.category))]
    return categories.map(cat => ({
        category: cat,
        tools: Tools.data.filter(t => t.category === cat)
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