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
    // by _id (the Mongo ID) for use in the app.
    action.result.forEach((p) => {
      if (!state.hasIn('data', p._id, 'loaded')) {
        unloadedPosts[p._id] = p;
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
    singleLoading: {
      [action.postTitle]: {
        loading: true
      }
    }
  }),

  [LOAD_SINGLE_SUCCESS]: (state, action) => state.mergeDeep({
    data: {
      [action.result._id]: {
        loading: false,
        loaded: true,
        ...action.result
      }
    },
    singleLoading: {
      [action.postTitle]: null
    }
  }),

  [LOAD_SINGLE_FAIL]: (state, action) => state.mergeDeep({
    singleLoading: {
      [action.postTitle]: {
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

export function getByTitle(globalState, normalizedTitle) {
  return globalState.posts.get('data').find((post, id) => (
    post.get('normalizedTitle') === normalizedTitle
  ));
}

export function isFullyLoaded(globalState, normalizedTitle) {
  const post = getByTitle(globalState, normalizedTitle);
  return post && post.get('loaded');
}

export function loadSingle(globalState, normalizedTitle) {
  return {
    types: [LOAD_SINGLE, LOAD_SINGLE_SUCCESS, LOAD_SINGLE_FAIL],
    promise: (client) => client.get(`/posts/t/${normalizedTitle}`),
    postTitle: normalizedTitle
  };
}
