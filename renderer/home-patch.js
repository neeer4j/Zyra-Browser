// Simple fix to use home screen
const DEFAULT_HOME = 'home.html'; // Relative path works in Electron

// Modify state to include settings
const state = {
    tabs: [],
    activeTabId: null,
    isSplitView: false,
    splitTabId: null,
    isSidebarOpen: true,
    metricsInterval: null,
    settings: {
        homepage: DEFAULT_HOME // Use home screen by default
    }
};
