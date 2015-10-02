import React, {Component, PropTypes} from 'react';
// import AceEditor from 'react-ace';
// import brace from 'brace';
// import 'brace/mode/markdown';
// import 'brace/theme/github';

export default class Editor extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired
  }

  onChange(newValue) {
    console.log('change', newValue);
  }

  render() {
    require('./Editor.scss');

    if (__CLIENT__) {
      const AceEditor = require('react-ace');
      require('brace/mode/markdown');
      require('brace/theme/solarized_light');
      require('brace/keybinding/vim');

      return (
        <div id="Editor">
          <div id="Editor-TopBar">
          </div>

          <div id="Editor-AceContainer">
            <AceEditor
              width="100%"
              height="100%"
              mode="markdown"
              keyboardHandler="vim"
              theme="solarized_light"
              onChange={this.onChange}
              name={this.props.name}
              editorProps={{$blockScrolling: true}}
            />
          </div>
        </div>
      );
    }

    return null;
  }
}
