import Joi from 'joi';
import Boom from 'boom';
import db from '../../lib/db';
import { parseMarkdown } from '../../lib/parser';

const pages = db.collection('pages');

// -----------------------------------------------------------------------------
// Database lookup functions ---------------------------------------------------
// -----------------------------------------------------------------------------

/**
 * Returns the requested page, including an additional field, `html`, which
 * represents the rendered Markdown for the page.
 *
 * @param {String} name - the name of the page to retrieve
 * @return {Object}
 */
export async function getPage(name) {
  const promise = pages.findOne({ name });

  promise.then((page) => {
    page.html = parseMarkdown(page);
  });

  return promise;
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
  }
];
