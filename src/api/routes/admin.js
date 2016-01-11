import Joi from 'joi';
import {admins} from '../lib/db';

// -----------------------------------------------------------------------------
// Hapi routes -----------------------------------------------------------------
// -----------------------------------------------------------------------------

/*
 * Returns an admin entry based on the provided auth value if it exists.
 *
 * @param {String} auth - the authentication string
 * @return {Object}
 */
export async function getAdmin(auth) {
  return admins.findOne({auth});
}

export const routes = [
  {
    path: '/login', method: 'POST', handler: async (request, reply) => {
      const foundAuth = await getAdmin(request.payload.auth);
      if (foundAuth) {
        request.auth.session.set({pass: request.payload.auth});
        reply({status: 'OK'});
      } else {
        request.auth.session.clear();
        reply({error: 'Unknown Auth'});
      }
    },
    config: {
      validate: {
        payload: {
          auth: Joi.string()
        }
      }
    }
  }
];
