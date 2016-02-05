import config from 'config';
import hapiAuthCookie from 'hapi-auth-cookie';

export default (server, projectConfig) => {
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
};
