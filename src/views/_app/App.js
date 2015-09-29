import React, {Component, PropTypes} from 'react';
import DocumentMeta from 'react-document-meta';
import {createTransitionHook} from '../../utils/fetchAwareRouter';
import { NavBar } from '../../components';

const meta = {
  title: 'Andre Azzolini'
};

export default class App extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired
  };

  componentWillMount() {
    const {router, store} = this.context;
    this.transitionHook = createTransitionHook(store);
    router.addTransitionHook(this.transitionHook);
  }

  componentWillUnmount() {
    const {router} = this.context;
    router.removeTransitionHook(this.transitionHook);
  }

  render() {
    const styles = require('./App.scss');

    return (
      <div className='editing'>
        <DocumentMeta {...meta} />

        <NavBar />

        <div id={styles.MainContainer}>
          {this.props.children}
        </div>

      </div>
    );
  }
}
