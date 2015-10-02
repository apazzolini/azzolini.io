import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import * as Posts from '../../redux/modules/posts';

@connect(
  state => ({
    posts: state.posts.get('data').toJS(),
  })
)
export default class Post extends Component {
  static propTypes = {
    posts: PropTypes.object,
    params: PropTypes.shape({
      title: PropTypes.string.isRequired
    })
  }

  static fetchData(store, params, query) {
    if (!Posts.isFullyLoaded(store.getState(), params.title)) {
      return store.dispatch(Posts.loadSingle(store.getState(), params.title));
    }
  }

  render() {
    require('./Post.scss');
    const { posts } = this.props;
    const post = _.find(posts, 'normalizedTitle', this.props.params.title);

    return (
      <div className="Post container">
        <div dangerouslySetInnerHTML={{__html: post.html}} />
        { post.html }
      </div>
    );
  }
}
