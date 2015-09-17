import React from 'react';
import {Route} from 'react-router';

import App from 'views/_app/App';
import NotFound from 'views/_errors/NotFound';

import About from 'views/about/About';
import Home from 'views/home/Home';

export default function create(store) {
  return (
    <Route component={App}>
      <Route path="/" component={Home}/>
      <Route path="/about" component={About}/>
      <Route path="*" component={NotFound}/>
    </Route>
  );
}
