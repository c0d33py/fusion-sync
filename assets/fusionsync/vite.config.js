import { resolve } from 'path';
import { defineConfig } from 'vite'
import { minify } from "terser";
import autoprefixer from 'autoprefixer'

function minifyBundles() {
    return {
        name: "minifyBundles",
        async generateBundle(options, bundle) {
            for (let key in bundle) {
                if (bundle[key].type == 'chunk' && key.endsWith('.js')) {
                    const minifyCode = await minify(bundle[key].code, { sourceMap: false })
                    bundle[key].code = minifyCode.code
                }
            }
            return bundle
        },
    }
}

export default defineConfig({
    css: {
        devSourcemap: true,
        postcss: {
            plugins: [
                autoprefixer
            ],
        }
    },
    build: {
        target: ['es2015'],
        outDir: 'dist',
        emptyOutDir: true,
        cssCodeSplit: true,
        sourcemap: false,
        lib: {
            formats: ['es'],
            entry: [
                resolve(__dirname, './src/sync.js'),
            ],
            name: 'FusionSync',
            fileName: 'fusion-sync',
        },
        rollupOptions: {
            output: {
                assetFileNames: 'fusion-sync.[ext]',
            },
        },
    },
    plugins: [
        minifyBundles()
    ]
})