import { defineConfig } from 'vite'
import { resolve } from 'path'
import glsl from 'vite-plugin-glsl'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: '/astropirates/',
    plugins: [glsl(), react()],
    server: {
        port: 3000
    },
    esbuild: {
        keepNames: true,
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                admin: resolve(__dirname, 'admin/index.html'),
            },
            output: {
                manualChunks: {
                    'pixi-js': ['pixi.js'],
                }
            }
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                keep_fnames: /^using$/,
                keep_classnames: /^LongType$/,
            },
        },
    },
    define: {
        'process.env': {}
    }
})