import Joi from 'joi';
// import Boom from 'boom';
import fb from 'firebase';

export async function getBlogs() {
  return new Promise((resolve, reject) => {
    fb.root.child('blogs').once('value', (snapshot) => {
      resolve(snapshot.val());
    });
  });
}

export async function getBlog(id) {
  const blogs = await getBlogs();
  return blogs[id];
}

export const routes = [
  {
    path: '/blogs', method: 'GET', handler: async (request, reply) => {
      reply(await getBlogs());
    }
  },

  {
    path: '/blogs/{id}', method: 'GET', handler: async (request, reply) => {
      reply(await getBlog(request.params.id));
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

