import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import * as Posts from '../../redux/modules/posts';

@connect(
  state => ({
    postResults: state.posts.data,
  })
)
export default class Post extends Component {
  static propTypes = {
    postResults: PropTypes.object,
  }

  static fetchData(store, params) {
    if (!Posts.isFullyLoaded(store.getState(), params.title)) {
      return store.dispatch(Posts.loadSingle(params.title));
    }
  }

  render() {
    require('./Post.scss');

    const { postResults } = this.props;
    const post = postResults.posts[this.props.params.title];

    return (
      <div className="container">
        hi
        <div dangerouslySetInnerHTML={{__html: post.html}} />
        { post.html }
      </div>
    );
  }
}
