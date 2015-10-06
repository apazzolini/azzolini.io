import { combineReducers } from 'redux';
import admin from './admin';
import docs from './docs';

export default combineReducers({
  admin,
  docs
});

/*
 * The Redux state tree adheres to the following structure:
 *
 * {
 *   admin: {
 *     editing: {boolean},
 *   },
 *
 *   docs: {
 *     loading: {boolean},
 *     loaded: {boolean},
 *     loadError: {Object},
 *     creating: {boolean},
 *     createError: {Object},
 *     entities: {
 *       [mongoId]: {
 *         ...<the structure from the api server>,
 *         loading: {boolean},
 *         loaded: {boolean},
 *         loadError: {Object},
 *         saving: {boolean},
 *         saved: {boolean},
 *         saveError: {Object},
 *         updateError: {false or String} - False if no error, an error message otherwise
 *       }
 *     }
 *   }
 * }
 */
