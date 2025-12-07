/**
 * Zy Browser - Main Process
 * 
 * This is the main Electron process that creates the browser window
 * and handles IPC communication with the renderer process.
 * 
 * Key responsibilities:
 * - Create and manage the main BrowserWindow
 * - Handle navigation IPC events (back, forward, reload, navigate)
 * - Manage developer tools toggle
 */

const { app, BrowserWindow, ipcMain, session, desktopCapturer } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// ============================================
// CONFIGURATION
// ============================================

// Default window dimensions (optimized for usability)
const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 800;

// Minimum window dimensions
const MIN_WIDTH = 400;
const MIN_HEIGHT = 300;

// ============================================
// WINDOW MANAGEMENT
// ============================================

// Keep a global reference of the window object to prevent garbage collection
let mainWindow = null;

/**
 * Creates the main browser window with optimized settings
 * for performance and low memory usage.
 */
function createWindow() {
    mainWindow = new BrowserWindow({
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        minWidth: MIN_WIDTH,
        minHeight: MIN_HEIGHT,

        // Use custom title bar for minimal UI
        frame: true,
        titleBarStyle: 'default',

        // Application Icon
        icon: path.join(__dirname, 'assets', 'zy.png'),

        // Window appearance
        backgroundColor: '#1a1a2e',
        show: false, // Don't show until ready (prevents white flash)

        // Web preferences for security and performance
        webPreferences: {
            // Enable preload script for secure IPC
            preload: path.join(__dirname, 'preload.js'),

            // Security: Enable context isolation
            contextIsolation: true,

            // Security: Disable node integration in renderer
            nodeIntegration: false,

            // Enable webview tag for the browser content
            webviewTag: true,

            // Performance: Enable hardware acceleration
            enableBlinkFeatures: '',

            // Disable remote module (deprecated, security risk)
            enableRemoteModule: false
        }
    });

    // Load the renderer HTML file
    mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

    // Show window when ready to prevent white flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Remove default menu for minimal UI
    mainWindow.setMenu(null);

    // Handle window closed event
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// ============================================
// IPC HANDLERS
// ============================================

/**
 * Set up IPC handlers for communication with the renderer process.
 * These handle navigation controls and dev tools toggle.
 */
function setupIpcHandlers() {
    // Handle navigation requests from renderer
    // Note: Actual navigation is handled by the webview in the renderer
    // These are placeholder handlers for potential future enhancements

    ipcMain.handle('get-app-version', () => {
        return app.getVersion();
    });

    // --- Developer Tools IPC ---

    // Get system metrics (RAM, CPU)
    ipcMain.handle('get-system-metrics', async () => {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const processMem = process.memoryUsage();

        return {
            totalMem: (totalMem / 1024 / 1024 / 1024).toFixed(2), // GB
            usedMem: (usedMem / 1024 / 1024 / 1024).toFixed(2),   // GB
            processRSS: (processMem.rss / 1024 / 1024).toFixed(2) // MB
        };
    });

    // Save screenshot to Downloads
    ipcMain.handle('save-screenshot', async (event, { buffer }) => {
        try {
            const downloadsPath = app.getPath('downloads');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `Zy-Screenshot-${timestamp}.png`;
            const filePath = path.join(downloadsPath, fileName);

            fs.writeFileSync(filePath, Buffer.from(buffer));
            return { success: true, path: filePath };
        } catch (error) {
            console.error('Screenshot save failed:', error);
            return { success: false, error: error.message };
        }
    });
}

// ============================================
// PERMISSION HANDLERS (Developer Mode)
// ============================================

/**
 * Set up permission handlers to grant all permissions for developer testing.
 * This allows testing of all modern web APIs including:
 * - Camera/Microphone (media)
 * - Geolocation
 * - Notifications
 * - Clipboard
 * - Screen capture
 * - USB/Serial/HID devices
 * - MIDI
 * - Sensors
 * - And more...
 * 
 * WARNING: This is intended for development/testing only.
 * For production, implement selective permission granting.
 */
function setupPermissionHandlers() {
    const ses = session.defaultSession;

    // Handle async permission requests (camera, mic, geolocation, etc.)
    ses.setPermissionRequestHandler((webContents, permission, callback) => {
        console.log(`[Zy] Permission requested: ${permission}`);
        // Grant all permissions for developer testing
        callback(true);
    });

    // Handle sync permission checks
    ses.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
        console.log(`[Zy] Permission check: ${permission} from ${requestingOrigin}`);
        // Allow all permission checks
        return true;
    });

    // Handle device permission requests (USB, Serial, HID)
    ses.setDevicePermissionHandler((details) => {
        console.log(`[Zy] Device permission requested: ${details.deviceType}`);
        // Grant all device permissions for developer testing
        return true;
    });

    console.log('[Zy] Developer mode: All permissions enabled');
}

// ============================================
// APP LIFECYCLE
// ============================================

// Create window when Electron is ready
app.whenReady().then(() => {
    setupPermissionHandlers();
    createWindow();
    setupIpcHandlers();

    // macOS: Re-create window when dock icon is clicked
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// ============================================
// PERFORMANCE OPTIMIZATIONS
// ============================================

// Disable hardware acceleration if not needed (reduces memory usage)
// Uncomment the line below if experiencing GPU issues:
// app.disableHardwareAcceleration();

// Reduce memory usage by limiting renderer process count
app.commandLine.appendSwitch('renderer-process-limit', '4');

// Enable memory optimization flags
app.commandLine.appendSwitch('enable-features', 'CalculateNativeWinOcclusion');

// ============================================
// EXPERIMENTAL WEB FEATURES (Developer Mode)
// ============================================

// Enable experimental web platform features for cutting-edge API testing
app.commandLine.appendSwitch('enable-experimental-web-platform-features');

// Enable WebGPU for graphics-intensive applications
app.commandLine.appendSwitch('enable-unsafe-webgpu');

// Enable WebXR for AR/VR applications
app.commandLine.appendSwitch('enable-features', 'WebXR');

// Allow insecure localhost for local development (useful for self-signed certs)
app.commandLine.appendSwitch('allow-insecure-localhost');
