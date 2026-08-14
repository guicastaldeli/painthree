import * as data from "./data.js";

const state = {
    id: null as string | null,
    html: null as HTMLElement | null,
    elements: new Map<string, any>(),
    handler: null as ((e: KeyboardEvent) => void) | null
};

// Toggle
export function toggle(id: string): void {
    if(state.id === id) {
        close();
    } else {
        open(id);
    }
}

// Is Open
export function isOpen(id: string): boolean {
    const val = state.id === id;
    return val;
}

// Get Active
export function getActive(): string | null {
    const val = state.id;
    return val;
}

/**
 * 
 * Register
 * 
 */
export function register(id: string, config: any): void {
    state.elements.set(id, config);
}

/**
 * 
 * Open
 * 
 */
export function open(id: string): void {
    if(state.id === id && state.html) return;
    if(state.html) close();

    const config = state.elements.get(id);
    if(!config) {
        console.error(`UI element ${id} not found`);
        return;
    }

    const container = document.createElement('div');
    container.className = 'ui';
    container.id = `ui-${id}`;
    container.innerHTML = config.html;
    document.body.appendChild(container);
    
    state.html = container;
    state.id = id;

    if(config.events) {
        config.events.forEach(({ selector, event, handler }: any) => {
            const el = container.querySelector(selector);
            if(el) el.addEventListener(event, handler);
        });
    }
    if(config.onOpen) {
        config.onOpen();
    }

    console.log(`UI "${id}" opened`);
}

/**
 * 
 * Close
 * 
 */
export function close(): void {
    if(!state.html) return;

    const id = state.id;
    const config = id ? state.elements.get(id) : null;
    document.body.removeChild(state.html);

    state.html = null;
    state.id = null;

    if(config && config.onClose) {
        config.onClose();
    }

    console.log(`UI "${id}" closed`);
}