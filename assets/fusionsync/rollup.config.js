import { defineConfig } from 'rollup';
import { terser } from 'rollup-plugin-terser';

export default defineConfig({
    input: 'dist/js/fusion-sync.js',
    output: {
        file: 'dist/js/fusion-sync.min.js', // Output minified file
        format: 'iife',
    },
    plugins: [terser()], // Apply minification
});
