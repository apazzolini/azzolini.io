const LOAD = 'posts/LOAD';
const LOAD_SUCCESS = 'posts/LOAD_SUCCESS';
const LOAD_FAIL = 'posts/LOAD_FAIL';

const initialState = {
  loaded: false
};

/*
 * The posts state tree segemnt holds the following structure:
 * {
 *   loading: {boolean},
 *   loaded: {boolean},
 *   error: {Error},
 *   data: [{
 *     <the structure from the api server>,
 *     fullyLoaded: {boolean},
 *     loading: {boolean},
 *     error: {Error}
 *   }]
 * }
 */
export default function posts(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true
      };

    case LOAD_SUCCESS:
      const newState = {
        ...state,
        loading: false,
        loaded: true,
        data: action.result
      };

      newState.data.forEach((p) => {
        p.fullyLoaded = false;
      });

      return newState;

    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };

    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.posts && globalState.posts.loaded;
}

/*
export function isFullyLoaded(globalState, normalizedTitle) {
  if (!isLoaded(globalState)) {
    return false;
  }

  const ps = globalState.posts.data;
  const post = ps.filter(p => p.normalizedTitle === normalizedTitle);
  return post.html !== null;
}
*/

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get('/posts')
  };
}

/*
export function loadSingle(title) {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get(`/posts/t/${title}`)
  };
}
*/
