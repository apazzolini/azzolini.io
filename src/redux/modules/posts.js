import { createReducer } from 'redux-immutablejs';
import Immutable from 'immutable';
import {parseMarkdown, parseHeader} from '../../utils/markdownParser.js';

const LOAD = 'posts/LOAD';
const LOAD_SUCCESS = 'posts/LOAD_SUCCESS';
const LOAD_FAIL = 'posts/LOAD_FAIL';
const LOAD_SINGLE = 'posts/LOAD_SINGLE';
const LOAD_SINGLE_SUCCESS = 'posts/LOAD_SINGLE_SUCCESS';
const LOAD_SINGLE_FAIL = 'posts/LOAD_SINGLE_FAIL';
const UPDATE_CONTENT = 'posts/UPDATE_CONTENT';
const SAVE = 'posts/SAVE';
const SAVE_SUCCESS = 'posts/SAVE_SUCCESS';
const SAVE_FAIL = 'posts/SAVE_FAIL';

const initialState = Immutable.fromJS({
  loaded: false,
  data: {}
});

// -----------------------------------------------------------------------------
// Utility functions -----------------------------------------------------------
// -----------------------------------------------------------------------------

function getByTitle(postsState, normalizedTitle) {
  return postsState.get('data').find((post, id) => (
    post.get('normalizedTitle') === normalizedTitle
  ));
}

// -----------------------------------------------------------------------------
// Reducers --------------------------------------------------------------------
// -----------------------------------------------------------------------------

export default createReducer(initialState, {

  // ---------------------------------------------------------------------------
  // Reducers on lists of posts ------------------------------------------------
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
  // Reducers on single posts --------------------------------------------------
  // ---------------------------------------------------------------------------

  [LOAD_SINGLE]: (state, action) => {
    const post = getByTitle(state, action.postTitle);

    if (post) {
      return state.mergeDeep({
        data: {
          [post.get('_id')]: {
            loading: true
          }
        }
      });
    }

    // If we couldn't find a post by the title, that must mean we're doing
    // server-side rendering directly to a post page. In this case, we can
    // ignore the loading state.
    return Immutable.Map(state);
  },

  [LOAD_SINGLE_SUCCESS]: (state, action) => state.mergeDeep({
    data: {
      [action.result._id]: {
        loading: false,
        loaded: true,
        ...action.result
      }
    }
  }),

  [LOAD_SINGLE_FAIL]: (state, action) => {
    const post = getByTitle(state, action.postTitle);

    if (post) {
      return state.mergeDeep({
        data: {
          [post.get('_id')]: {
            loading: false,
            loaded: false,
            error: action.error
          }
        }
      });
    }

    // See above comment in LOAD_SINGLE
    return Immutable.Map(state);
  },

  [UPDATE_CONTENT]: (state, action) => {
    const header = parseHeader(action.newContent);

    const newPartial = state.mergeDeep({
      data: {
        [action.post._id]: {
          normalizedTitle: header.title,
          content: action.newContent,
          html: parseMarkdown(action.newContent)
        }
      }
    });

    return newPartial;
  },

  [SAVE]: (state, action) => state.mergeDeep({
    data: {
      [action.post._id]: {
        saving: true
      }
    }
  }),

  [SAVE_SUCCESS]: (state, action) => state.mergeDeep({
    data: {
      [action.post._id]: {
        saving: false,
        saved: true
      }
    }
  }),

  [SAVE_FAIL]: (state, action) => state.mergeDeep({
    data: {
      [action.post._id]: {
        saving: false,
        saved: false,
        error: action.error
      }
    }
  })
});

// -----------------------------------------------------------------------------
// Actions on single posts -----------------------------------------------------
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
// Actions on single posts -----------------------------------------------------
// -----------------------------------------------------------------------------

export function isFullyLoaded(globalState, normalizedTitle) {
  const post = getByTitle(globalState.posts, normalizedTitle);
  return post && post.get('loaded');
}

export function loadSingle(globalState, normalizedTitle) {
  return {
    types: [LOAD_SINGLE, LOAD_SINGLE_SUCCESS, LOAD_SINGLE_FAIL],
    promise: (client) => client.get(`/posts/t/${normalizedTitle}`),
    postTitle: normalizedTitle
  };
}

export function updateContent(post, newContent) {
  return {
    type: UPDATE_CONTENT,
    post,
    newContent
  };
}

export function save(post, newContent) {
  return {
    types: [SAVE, SAVE_SUCCESS, SAVE_FAIL],
    promise: (client) => client.post(`/posts/${post._id}`, newContent),
    post
  };
}
