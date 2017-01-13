import Promise from 'bluebird';
import { parseHeader, parseMarkdown } from '../../utils/markdownParser.js';

export default (db) => {
  const docs = Promise.promisifyAll(db.collection('docs'));

  // ---------------------------------------------------------------------------
  // Private -------------------------------------------------------------------
  // ---------------------------------------------------------------------------

  const findDoc = async (params, includeMd) => {
    const promise = docs.findOneAsync(params);

    promise.then((doc) => {
      doc.html = parseMarkdown(doc.content);
      if (!includeMd) {
        delete doc.content;
      }
    });

    return promise;
  };

  // ---------------------------------------------------------------------------
  // Public --------------------------------------------------------------------
  // ---------------------------------------------------------------------------

  return {

    __collection: docs,

    /**
     * Creates a new post object in the database and returns the MongoID.
     */
    create: async (type) => {
      const newId = db.ObjectId().toString();
      const content = [
        '---',
        'type: ' + type,
        'title: ' + newId,
        'slug: ' + newId,
        '---'
      ].join('\n');

      return docs.saveAsync({
        _id: db.ObjectId(newId),
        title: newId,
        slug: newId,
        type,
        content
      });
    },

    /**
     * Returns all docs of the given type with the content field omitted.
     *
     * @param {String} type - the type of the docs to retrieve
     * @return {Array}
     */
    getAllByType: async (type) => {
      const params = type ? { type } : {};
      return docs.findAsync(params, { content: false });
    },

    /**
     * Retrieves the specified doc by id.
     *
     * @param {ObjectId} id - The MongoDB id of the doc to retrieve
     * @param {Boolean} includeMd - Whether or not to include markdown in the response
     * @return {Object}
     */
    getById: async (id, includeMd = false) => findDoc({ _id: db.ObjectId(id) }, includeMd),

    /**
     * Retrieves the specified doc by slug and type.
     *
     * @param {String} type - The type of the doc to retrieve
     * @param {String} slug - The URL slug of the doc to retrieve
     * @param {Boolean} includeMd - Whether or not to include markdown in the response
     * @return {Object}
     */
    getBySlug: async (type, slug, includeMd = false) => findDoc({ type, slug }, includeMd),

    /**
     * Updates the given doc keyed by MongoID to have the new markdown content.
     *
     * @param {String} docId - the MongoID of the post to update
     * @param {String} newContent - the new markdown content of the post
     */
    save: async (docId, newContent) => {
      const header = parseHeader(newContent);

      // TODO: This needs to clear out fields that are no longer present in the header.

      const x = await docs.saveAsync({
        _id: db.ObjectId(docId),
        ...header,
        content: newContent
      });

      return x;
    },

    /**
     * Deletes the given doc keyed by MongoID
     *
     * @param {String} docId - the MongoID of the post to delete
     */
    remove: async (docId) => docs.removeAsync({
      _id: db.ObjectId(docId)
    })

  };
};
