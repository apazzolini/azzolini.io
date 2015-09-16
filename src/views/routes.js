import React from 'react';
import {Route} from 'react-router';

import App from 'views/_app/App';
import NotFound from 'views/_errors/NotFound';

import About from 'views/about/About';
import Home from 'views/home/Home';
import Widgets from 'views/widgets/Widgets';

export default function create(store) { //eslint-disable-line
  return (
    <Route component={App}>
      <Route path="/" component={Home}/>
      <Route path="/widgets" component={Widgets}/>
      <Route path="/about" component={About}/>
      <Route path="*" component={NotFound}/>
    </Route>
  );
}
