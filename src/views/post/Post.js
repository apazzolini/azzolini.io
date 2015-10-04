import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import * as Posts from '../../redux/modules/posts';
import {Editor} from '../../components';

@connect(
  state => ({
    editing: state.admin.get('editing'),
    posts: state.posts.get('data').toJS(),
  })
)
export default class Post extends Component {
  static propTypes = {
    editing: PropTypes.boolean,
    posts: PropTypes.object,
    params: PropTypes.shape({
      title: PropTypes.string.isRequired
    })
  }

  componentDidMount() {
    console.log('mounted');
  }

  onChange(newValue) {
    console.log('changed ', newValue);
  }

  static fetchData(store, params, query) {
    if (!Posts.isFullyLoaded(store.getState(), params.title)) {
      return store.dispatch(Posts.loadSingle(store.getState(), params.title));
    }
  }

  render() {
    require('./Post.scss');
    const post = _.find(this.props.posts, 'normalizedTitle', this.props.params.title);

    return (
      <div className={this.props.editing && 'editing'}>
        {this.props.editing &&
          <Editor name="ace"
            content={post.content}
            onChange={this.onChange} />
        }

        <div className="Post container">
          <div dangerouslySetInnerHTML={{__html: post.html}} />
          { post.html }
        </div>
      </div>
    );
  }
}
