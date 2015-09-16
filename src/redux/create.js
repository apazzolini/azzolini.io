import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import apiClientMiddleware from './middleware/apiClientMiddleware';

/**
 * Responsible for providing a customzed store for the application.
 *
 * @param apiClient: ApiClient an instantiated ApiClient for use by actions
 * @param data: Object the initial data to seed the store with
 */
export default function createCustomizedStore(apiClient, data) {
  let finalCreateStore;

  if (__DEVELOPMENT__ && __CLIENT__ && __DEVTOOLS__) {
    const { devTools, persistState } = require('redux-devtools');

    finalCreateStore = compose(
      applyMiddleware(
        thunk,
        apiClientMiddleware(apiClient)
      ),
      devTools(),
      persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
    )(createStore);
  } else {
    finalCreateStore = applyMiddleware(
      thunk,
      apiClientMiddleware(apiClient)
    )(createStore);
  }

  const reducer = require('./modules');
  const store = finalCreateStore(reducer, data);
  store.apiClient = apiClient;

  if (__DEVELOPMENT__ && module.hot) {
    module.hot.accept('./modules', () => {
      store.replaceReducer(require('./modules'));
    });
  }

  return store;
}
