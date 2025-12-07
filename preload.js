/**
 * Zy Browser - Preload Script
 * 
 * This script runs in a privileged context before the renderer loads.
 * It creates a secure bridge between the main process and renderer
 * using Electron's contextBridge API.
 * 
 * Security note:
 * - Only expose necessary APIs to the renderer
 * - Never expose Node.js or Electron internals directly
 * - Validate all data passed through the bridge
 */

const { contextBridge, ipcRenderer } = require('electron');

// ============================================
// EXPOSED API
// ============================================

/**
 * Expose a minimal, secure API to the renderer process.
 * This is accessed via `window.zyAPI` in the renderer.
 */
contextBridge.exposeInMainWorld('zyAPI', {
    /**
     * Get the application version
     * @returns {Promise<string>} The app version
     */
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),

    /**
     * Platform information for UI customization
     */
    platform: process.platform
});

// ============================================
// NOTES FOR CUSTOMIZATION
// ============================================

/**
 * To add more IPC functionality:
 * 
 * 1. Add a handler in main.js:
 *    ipcMain.handle('my-action', (event, args) => {
 *        // Handle the action
 *        return result;
 *    });
 * 
 * 2. Expose it here:
 *    myAction: (args) => ipcRenderer.invoke('my-action', args)
 * 
 * 3. Use in renderer.js:
 *    const result = await window.zyAPI.myAction(args);
 */
