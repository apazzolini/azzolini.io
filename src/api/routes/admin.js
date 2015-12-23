import Joi from 'joi';

// -----------------------------------------------------------------------------
// Hapi routes -----------------------------------------------------------------
// -----------------------------------------------------------------------------

export const routes = [
  {
    path: '/login', method: 'POST', handler: async (request, reply) => {
      request.auth.session.set({pass: request.payload.auth});
      reply({status: 'OK'});
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
