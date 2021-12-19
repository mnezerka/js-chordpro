import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default [
    {
        input: 'src/index.js',
        output: {
            sourcemap: true,
            format: 'iife',
            name: 'jschordpro',
            file: 'dist/js-chordpro.js'
        },
        plugins: [
            commonjs(),
            terser()
        ],
    }
];