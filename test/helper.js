import chai from 'chai';
import chaiImmutable from 'chai-immutable';
import { Server } from 'hapi';
import api from '../src/api';

chai.use(chaiImmutable);

const server = new Server();
server.connection({port: process.env.PORT});
server.start(() => {
  console.info(`Test server is listening at ${server.info.uri.toLowerCase()}\n`);
});

server.register(api, (err) => {
  if (err) {
    throw err;
  }
});

export { server };

