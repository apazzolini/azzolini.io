import { createReducer } from 'redux-immutablejs';
import Immutable from 'immutable';
import marked from 'marked';

const LOAD = 'pages/LOAD';
const LOAD_SUCCESS = 'pages/LOAD_SUCCESS';
const LOAD_FAIL = 'pages/LOAD_FAIL';
const UPDATE_CONTENT = 'pages/UPDATE_CONTENT';
const SAVE = 'pages/SAVE';
const SAVE_SUCCESS = 'pages/SAVE_SUCCESS';
const SAVE_FAIL = 'pages/SAVE_FAIL';

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
        ...action.result
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
  }),

  [UPDATE_CONTENT]: (state, action) => state.mergeDeep({
    data: {
      [action.pageName]: {
        content: action.newContent,
        html: marked(action.newContent)
      }
    }
  }),

  [SAVE]: (state, action) => state.mergeDeep({
    data: {
      [action.pageName]: {
        saving: true
      }
    }
  }),

  [SAVE_SUCCESS]: (state, action) => state.mergeDeep({
    data: {
      [action.pageName]: {
        saving: false,
        saved: true
      }
    }
  }),

  [SAVE_FAIL]: (state, action) => state.mergeDeep({
    data: {
      [action.pageName]: {
        saving: false,
        saved: false,
        error: action.error
      }
    }
  }),
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

export function updateContent(pageName, newContent) {
  return {
    type: UPDATE_CONTENT,
    pageName,
    newContent
  };
}

export function save(page, newContent) {
  return {
    types: [SAVE, SAVE_SUCCESS, SAVE_FAIL],
    promise: (client) => client.post(`/pages/${page.name}`, newContent),
    pageName: page.name
  };
}
