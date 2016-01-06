import React from 'react';
import {IndexRoute, Route} from 'react-router';

import App from 'views/_app/App';
import NotFound from 'views/_errors/NotFound';

import Home from 'views/home/Home';
import Login from 'views/login/Login';
import {DocPost, DocPage} from 'views/doc/Doc';

export default (store) => {
  return (
    <Route path="/" component={App}>
      <IndexRoute component={Home} />

      <Route path="login" component={Login} />
      <Route path="posts/:slug" component={DocPost} />
      <Route path="about" component={DocPage} />

      <Route path="*" component={NotFound} status={404} />
    </Route>
  );
};
