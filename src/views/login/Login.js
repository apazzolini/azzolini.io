import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as Admin from '../../redux/modules/admin';

@connect(
  state => ({
    admin: state.admin.toJS()
  }),
  dispatch => ({
    actions: bindActionCreators({
      login: Admin.login
    }, dispatch)
  })
)
export default class Home extends Component {
  static propTypes = {
    actions: PropTypes.shape({
      login: PropTypes.func
    }),
    admin: PropTypes.object
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  componentWillMount() {
    const {router} = this.context;
    this.router = router;
  }

  loginAndRedirect(e) {
    e.preventDefault();

    const auth = this.refs.auth.getDOMNode().value.trim();
    if (!auth) {
      return;
    }

    this.props.actions.login(auth).then((res) => {
      console.log(res);
      // window.location = '/';
    }, (err) => {
      console.log('error', err);
    });

    this.refs.auth.value = '';
  }

  render() {
    require('./Login.scss');

    return (
      <div className="container">
        <h2>Thoughts on programming and things.</h2>

        <form onSubmit={this.loginAndRedirect.bind(this)}>
          <input type="text" placeholder="Password" ref="auth" />

          { this.props.admin.loginError &&
            <span>Error logging in</span>
          }

          { this.props.admin.isAdmin &&
            <span>isAdmin set to true</span>
          }
        </form>
      </div>
    );
  }
}
