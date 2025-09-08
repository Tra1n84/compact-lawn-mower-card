import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';


export default {
  input: 'src/card.ts',
  output: {
    file: 'dist/compact-lawn-mower-card.js',
    format: 'es',
    sourcemap: true
  },
  context: 'this',
  plugins: [
    typescript({ tsconfig: './tsconfig.json' }),
    json(),
    resolve({
      extensions: ['.js', '.ts'],
      browser: true,          
      preferBuiltins: false,
    }),
    commonjs(),
  ],
};
