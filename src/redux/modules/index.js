import {combineReducers} from 'redux';
import {routeReducer} from 'redux-simple-router';
import admin from './admin';
import docs from './docs';

export default combineReducers({
  routing: routeReducer,
  admin,
  docs
});

/*
 * The Redux state tree adheres to the following structure:
 *
 * {
 *   routing: ...<the structure from redux-simple-router>,
 *
 *   admin: {
 *     loggingIn: {boolean},
 *     loginError: {Object},
 *     isAdmin: {boolean},
 *     isEditing: {boolean},
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
