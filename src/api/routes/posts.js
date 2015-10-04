import Joi from 'joi';
import Boom from 'boom';
import db from '../lib/db';
import parseMarkdown from '../../utils/markdownParser.js';

const posts = db.collection('posts');

// -----------------------------------------------------------------------------
// Database interaction functions ----------------------------------------------
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
  // TODO: This should exclude the content field unless it's an admin session
  const promise = posts.findOne(params);

  promise.then((post) => {
    post.html = parseMarkdown(post.content);
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

/**
 * Updates the given post keyed by MongoID to have the new markdown content.
 *
 * @param {String} name - the MongoID of the post to update
 * @param {String} newContent - the new markdown content of the post
 */
export async function savePost(postId, newContent) {
  return posts.update(
    { _id: db.ObjectId(postId) },
    {
      $set: {
        content: newContent
      }
    }
  );
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
  },

  {
    path: '/posts/{id}', method: 'POST', handler: async (request, reply) => {
      try {
        const result = await savePost(request.params.id, request.payload);
        reply(result.nModified);
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
  }
];

