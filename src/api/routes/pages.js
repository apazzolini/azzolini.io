import Joi from 'joi';
import Boom from 'boom';
import db from '../lib/db';
import {parseMarkdown} from '../../utils/markdownParser.js';

const pages = db.collection('pages');

// -----------------------------------------------------------------------------
// Database interaction functions ----------------------------------------------
// -----------------------------------------------------------------------------

/**
 * Returns the requested page, including an additional field, `html`, which
 * represents the rendered Markdown for the page.
 *
 * @param {String} name - the name of the page to retrieve
 * @return {Object}
 */
export async function getPage(name) {
  // TODO: This should exclude the content field unless it's an admin session
  const promise = pages.findOne({ name });

  promise.then((page) => {
    page.html = parseMarkdown(page.content);
  });

  return promise;
}

/**
 * Updates the given page keyed by name to have the new markdown content.
 *
 * @param {String} name - the name of the page to update
 * @param {String} newContent - the new markdown content of the page
 */
export async function savePage(name, newContent) {
  return pages.update(
    { name },
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
    path: '/pages/{name}', method: 'GET', handler: async (request, reply) => {
      try {
        const page = await getPage(request.params.name);
        reply(page === null ? Boom.notFound() : page);
      } catch (e) {
        reply(Boom.wrap(e));
      }
    },
    config: {
      validate: {
        params: {
          name: Joi.string().required()
        }
      }
    }
  },

  {
    path: '/pages/{name}', method: 'POST', handler: async (request, reply) => {
      try {
        const result = await savePage(request.params.name, request.payload);
        reply(result.nModified);
      } catch (e) {
        reply(Boom.wrap(e));
      }
    },
    config: {
      validate: {
        params: {
          name: Joi.string().required()
        }
      }
    }
  }
];
