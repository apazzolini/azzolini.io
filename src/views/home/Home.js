import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { routeActions } from 'react-router-redux';
import _ from 'lodash';
import * as Docs from '../../redux/modules/docs';

const mapStateToProps = (state) => ({
  editing: state.admin.get('isEditing'),
  docs: state.docs.get('entities').toJS()
});

class Home extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    editing: PropTypes.bool,
    docs: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
  }

  createAndRedirect = () => {
    this.dispatch(Docs.actions.create('post')).then((res) => {
      this.dispatch(routeActions.push(`/posts/${res.result.slug}`));
    });
  };

  deletePost = (post) => {
    if (confirm(`Really delete ${post.title}?`)) {
      this.dispatch(Docs.actions.deleteDoc(post._id));
    }
  };

  static fetchData(getState, dispatch) {
    if (!Docs.selectors.isLoaded(getState())) {
      return dispatch(Docs.actions.load());
    }
  }

  render() {
    require('./Home.scss');

    const { docs } = this.props;
    const dateSortedIds = _.chain(docs)
      .filter('type', 'post')
      .filter(d => this.props.editing || d.published)
      .sortBy('date')
      .pluck('_id')
      .value();

    return (
      <div className="container">
        <h1>Thoughts on programming and things</h1>

        <h3>Posts</h3>

        <ul>
          { dateSortedIds.reverse().map((postId) => {
            const post = docs[postId];

            return (
              <li key={postId}>
                <Link to={`/posts/${post.slug}`}>
                  {post.title}
                </Link>
                { this.props.editing &&
                  <span className="edit" onClick={() => this.deletePost(post)}>Delete</span>
                }
              </li>
            );
          })
          }

          { this.props.editing &&
            <li>
              <span className="edit" onClick={this.createAndRedirect}>New Post</span>
            </li>
          }
        </ul>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Home);
