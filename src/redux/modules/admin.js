import {createReducer} from 'redux-immutablejs';
import Immutable from 'immutable';
import {fromError} from '../utils';

const initialState = Immutable.fromJS({
  isAdmin: false,
  isEditing: false
});

// -----------------------------------------------------------------------------
// Reducers --------------------------------------------------------------------
// -----------------------------------------------------------------------------

export default createReducer(initialState, {

  'admin/login': (state, action) => state.merge({
    loggingIn: true,
    loginError: false
  }),

  'admin/loginOk': (state, action) => state.merge({
    loggingIn: false,
    isAdmin: true
  }),

  'admin/loginFail': (state, action) => state.merge({
    loggingIn: false,
    isAdmin: false,
    isEditing: false,
    loginError: fromError(action.error)
  }),

  'admin/toggleEditMode': (state, action) => state.merge({
    isEditing: state.get('isAdmin') && !state.get('isEditing')
  })

});

// -----------------------------------------------------------------------------
// Utility functions -----------------------------------------------------------
// -----------------------------------------------------------------------------

export function isAdmin(globalState) {
  return globalState.admin.get('isAdmin');
}

// -----------------------------------------------------------------------------
// Actions creators ------------------------------------------------------------
// -----------------------------------------------------------------------------

export function login(auth) {
  return {
    type: 'admin/login',
    promise: (api) => api.post('/login', {auth})
  };
}

export function toggleEditMode() {
  return {
    type: 'admin/toggleEditModle'
  };
}
