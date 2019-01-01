import React from 'react'
import styled from 'styled-components'
import { Link } from 'gatsby'
import 'sanitize.css'
import '../util/skeleton.css'

const Container = styled.div`
  background: white;

  h1 {
    text-align: center;
    margin-top: 3.5em;
    margin-bottom: 3em;
    font-size: 5rem;
  }
`

const NavWrapper = styled.div`
  height: 65px;
  line-height: 65px;
  width: 100%;
  border-bottom: 1px solid #eee;
  background: white;

  nav {
    margin: 0 auto;
    max-width: 860px;
    padding: 0 1rem;
    display: grid;
    grid-template-columns: max-content 1fr;
  }

  a {
    display: inline-block;
    line-height: 6.5rem;
    text-transform: uppercase;
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: 0.1rem;
    text-decoration: none;
    color: #222;
  }

  ul {
    list-style-type: none;
    justify-self: end;
    margin: 0;
    padding: 0;

    li {
      display: inline-block;
      padding-right: 2rem;
      &:last-child {
        padding-right: 0;
      }
    }
  }
`

const BodyWrapper = styled.div`
  max-width: 860px;
  margin: 0 auto;
  padding: 0 1rem;
`

class Layout extends React.Component {
  render() {
    return (
      <Container>
        <NavWrapper>
          <nav>
            <div>
              <Link to="/">Andre Azzolini</Link>
            </div>
            <ul>
              <li>
                <Link to="/about">about</Link>
              </li>
              <li>
                <a href="https://www.github.com/apazzolini">GitHub</a>
              </li>
              <li>
                <a href="https://twitter.com/apazzolini">Twitter</a>
              </li>
            </ul>
          </nav>
        </NavWrapper>

        <BodyWrapper>
          {this.props.header && <h1>{this.props.header}</h1>}
          {this.props.children}
        </BodyWrapper>
      </Container>
    )
  }
}

export default Layout
