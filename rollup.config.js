import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-commonjs'

export default {
    input: './src/index.ts',
    output: {
        file: './dist/index.js',
        format: 'es6',
        sourcemap: true
    },
    plugins: [
        typescript()
    ],
}