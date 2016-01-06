import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {replacePath} from 'redux-simple-router';
import DocumentMeta from 'react-document-meta';
import _ from 'lodash';
import * as Docs from '../../redux/modules/docs';
import NotFound from '../_errors/NotFound';
import {Editor} from '../../components';
import {parseHeader, isHeaderValid} from '../../utils/markdownParser.js';

@connect(
  state => ({
    editing: state.admin.get('isEditing'),
    docs: state.docs.get('entities').toJS(),
  }),
  dispatch => ({
    actions: bindActionCreators({
      updateContent: Docs.updateContent,
      updateContentFailed: Docs.updateContentFailed,
      save: Docs.save,
      replacePath
    }, dispatch)
  })
)
class Doc extends Component {
  static propTypes = {
    actions: PropTypes.shape({
      updateContent: PropTypes.func,
      updateContentFailed: PropTypes.func,
      save: PropTypes.func,
      replacePath: PropTypes.func.isRequired
    }),
    editing: PropTypes.bool,
    docs: PropTypes.object,
    params: PropTypes.shape({
      slug: PropTypes.string.isRequired
    })
  }

  constructor(props) {
    super(props);
    this.onEditorChange = this.onEditorChange.bind(this);
  }

  componentWillMount() {
    this.debouncedSave = _.debounce(this.props.actions.save, 1000);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !this.preventComponentUpdate;
  }

  onEditorChange(newContent) {
    if (!isHeaderValid(newContent)) {
      this.props.actions.updateContentFailed(this.doc, newContent, 'Header invalid');
      return;
    }

    const doc = this.doc;
    const header = parseHeader(newContent);

    if (header.slug !== doc.slug) {
      // If we're changing the URL, we have to delay React's ability to re-render the
      // component until we're both done with updating the URL and updating the Redux store.
      this.preventComponentUpdate = true;

      this.props.actions.updateContent(doc, newContent);

      if (header.type === 'post') {
        this.props.actions.replacePath('/posts/' + header.slug);
      } else {
        this.props.actions.replacePath('/' + header.slug);
      }

      this.preventComponentUpdate = false;
    } else {
      this.props.actions.updateContent(doc, newContent);
    }

    this.debouncedSave(doc, newContent);
  }

  get doc() {
    return this.findDoc(this.props);
  }

  findDoc(props) {
    return _.find(props.docs, 'slug', props.params.slug);
  }

  static fetchData(getState, dispatch, location, params) {
    if (!Docs.isFullyLoaded(getState(), this.type, params.slug)) {
      return dispatch(Docs.loadDoc(getState(), this.type, params.slug));
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

        <div className="Doc container">
          <div className="content" dangerouslySetInnerHTML={{__html: this.doc.html}} />
        </div>
      </div>
    );
  }
}

export class DocPost extends Doc { static type = 'post' }
export class DocPage extends Doc { static type = 'page' }
