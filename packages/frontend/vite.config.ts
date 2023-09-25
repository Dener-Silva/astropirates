import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
    plugins: [glsl()],
    server: {
        port: 3000
    },
    build: {
        outDir: 'dist'
    }
})