import 'babel/polyfill';
import React from 'react';
import BrowserHistory from 'react-router/lib/BrowserHistory';
import Location from 'react-router/lib/Location';
import queryString from 'query-string';
import createStore from './redux/create';
import ApiClient from './utils/ApiClient';
import fetchAwareRouter from './utils/fetchAwareRouter';
const history = new BrowserHistory();
const client = new ApiClient();

const dest = document.getElementById('content');
const store = createStore(client, window.__state);
const search = document.location.search;
const query = search && queryString.parse(search);
const location = new Location(document.location.pathname, query);

fetchAwareRouter(location, history, store)
  .then(({component}) => {
    React.render(component, dest);
    if (__DEVTOOLS__) {
      const { DevTools, DebugPanel, LogMonitor } = require('redux-devtools/lib/react');

      React.render(
        <div>
          {component}
          <DebugPanel top right bottom key="debugPanel">
            <DevTools store={store} monitor={LogMonitor}/>
          </DebugPanel>
        </div>
      , dest);
    }
  }, (error) => {
    console.error(error);
  });


if (process.env.NODE_ENV !== 'production') {
  window.React = React; // enables debugger
  const reactRoot = window.document.getElementById('content');

  if (!reactRoot || !reactRoot.firstChild || !reactRoot.firstChild.attributes ||
      !reactRoot.firstChild.attributes['data-react-checksum']) {
    console.error('Server-side React render was discarded. Make sure that your ' +
      'initial render does not contain any client-side code.');
  }
}
