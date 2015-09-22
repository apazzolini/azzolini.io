import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import * as Posts from '../../redux/modules/posts';

@connect(
  state => ({
    posts: state.posts.data
  })
)
export default class Home extends Component {
  static propTypes = {
    posts: PropTypes.array,
  }

  static fetchData(store) {
    if (!Posts.isLoaded(store.getState())) {
      return store.dispatch(Posts.load());
    }
  }

  render() {
    require('./Home.scss');

    const {posts} = this.props;

    return (
      <div className="container">
        <h2 className="header">Thoughts on programming and things.</h2>

        <h6>Posts</h6>

        <ul>
          { posts && posts.map((post) =>
              <li>
                <Link to={`/posts/${post.normalizedTitle}`}>
                  {post.title} - {post.date}
                </Link>
              </li>
            )
          }
        </ul>
      </div>
    );
  }
}
