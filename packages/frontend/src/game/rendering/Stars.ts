import vertexSrc from './shaders/stars.vert';
import fragmentSrc from './shaders/stars.frag';
import { Container, Geometry, Mesh, Shader, Texture } from 'pixi.js';
import starUrl from './star.png'

export class Stars {

    private uniforms = {
        baseResolution: window.innerWidth > window.innerHeight ? [800, 600] : [600, 800],
        playerPosition: [0, 0],
        uSampler: Texture.from(starUrl)
    }

    constructor(stage: Container) {

        // The stars consist of a single mesh whose vertex positions are calculated on the GPU.
        const starsQuantity = 256;
        const starsPositions: number[][] = [];
        const uv: number[] = [];
        const verticesIndices: number[] = [];

        for (let i = 0; i < starsQuantity; i++) {
            const x = (Math.random() * 2 - 1) * 800;
            const y = (Math.random() * 2 - 1) * 600;
            const z = 1 - Math.sqrt(Math.random());
            // Each vertex need to know where is the center of the star.
            // This allows the shader to "teleport" the star when it goes offscreen
            starsPositions.push([
                x, y, z,
                x, y, z,
                x, y, z,
                x, y, z
            ]);
            uv.push(
                0, 0,
                1, 0,
                1, 1,
                0, 1
            );
            // Vertex indices for each triangle
            const indexOffset = i * 4;
            verticesIndices.push(
                indexOffset, indexOffset + 1, indexOffset + 2,
                indexOffset, indexOffset + 2, indexOffset + 3
            );
        }

        // Order by Z depth, so transparency works properly
        starsPositions.sort((a, b) => a[2] - b[2]);

        const geometry = new Geometry()
            .addAttribute('starPosition', starsPositions.flat(), 3)
            .addAttribute('uv', uv, 2)
            .addIndex(verticesIndices);
        const shader = Shader.from(vertexSrc, fragmentSrc, this.uniforms);
        const mesh = new Mesh(geometry, shader as any);
        stage.addChild(mesh);

        window.addEventListener("resize", () => {
            this.uniforms.baseResolution = window.innerWidth > window.innerHeight ? [800, 600] : [600, 800];
        });
    }

    update(x: number, y: number): void {
        this.uniforms.playerPosition[0] = -x
        this.uniforms.playerPosition[1] = y
    }
}