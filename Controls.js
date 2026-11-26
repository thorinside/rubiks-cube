/**
 * Controls.js
 * Handles keyboard and mouse input for the Rubik's cube.
 */
export class Controls {
    constructor() {
        this.keys = {};
        this.isScrambling = false;
        this.isPaused = false;

        // Key mappings for face rotations
        // Each key maps to { face: 'U', direction: 1 } where direction is 1 (clockwise) or -1 (counter-clockwise)
        this.keyMap = {
            // Up face
            'q': { face: 'U', direction: 1 },
            'w': { face: 'U', direction: -1 },
            // Down face
            'a': { face: 'D', direction: 1 },
            's': { face: 'D', direction: -1 },
            // Right face
            'e': { face: 'R', direction: 1 },
            'd': { face: 'R', direction: -1 },
            // Left face
            'z': { face: 'L', direction: 1 },
            'x': { face: 'L', direction: -1 },
            // Front face
            'r': { face: 'F', direction: 1 },
            'f': { face: 'F', direction: -1 },
            // Back face
            't': { face: 'B', direction: 1 },
            'y': { face: 'B', direction: -1 }
        };

        // Mouse/touch state
        this.mouse = {
            x: 0,
            y: 0,
            isDown: false
        };

        this.initEventListeners();
    }

    initEventListeners() {
        // Keyboard listeners
        window.addEventListener('keydown', (e) => {
            if (this.isPaused) return;

            const key = e.key.toLowerCase();

            // Space bar - pause/resume
            if (key === ' ') {
                this.isPaused = !this.isPaused;
                return;
            }

            // Check if this key controls a face
            if (this.keyMap[key]) {
                this.keys[key] = true;
                this.handleKeyPress(key);
            }
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (this.keyMap[key]) {
                this.keys[key] = false;
            }
        });

        // Mouse wheel for zooming (handled by OrbitControls, but we can add custom)
        window.addEventListener('mousedown', (e) => {
            this.mouse.isDown = true;
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mouseup', () => {
            this.mouse.isDown = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (this.mouse.isDown) {
                // This could be used for custom camera controls
                // For now, OrbitControls handles camera movement
            }
        });

        // Touch support
        window.addEventListener('touchstart', (e) => {
            this.mouse.isDown = true;
            this.mouse.x = e.touches[0].clientX;
            this.mouse.y = e.touches[0].clientY;
        }, { passive: false });

        window.addEventListener('touchend', () => {
            this.mouse.isDown = false;
        });

        window.addEventListener('touchmove', (e) => {
            if (this.mouse.isDown) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    handleKeyPress(key) {
        // This is called when a key is pressed down
        // The actual rotation is handled in the animation loop
        // to allow for continuous rotation when holding keys
    }

    /**
     * Get the current state of keys
     */
    getKeyState() {
        return this.keys;
    }

    /**
     * Check if a specific key is pressed
     */
    isKeyPressed(key) {
        return this.keys[key] || false;
    }

    /**
     * Set pause state
     */
    setPaused(paused) {
        this.isPaused = paused;
    }

    /**
     * Check if paused
     */
    isPausedState() {
        return this.isPaused;
    }
}
