/**
 * Zyra Browser - Renderer Script
 * 
 * This script handles all UI interactions in the browser window.
 * It manages navigation controls, URL input, and webview interactions.
 * 
 * Key Components:
 * - Navigation button handlers (back, forward, reload)
 * - URL bar input and submission
 * - Webview event listeners (loading, navigation, title updates)
 * - Developer tools toggle
 * - Keyboard shortcuts
 */

// ============================================
// DOM ELEMENT REFERENCES
// Cache DOM elements for better performance
// ============================================

const elements = {
    // Navigation buttons
    btnBack: document.getElementById('btn-back'),
    btnForward: document.getElementById('btn-forward'),
    btnReload: document.getElementById('btn-reload'),
    btnDevTools: document.getElementById('btn-devtools'),

    // URL input
    urlInput: document.getElementById('url-input'),

    // Webview (the actual browser content)
    webview: document.getElementById('webview'),

    // Loading indicator
    loadingBar: document.getElementById('loading-bar')
};

// ============================================
// STATE
// Track the current state of the browser
// ============================================

const state = {
    isDevToolsOpen: false,
    isLoading: false
};

// ============================================
// URL UTILITIES
// Functions for URL validation and formatting
// ============================================

/**
 * Checks if a string is a valid URL
 * @param {string} string - The string to check
 * @returns {boolean} True if valid URL
 */
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * Formats user input into a proper URL
 * - Adds https:// if no protocol specified
 * - Converts search terms to Google search
 * 
 * @param {string} input - Raw user input
 * @returns {string} Formatted URL
 */
function formatUrl(input) {
    // Trim whitespace
    input = input.trim();

    // If empty, return current URL or default
    if (!input) {
        return elements.webview.src || 'https://www.google.com';
    }

    // If already a valid URL, return as-is
    if (isValidUrl(input)) {
        return input;
    }

    // If looks like a domain (contains dot, no spaces)
    if (input.includes('.') && !input.includes(' ')) {
        return 'https://' + input;
    }

    // Otherwise, treat as a search query
    return 'https://www.google.com/search?q=' + encodeURIComponent(input);
}

// ============================================
// NAVIGATION FUNCTIONS
// Core browser navigation functionality
// ============================================

/**
 * Navigate to a URL
 * @param {string} url - The URL to navigate to
 */
function navigateTo(url) {
    const formattedUrl = formatUrl(url);
    elements.webview.src = formattedUrl;
}

/**
 * Go back in history
 */
function goBack() {
    if (elements.webview.canGoBack()) {
        elements.webview.goBack();
    }
}

/**
 * Go forward in history
 */
function goForward() {
    if (elements.webview.canGoForward()) {
        elements.webview.goForward();
    }
}

/**
 * Reload the current page
 */
function reload() {
    elements.webview.reload();
}

/**
 * Toggle developer tools for the webview
 */
function toggleDevTools() {
    if (state.isDevToolsOpen) {
        elements.webview.closeDevTools();
        state.isDevToolsOpen = false;
        elements.btnDevTools.classList.remove('active');
    } else {
        elements.webview.openDevTools();
        state.isDevToolsOpen = true;
        elements.btnDevTools.classList.add('active');
    }
}

// ============================================
// UI UPDATE FUNCTIONS
// Functions that update the UI state
// ============================================

/**
 * Update the navigation button states (enabled/disabled)
 * Called after each navigation to reflect current state
 */
function updateNavigationButtons() {
    elements.btnBack.disabled = !elements.webview.canGoBack();
    elements.btnForward.disabled = !elements.webview.canGoForward();
}

/**
 * Update the URL bar with the current page URL
 * @param {string} url - The URL to display
 */
function updateUrlBar(url) {
    // Only update if not focused (to not disrupt typing)
    if (document.activeElement !== elements.urlInput) {
        elements.urlInput.value = url;
    }
}

/**
 * Show loading state
 */
function showLoading() {
    state.isLoading = true;
    elements.loadingBar.classList.remove('complete');
    elements.loadingBar.classList.add('loading');
}

/**
 * Hide loading state
 */
function hideLoading() {
    state.isLoading = false;
    elements.loadingBar.classList.remove('loading');
    elements.loadingBar.classList.add('complete');

    // Reset after animation
    setTimeout(() => {
        elements.loadingBar.classList.remove('complete');
    }, 600);
}

// ============================================
// EVENT HANDLERS
// Set up all event listeners
// ============================================

/**
 * Initialize all event handlers
 */
function initializeEventHandlers() {
    // --- Navigation Button Clicks ---

    elements.btnBack.addEventListener('click', goBack);
    elements.btnForward.addEventListener('click', goForward);
    elements.btnReload.addEventListener('click', reload);
    elements.btnDevTools.addEventListener('click', toggleDevTools);

    // --- URL Bar Events ---

    // Handle Enter key in URL bar
    elements.urlInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            navigateTo(elements.urlInput.value);
            elements.urlInput.blur(); // Remove focus after navigation
        }

        // Escape key clears focus
        if (event.key === 'Escape') {
            elements.urlInput.blur();
            // Restore current URL
            updateUrlBar(elements.webview.getURL());
        }
    });

    // Select all text when clicking into URL bar
    elements.urlInput.addEventListener('focus', () => {
        elements.urlInput.select();
    });

    // --- Webview Events ---

    // Page started loading
    elements.webview.addEventListener('did-start-loading', () => {
        showLoading();
    });

    // Page finished loading
    elements.webview.addEventListener('did-stop-loading', () => {
        hideLoading();
        updateNavigationButtons();
    });

    // URL changed (handles redirects, link clicks, etc.)
    elements.webview.addEventListener('did-navigate', (event) => {
        updateUrlBar(event.url);
        updateNavigationButtons();
    });

    // In-page navigation (anchors, pushState, etc.)
    elements.webview.addEventListener('did-navigate-in-page', (event) => {
        updateUrlBar(event.url);
        updateNavigationButtons();
    });

    // Page title changed - update window title
    elements.webview.addEventListener('page-title-updated', (event) => {
        document.title = event.title ? `${event.title} - Zyra` : 'Zyra Browser';
    });

    // Handle new window requests (open in same webview)
    elements.webview.addEventListener('new-window', (event) => {
        // Navigate to the new URL instead of opening a new window
        navigateTo(event.url);
    });

    // --- Keyboard Shortcuts ---

    document.addEventListener('keydown', (event) => {
        // Alt + Left Arrow: Go back
        if (event.altKey && event.key === 'ArrowLeft') {
            event.preventDefault();
            goBack();
        }

        // Alt + Right Arrow: Go forward
        if (event.altKey && event.key === 'ArrowRight') {
            event.preventDefault();
            goForward();
        }

        // Ctrl/Cmd + R: Reload
        if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
            event.preventDefault();
            reload();
        }

        // F12: Toggle dev tools
        if (event.key === 'F12') {
            event.preventDefault();
            toggleDevTools();
        }

        // Ctrl/Cmd + L: Focus URL bar
        if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
            event.preventDefault();
            elements.urlInput.focus();
            elements.urlInput.select();
        }

        // F5: Reload (alternative)
        if (event.key === 'F5') {
            event.preventDefault();
            reload();
        }
    });
}

// ============================================
// INITIALIZATION
// Start the browser UI
// ============================================

/**
 * Initialize the browser UI
 * Called when the DOM is ready
 */
function initialize() {
    console.log('Zyra Browser initializing...');

    // Set up event handlers
    initializeEventHandlers();

    // Initial state update
    updateNavigationButtons();

    // Wait for webview to be ready
    elements.webview.addEventListener('dom-ready', () => {
        console.log('Webview ready');
        updateUrlBar(elements.webview.getURL());
    });

    console.log('Zyra Browser initialized');
}

// Start when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
