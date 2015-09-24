import { createReducer } from 'redux-immutablejs';
import Immutable from 'immutable';

const LOAD = 'pages/LOAD';
const LOAD_SUCCESS = 'pages/LOAD_SUCCESS';
const LOAD_FAIL = 'pages/LOAD_FAIL';

const initialState = Immutable.fromJS({
  data: {}
});

export default createReducer(initialState, {

  [LOAD]: (state, action) => state.mergeDeep({
    data: {
      [action.pageName]: {
        loading: true
      }
    }
  }),

  [LOAD_SUCCESS]: (state, action) => state.mergeDeep({
    data: {
      [action.pageName]: {
        loading: false,
        loaded: true,
        html: action.result.html
      }
    }
  }),

  [LOAD_FAIL]: (state, action) => state.mergeDeep({
    data: {
      [action.pageName]: {
        loading: false,
        loaded: false,
        error: action.error
      }
    }
  })
});

export function isLoaded(globalState, name) {
  return globalState.pages.getIn(['data', name, 'loaded']);
}

export function load(name) {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get(`/pages/${name}`),
    pageName: name
  };
}
