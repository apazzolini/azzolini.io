import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import _ from 'lodash';
import * as Docs from '../../redux/modules/docs';
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

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  componentWillMount() {
    console.log('mount');
    this.router = this.context.router;
    this.debouncedSave = _.debounce(this.props.actions.save, 1000);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.doc.content !== this.findCurrentDoc(nextProps).content;
  }

  onChange(newContent) {
    if (!isHeaderValid(newContent)) {
      this.props.actions.updateContentFailed(this.doc, newContent, 'Header invalid');
      return;
    }

    const header = parseHeader(newContent);

    if (header.slug !== this.doc.slug) {
      // If we're changing the URL, we have to delay React's ability to re-render
      // the component until we're both done with updating the URL and updating
      // the Redux store.
      this.preventComponentUpdate = true;

      this.props.actions.updateContent(this.doc, newContent);

      if (header.type === 'post') {
        this.router.replaceWith('/posts/' + header.slug);
      } else {
        this.router.replaceWith('/' + header.slug);
      }

      this.preventComponentUpdate = false;
    } else {
      this.props.actions.updateContent(this.doc, newContent);
    }

    this.debouncedSave(this.doc, newContent);
  }

  findCurrentDoc(props = this.props) {
    return _.find(props.docs, 'slug', props.params.slug);
  }

  static fetchData(store, params, query) {
    if (!Docs.isFullyLoaded(store.getState(), this.type, params.slug)) {
      return store.dispatch(Docs.loadDoc(store.getState(), this.type, params.slug));
    }
  }

  render() {
    require('./Doc.scss');
    this.doc = this.findCurrentDoc();
    console.log('rendering');

    return (
      <div className={this.props.editing && 'editing'}>
        { this.props.editing &&
          <Editor name="ace"
            content={this.doc.content}
            onChange={this.onChange} />
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
