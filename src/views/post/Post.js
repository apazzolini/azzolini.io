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
    actions: PropTypes.shape({
      updateContent: PropTypes.func,
      save: PropTypes.func
    }),
    editing: PropTypes.bool,
    posts: PropTypes.object,
    params: PropTypes.shape({
      slug: PropTypes.string.isRequired
    })
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  componentWillMount() {
    const {router} = this.context;
    this.router = router;
    this.debouncedSave = _.debounce(this.props.actions.save, 1000);
  }

  shouldComponentUpdate() {
    return !this.preventComponentUpdate;
  }

  onChange(post, newContent) {
    const header = parseHeader(newContent);

    if (!header || !header.title || !header.slug) {
      return null;
    }

    if (header.slug !== post.slug) {
      this.preventComponentUpdate = true;

      this.props.actions.updateContent(post, newContent);
      this.router.replaceWith('/posts/' + header.slug);

      this.preventComponentUpdate = false;
    } else {
      this.props.actions.updateContent(post, newContent);
    }

    this.debouncedSave(post, newContent);
  }

  static fetchData(store, params, query) {
    if (!Posts.isFullyLoaded(store.getState(), params.slug)) {
      return store.dispatch(Posts.loadSingle(store.getState(), params.slug));
    }
  }

  render() {
    require('./Post.scss');
    const post = _.find(this.props.posts, 'slug', this.props.params.slug);

    return (
      <div className={this.props.editing && 'editing'}>
        { this.props.editing &&
          <Editor name="ace"
            content={post.content}
            onChange={this.onChange.bind(this, post)} />
        }

        <div className="Post container">
          <div className="content" dangerouslySetInnerHTML={{__html: post.html}} />
        </div>
      </div>
    );
  }
}
