/**
 * Materials.js
 * Defines the materials for each face of the Rubik's cube.
 */
export class Materials {
    constructor() {
        // Face colors for a standard Rubik's cube
        this.colors = {
            white: 0xffffff,
            yellow: 0xffd700,
            blue: 0x0000ff,
            green: 0x00ff00,
            red: 0xff0000,
            orange: 0xff4500
        };

        // Standard face arrangement (when white is up, yellow is front)
        // Up: White, Down: Yellow, Front: Blue, Back: Green, Left: Red, Right: Orange
        // We'll use a color map for each sticker position
        this.faceColors = {
            U: this.colors.white,  // Up
            D: this.colors.yellow, // Down
            F: this.colors.blue,   // Front
            B: this.colors.green,  // Back
            L: this.colors.red,    // Left
            R: this.colors.orange  // Right
        };

        this.createMaterials();
    }

    createMaterials() {
        this.materials = {};

        // Create a material for each face color
        for (const [name, color] of Object.entries(this.colors)) {
            this.materials[name] = new THREE.MeshPhongMaterial({
                color: color,
                shading: THREE.PhongShading,
                specular: 0x222222,
                shininess: 30
            });
        }

        // Edge material for the black borders between stickers
        this.edgeMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000,
            shading: THREE.PhongShading
        });

        // Sticker material (slightly different from face material for visual effect)
        this.stickerMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shading: THREE.PhongShading,
            shininess: 50
        });
    }

    getColor(face) {
        return this.faceColors[face] || this.colors.white;
    }
}
