import { combineReducers } from 'redux';
import pages from './pages';
import posts from './posts';

export default combineReducers({
  pages,
  posts
});

/*
 * The Redux state tree adheres to the following structure:
 *
 * {
 *   posts: {
 *     loading: {boolean},
 *     loaded: {boolean},
 *     error: {Error},
 *     data: {
 *       normalizedTitle: {
 *         ...<the structure from the api server>,
 *         loading: {boolean},
 *         loaded: {boolean},
 *         error: {Error}
 *       }
 *     }
 *   },
 *
 *   pages: {
 *     data: {
 *       name: {
 *         ...<the structure from the api server>,
 *         loading: {boolean},
 *         loaded: {boolean},
 *         error: {Error}
 *       }
 *     }
 *   }
 * }
 *
 */
