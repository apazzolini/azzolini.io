import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import _ from 'lodash';
import * as Posts from '../../redux/modules/posts';

@connect(
  state => ({
    posts: state.posts.get('data').toJS(),
  })
)
export default class Home extends Component {
  static propTypes = {
    posts: PropTypes.object,
  }

  static fetchData(store, params, query) {
    if (!Posts.isLoaded(store.getState())) {
      return store.dispatch(Posts.load());
    }
  }

  render() {
    require('./Home.scss');

    const { posts } = this.props;
    const postIds = _.pluck(_.sortBy(posts, 'date'), 'normalizedTitle');

    return (
      <div className="container">
        <h2 className="header">Thoughts on programming and things.</h2>

        <h6>Posts</h6>

        <ul>
          { postIds.reverse().map((postId) => {
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
