import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { routeActions } from 'react-router-redux';
import DocumentMeta from 'react-document-meta';
import _ from 'lodash';
import * as Docs from '../../redux/modules/docs';
import NotFound from '../_errors/NotFound';
import { Editor } from '../../components';
import { parseHeader, isHeaderValid } from '../../utils/markdownParser.js';

const mapStateToProps = (state) => ({
  editing: state.admin.get('isEditing'),
  docs: state.docs.get('entities').toJS()
});

class Doc extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    editing: PropTypes.bool,
    docs: PropTypes.object,
    params: PropTypes.shape({
      slug: PropTypes.string
    })
  };

  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
  }

  componentWillMount() {
    this.debouncedSave = _.debounce((doc, newContent) => (
      this.dispatch(Docs.actions.save(doc, newContent))
    ), 1000);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !this.preventComponentUpdate;
  }

  onEditorChange = (newContent) => {
    if (!isHeaderValid(newContent)) {
      this.dispatch(Docs.actions.updateContentFailed(this.doc, newContent, 'Header invalid'));
      return;
    }

    const doc = this.doc;
    const header = parseHeader(newContent);

    if (header.slug !== doc.slug && header.type === 'post') {
      // If we're changing the URL, we have to delay React's ability to re-render the
      // component until we're both done with updating the URL and updating the Redux store.
      this.preventComponentUpdate = true;

      this.dispatch(Docs.actions.updateContent(doc, newContent));
      this.dispatch(routeActions.replace('/posts/' + header.slug));

      this.preventComponentUpdate = false;
    } else {
      this.dispatch(Docs.actions.updateContent(doc, newContent));
    }

    this.debouncedSave(doc, newContent);
  };

  get doc() {
    return this.findDoc(this.props);
  }

  findDoc(props) {
    const slug = props.params.slug || props.route.path;
    return _.find(props.docs, 'slug', slug);
  }

  static fetchData(getState, dispatch, location, params) {
    const slug = params.slug || location.pathname.substring(1);
    const type = location.pathname.indexOf('/posts') === 0 ? 'post' : 'page';
    if (!Docs.selectors.isFullyLoaded(getState(), type, slug)) {
      return dispatch(Docs.actions.loadDoc(getState(), type, slug));
    }
  }

  render() {
    require('./Doc.scss');

    const meta = {};
    if (this.doc && this.doc.title) {
      meta.title = `${this.doc.title} | Andre Azzolini`;
    }

    if (!this.doc) {
      return (
        <NotFound />
      );
    }

    return (
      <div className={this.props.editing && 'editing'}>

        <DocumentMeta {...meta} extend />

        { this.props.editing &&
          <Editor name="ace"
            content={this.doc.content}
            onChange={this.onEditorChange}
          />
        }

        { this.props.editing && this.doc.updateError &&
          <div className="updateError">{this.doc.updateError}</div>
        }

        { this.props.editing && !this.doc.dirty && this.doc.saved &&
          <div className="saved">Saved</div>
        }

        <div className="Doc container">
          <div className="content" dangerouslySetInnerHTML={{ __html: this.doc.html }} />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Doc);
