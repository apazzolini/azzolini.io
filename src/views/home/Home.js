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
      .sortBy('date')
      .pluck('_id')
      .value();

    return (
      <div className="container">
        <h2>Thoughts on programming and things.</h2>

        <h6>Posts</h6>

        <ul>
          { dateSortedIds.reverse().map((postId) => {
            const post = docs[postId];

            return (
              <li key={postId}>
                <Link to={`/posts/${post.slug}`}>
                  {post.title}
                </Link>
                - {post.date}
                { this.props.editing &&
                  <span onClick={this.props.actions.deletePost.bind(null, post._id)}>Delete</span>
                }
              </li>
            );
          })
          }

          { this.props.editing &&
            <li>
              <div onClick={this.createAndRedirect}>New Post</div>
            </li>
          }
        </ul>
      </div>
    );
  }
}
