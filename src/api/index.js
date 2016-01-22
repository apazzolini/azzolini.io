import path from 'path';
import Boom from 'boom';

const routeFiles = [
  'routes/admin.js',
  'routes/docs.js'
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
  // TODO: Rewrite this using Redux compose/applyMiddleware
  const getTryCatchWrappedHandler = (handler) => {
    return async (request, reply) => {

      try {
        const response = await handler(request, reply);

        if (response === null) {
          // By convention, if the response is null, we'll return a 404
          reply(Boom.notFound());
        } else if (response._events) {
          // The handler called reply()
          // do nothing as the response is already set
        } else {
          reply(response);
        }
      } catch (e) {
        reply(Boom.wrap(e));
      }
    };
  };

  routeFiles.forEach((routeFile) => {
    const routes = require(path.join(__dirname, routeFile)).routes;
    const preparedRoutes = routes.map((route) => {
      const wrappedHandler = async (request, reply) => {
        return await getTryCatchWrappedHandler(route.handler)(request, reply);
      };

      // TODO: This needs to be expanded to capture all Hapi properties
      const preparedRoute = {
        path: route.path,
        method: route.method,
        handler: wrappedHandler,
        config: {
          auth: route.auth,
          validate: {
            query: route.query,
            params: route.params,
            payload: route.payload
          }
        }
      };

      return preparedRoute;
    });

    server.route(preparedRoutes);
  });

  next();
};

exports.register.attributes = {
  name: 'api',
  version: '0.1.0'
};
