import { resolve } from 'path';
import { defineConfig } from 'vite';
import { terser } from 'rollup-plugin-terser'; // Import the terser plugin

export default defineConfig({
    build: {
        outDir: 'dist',
        assetsDir: '',
        sourcemap: false,
        minify: true,
        lib: {
            entry: resolve(__dirname, 'src/main.js'),
            name: 'FusionSync',
            fileName: 'js/fusion-sync',
        },
        rollupOptions: {
            output: {
                format: ['es', 'cjs', 'umd', 'iife'],
                assetFileNames: 'fusion-sync.css',
            },
            plugins: [
                terser(),
            ],
        },
    },
});
