# Zy Browser

A lightweight, minimalist web browser built with Electron.

![Zy Browser](https://img.shields.io/badge/Electron-28.0-blue) ![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-green)

## Features

- 🚀 **Lightweight** - Optimized for speed and low memory usage
- 🎨 **Minimal UI** - Clean, distraction-free browsing
- 🔧 **Developer Tools** - Built-in console for testing web apps
- ⌨️ **Keyboard Shortcuts** - Navigate efficiently
- 🌐 **Cross-Platform** - Works on Windows, macOS, and Linux
- 🔒 **Secure** - Standard security features enabled
- 🔌 **Developer API** - Full access to web APIs (Camera, Mic, etc.) for testing

## Installation

```bash
# Clone the repository
git clone https://github.com/neeer4j/Zy-Browser.git
cd Zy-Browser

# Install dependencies
npm install

# Run the browser
npm start
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + ←` | Go Back |
| `Alt + →` | Go Forward |
| `Ctrl + R` / `F5` | Reload |
| `Ctrl + L` | Focus URL Bar |
| `F12` | Toggle Developer Tools |

## Building for Distribution

```bash
npm run build:win    # Windows (NSIS installer)
npm run build:mac    # macOS (DMG)
npm run build:linux  # Linux (AppImage)
```

## Project Structure

```
ZyBrowser/
├── package.json       # Project config & dependencies
├── main.js            # Main Electron process
├── preload.js         # Secure IPC bridge
└── renderer/
    ├── index.html     # Browser UI
    ├── styles.css     # Dark theme styling
    └── renderer.js    # UI logic & navigation
```

## License

MIT
