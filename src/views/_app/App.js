import React, {Component, PropTypes} from 'react';
import DocumentMeta from 'react-document-meta';
import ga from 'react-ga';
import {NavBar} from '../../components';
import * as admin from '../../redux/modules/admin';

const meta = {
  title: 'Andre Azzolini'
};

export default class App extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired
  };

  static contextTypes = {
    store: PropTypes.object.isRequired
  };

  componentWillMount() {
    if (__CLIENT__) {
      this.keydownHandler = (e) => {
        const cmdShiftE = e.metaKey && e.shiftKey && e.keyCode === 69;

        if (cmdShiftE) {
          this.context.store.dispatch(admin.actions.toggleEditMode());
        }
      };

      document.addEventListener('keydown', this.keydownHandler);
    }

    if (__CLIENT__) {
      const clientConfig = require('client-app-config');
      ga.initialize(clientConfig.gaId, {
        debug: __DEVELOPMENT__
      });
    }
  }

  componentWillUnmount() {
    if (__CLIENT__) {
      document.removeEventListener('keydown', this.keydownHandler);
    }
  }

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
