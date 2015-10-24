import {createReducer} from 'redux-immutablejs';
import Immutable from 'immutable';
import {fromError} from '../utils';

const LOGIN = 'admin/LOGIN';
const LOGIN_OK = 'admin/LOGIN_OK';
const LOGIN_FAIL = 'admin/LOGIN_FAIL';

const initialState = Immutable.fromJS({
  isAdmin: false,
  isEditing: false
});

// -----------------------------------------------------------------------------
// Reducers --------------------------------------------------------------------
// -----------------------------------------------------------------------------

export default createReducer(initialState, {

  [LOGIN]: (state, action) => state.merge({
    loggingIn: true,
    loginError: false
  }),

  [LOGIN_OK]: (state, action) => state.merge({
    loggingIn: false,
    isAdmin: true
  }),

  [LOGIN_FAIL]: (state, action) => state.merge({
    loggingIn: false,
    isAdmin: false,
    loginError: fromError(action.error)
  })

});

// -----------------------------------------------------------------------------
// Actions creators ------------------------------------------------------------
// -----------------------------------------------------------------------------

export function isAdmin(globalState) {
  return globalState.admin.get('isAdmin');
}

export function login(auth) {
  return {
    types: [LOGIN, LOGIN_OK, LOGIN_FAIL],
    promise: (client) => client.post('/login', {auth})
  };
}
