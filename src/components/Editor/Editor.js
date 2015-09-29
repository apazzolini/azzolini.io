import React, {Component, PropTypes} from 'react';
// import AceEditor from 'react-ace';
// import brace from 'brace';
// import 'brace/mode/markdown';
// import 'brace/theme/github';

export default class Editor extends Component {
  onChange(newValue) {
    console.log('change', newValue);
  }

  static propTypes = {
    name: PropTypes.string.isRequired
  }

  render() {
    const styles = require('./Editor.scss');

    if (__CLIENT__) {
      const AceEditor = require('react-ace');
      require('brace/mode/markdown');
      require('brace/theme/solarized_dark')
      require('brace/keybinding/vim')

      return (
        <AceEditor
          mode="markdown"
          keyboardHandler="vim"
          theme="solarized_dark"
          onChange={this.onChange}
          name={this.props.name}
          editorProps={{$blockScrolling: true}}
        />
      );
    } else {
      return null;
    }
  }
}
