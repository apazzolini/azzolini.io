import React, {Component} from 'react';
import {Link} from 'react-router';

export default class NavBar extends Component {
  render() {
    const styles = require('./NavBar.scss');

    return (
      <nav id={styles.MainNav}>
        <div className="container">
          <Link to="/">Andre Azzolini</Link>

          <ul className="u-pull-right">
            <li><Link to="/about">About</Link></li>
            <li><a href="https://www.github.com/apazzolini">GitHub</a></li>
            <li><a href="https://twitter.com/apazzolini">Twitter</a></li>
          </ul>

          <div className="u-cf"></div>
        </div>

      </nav>
    );
  }
}

