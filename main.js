import { createRequire } from 'node:module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { app, BrowserWindow } = require('electron/main');
const path = require('node:path');

const { Window } = await import('./.out/window.js');

function createWindow() {
    const win = new BrowserWindow({
        width: Window.WIDTH,
        height: Window.HEIGHT,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile('index.html');
    win.setMenu(null);
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});