import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {pushPath} from 'redux-simple-router';
import _ from 'lodash';
import * as Docs from '../../redux/modules/docs';

@connect(
  state => ({
    editing: state.admin.get('isEditing'),
    docs: state.docs.get('entities').toJS(),
  }),
  dispatch => ({
    actions: bindActionCreators({
      createNewPost: Docs.create.bind(null, 'post'),
      deletePost: Docs.deleteDoc,
      pushPath
    }, dispatch)
  })
)
export default class Home extends Component {
  static propTypes = {
    actions: PropTypes.shape({
      createNewPost: PropTypes.func,
      deletePost: PropTypes.func,
      pushPath: PropTypes.func.isRequired
    }),
    editing: PropTypes.bool,
    docs: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.createAndRedirect = this.createAndRedirect.bind(this);
  }

  createAndRedirect() {
    this.props.actions.createNewPost().then((res) => {
      this.props.actions.pushPath(`/posts/${res.result.slug}`);
    });
  }

  deletePost(post) {
    if (confirm(`Really delete ${post.title}?`)) {
      this.props.actions.deletePost(post._id);
    }
  }

  static fetchData(getState, dispatch) {
    if (!Docs.isLoaded(getState())) {
      return dispatch(Docs.load());
    }
  }

  render() {
    require('./Home.scss');

    const {docs} = this.props;
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
