import Joi from 'joi';
import Boom from 'boom';
import db from '../db';
import { parseMarkdown } from './parser';

const posts = db.collection('posts');

// -----------------------------------------------------------------------------
// Database lookup functions ---------------------------------------------------
// -----------------------------------------------------------------------------

/**
 * Returns all posts with the content field omitted.
 *
 * @return {Array}
 */
export async function getPosts() {
  return posts.find({}, {content: false}).toArray();
}

/**
 * Retrieves one post based on the given query parameters. Additionally,
 * retrieving posts via this method will add an additional field to the object,
 * `html`, which represents the rendered Markdown of the post.
 *
 * @param {Object} params - The params to use for looking up
 * @return {Object}
 */
async function getPost(params) {
  const promise = posts.findOne(params);

  promise.then((post) => {
    post.html = parseMarkdown(post);
  });

  return promise;
}

/**
 * Retrieves the specified post by id.
 *
 * @param {ObjectId} id - The MongoDB id of the post to retrieve
 * @return {Object}
 */
export async function getPostById(id) {
  return getPost({ _id: db.ObjectId(id) });
}

/**
 * Retrieves the specified post by normalized title.
 *
 * @param {String} title - The normalized title of the post to retrieve
 * @return {Object}
 */
export async function getPostByTitle(title) {
  return getPost({normalizedTitle: title});
}

// -----------------------------------------------------------------------------
// Hapi routes -----------------------------------------------------------------
// -----------------------------------------------------------------------------

export const routes = [
  {
    path: '/posts', method: 'GET', handler: async (request, reply) => {
      try {
        reply(await getPosts());
      } catch (e) {
        reply(Boom.wrap(e));
      }
    }
  },

  {
    path: '/posts/{id}', method: 'GET', handler: async (request, reply) => {
      try {
        const post = await getPostById(request.params.id);
        console.log('**', post);
        reply(post === null ? Boom.notFound() : post);
      } catch (e) {
        reply(Boom.wrap(e));
      }
    },
    config: {
      validate: {
        params: {
          id: [
            Joi.string().length(12).required(),
            Joi.string().length(24).hex().required()
          ]
        }
      }
    }
  },

  {
    path: '/posts/t/{title}', method: 'GET', handler: async (request, reply) => {
      try {
        const post = await getPostByTitle(request.params.title);
        reply(post === null ? Boom.notFound() : post);
      } catch (e) {
        reply(Boom.wrap(e));
      }
    },
    config: {
      validate: {
        params: {
          title: Joi.string()
        }
      }
    }
  }
];

