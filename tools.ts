import * as data from "./data.js";
import * as ui from "./ui.js";
import * as index from "./index.js";

/**
 * 
 * Add Mesh
 * 
 */
const category_ToolAddMesh = 'Add Mesh' as const;

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
/**
 * 
 */

export interface Tool {
    id: string;
    label: string;
    category: string;
}

export const Tools: Tool[] = [
    ...ToolAddMesh
    //...ToolBrush
]

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

/* Elements */
    ui.register(elToolMenu, {
        id: elToolMenu,
        html: `
            <div class="${elToolMenu}--main">
                <div id="${elToolMenu}--content">
                    ${buildTool().map(g => `
                        ${g.tools.map(t => `
                            <button id="tool-${t.label}-btn" data-tool="${t.id}">${t.label}</button>
                        `).join('')}
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
        if(tool) setActiveTool(tool);
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