import fromError from '../utils/fromError';

// Initial State ---------------------------------------------------------------

export const initialState = {
  isAdmin: false,
  isEditing: false
};

// Reducers --------------------------------------------------------------------

export const reducers = {

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

};

// Action Creators -------------------------------------------------------------

export const actions = {

  login: (auth) => ({
    type: 'admin/login',
    apiRequest: (api) => api.post('/login', { auth })
  }),

  toggleEditMode: () => ({
    type: 'admin/toggleEditMode'
  })

};

// Selectors -------------------------------------------------------------------

export const selectors = {

  isAdmin: (globalState) => globalState.admin.get('isAdmin')

};
