import Joi from 'joi';
import Boom from 'boom';
import * as fb from '../../utils/firebase';

export async function getBlogs() {
  return fb.once('value', 'blogs');
}

export async function getBlog(id) {
  return fb.once('value', `blogs/${id}`);
}

export const routes = [
  {
    path: '/blogs', method: 'GET', handler: async (request, reply) => {
      try {
        reply(await getBlogs());
      } catch (e) {
        reply(Boom.wrap(e), 500);
      }
    }
  },

  {
    path: '/blogs/{id}', method: 'GET', handler: async (request, reply) => {
      try {
        reply(await getBlog(request.params.id));
      } catch (e) {
        reply(Boom.wrap(e), 500);
      }
    },
    config: {
      validate: {
        params: {
          id: Joi.number().min(0).required()
        }
      }
    }
  }
];

