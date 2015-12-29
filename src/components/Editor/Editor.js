import React, {Component, PropTypes} from 'react';

export default class Editor extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    content: PropTypes.string,
    onChange: PropTypes.func.isRequired
  }

  onAceLoad(editor) {
    editor.getSession().setUseWrapMode(true);

    editor.getKeyboardHandler().defaultKeymap.unshift({
      keys: 'j',
      toKeys: 'gj',
      type: 'keyToKey',
      user: true
    });

    editor.getKeyboardHandler().defaultKeymap.unshift({
      keys: 'k',
      toKeys: 'gk',
      type: 'keyToKey',
      user: true
    });

    editor.getKeyboardHandler().defaultKeymap.unshift({
      keys: 'H',
      toKeys: '^',
      type: 'keyToKey',
      user: true
    });

    editor.getKeyboardHandler().defaultKeymap.unshift({
      keys: 'L',
      toKeys: '$',
      type: 'keyToKey',
      user: true
    });

    editor.getKeyboardHandler().defaultKeymap.unshift({
      keys: '<Space>',
      toKeys: '10j',
      type: 'keyToKey',
      user: true
    });

    editor.getKeyboardHandler().defaultKeymap.unshift({
      keys: '<BS>',
      toKeys: '10k',
      type: 'keyToKey',
      user: true
    });
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
              value={this.props.content}
              onChange={this.props.onChange}
              onLoad={this.onAceLoad}
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
