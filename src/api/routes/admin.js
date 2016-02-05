import Joi from 'joi';
import {admins} from '../db';

export const routes = [
  {
    path: '/login', method: 'POST', handler: async (request, reply) => {
      const foundAuth = await admins.getAdmin(request.payload.auth);
      if (foundAuth) {
        request.auth.session.set({pass: request.payload.auth});
        reply({status: 'OK'});
      } else {
        request.auth.session.clear();
        reply({error: 'Unknown Auth'});
      }
    },
    payload: {
      auth: Joi.string()
    }
  }
];
