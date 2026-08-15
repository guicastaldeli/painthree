import * as data from "./data.js";
import * as raycast from "./raycast.js";

/**
 * 
 * Add Mesh
 * 
 */
export interface ToolAddMesh extends Tool {
    type: data.MeshType;
}

export const ToolAddMeshData: ToolAddMesh[] = [
    { 
        id: 'cube',
        label: 'Cube',
        type: data.MeshType.CUBE
    },
    { 
        id: 'pyramid',
        label: 'Pyramid',
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