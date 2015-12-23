import {Server} from 'hapi';
import Boom from 'boom';
import inert from 'inert';
import hapiAuthCookie from 'hapi-auth-cookie';
import PrettyError from 'pretty-error';
import fs from 'fs';
import path from 'path';
import config from 'config';
import React from 'react';
import ReactDOM from 'react-dom/server';
import {Provider} from 'react-redux';
import {RoutingContext, match} from 'react-router';

import api from './api';

import createStore from './redux/create';
import ApiClient from './utils/ApiClient';
import Html from './utils/Html';
import getRoutes from './views/routes';
import fetchData from './utils/fetchComponentData';
import getRouteHttpStatus from './utils/getRouteHttpStatus';

const pretty = new PrettyError();
const server = new Server({
  connections: {
    router: {
      stripTrailingSlash: true
    }
  }
});
server.connection({port: process.env.PORT});

/**
 * Register the authentication cookie mechanism.
 */
server.register(hapiAuthCookie, (err) => {
  if (err) {
    throw err;
  }

  server.auth.strategy('session', 'cookie', 'optional', {
    password: config.get('hapi.authCookie.password'),
    cookie: 'sid',
    isSecure: false
  });
});

/**
 * Pretty print any request errors with their stack traces.
 */
server.on('request-error', (request, err) => {
  console.error('SERVER ERROR:', pretty.render(err));
});

/**
 * Register the api routes under the '/api' path prefix.
 */
server.register(api, {
  routes: {
    prefix: '/api'
  }
}, (err) => {
  if (err) {
    throw err;
  }
});

/**
 * Attempt to serve static requests from the public folder.
 *
 * If the file doesn't exist, don't raise an error - instead, continue
 * normally because the path could match a React route.
 */
server.register(inert, (err) => {
  if (err) {
    throw err;
  }

  server.route({
    method: 'GET',
    path: '/{params*}',
    handler: (request, reply) => {
      const filePath = path.join('static', request.path);
      fs.lstat(filePath, (statErr, stats) => {
        if (!statErr && stats.isFile()) {
          reply.file(filePath);
        } else {
          reply.continue();
        }
      });
    }
  });
});

/**
 * All other routes are handled via Redux and React Router.
 */
server.ext('onPreResponse', (request, reply) => {
  if (request.path.indexOf('/api/') === 0) {
    return reply.continue();
  }

  if (request.response.source !== null) {
    return reply.continue();
  }

  if (__DEVELOPMENT__) {
    // Webpack stats change in development due to hot module replacement
    webpackIsomorphicTools.refresh();
  }

  const initialState = {};
  if (request.auth.isAuthenticated) {
    initialState.admin = {
      isAdmin: true,
      isEditing: false
    };
  }

  const client = new ApiClient(request);
  const store = createStore(client, initialState);

  if (__DISABLE_SSR__) {
    reply('<!doctype html>\n' + ReactDOM.renderToString(
      <Html assets={webpackIsomorphicTools.assets()}
        component={<div/>}
        store={store}
      />
    ));
  } else {
    match({
      routes: getRoutes(store),
      location: request.url.path
    }, (error, redirectLocation, renderProps) => {
      if (redirectLocation) {
        reply.redirect(redirectLocation.pathname + redirectLocation.search);
      } else if (error) {
        reply(Boom.wrap(error));
      } else {
        try {
          fetchData(
            renderProps.components,
            store.getState, store.dispatch,
            renderProps.location,
            renderProps.params
          ).then(() => {
            const component = (
              <Provider store={store} key="provider">
                <RoutingContext {...renderProps} />
              </Provider>
            );

            const httpStatus = getRouteHttpStatus(renderProps.routes) || 200;

            return reply('<!doctype html>\n' + ReactDOM.renderToString(
              <Html assets={webpackIsomorphicTools.assets()}
                component={component}
                store={store}
              />
            )).code(httpStatus);
          }).catch((e) => {
            reply(Boom.wrap(e));
          });
        } catch (err) {
          reply(error);
        }
      }
    });
  }
});

server.start(() => {
  console.info('==> Server is listening at ' + server.info.uri.toLowerCase());
});
