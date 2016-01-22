import chai from 'chai';
import chaiImmutable from 'chai-immutable';
import { Server } from 'hapi';
import hapiAuthCookie from 'hapi-auth-cookie';
import api from '../src/api';

chai.use(chaiImmutable);

const server = new Server();
server.connection({port: process.env.PORT});

server.register(hapiAuthCookie, (err) => {
  if (err) {
    throw err;
  }

  server.auth.strategy('session', 'cookie', 'optional', {
    password: 'test'
  });
});

server.register(api, (err) => {
  if (err) {
    throw err;
  }
});

server.start(() => {
  console.info(`Test server is listening at ${server.info.uri.toLowerCase()}\n`);
});

export { server };
