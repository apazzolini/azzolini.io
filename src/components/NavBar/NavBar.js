import React, {Component} from 'react';
import {Link} from 'react-router';

export default class NavBar extends Component {
  constructor() {
    super();

    this.state = {
      menuExpanded: false,
      menuPinned: false,
      scrollY: -1
    };
  }

  componentDidMount() {
    // If we've determined this is a mobile browser, we want to use an expanding
    // menu with animation. This must be determined client-side.
    this.isExpandingMenu = typeof window !== 'undefined' && window.innerWidth < 550;
    if (this.isExpandingMenu) {
      this.forceUpdate();
    }

    // Delay the binding in case the browser is restoring scroll position
    setTimeout(() => {
      this.boundHandleScroll = this.handleScroll.bind(this);
      window.addEventListener('scroll', this.boundHandleScroll);
    }, 1000);
  }

  componentWillUnmount() {
    if (typeof this.boundHandleScroll !== 'undefined') {
      window.removeEventListener('scroll', this.boundHandleScroll);
    }
  }

  handleScroll(event) {
    const pos = event.srcElement.body.scrollTop;
    this.setState({
      ...this.state,
      scrollY: pos,
      menuPinned: pos < this.state.scrollY,
      menuExpanded: this.state.menuExpanded && pos < this.state.scrollY
    });
  }

  collapseMenu() {
    this.setState({ ...this.state, menuExpanded: false });
  }

  toggleMenuExpanded(expanded) {
    this.setState({ ...this.state, menuExpanded: !this.state.menuExpanded });
  }

  render() {
    require('./NavBar.scss');

    let mainNavAnimation = '';
    if (this.isExpandingMenu && this.state.scrollY !== -1) {
      mainNavAnimation = 'expanding-menu animated ' + (this.state.menuPinned ? 'slideInDown' : 'slideOutUp');
    }

    return (
      <nav className={'MainNav ' + mainNavAnimation}>
        <div className="container">
          <Link to="/">Andre Azzolini</Link>

          <ul className={'u-pull-right ' + (this.isExpandingMenu ? 'expanding-menu' : '')}>
            { this.isExpandingMenu &&
              <li className="expand-icon">
                <a onClick={() => this.toggleMenuExpanded()}>
                  <span></span>
                </a>
              </li>
            }

            <div className={(this.isExpandingMenu && !this.state.menuExpanded ? 'u-hidden' : '')}>
              <li><Link to="/about" onClick={() => this.collapseMenu()}>About</Link></li>
              <li><a href="https://www.github.com/apazzolini">GitHub</a></li>
              <li><a href="https://twitter.com/apazzolini">Twitter</a></li>
            </div>
          </ul>

          <div className="u-cf"></div>
        </div>
      </nav>
    );
  }
}
