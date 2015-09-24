import { createReducer } from 'redux-immutablejs';
import Immutable from 'immutable';

const LOAD = 'posts/LOAD';
const LOAD_SUCCESS = 'posts/LOAD_SUCCESS';
const LOAD_FAIL = 'posts/LOAD_FAIL';
const LOAD_SINGLE = 'posts/LOAD_SINGLE';
const LOAD_SINGLE_SUCCESS = 'posts/LOAD_SINGLE_SUCCESS';
const LOAD_SINGLE_FAIL = 'posts/LOAD_SINGLE_FAIL';

const initialState = Immutable.fromJS({
  loaded: false,
  data: {}
});

export default createReducer(initialState, {
  // ---------------------------------------------------------------------------
  // Actions on lists of posts -------------------------------------------------
  // ---------------------------------------------------------------------------

  [LOAD]: (state, action) => state.merge({
    loading: true
  }),

  [LOAD_SUCCESS]: (state, action) => {
    const unloadedPosts = {};

    // We only want to merge in posts that haven't already been loaded. Also,
    // although the API server returns an array of posts, we want them keyed
    // by normalized title for use in the app.
    action.result.forEach((p) => {
      if (!state.hasIn('data', p.normalizedTitle, 'loaded')) {
        unloadedPosts[p.normalizedTitle] = p;
      }
    });

    return state.mergeDeep({
      loading: false,
      loaded: true,
      data: unloadedPosts
    });
  },

  [LOAD_FAIL]: (state, action) => state.merge({
    loading: false,
    loaded: false,
    error: action.error
  }),

  // ---------------------------------------------------------------------------
  // Actions on single posts ---------------------------------------------------
  // ---------------------------------------------------------------------------

  [LOAD_SINGLE]: (state, action) => state.mergeDeep({
    data: {
      [action.postId]: {
        loading: true
      }
    }
  }),

  [LOAD_SINGLE_SUCCESS]: (state, action) => state.mergeDeep({
    data: {
      [action.postId]: {
        loading: false,
        loaded: true,
        html: action.result.html
      }
    }
  }),

  [LOAD_SINGLE_FAIL]: (state, action) => state.mergeDeep({
    data: {
      [action.postId]: {
        loading: false,
        loaded: false,
        error: action.error
      }
    }
  })
});

// -----------------------------------------------------------------------------
// Operations on lists of posts ------------------------------------------------
// -----------------------------------------------------------------------------

export function isLoaded(globalState) {
  return globalState.posts.get('loaded');
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get('/posts')
  };
}

// -----------------------------------------------------------------------------
// Operations on single posts --------------------------------------------------
// -----------------------------------------------------------------------------

export function isFullyLoaded(globalState, normalizedTitle) {
  return globalState.posts.getIn(['data', normalizedTitle, 'loaded']);
}

export function loadSingle(title) {
  return {
    types: [LOAD_SINGLE, LOAD_SINGLE_SUCCESS, LOAD_SINGLE_FAIL],
    promise: (client) => client.get(`/posts/t/${title}`),
    postId: title
  };
}
