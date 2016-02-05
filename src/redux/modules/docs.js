import fromError from '../utils/fromError';
import {parseMarkdown, parseHeader} from '../../utils/markdownParser.js';

// Initial State ---------------------------------------------------------------

export const initialState = {
  loaded: false,
  entities: {}
};

// Utility Functions -----------------------------------------------------------

const getBySlug = (state, type, slug) => (
  state.get('entities').find(doc => (
    doc.get('slug') === slug && doc.get('type') === type)
  )
);

// Reducers --------------------------------------------------------------------

export const reducers = {

  'docs/loadList': (state, action) => state.merge({
    loading: true
  }),

  'docs/loadListOk': (state, action) => {
    const unloadedDocs = {};

    // We only want to merge in docs that haven't already been loaded. Also,
    // although the API server returns an array of docs, we want them keyed
    // by _id (the Mongo ID) for use in the app.
    action.result.forEach((p) => {
      if (!state.hasIn('entities', p._id, 'loaded')) {
        unloadedDocs[p._id] = p;
      }
    });

    return state.mergeDeep({
      loading: false,
      loaded: true,
      entities: unloadedDocs
    });
  },

  'docs/loadListFail': (state, action) => state.merge({
    loading: false,
    loaded: false,
    loadError: fromError(action.error)
  }),

  'docs/loadDoc': (state, action) => {
    const doc = getBySlug(state, action.docType, action.slug);

    if (doc) {
      return state.mergeDeep({
        entities: {
          [doc.get('_id')]: {
            loading: true
          }
        }
      });
    }

    // If we couldn't find a doc by the slug, that must mean we're doing
    // server-side rendering directly to a doc page. In this case, we can
    // ignore the loading state.
    return state;
  },

  'docs/loadDocOk': (state, action) => state.mergeDeep({
    entities: {
      [action.result._id]: {
        loading: false,
        loaded: true,
        ...action.result
      }
    }
  }),

  'docs/loadDocFail': (state, action) => {
    const doc = getBySlug(state, action.docType, action.slug);

    if (doc) {
      return state.mergeDeep({
        entities: {
          [doc.get('_id')]: {
            loading: false,
            loaded: false,
            loadError: fromError(action.error)
          }
        }
      });
    }

    // See above comment in loadDoc
    return state;
  },

  'docs/updateContent': (state, action) => state.mergeDeep({
    entities: {
      [action.doc._id]: {
        ...parseHeader(action.newContent),
        content: action.newContent,
        html: parseMarkdown(action.newContent),
        updateError: false,
        dirty: true
      }
    }
  }),

  'docs/updateContentFail': (state, action) => state.mergeDeep({
    entities: {
      [action.doc._id]: {
        content: action.newContent,
        updateError: action.message
      }
    }
  }),

  'docs/save': (state, action) => state.mergeDeep({
    entities: {
      [action.doc._id]: {
        saving: true
      }
    }
  }),

  'docs/saveOk': (state, action) => state.mergeDeep({
    entities: {
      [action.doc._id]: {
        saving: false,
        saved: true,
        dirty: false
      }
    }
  }),

  'docs/saveFail': (state, action) => state.mergeDeep({
    entities: {
      [action.doc._id]: {
        saving: false,
        saved: false,
        saveError: fromError(action.error)
      }
    }
  }),

  'docs/delete': (state, action) => state.mergeDeep({
    entities: {
      [action.docId]: {
        deleting: true
      }
    }
  }),

  'docs/deleteOk': (state, action) => (
    state.deleteIn(['entities', action.docId])
  ),

  'docs/deleteFail': (state, action) => state.mergeDeep({
    entities: {
      [action.docId]: {
        deleting: false,
        deleteError: fromError(action.error)
      }
    }
  }),

  'docs/create': (state, action) => state.mergeDeep({
    creating: true
  }),

  'docs/createOk': (state, action) => state.mergeDeep({
    creating: false,
    entities: {
      [action.result._id]: action.result
    }
  }),

  'docs/createFail': (state, action) => state.mergeDeep({
    creating: false,
    createError: fromError(action.error)
  })

};

// Action Creators -------------------------------------------------------------

export const actions = {

  load: () => ({
    type: 'docs/loadList',
    apiRequest: (api) => api.get('/docs?type=post')
  }),

  loadDoc: (globalState, type, slug) => ({
    type: 'docs/loadDoc',
    apiRequest: (api) => api.get(`/docs/${type}/${slug}`),
    slug
  }),

  updateContent: (doc, newContent) => ({
    type: 'docs/updateContent',
    doc,
    newContent
  }),

  updateContentFailed: (doc, newContent, message) => ({
    type: 'docs/updateContentFail',
    doc,
    newContent,
    message
  }),

  save: (doc, newContent) => ({
    type: 'docs/save',
    apiRequest: (api) => api.post(`/docs/${doc._id}`, newContent),
    doc
  }),

  create: (type) => ({
    type: 'docs/create',
    apiRequest: (api) => api.post(`/docs/${type}/create`)
  }),

  deleteDoc: (docId) => ({
    type: 'docs/delete',
    apiRequest: (api) => api.delete(`/docs/${docId}`),
    docId
  })

};

// Selectors -------------------------------------------------------------------

export const selectors = {

  isLoaded: (globalState) => globalState.docs.get('loaded'),

  isFullyLoaded: (globalState, type, slug) => {
    const doc = getBySlug(globalState.docs, type, slug);
    return doc && doc.get('loaded');
  }

};
