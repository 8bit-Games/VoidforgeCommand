// OpenHV Web Game JavaScript Interop
// Handles canvas, WebGL, input, and browser-specific operations

let gameCanvas = null;
let gl = null;
let gameContext = {
    canvas: null,
    gl: null,
    inputManager: null,
    audioContext: null,
    isInitialized: false
};

// Initialize the game canvas and WebGL context
window.initializeGameCanvas = function(canvasId) {
    try {
        gameCanvas = document.getElementById(canvasId);
        if (!gameCanvas) {
            throw new Error(`Canvas element with id '${canvasId}' not found`);
        }

        // Initialize WebGL context
        gl = gameCanvas.getContext('webgl2') || gameCanvas.getContext('webgl');
        if (!gl) {
            throw new Error('WebGL is not supported in this browser');
        }

        // Store in game context
        gameContext.canvas = gameCanvas;
        gameContext.gl = gl;

        // Set up canvas properties
        setupCanvas();

        // Initialize input handling
        initializeInputHandling();

        // Initialize audio context
        initializeAudioContext();

        gameContext.isInitialized = true;
        console.log('Game canvas initialized successfully');

        return true;
    } catch (error) {
        console.error('Failed to initialize game canvas:', error);
        throw error;
    }
};

// Set up canvas properties and event handlers
function setupCanvas() {
    // Set canvas size and properties
    gameCanvas.width = 1024;
    gameCanvas.height = 768;

    // Configure WebGL viewport
    gl.viewport(0, 0, gameCanvas.width, gameCanvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Handle canvas resize
    window.addEventListener('resize', handleCanvasResize);

    // Prevent context menu on right-click
    gameCanvas.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
}

// Handle canvas resize for responsive design
function handleCanvasResize() {
    if (!gameCanvas) return;

    const container = gameCanvas.parentElement;
    const containerRect = container.getBoundingClientRect();

    // Maintain aspect ratio
    const aspectRatio = 1024 / 768;
    let newWidth = containerRect.width - 40; // Account for padding
    let newHeight = newWidth / aspectRatio;

    if (newHeight > containerRect.height - 40) {
        newHeight = containerRect.height - 40;
        newWidth = newHeight * aspectRatio;
    }

    gameCanvas.style.width = newWidth + 'px';
    gameCanvas.style.height = newHeight + 'px';

    // Update WebGL viewport
    if (gl) {
        gl.viewport(0, 0, gameCanvas.width, gameCanvas.height);
    }
}

// Initialize input handling (mouse, keyboard, touch)
function initializeInputHandling() {
    gameContext.inputManager = {
        keys: {},
        mouse: { x: 0, y: 0, buttons: 0 },
        touches: []
    };

    // Keyboard events
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Mouse events
    gameCanvas.addEventListener('mousedown', handleMouseDown);
    gameCanvas.addEventListener('mouseup', handleMouseUp);
    gameCanvas.addEventListener('mousemove', handleMouseMove);
    gameCanvas.addEventListener('wheel', handleMouseWheel);

    // Touch events for mobile support
    gameCanvas.addEventListener('touchstart', handleTouchStart);
    gameCanvas.addEventListener('touchend', handleTouchEnd);
    gameCanvas.addEventListener('touchmove', handleTouchMove);

    console.log('Input handling initialized');
}

// Initialize Web Audio API
function initializeAudioContext() {
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        gameContext.audioContext = new AudioContext();

        // Handle browser autoplay policy
        if (gameContext.audioContext.state === 'suspended') {
            const resumeAudio = () => {
                gameContext.audioContext.resume();
                document.removeEventListener('click', resumeAudio);
                document.removeEventListener('keydown', resumeAudio);
            };
            document.addEventListener('click', resumeAudio);
            document.addEventListener('keydown', resumeAudio);
        }

        console.log('Audio context initialized');
    } catch (error) {
        console.warn('Failed to initialize audio context:', error);
    }
}

// Input event handlers
function handleKeyDown(event) {
    gameContext.inputManager.keys[event.code] = true;

    // Prevent default for game-relevant keys
    if (isGameKey(event.code)) {
        event.preventDefault();
    }
}

function handleKeyUp(event) {
    gameContext.inputManager.keys[event.code] = false;
}

function handleMouseDown(event) {
    const rect = gameCanvas.getBoundingClientRect();
    gameContext.inputManager.mouse.x = event.clientX - rect.left;
    gameContext.inputManager.mouse.y = event.clientY - rect.top;
    gameContext.inputManager.mouse.buttons |= (1 << event.button);

    event.preventDefault();
}

function handleMouseUp(event) {
    gameContext.inputManager.mouse.buttons &= ~(1 << event.button);
    event.preventDefault();
}

function handleMouseMove(event) {
    const rect = gameCanvas.getBoundingClientRect();
    gameContext.inputManager.mouse.x = event.clientX - rect.left;
    gameContext.inputManager.mouse.y = event.clientY - rect.top;
}

function handleMouseWheel(event) {
    // Handle zoom/scroll operations
    event.preventDefault();
}

// Touch event handlers for mobile support
function handleTouchStart(event) {
    event.preventDefault();
    updateTouches(event.touches);
}

function handleTouchEnd(event) {
    event.preventDefault();
    updateTouches(event.touches);
}

function handleTouchMove(event) {
    event.preventDefault();
    updateTouches(event.touches);
}

function updateTouches(touches) {
    gameContext.inputManager.touches = Array.from(touches).map(touch => {
        const rect = gameCanvas.getBoundingClientRect();
        return {
            id: touch.identifier,
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    });
}

// Check if a key is relevant for the game
function isGameKey(keyCode) {
    const gameKeys = [
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'KeyW', 'KeyA', 'KeyS', 'KeyD',
        'Space', 'Enter', 'Escape',
        'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5',
        'KeyQ', 'KeyE', 'KeyR', 'KeyT', 'KeyY'
    ];
    return gameKeys.includes(keyCode);
}

// Asset loading utilities
window.loadGameAsset = async function(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load asset: ${response.status} ${response.statusText}`);
        }
        return await response.arrayBuffer();
    } catch (error) {
        console.error('Asset loading failed:', error);
        throw error;
    }
};

// WebGL utilities
window.createShader = function(type, source) {
    if (!gl) return null;

    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
};

window.createProgram = function(vertexShader, fragmentShader) {
    if (!gl) return null;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program linking error:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
};

// Performance monitoring
window.getPerformanceInfo = function() {
    return {
        memory: performance.memory ? {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
        } : null,
        timing: performance.timing,
        now: performance.now()
    };
};

// Browser capability detection
window.getBrowserCapabilities = function() {
    return {
        webgl: !!gl,
        webgl2: !!(gameCanvas && gameCanvas.getContext('webgl2')),
        webAudio: !!(window.AudioContext || window.webkitAudioContext),
        indexedDB: !!window.indexedDB,
        serviceWorker: 'serviceWorker' in navigator,
        webAssembly: typeof WebAssembly === 'object',
        touch: 'ontouchstart' in window,
        mobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    };
};

// Cleanup function
window.cleanupGame = function() {
    if (gameContext.audioContext) {
        gameContext.audioContext.close();
    }

    // Remove event listeners
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('resize', handleCanvasResize);

    if (gameCanvas) {
        gameCanvas.removeEventListener('mousedown', handleMouseDown);
        gameCanvas.removeEventListener('mouseup', handleMouseUp);
        gameCanvas.removeEventListener('mousemove', handleMouseMove);
        gameCanvas.removeEventListener('wheel', handleMouseWheel);
        gameCanvas.removeEventListener('touchstart', handleTouchStart);
        gameCanvas.removeEventListener('touchend', handleTouchEnd);
        gameCanvas.removeEventListener('touchmove', handleTouchMove);
    }

    gameContext.isInitialized = false;
    console.log('Game cleanup completed');
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('OpenHV Web Game JavaScript loaded');
    console.log('Browser capabilities:', window.getBrowserCapabilities());
});
