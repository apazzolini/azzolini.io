import React from 'react';
import {Route} from 'react-router';

import App from 'views/_app/App';
import NotFound from 'views/_errors/NotFound';

import Home from 'views/home/Home';
import Page from 'views/page/Page';
import Post from 'views/post/Post';

export default function create(store) {
  return (
    <Route component={App}>
      <Route path="/" component={Home} />
      <Route path="/posts/:slug" component={Post} />
      <Route path="/:page" component={Page} />
      <Route path="*" component={NotFound} />
    </Route>
  );
}
