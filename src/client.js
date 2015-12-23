import 'babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {Router, match, createRoutes} from 'react-router';
import {syncReduxAndRouter} from 'redux-simple-router';
import createHistory from 'history/lib/createBrowserHistory';
import useScroll from 'scroll-behavior/lib/useStandardScroll';

import createStore from './redux/create';
import ApiClient from './utils/ApiClient';
import getRoutes from './views/routes';
import fetchData from './utils/fetchComponentData';

const client = new ApiClient();
const dest = document.getElementById('content');
const store = createStore(client, window.__state);
const routes = getRoutes(store);
const history = useScroll(createHistory)({routes: createRoutes(routes)});

syncReduxAndRouter(history, store);

let lastMatchedLocBefore;

history.listenBefore((location, callback) => {
  const loc = location.pathname + location.search + location.hash;
  if (lastMatchedLocBefore === loc) {
    return callback();
  }

  match({routes, location: loc}, (err, redirectLocation, nextState) => {
    if (!err && nextState) {
      fetchData(nextState.components, store.getState, store.dispatch, location, nextState.params)
      .then(() => {
        lastMatchedLocBefore = loc;
        callback();
      })
      .catch(err2 => {
        console.error(err2, 'Error while fetching data');
        callback();
      });
    } else {
      console.log('Location "%s" did not match any routes (listenBefore)', loc);
      callback();
    }
  });
});

const component = (
  <Router history={history}>
    {routes}
  </Router>
);

// Render always to prevent server-side render from being discarded
ReactDOM.render(
  <Provider store={store} key="provider">
    {component}
  </Provider>,
  dest
);

if (process.env.NODE_ENV !== 'production') {
  window.React = React; // enable debugger

  if (!dest || !dest.firstChild || !dest.firstChild.attributes || !dest.firstChild.attributes['data-react-checksum']) {
    console.error('Server-side React render was discarded. Make sure that your initial render does not contain any client-side code.');
  }
}

if (__DEVTOOLS__) {
  // Re-render with devtools
  const DevTools = require('./components/DevTools/DevTools');
  ReactDOM.render(
    <Provider store={store} key="provider">
      <div>
        {component}
        <DevTools />
      </div>
    </Provider>,
    dest
  );
}
