import React, {Component} from 'react';
import {Link} from 'react-router';

export default class Home extends Component {
  render() {
    // require the logo image both from client and server
    const logoImage = require('./logo.png');
    return (
      <p>
        <img src={logoImage}/>
        hi
      </p>
    );
  }
}
