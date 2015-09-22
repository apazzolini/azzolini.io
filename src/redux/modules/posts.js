const LOAD = 'posts/LOAD';
const LOAD_SUCCESS = 'posts/LOAD_SUCCESS';
const LOAD_FAIL = 'posts/LOAD_FAIL';

const LOAD_SINGLE = 'posts/LOAD_SINGLE';
const LOAD_SINGLE_SUCCESS = 'posts/LOAD_SINGLE_SUCCESS';
const LOAD_SINGLE_FAIL = 'posts/LOAD_SINGLE_FAIL';

const initialState = {
  loaded: false
};

/*
 * The posts state tree segemnt holds the following structure:
 * {
 *   loading: {boolean},
 *   loaded: {boolean},
 *   error: {Error},
 *   data: {
 *     postIds: [<normalized titles>],
 *     posts: {
 *       normalizedTitle: {
 *         ...<the structure from the api server>,
 *         fullyLoaded: {boolean},
 *         loading: {boolean},
 *         error: {Error}
 *       }
 *     }
 *   }
 * }
 */
export default function posts(state = initialState, action = {}) {
  let newState;
  let newPost;

  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true
      };

    case LOAD_SUCCESS:
      newState = {
        ...state,
        loading: false,
        loaded: true,
        data: {
          postIds: [],
          posts: {}
        }
      };

      action.result.forEach((p) => {
        p.fullyLoaded = false;
        newState.data.postIds.push(p.normalizedTitle);
        newState.data.posts[p.normalizedTitle] = p;
      });

      return newState;

    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };

    case LOAD_SINGLE:
      newState = {
        data: {
          postIds: [],
          posts: {}
        },
        ...state
      };

      newPost = newState.data.posts && {
        ...newState.data.posts[action.postId],
        loading: true
      } || {};

      newState.data.posts[action.postId] = newPost;
      return newState;

    case LOAD_SINGLE_SUCCESS:
      newState = {
        ...state
      };

      newPost = {
        ...newState.data.posts[action.postId],
        loading: false,
        loaded: true,
        html: action.result.html
      };

      newState.data.posts[action.postId] = newPost;
      return newState;

    case LOAD_SINGLE_FAIL:
      newState = {
        ...state
      };

      newPost = {
        ...newState.data.posts[action.postId],
        loading: false,
        loaded: false,
        error: action.error
      };

      newState.data.posts[action.postId] = newPost;
      return newState;

    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.posts && globalState.posts.loaded;
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get('/posts')
  };
}

export function isFullyLoaded(globalState, normalizedTitle) {
  if (!isLoaded(globalState)) {
    return false;
  }

  const postIds = globalState.posts.data.postIds;
  const post = postIds.find(id => id === normalizedTitle);
  return !!post.html;
}

export function loadSingle(title) {
  return {
    types: [LOAD_SINGLE, LOAD_SINGLE_SUCCESS, LOAD_SINGLE_FAIL],
    promise: (client) => client.get(`/posts/t/${title}`),
    postId: title
  };
}
