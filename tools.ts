import * as data from "./data.js";
import * as raycast from "./raycast.js";

/**
 * 
 * Add Mesh
 * 
 */
export interface tool_ToolAddMesh extends Tool {
    type: data.MeshType;
    category: typeof category_ToolAddMesh;
}

const category_ToolAddMesh = 'Add Mesh' as const;

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