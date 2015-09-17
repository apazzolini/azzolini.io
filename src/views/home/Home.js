import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import * as Blogs from '../../redux/modules/blogs';

@connect(
  state => ({
    blogs: state.blogs.data
  })
)
export default class Home extends Component {
  static propTypes = {
    blogs: PropTypes.array,
  }

  static fetchData(store) {
    if (!Blogs.isLoaded(store.getState())) {
      return store.dispatch(Blogs.load());
    }
  }

  render() {
    require('./Home.scss');

    const {blogs} = this.props;

    return (
      <div className="container">
        <h2 className="header">Thoughts on programming and things.</h2>

        <h6>Latest post</h6>

        <ul>
          { blogs && blogs.length && blogs.map((blog, key) =>
              <li>
                <Link to={`/articles/${key}`}>
                  {blog.title} - {blog.date}
                </Link>
              </li>
            )
          }
        </ul>
      </div>
    );
  }
}
