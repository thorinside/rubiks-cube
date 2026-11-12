/**
 * Animation.js
 * Handles the animation loop, including continuous key presses and scramble functionality.
 */
export class Animation {
    constructor(cube, controls) {
        this.cube = cube;
        this.controls = controls;
        this.isScrambling = false;
        this.scrambleMoves = [];
        this.scrambleIndex = 0;
        this.scrambleTimer = 0;
        this.lastKeyPress = {};
        this.keyHoldTimers = {};
        this.keyHoldDelay = 200; // ms before key repeat starts
    }

    update(deltaTime) {
        // Handle continuous key presses (holding a key rotates continuously)
        const keys = this.controls.getKeyState();

        for (const [key, isPressed] of Object.entries(keys)) {
            if (isPressed && this.controls.keyMap[key]) {
                this.handleKeyHold(key, deltaTime);
            }
        }

        // Handle scramble animation
        if (this.isScrambling) {
            this.updateScramble(deltaTime);
        }
    }

    handleKeyHold(key, deltaTime) {
        const mapping = this.controls.keyMap[key];
        if (!mapping) return;

        const face = mapping.face;
        const direction = mapping.direction;

        // Initialize key hold timer if not started
        if (!this.lastKeyPress[key]) {
            this.lastKeyPress[key] = Date.now();
            this.keyHoldTimers[key] = 0;
            return;
        }

        // Calculate time since last press
        const now = Date.now();
        const elapsed = now - this.lastKeyPress[key];

        // Only rotate after the hold delay
        if (elapsed > this.keyHoldDelay) {
            // Rotate the face
            const degrees = direction === 1 ? 90 : -90;
            this.cube.rotateFace(face, degrees, true);

            // Reset timer for next rotation
            this.lastKeyPress[key] = now;

            // Play a click sound or visual feedback could go here
        }
    }

    /**
     * Start scrambling the cube
     */
    startScramble(numMoves = 20, delayBetweenMoves = 300) {
        if (this.isScrambling) return;

        this.isScrambling = true;
        this.scrambleMoves = [];
        this.scrambleIndex = 0;
        this.scrambleTimer = 0;

        // Generate random move sequence
        const faces = Object.keys(this.cube.faces);
        const lastFace = null;

        for (let i = 0; i < numMoves; i++) {
            let face;
            do {
                face = faces[Math.floor(Math.random() * faces.length)];
            } while (face === lastFace); // Don't repeat the same face consecutively

            const direction = Math.random() > 0.5 ? 1 : -1;
            const degrees = direction === 1 ? 90 : -90;
            this.scrambleMoves.push({ face, degrees });

            lastFace = face;
        }

        // Start the scramble sequence
        this.nextScrambleMove();
    }

    /**
     * Stop scrambling
     */
    stopScramble() {
        this.isScrambling = false;
        this.scrambleIndex = 0;
    }

    /**
     * Update scramble animation
     */
    updateScramble(deltaTime) {
        if (!this.isScrambling || this.scrambleIndex >= this.scrambleMoves.length) {
            this.isScrambling = false;
            return;
        }

        // Time between moves (in seconds)
        const moveDelay = 0.5;

        this.scrambleTimer += deltaTime / 1000; // Convert to seconds

        if (this.scrambleTimer >= moveDelay) {
            this.scrambleTimer = 0;
            this.nextScrambleMove();
        }
    }

    /**
     * Execute the next scramble move
     */
    nextScrambleMove() {
        if (this.scrambleIndex >= this.scrambleMoves.length) {
            this.isScrambling = false;
            return;
        }

        const move = this.scrambleMoves[this.scrambleIndex];
        this.cube.rotateFace(move.face, move.degrees, true);
        this.scrambleIndex++;
    }

    /**
     * Reset the cube to solved state
     */
    resetCube() {
        this.cube.reset();
    }

    /**
     * Check if cube is solved
     */
    checkSolved() {
        return this.cube.isSolved();
    }
}
