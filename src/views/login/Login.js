import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {pushPath} from 'redux-simple-router';
import * as Admin from '../../redux/modules/admin';

@connect(
  state => ({
    admin: state.admin.toJS()
  }),
  dispatch => ({
    actions: bindActionCreators({
      login: Admin.login,
      pushPath
    }, dispatch)
  })
)
export default class Login extends Component {
  static propTypes = {
    actions: PropTypes.shape({
      login: PropTypes.func.isRequired,
      pushPath: PropTypes.func.isRequired
    }),
    admin: PropTypes.object
  }

  loginAndRedirect(e) {
    e.preventDefault();

    const auth = this.refs.auth.value.trim();
    if (!auth) {
      return;
    }

    this.props.actions.login(auth).then((res) => {
      if (res.type === Admin.LOGIN_OK) {
        this.props.actions.pushPath(`/`);
      }
    }, (err) => {
      console.log('error', err);
    });

    this.refs.auth.value = '';
  }

  render() {
    require('./Login.scss');

    return (
      <div className="container">
        <h1>Login</h1>

        <form onSubmit={this.loginAndRedirect.bind(this)}>
          <input type="text" placeholder="Password" ref="auth" />

          { this.props.admin.loginError &&
            <span>Error logging in</span>
          }
        </form>
      </div>
    );
  }
}
