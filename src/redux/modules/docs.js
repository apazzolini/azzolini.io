import {createReducer} from 'redux-immutablejs';
import Immutable from 'immutable';
import {fromError} from '../utils';
import {parseMarkdown, parseHeader} from '../../utils/markdownParser.js';

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

    // See above comment in LOAD_DOC
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

});

// -----------------------------------------------------------------------------
// Utility functions -----------------------------------------------------------
// -----------------------------------------------------------------------------

export function isLoaded(globalState) {
  return globalState.docs.get('loaded');
}

export function isFullyLoaded(globalState, type, slug) {
  const doc = getBySlug(globalState.docs, type, slug);
  return doc && doc.get('loaded');
}

// -----------------------------------------------------------------------------
// Actions creators ------------------------------------------------------------
// -----------------------------------------------------------------------------

export function load() {
  return {
    type: 'docs/load',
    promise: (api) => api.get('/docs?type=post')
  };
}

export function loadDoc(globalState, type, slug) {
  return {
    type: 'docs/loadDoc',
    promise: (api) => api.get(`/docs/${type}/${slug}`),
    slug
  };
}

export function updateContent(doc, newContent) {
  return {
    type: 'docs/updateContent',
    doc,
    newContent
  };
}

export function updateContentFailed(doc, newContent, message) {
  return {
    type: 'docs/updateContentFail',
    doc,
    newContent,
    message
  };
}

export function save(doc, newContent) {
  return {
    type: 'docs/save',
    promise: (api) => api.post(`/docs/${doc._id}`, newContent),
    doc
  };
}

export function create(type) {
  return {
    type: 'docs/create',
    promise: (api) => api.post(`/docs/${type}/create`)
  };
}

export function deleteDoc(docId) {
  return {
    type: 'docs/delete',
    promise: (api) => api.delete(`/docs/${docId}`),
    docId
  };
}
