import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import _ from 'lodash';
import * as Pages from '../../redux/modules/pages';
import {Editor} from '../../components';

@connect(
  state => ({
    editing: state.admin.get('editing'),
    pages: state.pages.get('data').toJS(),
  }),
  dispatch => ({
    actions: bindActionCreators({
      updateContent: Pages.updateContent,
      save: Pages.save
    }, dispatch)
  })
)
export default class Page extends Component {
  static propTypes = {
    actions: PropTypes.shape({
      updateContent: PropTypes.func,
      save: PropTypes.func
    }),
    editing: PropTypes.bool,
    pages: PropTypes.object,
    params: PropTypes.shape({
      page: PropTypes.string.isRequired
    })
  }

  componentWillMount() {
    this.debouncedSave = _.debounce(this.props.actions.save, 1000);
  }

  onChange(page, newContent) {
    this.props.actions.updateContent(page.name, newContent);
    this.debouncedSave(page, newContent);
  }

  static fetchData(store, params, query) {
    if (!Pages.isLoaded(store.getState(), params.page)) {
      return store.dispatch(Pages.load(params.page));
    }
  }

  render() {
    require('./Page.scss');
    const page = this.props.pages[this.props.params.page];

    return (
      <div className={this.props.editing && 'editing'}>
        { this.props.editing &&
          <Editor name="ace"
            content={page.content}
            onChange={this.onChange.bind(this, page)} />
        }

        <div className="SimplePage container">
          <div className="content" dangerouslySetInnerHTML={{__html: page.html}} />
        </div>
      </div>
    );
  }
}
