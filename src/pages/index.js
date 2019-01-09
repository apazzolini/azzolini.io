import React from 'react'
import { Link, graphql } from 'gatsby'
import styled from 'styled-components'
import Layout from '../components/Layout'
import SEO from '../components/SEO'

const PostsHeader = styled.div`
  text-transform: uppercase;
  margin-top: 1.6em;
  font-size: 1.4rem;
  font-weight: 300;
  letter-spacing: 0.1rem;
  margin: 2rem 0;
`

const isDev = process.env.NODE_ENV === 'development'

class BlogIndex extends React.Component {
  render() {
    const { data } = this.props
    const posts = data.allMarkdownRemark.edges

    return (
      <Layout location={this.props.location} header="Thoughts on programming and things">
        <SEO title="Home" keywords={['blog', 'javascript', 'react']} />

        <PostsHeader>Posts</PostsHeader>

        <ul>
          {posts
            .filter(({ node }) => node.fields.slug.startsWith('/posts'))
            .filter(({ node }) => node.frontmatter.published || isDev)
            .map(({ node }) => {
              const title = node.frontmatter.title || node.fields.slug
              return (
                <li key={node.fields.slug}>
                  <Link style={{ boxShadow: 'none' }} to={node.fields.slug}>
                    {title}
                  </Link>
                </li>
              )
            })}
        </ul>
      </Layout>
    )
  }
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [fields___sortKey], order: DESC }) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
            published
          }
        }
      }
    }
  }
`
