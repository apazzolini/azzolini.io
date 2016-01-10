import {createReducer} from 'redux-immutablejs';
import Immutable from 'immutable';
import {fromError} from '../utils';
import {parseMarkdown, parseHeader} from '../../utils/markdownParser.js';

const LOAD_LIST = 'docs/LOAD_LIST';
const LOAD_LIST_OK = 'docs/LOAD_LIST_OK';
const LOAD_LIST_FAIL = 'docs/LOAD_LIST_FAIL';

const LOAD_DOC = 'docs/LOAD_DOC';
const LOAD_DOC_OK = 'docs/LOAD_DOC_OK';
const LOAD_DOC_FAIL = 'docs/LOAD_DOC_FAIL';

const UPDATE_CONTENT = 'docs/UPDATE_CONTENT';
const UPDATE_CONTENT_FAIL = 'docs/UPDATE_CONTENT_FAIL';
const SAVE = 'docs/SAVE';
const SAVE_OK = 'docs/SAVE_OK';
const SAVE_FAIL = 'docs/SAVE_FAIL';

const DELETE = 'docs/DELETE';
const DELETE_OK = 'docs/DELETE_OK';
const DELETE_FAIL = 'docs/DELETE_FAIL';

const CREATE = 'docs/CREATE';
const CREATE_OK = 'docs/CREATE_OK';
const CREATE_FAIL = 'docs/CREATE_FAIL';

const initialState = Immutable.fromJS({
  loaded: false,
  entities: {}
});

// -----------------------------------------------------------------------------
// Utility functions -----------------------------------------------------------
// -----------------------------------------------------------------------------

const getBySlug = (state, type, slug) => (
  state.get('entities').find(doc => (
    doc.get('slug') === slug && doc.get('type') === type)
  )
);

// -----------------------------------------------------------------------------
// Reducers --------------------------------------------------------------------
// -----------------------------------------------------------------------------

export default createReducer(initialState, {

  [LOAD_LIST]: (state, action) => state.merge({
    loading: true
  }),

  [LOAD_LIST_OK]: (state, action) => {
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

  [LOAD_LIST_FAIL]: (state, action) => state.merge({
    loading: false,
    loaded: false,
    loadError: fromError(action.error)
  }),

  [LOAD_DOC]: (state, action) => {
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

  [LOAD_DOC_OK]: (state, action) => state.mergeDeep({
    entities: {
      [action.result._id]: {
        loading: false,
        loaded: true,
        ...action.result
      }
    }
  }),

  [LOAD_DOC_FAIL]: (state, action) => {
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

    // See above comment in LOAD_DOC
    return state;
  },

  [UPDATE_CONTENT]: (state, action) => state.mergeDeep({
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

  [UPDATE_CONTENT_FAIL]: (state, action) => state.mergeDeep({
    entities: {
      [action.doc._id]: {
        content: action.newContent,
        updateError: action.message
      }
    }
  }),

  [SAVE]: (state, action) => state.mergeDeep({
    entities: {
      [action.doc._id]: {
        saving: true
      }
    }
  }),

  [SAVE_OK]: (state, action) => state.mergeDeep({
    entities: {
      [action.doc._id]: {
        saving: false,
        saved: true,
        dirty: false
      }
    }
  }),

  [SAVE_FAIL]: (state, action) => state.mergeDeep({
    entities: {
      [action.doc._id]: {
        saving: false,
        saved: false,
        saveError: fromError(action.error)
      }
    }
  }),

  [DELETE]: (state, action) => state.mergeDeep({
    entities: {
      [action.docId]: {
        deleting: true
      }
    }
  }),

  [DELETE_OK]: (state, action) =>
    state.deleteIn(['entities', action.docId]),

  [DELETE_FAIL]: (state, action) => state.mergeDeep({
    entities: {
      [action.docId]: {
        deleting: false,
        deleteError: fromError(action.error)
      }
    }
  }),

  [CREATE]: (state, action) => state.mergeDeep({
    creating: true
  }),

  [CREATE_OK]: (state, action) => state.mergeDeep({
    creating: false,
    entities: {
      [action.result._id]: action.result
    }
  }),

  [CREATE_FAIL]: (state, action) => {
    return state.mergeDeep({
      creating: false,
      createError: fromError(action.error)
    });
  }
});

// -----------------------------------------------------------------------------
// Actions creators ------------------------------------------------------------
// -----------------------------------------------------------------------------

export function isLoaded(globalState) {
  return globalState.docs.get('loaded');
}

export function load() {
  return {
    types: [LOAD_LIST, LOAD_LIST_OK, LOAD_LIST_FAIL],
    promise: (client) => client.get('/docs?type=post')
  };
}

export function isFullyLoaded(globalState, type, slug) {
  const doc = getBySlug(globalState.docs, type, slug);
  return doc && doc.get('loaded');
}

export function loadDoc(globalState, type, slug) {
  return {
    types: [LOAD_DOC, LOAD_DOC_OK, LOAD_DOC_FAIL],
    promise: (client) => client.get(`/docs/${type}/${slug}`),
    slug
  };
}

export function updateContent(doc, newContent) {
  return {
    type: UPDATE_CONTENT,
    doc,
    newContent
  };
}

export function updateContentFailed(doc, newContent, message) {
  return {
    type: UPDATE_CONTENT_FAIL,
    doc,
    newContent,
    message
  };
}

export function save(doc, newContent) {
  return {
    types: [SAVE, SAVE_OK, SAVE_FAIL],
    promise: (client) => client.post(`/docs/${doc._id}`, newContent),
    doc
  };
}

export function create(type) {
  return {
    types: [CREATE, CREATE_OK, CREATE_FAIL],
    promise: (client) => {
      return client.post(`/docs/${type}/create`);
    }
  };
}

export function deleteDoc(docId) {
  return {
    types: [DELETE, DELETE_OK, DELETE_FAIL],
    promise: (client) => {
      return client.delete(`/docs/${docId}`);
    },
    docId
  };
}
