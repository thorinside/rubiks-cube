/**
 * Cube.js
 * Represents the Rubik's cube - a 3x3x3 arrangement of cubies.
 */
import * as THREE from 'three';

export class Cube {
    constructor(materials) {
        this.materials = materials;
        this.cubies = [];
        this.cubeGroup = new THREE.Group();

        // Define face names and their normal directions
        this.faces = {
            U: { name: 'Up', normal: new THREE.Vector3(0, 1, 0), axis: new THREE.Vector3(0, 1, 0) },
            D: { name: 'Down', normal: new THREE.Vector3(0, -1, 0), axis: new THREE.Vector3(0, 1, 0) },
            F: { name: 'Front', normal: new THREE.Vector3(0, 0, -1), axis: new THREE.Vector3(0, 0, 1) },
            B: { name: 'Back', normal: new THREE.Vector3(0, 0, 1), axis: new THREE.Vector3(0, 0, 1) },
            L: { name: 'Left', normal: new THREE.Vector3(-1, 0, 0), axis: new THREE.Vector3(1, 0, 0) },
            R: { name: 'Right', normal: new THREE.Vector3(1, 0, 0), axis: new THREE.Vector3(1, 0, 0) }
        };

        // Initialize solved state - each cubie has stickers on exposed faces
        // Each cubie is identified by its position (x, y, z) where each is -1, 0, or 1
        this.initCubies();

        this.cubeGroup.add(...this.cubies.map(cubie => cubie.mesh));
        this.position = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0);

        // Current rotation state for each face (0 = solved)
        this.faceRotations = {
            U: 0, D: 0, F: 0, B: 0, L: 0, R: 0
        };
    }

    initCubies() {
        this.cubies = [];

        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    // Skip the center cubie (0,0,0) - it doesn't exist in a Rubik's cube
                    if (x === 0 && y === 0 && z === 0) continue;

                    const cubie = new Cubie(x, y, z, this.materials);
                    this.cubies.push(cubie);
                }
            }
        }
    }

    /**
     * Rotate a face of the cube
     * @param {string} face - Face name (U, D, F, B, L, R)
     * @param {number} degrees - Rotation angle in degrees (90, 180, 270)
     * @param {boolean} animate - Whether to animate the rotation
     */
    rotateFace(face, degrees = 90, animate = true) {
        const faceData = this.faces[face];
        if (!faceData) return;

        const angle = (degrees * Math.PI) / 180;
        const axis = faceData.axis.clone();

        // Find all cubies that belong to this face layer
        const layerCubies = this.cubies.filter(cubie => {
            const pos = cubie.position.clone();
            // Check if the cubie is on this face layer
            if (face === 'U' || face === 'D') {
                return Math.abs(pos.y) === 1;
            } else if (face === 'F' || face === 'B') {
                return Math.abs(pos.z) === 1;
            } else if (face === 'L' || face === 'R') {
                return Math.abs(pos.x) === 1;
            }
            return false;
        });

        // Rotate each cubie in the layer around the cube's center
        layerCubies.forEach(cubie => {
            if (animate) {
                this.animateCubie(cubie, angle, axis);
            } else {
                cubie.rotateAround(axis, angle);
            }
        });

        // Update face rotation tracking
        this.faceRotations[face] = (this.faceRotations[face] + degrees) % 360;
    }

    /**
     * Animate a cubie rotation
     */
    animateCubie(cubie, angle, axis) {
        // Store original position and rotation
        const originalPos = cubie.position.clone();
        const originalRotation = cubie.rotation.clone();

        // Animate over ~30 frames
        const frames = 30;
        let frame = 0;

        const animateStep = () => {
            const t = frame / frames;
            const currentAngle = angle * t;

            // Rotate position around origin
            const rotatedPos = originalPos.clone();
            rotatedPos.applyAxisAngle(axis, currentAngle);

            cubie.position.copy(rotatedPos);
            cubie.rotation.copy(originalRotation);
            cubie.rotation.applyAxisAngle(axis, currentAngle);

            frame++;
            if (frame < frames) {
                requestAnimationFrame(animateStep);
            }
        };

        animateStep();
    }

    /**
     * Scramble the cube with random moves
     */
    scramble(numMoves = 20) {
        const faces = Object.keys(this.faces);
        for (let i = 0; i < numMoves; i++) {
            const face = faces[Math.floor(Math.random() * faces.length)];
            const degrees = [90, 180, 270][Math.floor(Math.random() * 3)];
            this.rotateFace(face, degrees, true);
            // Small delay between moves for visual effect
            // In a real implementation, we'd use setTimeout or similar
        }
    }

    /**
     * Reset the cube to solved state
     */
    reset() {
        // Reset all cubie positions and rotations
        this.cubies.forEach((cubie, index) => {
            const x = index % 3 - 1;
            const y = Math.floor(index / 3) % 3 - 1;
            const z = Math.floor(index / 9) - 1;

            cubie.position.set(x, y, z);
            cubie.rotation.set(0, 0, 0);
        });

        // Reset face rotation tracking
        for (const face of Object.keys(this.faceRotations)) {
            this.faceRotations[face] = 0;
        }
    }

    /**
     * Get the current state of the cube for checking if solved
     */
    getState() {
        const state = {};
        for (const [face, data] of Object.entries(this.faces)) {
            state[face] = [];
            for (const cubie of this.cubies) {
                const sticker = cubie.getSticker(face);
                if (sticker) {
                    state[face].push(sticker.color);
                }
            }
        }
        return state;
    }

    /**
     * Check if the cube is solved
     */
    isSolved() {
        const state = this.getState();
        for (const [face, colors] of Object.entries(state)) {
            const firstColor = colors[0];
            for (let i = 1; i < colors.length; i++) {
                if (colors[i] !== firstColor) {
                    return false;
                }
            }
        }
        return true;
    }
}

/**
 * Cubie.js - Individual cubie (small cube) that makes up the Rubik's cube
 */
class Cubie {
    constructor(x, y, z, materials) {
        this.position = new THREE.Vector3(x, y, z);
        this.originalPosition = this.position.clone();
        this.materials = materials;

        // Create the cubie mesh
        this.geometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
        this.mesh = new THREE.Mesh(this.geometry, materials.materials.white); // Default material
        this.mesh.position.copy(this.position);

        // Add stickers for each exposed face
        this.stickers = {};
        this.addStickers();

        // Store which faces have stickers (for rendering)
        this.faceColors = {};
        this.updateFaceColors();
    }

    addStickers() {
        // Create sticker geometries for each face
        // Each sticker is a thin plane on the face of the cubie
        const stickerGeo = new THREE.PlaneGeometry(0.8, 0.8);
        const stickerMat = this.materials.stickerMaterial;

        // Up sticker (y = +0.45)
        const upSticker = new THREE.Mesh(stickerGeo, stickerMat);
        upSticker.position.set(0, 0.45, 0);
        upSticker.rotation.set(Math.PI / 2, 0, 0);
        this.mesh.add(upSticker);
        this.stickers.U = upSticker;

        // Down sticker (y = -0.45)
        const downSticker = new THREE.Mesh(stickerGeo, stickerMat);
        downSticker.position.set(0, -0.45, 0);
        downSticker.rotation.set(-Math.PI / 2, 0, 0);
        this.mesh.add(downSticker);
        this.stickers.D = downSticker;

        // Front sticker (z = -0.45)
        const frontSticker = new THREE.Mesh(stickerGeo, stickerMat);
        frontSticker.position.set(0, 0, -0.45);
        frontSticker.rotation.set(0, 0, 0);
        this.mesh.add(frontSticker);
        this.stickers.F = frontSticker;

        // Back sticker (z = +0.45)
        const backSticker = new THREE.Mesh(stickerGeo, stickerMat);
        backSticker.position.set(0, 0, 0.45);
        backSticker.rotation.set(0, Math.PI, 0);
        this.mesh.add(backSticker);
        this.stickers.B = backSticker;

        // Left sticker (x = -0.45)
        const leftSticker = new THREE.Mesh(stickerGeo, stickerMat);
        leftSticker.position.set(-0.45, 0, 0);
        leftSticker.rotation.set(0, 0, Math.PI / 2);
        this.mesh.add(leftSticker);
        this.stickers.L = leftSticker;

        // Right sticker (x = +0.45)
        const rightSticker = new THREE.Mesh(stickerGeo, stickerMat);
        rightSticker.position.set(0.45, 0, 0);
        rightSticker.rotation.set(0, 0, -Math.PI / 2);
        this.mesh.add(rightSticker);
        this.stickers.R = rightSticker;
    }

    updateFaceColors() {
        // Determine which faces are exposed based on position
        const x = this.position.x;
        const y = this.position.y;
        const z = this.position.z;

        // Default: no color (black edge)
        this.faceColors = {
            U: 0x000000,
            D: 0x000000,
            F: 0x000000,
            B: 0x000000,
            L: 0x000000,
            R: 0x000000
        };

        // Assign colors based on solved state position
        if (y === 1) this.faceColors.U = this.materials.colors.white;
        if (y === -1) this.faceColors.D = this.materials.colors.yellow;
        if (z === -1) this.faceColors.F = this.materials.colors.blue;
        if (z === 1) this.faceColors.B = this.materials.colors.green;
        if (x === -1) this.faceColors.L = this.materials.colors.red;
        if (x === 1) this.faceColors.R = this.materials.colors.orange;

        // Apply colors to stickers
        for (const [face, color] of Object.entries(this.faceColors)) {
            if (this.stickers[face]) {
                this.stickers[face].material.color.setHex(color);
            }
        }
    }

    getSticker(face) {
        return this.stickers[face];
    }

    rotateAround(axis, angle) {
        // Rotate position around origin
        this.position.applyAxisAngle(axis, angle);
        // Rotate the mesh
        this.mesh.rotation.applyAxisAngle(axis, angle);

        // Rotate stickers relative to the mesh
        for (const sticker of Object.values(this.stickers)) {
            sticker.rotation.applyAxisAngle(axis, angle);
        }
    }
}
