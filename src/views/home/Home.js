import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import _ from 'lodash';
import * as Posts from '../../redux/modules/posts';

@connect(
  state => ({
    editing: state.admin.get('editing'),
    posts: state.posts.get('data').toJS(),
  }),
  dispatch => ({
    actions: bindActionCreators({
      createNewPost: Posts.create
    }, dispatch)
  })
)
export default class Home extends Component {
  // TODO: actions should be a shape
  static propTypes = {
    actions: PropTypes.object,
    editing: PropTypes.bool,
    posts: PropTypes.object,
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  componentWillMount() {
    const {router} = this.context;
    this.router = router;
  }

  createAndRedirect() {
    this.props.actions.createNewPost().then((res) => {
      this.router.transitionTo(`/posts/${res.result.id}`);
    });
  }

  static fetchData(store, params, query) {
    if (!Posts.isLoaded(store.getState())) {
      return store.dispatch(Posts.load());
    }
  }

  render() {
    require('./Home.scss');

    const { posts } = this.props;
    const postIds = _.pluck(_.sortBy(posts, 'date'), '_id');

    return (
      <div className="container">
        <h2>Thoughts on programming and things.</h2>

        <h6>Posts</h6>

        <ul>
          { postIds.reverse().map((postId) => {
            const post = posts[postId];

            return (
              <li key={postId}>
                <Link to={`/posts/${post.slug}`}>
                  {post.title}
                </Link> - {post.date}
              </li>
            );
          })
          }

          { this.props.editing &&
            <li>
              <div onClick={this.createAndRedirect.bind(this)}>New Post</div>
            </li>
          }
        </ul>
      </div>
    );
  }
}
