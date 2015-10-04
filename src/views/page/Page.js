import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import _ from 'lodash';
import * as Pages from '../../redux/modules/pages';
import {Editor} from '../../components';

export function parseMarkdown(post) {
  return marked(post.content);
}

@connect(
  state => ({
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

  onChangeCreator(page, actions) {
    if (!this.onChange) {
      const debouncedSave = _.debounce(actions.save, 1000);

      this.onChange = newContent => {
        actions.updateContent(page.name, newContent);
        debouncedSave(page, newContent);
      };
    }

    return this.onChange;
  }

  render() {
    require('./Page.scss');
    const { pages } = this.props;
    const page = pages[this.props.params.page];

    const editing = true;

    return (
      <div className={editing && 'editing'}>
        {editing &&
          <Editor name="ace"
            content={page.content}
            onChange={this.onChangeCreator(page, this.props.actions)} />
        }
      
        <div className="SimplePage container">
          <div className="content" dangerouslySetInnerHTML={{__html: page.html}} />
        </div>
      </div>
    );
  }
}
