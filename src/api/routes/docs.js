import Joi from 'joi';
import Boom from 'boom';
import {db, docs} from '../lib/db';
import {parseHeader, parseMarkdown} from '../../utils/markdownParser.js';

// -----------------------------------------------------------------------------
// Database interaction functions ----------------------------------------------
// -----------------------------------------------------------------------------

/**
 * Returns all docs of the given type with the content field omitted.
 *
 * @param {String} type - the type of the docs to retrieve
 * @return {Array}
 */
export async function getDocs(type) {
  return docs.find({type}, {content: false}).toArray();
}

/**
 * Retrieves one doc based on the given query parameters. Additionally,
 * retrieving docs via this method will add an additional field to the object,
 * `html`, which represents the rendered Markdown of the doc.
 *
 * @param {Object} params - The params to use for looking up
 * @return {Object}
 */
async function getDoc(params) {
  // TODO: This should exclude the content field unless it's an admin session
  const promise = docs.findOne(params);

  promise.then((doc) => {
    doc.html = parseMarkdown(doc.content);
  });

  return promise;
}

/**
 * Retrieves the specified doc by id.
 *
 * @param {ObjectId} id - The MongoDB id of the doc to retrieve
 * @return {Object}
 */
export async function getDocById(id) {
  return getDoc({_id: db.ObjectId(id)});
}

/**
 * Retrieves the specified doc by slug and type.
 *
 * @param {String type - The type of the doc to retrieve
 * @param {String} slug - The URL slug of the doc to retrieve
 * @return {Object}
 */
export async function getDocBySlug(type, slug) {
  return getDoc({type, slug});
}

/**
 * Updates the given doc keyed by MongoID to have the new markdown content.
 *
 * @param {String} name - the MongoID of the post to update
 * @param {String} newContent - the new markdown content of the post
 */
export async function saveDoc(docId, newContent) {
  const header = parseHeader(newContent);

  // TODO: This needs to clear out fields that are no longer present in the header.

  return docs.save({
    _id: db.ObjectId(docId),
    ...header,
    content: newContent
  });
}

/**
 * Creates a new post object in the database and returns the MongoID.
 */
export async function createDoc(type) {
  const newId = db.ObjectId().toString();
  const content = [
    '---',
    'type: ' + type,
    'title: ' + newId,
    'slug: ' + newId,
    '---'
  ].join('\n');

  return docs.save({
    _id: db.ObjectId(newId),
    title: newId,
    slug: newId,
    type,
    content
  });
}

/**
 * Deletes the given doc keyed by MongoID
 *
 * @param {String} name - the MongoID of the post to delete
 */
export async function deleteDoc(docId) {
  return docs.remove({
    _id: db.ObjectId(docId),
  });
}

// -----------------------------------------------------------------------------
// Hapi routes -----------------------------------------------------------------
// -----------------------------------------------------------------------------

export const routes = [
  {
    path: '/docs', method: 'GET', handler: async (request, reply) => {
      try {
        reply(await getDocs(request.query.type));
      } catch (e) {
        reply(Boom.wrap(e));
      }
    },
    config: {
      validate: {
        query: {
          type: Joi.string()
        }
      }
    }
  },

  {
    path: '/docs/{id}', method: 'GET', handler: async (request, reply) => {
      try {
        const post = await getDocById(request.params.id);
        reply(post === null ? Boom.notFound() : post);
      } catch (e) {
        reply(Boom.wrap(e));
      }
    },
    config: {
      validate: {
        params: {
          id: Joi.string().length(24).hex().required()
        }
      }
    }
  },

  {
    path: '/docs/{id}', method: 'POST', handler: async (request, reply) => {
      try {
        reply(await saveDoc(request.params.id, request.payload));
      } catch (e) {
        reply(Boom.wrap(e));
      }
    },
    config: {
      validate: {
        params: {
          id: Joi.string().length(24).hex().required()
        }
      }
    }
  },

  {
    path: '/docs/{id}', method: 'DELETE', handler: async (request, reply) => {
      try {
        reply(await deleteDoc(request.params.id));
      } catch (e) {
        reply(Boom.wrap(e));
      }
    },
    config: {
      validate: {
        params: {
          id: Joi.string().length(24).hex().required()
        }
      }
    }
  },

  {
    path: '/docs/{type}/{slug}', method: 'GET', handler: async (request, reply) => {
      try {
        const post = await getDocBySlug(request.params.type, request.params.slug);
        reply(post === null ? Boom.notFound() : post);
      } catch (e) {
        reply(Boom.wrap(e));
      }
    },
    config: {
      validate: {
        params: {
          type: Joi.string(),
          slug: Joi.string()
        }
      }
    }
  },

  {
    path: '/docs/{type}/create', method: 'POST', handler: async (request, reply) => {
      try {
        reply(await createDoc(request.params.type));
      } catch (e) {
        reply(Boom.wrap(e));
      }
    },
    config: {
      validate: {
        params: {
          type: Joi.string().required(),
        }
      }
    }
  }
];

