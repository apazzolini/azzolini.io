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
    this.determineExpandingMenu();

    // TODO: Consider using touchmove in addition to scroll for better mobile support

    // Delay the binding in case the browser is restoring scroll position
    setTimeout(() => {
      window.addEventListener('scroll', this.handleScroll);
      window.addEventListener('resize', this.determineExpandingMenu);
    }, 1000);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.determineExpandingMenu);
  }

  handleScroll = (event) => {
    const pos = event.srcElement.body.scrollTop;

    this.setState({
      ...this.state,
      scrollY: pos,
      menuPinned: pos < this.state.scrollY,
      menuExpanded: this.state.menuExpanded && pos < this.state.scrollY
    });
  };

  determineExpandingMenu = () => {
    // If we've determined this is a mobile browser, we want to use an expanding
    // menu with animation. This must be determined client-side.
    this.isExpandingMenu = typeof window !== 'undefined' && window.innerWidth < 550;

    if (this.isExpandingMenu) {
      this.setState({...this.state, menuExpanded: false});
    } else {
      this.setState({...this.state, menuExpanded: true});
    }

    this.forceUpdate();
  };

  collapseMenu = () => {
    this.setState({...this.state, menuExpanded: false});
  };

  toggleMenuExpanded = () => {
    this.setState({...this.state, menuExpanded: !this.state.menuExpanded});
  };

  render() {
    require('./NavBar.scss');

    let mainNavAnimation = '';
    if (this.isExpandingMenu && this.state.scrollY !== -1) {
      mainNavAnimation = 'expanding-menu animated ' + (this.state.menuPinned ? 'slideInDown' : 'slideOutUp');
    }

    return (
      <nav className={'MainNav ' + mainNavAnimation}>
        <div className="container">
          <Link to="/" onClick={this.collapseMenu}>Andre Azzolini</Link>

          <ul className={'u-pull-right ' + (this.isExpandingMenu ? 'expanding-menu' : '')}>
            { this.isExpandingMenu &&
              <li className="expand-icon">
                <a onClick={this.toggleMenuExpanded}>
                  <span></span>
                </a>
              </li>
            }

            <div className={(this.isExpandingMenu && !this.state.menuExpanded ? 'u-hidden' : '')}>
              <li><Link to="/about" onClick={this.collapseMenu}>About</Link></li>
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
