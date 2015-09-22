import React from 'react';
import Location from 'react-router/lib/Location';
import PrettyError from 'pretty-error';
import { Server } from 'hapi';
import inert from 'inert';
import hapiAuthCookie from 'hapi-auth-cookie';
import fs from 'fs';
import path from 'path';
import createStore from './redux/create';
import api from './api';
import ApiClient from './utils/ApiClient';
import fetchAwareRouter from './utils/fetchAwareRouter';
import Html from './utils/Html';
import config from 'config';

const pretty = new PrettyError();
const server = new Server({
  connections: {
    router: {
      stripTrailingSlash: true
    }
  }
});

server.connection({port: process.env.PORT});
server.start(() => {
  console.info('==> Server is listening at ' + server.info.uri.toLowerCase());
});

/**
 * Register the authentication cookie mechanism.
 */
server.register(hapiAuthCookie, (err) => {
  if (err) {
    throw err;
  }

  server.auth.strategy('session', 'cookie', {
    password: config.get('hapi.authCookie.password'),
    cookie: 'sid',
    redirectTo: '/login',
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
    // Do not cache webpack stats: the script file would change since
    // hot module replacement is enabled in the development env
    webpackIsomorphicTools.refresh();
  }

  const client = new ApiClient(request);
  const store = createStore(client);
  const location = new Location(request.path, request.query);

  if (__DISABLE_SSR__) {
    reply('<!doctype html>\n' + React.renderToString(
      <Html assets={webpackIsomorphicTools.assets()}
        component={<div/>}
        store={store}/>
    ));
  } else {
    fetchAwareRouter(location, undefined, store)
      .then(({component, transition, isRedirect}) => {
        if (isRedirect) {
          reply.redirect(transition.redirectInfo.pathname);
          return;
        }

        reply('<!doctype html>\n' + React.renderToString(
          <Html assets={webpackIsomorphicTools.assets()}
            component={component}
            store={store}/>
        ));
      })
      .catch((error) => {
        if (error.redirect) {
          res.redirect(error.redirect);
          return;
        }

        console.error('ROUTER ERROR:', pretty.render(error));
        res.status(500).send({error: error.stack});
      });
  }
});
