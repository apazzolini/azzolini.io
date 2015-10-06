import React from 'react';
import Router from 'react-router';
import createRoutes from '../views/routes';
import {Provider} from 'react-redux';

/**
 * Returns the route component's fetchData property if it exists. If the
 * given component is a WrappedComponent, this method will unwrap
 * to the base component to search for fetchData.
 *
 * @param {Object} component - A React component
 */
const getFetchData = (component = {}) => {
  return component.WrappedComponent ?
    getFetchData(component.WrappedComponent) :
    component.fetchData;
};

/**
 * When we're calling the fetchData methods, we want to set the `this`
 * context to the route it's executing under so that the method has the
 * ability to inspect other values that are set on the route
 *
 * @param {Object} route - a React Router Route
 */
const extractFetchData = route => {
  return getFetchData(route.component).bind(route);
};

/**
 * Creates a React Router TransitionHook to gather all necessary API
 * data for each of the components in the requested route. Once all
 * data has been fetched, continues the state transition.
 *
 * @param {Object} store - A Redux store
 * @return {Function} A React Router TransitionHook
 */
export function createTransitionHook(store) {
  return (nextState, transition, callback) => {
    const {params, location: {query}} = nextState;

    const promises = nextState.branch                           // look at all branches of this route
      .filter(route => getFetchData(route.component))           // filter for ones with a static fetchData()
      .map(extractFetchData)                                    // pull out fetch data methods
      .map(fetchData => fetchData(store, params, query || {})); // call fetch data methods and save promises

    Promise.all(promises)
      .then(() => {
        callback();
      }, (error) => {
        callback(error);
      });
  };
}

/**
 * Creates a React Router that delays navigation to the desired page
 * until all fetchData requirements have been fulfilled.
 */
export default function fetchAwareRouter(location, history, store) {
  const routes = createRoutes(store);

  return new Promise((resolve, reject) => {
    Router.run(routes, location, [createTransitionHook(store)], (error, initialState, transition) => {
      if (error) {
        return reject(error);
      }

      if (transition && transition.redirectInfo) {
        return resolve({
          transition,
          isRedirect: true
        });
      }

      if (history) {  // only on client side
        initialState.history = history;
      }

      const component = (
        <Provider store={store} key="provider">
          {() => <Router {...initialState} children={routes} />}
        </Provider>
      );

      return resolve({
        component,
        isRedirect: false
      });
    });
  });
}
