import { combineReducers } from 'redux';
import admin from './admin';
import pages from './pages';
import posts from './posts';

export default combineReducers({
  admin,
  pages,
  posts
});

/*
 * The Redux state tree adheres to the following structure:
 *
 * {
 *   admin: {
 *     editing: {boolean},
 *   },
 *
 *   posts: {
 *     loading: {boolean},
 *     loaded: {boolean},
 *     error: {Error},
 *     data: {
 *       [mongoId]: {
 *         ...<the structure from the api server>,
 *         loading: {boolean},
 *         loaded: {boolean},
 *         error: {Error}
 *         saving: {boolean},
 *         saved: {boolean}
 *       }
 *     }
 *   },
 *
 *   pages: {
 *     data: {
 *       [name]: {
 *         ...<the structure from the api server>,
 *         loading: {boolean},
 *         loaded: {boolean},
 *         error: {Error},
 *         saving: {boolean},
 *         saved: {boolean}
 *       }
 *     }
 *   }
 * }
 */
