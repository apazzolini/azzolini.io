import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import * as Posts from '../../redux/modules/posts';

@connect(
  state => ({
    postResults: state.posts.data,
  })
)
export default class Home extends Component {
  static propTypes = {
    postResults: PropTypes.object,
  }

  static fetchData(store) {
    if (!Posts.isLoaded(store.getState())) {
      return store.dispatch(Posts.load());
    }
  }

  render() {
    require('./Home.scss');

    const { postResults } = this.props;
    const { postIds, posts } = postResults;

    return (
      <div className="container">
        <h2 className="header">Thoughts on programming and things.</h2>

        <h6>Posts</h6>

        <ul>
          { postIds && postIds.map((postId) => {
            const post = posts[postId];

            return (
              <li key={postId}>
                <Link to={`/posts/${post.normalizedTitle}`}>
                  {post.title} - {post.date}
                </Link>
              </li>
            );
          })
          }
        </ul>
      </div>
    );
  }
}
