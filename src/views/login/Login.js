import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {routeActions} from 'react-router-redux';
import * as Admin from '../../redux/modules/admin';

const mapStateToProps = (state) => ({
  admin: state.admin.toJS()
});

class Login extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    admin: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
  }

  loginAndRedirect = (e) => {
    e.preventDefault();

    const auth = this.refs.auth.value.trim();
    if (!auth) {
      return;
    }

    this.dispatch(Admin.actions.login(auth)).then((res) => {
      if (this.props.admin.isAdmin) {
        this.dispatch(routeActions.push(`/`));
      }
    }, (err) => {
      console.log('error', err);
    });

    this.refs.auth.value = '';
  };

  render() {
    require('./Login.scss');

    return (
      <div className="container">
        <h1>Login</h1>

        <form onSubmit={this.loginAndRedirect}>
          <input type="text" placeholder="Password" ref="auth" />

          { this.props.admin.loginError &&
            <span>Error logging in</span>
          }
        </form>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Login);
