import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import * as Pages from '../../redux/modules/pages';

@connect(
  state => ({
    pages: state.pages.get('data').toJS(),
  })
)
export default class Page extends Component {
  static propTypes = {
    pages: PropTypes.object,
    params: PropTypes.shape({
      page: PropTypes.string.isRequired
    })
  }

  static fetchData(store, params, query) {
    if (!Pages.isLoaded(store.getState(), params.page)) {
      return store.dispatch(Pages.load(params.page));
    }
  }

  render() {
    require('./Page.scss');
    const { pages } = this.props;
    const page = pages[this.props.params.page];

    return (
      <div className="SimplePage container">
        <div dangerouslySetInnerHTML={{__html: page.html}} />
      </div>
    );
  }
}
