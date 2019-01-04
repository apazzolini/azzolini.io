import React from 'react'
import { graphql } from 'gatsby'
import styled from 'styled-components'
import Layout from './Layout'
import SEO from './SEO'

const PostContainer = styled.div`
  h2 {
    margin-top: 2em;
    font-size: 2.3rem;
    font-weight: 500;
  }

  h3 {
    text-transform: uppercase;
    margin-top: 1.6em;
    font-size: 1.4rem;
    letter-spacing: 0.1rem;
    border-bottom: 1px solid #eee;
    display: inline-block;
  }

  blockquote {
    background: #f1f1f1;
    border-left: 7px solid #d8e0e5;
    margin: 0 0 2em;
    padding: 3px 10px;

    p {
      margin-bottom: 0;
    }
  }

  pre {
    padding: 0;
    margin-bottom: 2.5rem;
  }

  p code {
    background: none;
    color: #222;
  }

  pre > code {
    padding: 0.5rem;
    font-size: 1.2rem;
    background: #2d2d2d;
  }
`

const DateContainer = styled.p`
  margin-top: 2.5rem;
`

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark

    return (
      <Layout location={this.props.location}>
        <SEO title={post.frontmatter.title} description={post.excerpt} />
        <h1>{post.frontmatter.title}</h1>
        <PostContainer dangerouslySetInnerHTML={{ __html: post.html }} />
        <DateContainer>{post.frontmatter.date}</DateContainer>
      </Layout>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM YYYY")
      }
    }
  }
`
