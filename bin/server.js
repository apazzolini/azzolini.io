#!/usr/bin/env node

// Enables ES6 support
require('babel/register')({
  stage: 0,
  sourceMap: 'inline',
  retainLines: true,
  plugins: ['typecheck']
});

var path = require('path');
var rootDir = path.resolve(__dirname, '..');

global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DISABLE_SSR__ = false;
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

var WebpackIsomorphicTools = require('webpack-isomorphic-tools');
global.webpackIsomorphicTools = new WebpackIsomorphicTools(require('../webpack/webpack-isomorphic-tools'))
	.development(__DEVELOPMENT__)
	.server(rootDir, function() {
    require('../src/server');
  });

