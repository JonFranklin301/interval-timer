import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import minify from 'rollup-plugin-babel-minify';
import pkg from './package.json';

export default [
  // browser-friendly UMD build
  {
    input: 'src/index.js',
    output: {
      name: 'intervalTimer',
      file: 'dist/interval-timer.umd.js',
      format: 'umd'
    },
    plugins: [
      resolve({
        browser: true
      }),
      babel({
        exclude: 'node_modules/**'
      })
    ]
  },
  // Minified browser-friendly UMD build
  {
    input: 'src/index.js',
    output: {
      name: 'intervalTimer',
      file: 'dist/interval-timer.umd.min.js',
      format: 'umd'
    },
    plugins: [
      resolve({
        browser: true
      }),
      babel({
        exclude: 'node_modules/**'
      }),
      minify({
        comments: false,
        banner:
          '/* Interval-Timer v' +
          pkg.version +
          '\nAuthor: ' +
          pkg.author +
          '\nLicense: ' +
          pkg.license +
          ' */',
        bannerNewLine: true
      })
    ]
  }
];
