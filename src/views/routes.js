import React from 'react';
import {Route} from 'react-router';

import App from 'views/_app/App';
import NotFound from 'views/_errors/NotFound';

import Home from 'views/home/Home';
import Doc from 'views/doc/Doc';

export default function create(store) {
  return (
    <Route component={App}>
      <Route path="/" component={Home} />
      <Route path="/posts/:slug" component={Doc} type="post" />
      <Route path="/:slug" component={Doc} type="page" />
      <Route path="*" component={NotFound} />
    </Route>
  );
}
