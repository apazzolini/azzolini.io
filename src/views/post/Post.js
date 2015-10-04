import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import _ from 'lodash';
import * as Posts from '../../redux/modules/posts';
import {Editor} from '../../components';
import {parseHeader} from '../../utils/markdownParser.js';

@connect(
  state => ({
    editing: state.admin.get('editing'),
    posts: state.posts.get('data').toJS(),
  }),
  dispatch => ({
    actions: bindActionCreators({
      updateContent: Posts.updateContent,
      save: Posts.save
    }, dispatch)
  })
)
export default class Post extends Component {
  static propTypes = {
    actions: PropTypes.object,
    editing: PropTypes.bool,
    posts: PropTypes.object,
    params: PropTypes.shape({
      title: PropTypes.string.isRequired
    })
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  componentWillMount() {
    const {router} = this.context;
    this.router = router;
  }

  shouldComponentUpdate() {
    return !this.isUpdating;
  }

  onChangeCreator(post, actions) {
    if (!this.onChange) {
      const debouncedSave = _.debounce(actions.save, 1000);

      this.onChange = (post, newContent) => { // eslint-disable-line no-shadow
        this.isUpdating = true;
        const header = parseHeader(newContent);

        actions.updateContent(post, newContent);
        this.router.replaceWith('/posts/' + header.title);
        debouncedSave(header.title, post._id, newContent);

        this.isUpdating = false;
      };
    }

    return this.onChange.bind(this, post);
  }

  static fetchData(store, params, query) {
    if (!Posts.isFullyLoaded(store.getState(), params.title)) {
      return store.dispatch(Posts.loadSingle(params.title));
    }
  }

  render() {
    require('./Post.scss');
    const post = this.props.posts[this.props.params.title];

    return (
      <div className={this.props.editing && 'editing'}>
        {this.props.editing &&
          <Editor name="ace"
            content={post.content}
            onChange={this.onChangeCreator(post, this.props.actions)} />
        }

        <div className="Post container">
          <div className="content" dangerouslySetInnerHTML={{__html: post.html}} />
        </div>
      </div>
    );
  }
}
