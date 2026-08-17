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
    icon: string;
    category: typeof category_ToolAddMesh;
}

export const ToolAddMesh: tool_ToolAddMesh[] = [
    { 
        id: 'cube',
        label: 'Cube',
        icon: './resource/icon/test.jpg',
        category: category_ToolAddMesh,
        type: data.MeshType.CUBE
    },
    { 
        id: 'pyramid',
        label: 'Pyramid',
        icon: './resource/icon/test.jpg',
        category: category_ToolAddMesh,
        type: data.MeshType.PYRAMID
    },
    {
        id: 'sphere',
        label: 'Sphere',
        icon: './resource/icon/test.jpg',
        category: category_ToolAddMesh,
        type: data.MeshType.SPHERE
    }
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
    icon: string;
}

export const ToolEraser: tool_ToolEraser[] = [
    {
        id: 'eraser',
        label: 'Eraser',
        icon: './resource/icon/test.jpg',
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

const PaletteRenderer = (
    tool: tool_ToolPalette, 
    watchKey: string,
    rgb: string, 
    hex: string, 
    showColorPicker: boolean
) => 
    `<button class="tool-btn palette-btn" 
        data-tool="${tool.id}"
        ${watchKey ? `watch-data="${watchKey}" watch-prop="backgroundColor"` : ''}
        style="background-color: ${rgb}">
    </button>
    ${showColorPicker ? `<input type="color" 
        class="color-picker" 
        value="${hex}" 
        data-tool="${tool.id}"
        watch-data="newColor"
        watch-prop="value">` : ''}
    `

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
    const rgb = `rgb(${(tool as tool_ToolPalette).color.map(c => Math.round(c * 255)).join(',')})`;
    
    data.SetValue('activeColor', rgb);
    data.setActiveColor((tool as tool_ToolPalette).color);
    
    return;
}

function ToolPaletteRenderer(tool: Tool, isLast: boolean): string {
    const t = tool as tool_ToolPalette;
    const watchKey = t.id === 'palette_0' ? 'activeColor' : 
                t.id === `palette_${data.Palette._.length - 1}` ? 
                'newColor' : '';

    const rgb =  `rgb(${t.color.map(c => Math.round(c * 255)).join(',')})`;
    const hex = data.rgbToHex(t.color);
    
    const renderer = PaletteRenderer(t, watchKey, rgb, hex, isLast);
    return renderer;
}

function updateColor(content: HTMLElement): void {
    content.addEventListener('input', (e) => {
        const picker = (e.target as HTMLElement).closest('.color-picker') as HTMLInputElement;
        if(!picker) return;

        const rgb = data.hexToRgb(picker.value);
        data.setNewColor(rgb);
        data.setActiveColor(rgb);
        data.SetValue('newColor', `rgb(${rgb.map(c => Math.round(c * 255)).join(',')})`);
        data.SetValue('activeColor', `rgb(${rgb.map(c => Math.round(c * 255)).join(',')})`);
    });
}
/**
 * 
 */

/**
 * 
 * Scale
 * 
 */
export const category_ToolScale = 'Scale' as const;

const ScaleRenderer = (tool: Tool, _index: number, _arr: Tool[]) => {
    const t = tool as tool_ToolScale;
    return `
        <div class="tool-scale-container">
            <label class="tool-scale-label">
                Scale: <span class="tool-scale-value" watch-data="scaleValue" watch-prop="textContent">${t.value}</span>
            </label>
            <input type="range" 
                class="tool-scale-slider" 
                min="1" max="100" 
                value="${t.value}"
                data-tool="${tool.id}"
                watch-data="scaleValue"
                watch-prop="value"
                step="1"
            />
        </div>
    `;
};

export interface tool_ToolScale extends Tool {
    category: typeof category_ToolScale;
    value: number;
}

export const ToolScale: tool_ToolScale[] = [
    {
        id: 'scale',
        label: 'Scale',
        icon: './resource/icon/scale.jpg',
        category: category_ToolScale,
        value: 50
    }
];

export function isToolScale(tool: Tool | null): tool is tool_ToolScale {
    const val = tool !== null && tool?.category === category_ToolScale;
    return val;
}

function updateScale(content: HTMLElement): void {
    content.addEventListener('input', (e) => {
        const slider = (e.target as HTMLElement).closest('.tool-scale-slider') as HTMLInputElement;
        if(!slider) return;

        const value = parseInt(slider.value);
        data.setScale(value);

        const valueDisplay = slider.parentElement?.querySelector('.tool-scale-value');
        if(valueDisplay) valueDisplay.textContent = `${value}`;
    });
}
/**
 * 
 */

export interface Tool {
    id: string;
    label: string;
    category: string;
    icon?: string;
}

export const Tools = {
    get data(): Tool[] {
        return [
            ...ToolAddMesh,
            ...ToolEraser,
            ...ToolPalette._,
            ...ToolScale
        ]
    }
}

let activeTool: Tool | null = null;
let UnwatchState: (() => void) | null = null;

// Get Active Tool
export function getActiveTool(): Tool | null {
    const val = activeTool;
    return val;
}

// Set Active Tool
export function setActiveTool(tool: Tool | null): void {
    activeTool = tool;
    data.SetValue('activeTool', tool?.id ?? null);
}

// Find Tool
export function findTool(id: string): Tool | null {
    const val = Tools.data.find(t => t.id === id) ?? null;
    return val;
}

// Apply State
function applyState(el: HTMLElement, value: any): void {
    const prop = el.getAttribute('watch-prop')!;
    
    if(prop === 'value') (el as HTMLInputElement).value = value as string;
    else if(prop === 'selected') el.classList.toggle('selected', value === el.getAttribute('data-tool'));
    else if(prop === 'textContent') el.textContent = value;
    else (el.style as any)[prop] = value;
}

// Update Data
function updateData(content: HTMLElement): void {
    content.querySelectorAll('[watch-data]').forEach(el => {
        const key = el.getAttribute('watch-data');
        const value = data.GetValue(key!);
        if(value !== undefined) applyState(el as HTMLElement, value);
    });

    UnwatchState = data.Watch((key, value) => {
        content.querySelectorAll(`[watch-data="${key}"]`).forEach(el => {
            applyState(el as HTMLElement, value);
        });
    });

    updateColor(content);
    updateScale(content);
}

/**
 * 
 * Tool Menu
 * 
 */
const elToolMenu = 'el_tool_menu';

/* Renderer */
    const DefaultRenderer = (tool: Tool, _index: number, _arr: Tool[]) => 
        `<button class="tool-btn" 
            data-tool="${tool.id}"
            watch-data="activeTool"
            watch-prop="selected"
        >
            <img class="tool-icon" id="tool-icon-${tool.id}" src="${tool.icon}"/>
        </button>`;

    const ToolRenderers: Map<string, (tool: Tool, index: number, arr: Tool[]) => string> = new Map([
        [category_ToolAddMesh, DefaultRenderer],
        [category_ToolEraser, DefaultRenderer],
        [category_ToolPalette, (tool, index, arr) => ToolPaletteRenderer(tool, index === arr.length - 1)],
        [category_ToolScale, ScaleRenderer]
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

    updateData(content);

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
            if(isToolScale(tool)) {
                return;
            }
            setActiveTool(tool);
        }
    });
}

// On Closed
function onClosed(): void {
    UnwatchState?.();
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