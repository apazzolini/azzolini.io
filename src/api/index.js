import path from 'path';

const routes = [
  'info/get.js',
  'widgets/get.js'
];

/**
 * For every file defined in the above routes array, register the
 * Hapi.js routes exported by that file under the `routes` export.
 *
 * The manual import of routes is to allow different types of registration
 * with Hapi. For example, there could be an entire plugin that should
 * be registered as part of this api plugin.
 *
 * An alternate approach could be to put the simple routes under a nested
 * directory such as src/api/simple and then recursively find those files
 * and register them automatically.
 */
exports.register = (server, options, next) => {
  routes.forEach((route) => {
    server.route(require(path.join(__dirname, route)).routes);
  });

  next();
};

exports.register.attributes = {
  name: 'api',
  version: '0.1.0'
};
