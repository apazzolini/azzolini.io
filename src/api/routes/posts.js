import Joi from 'joi';
import Boom from 'boom';
import db from '../lib/db';
import {parseHeader, parseMarkdown} from '../../utils/markdownParser.js';

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
 * Retrieves the specified post by slug.
 *
 * @param {String} slug - The URL slug of the post to retrieve
 * @return {Object}
 */
export async function getPostBySlug(slug) {
  return getPost({ slug });
}

/**
 * Updates the given post keyed by MongoID to have the new markdown content.
 *
 * @param {String} name - the MongoID of the post to update
 * @param {String} newContent - the new markdown content of the post
 */
export async function savePost(postId, newContent) {
  const header = parseHeader(newContent);

  // TODO: This needs to clear out fields that are no longer present in the header.

  return posts.update(
    { _id: db.ObjectId(postId) },
    {
      $set: {
        ...header,
        content: newContent
      }
    }
  );
}

/**
 * Creates a new post object in the database and returns the MongoID.
 */
export async function createPost() {
  const newId = db.ObjectId().toString();
  const content = [
    '---',
    'title: ' + newId,
    'slug: ' + newId,
    '---'
  ].join('\n');

  return posts.save({
    _id: db.ObjectId(newId),
    title: newId,
    slug: newId,
    content
  });
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
    path: '/posts/s/{slug}', method: 'GET', handler: async (request, reply) => {
      try {
        const post = await getPostBySlug(request.params.slug);
        reply(post === null ? Boom.notFound() : post);
      } catch (e) {
        reply(Boom.wrap(e));
      }
    },
    config: {
      validate: {
        params: {
          slug: Joi.string()
        }
      }
    }
  },

  {
    path: '/posts/create', method: 'POST', handler: async (request, reply) => {
      try {
        const result = await createPost();
        reply({
          id: result._id.toString()
        });
      } catch (e) {
        reply(Boom.wrap(e));
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

