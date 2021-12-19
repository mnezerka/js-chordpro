import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';

export default [
    {
        input: 'src/index.js',
        output: {
            sourcemap: true,
            format: 'cjs',
            name: 'jschordpro',
            file: 'dist/js-chordpro.js',
            exports: "named" // supress warning regarding default exports 
        },
        plugins: [
            // resolve plugin loads modules from node_modules (dependences) and 
            // includes necessary stuff into final bundle
            resolve({
                jsnext: true,
                main: true,
                browser: true
            }),

            // solves all require commands
            commonjs(),

            // minifies final bundle
            terser()
        ],
        watch: {
            clearScreen: false
        }
    }
];