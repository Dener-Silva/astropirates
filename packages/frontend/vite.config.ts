import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: '/astropirates/',
    plugins: [glsl(), react()],
    server: {
        port: 3000
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    'pixi-js': ['pixi.js'],
                }
            }
        }
    },
    define: {
        'process.env': {}
    }
})