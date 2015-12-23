import React, {Component, PropTypes} from 'react';
import DocumentMeta from 'react-document-meta';
import {NavBar} from '../../components';

const meta = {
  title: 'Andre Azzolini'
};

export default class App extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired
  }

  static contextTypes = {
    store: PropTypes.object.isRequired
  };

  render() {
    require('./App.scss');

    return (
      <div>
        <DocumentMeta {...meta} />

        <NavBar />

        <div id="MainContainer">
          {this.props.children}
        </div>
      </div>
    );
  }
}
