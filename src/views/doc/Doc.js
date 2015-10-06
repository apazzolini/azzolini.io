import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import _ from 'lodash';
import * as Docs from '../../redux/modules/docs';
import {Editor} from '../../components';
import {parseHeader, isHeaderValid} from '../../utils/markdownParser.js';

@connect(
  state => ({
    editing: state.admin.get('editing'),
    docs: state.docs.get('entities').toJS(),
  }),
  dispatch => ({
    actions: bindActionCreators({
      updateContent: Docs.updateContent,
      updateContentFailed: Docs.updateContentFailed,
      save: Docs.save
    }, dispatch)
  })
)
export default class Doc extends Component {
  static propTypes = {
    actions: PropTypes.shape({
      updateContent: PropTypes.func,
      updateContentFailed: PropTypes.func,
      save: PropTypes.func
    }),
    editing: PropTypes.bool,
    docs: PropTypes.object,
    params: PropTypes.shape({
      slug: PropTypes.string.isRequired
    }),
    route: PropTypes.shape({
      type: PropTypes.string
    })
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  componentWillMount() {
    const {router} = this.context;
    this.router = router;
    this.debouncedSave = _.debounce(this.props.actions.save, 1000);
  }

  shouldComponentUpdate() {
    // TODO: This probably updates too eagerly
    return !this.preventComponentUpdate;
  }

  onChange(doc, newContent) {
    if (!isHeaderValid(newContent)) {
      this.props.actions.updateContentFailed(doc, newContent, 'Header invalid');
      return;
    }

    const header = parseHeader(newContent);

    if (header.slug !== doc.slug) {
      // If we're changing the URL, we have to delay React's ability to re-render
      // the component until we're both done with updating the URL and updating
      // the Redux store.
      this.preventComponentUpdate = true;

      this.props.actions.updateContent(doc, newContent);

      if (header.type === 'post') {
        this.router.replaceWith('/posts/' + header.slug);
      } else {
        this.router.replaceWith('/' + header.slug);
      }

      this.preventComponentUpdate = false;
    } else {
      this.props.actions.updateContent(doc, newContent);
    }

    this.debouncedSave(doc, newContent);
  }

  static fetchData(store, params, query) {
    if (!Docs.isFullyLoaded(store.getState(), this.type, params.slug)) {
      return store.dispatch(Docs.loadDoc(store.getState(), this.type, params.slug));
    }
  }

  render() {
    require('./Doc.scss');
    const doc = _.find(this.props.docs, 'slug', this.props.params.slug);

    return (
      <div className={this.props.editing && 'editing'}>
        { this.props.editing &&
          <Editor name="ace"
            content={doc.content}
            onChange={this.onChange.bind(this, doc)} />
        }

        { this.props.editing && doc.updateError &&
          <div className="updateError">{doc.updateError}</div>
        }

        <div className="Doc container">
          <div className="content" dangerouslySetInnerHTML={{__html: doc.html}} />
        </div>
      </div>
    );
  }
}
