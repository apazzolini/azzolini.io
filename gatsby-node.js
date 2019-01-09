const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const blogPost = path.resolve('./src/components/Post.js')

  const result = await graphql(`
    {
      allMarkdownRemark(sort: { fields: [fields___sortKey], order: DESC }, limit: 1000) {
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
              title
            }
          }
        }
      }
    }
  `)

  if (result.errors) {
    console.log(result.errors)
    throw result.errors
  }

  result.data.allMarkdownRemark.edges.forEach(post => {
    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
      },
    })
  })
}

const urlSlug = title =>
  title
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === 'MarkdownRemark') {
    let slug = createFilePath({ node, getNode })
    let sortKey

    if (slug.startsWith('/posts')) {
      sortKey = slug
      slug = `/posts/${urlSlug(node.frontmatter.title)}`
    }

    createNodeField({
      name: 'slug',
      node,
      value: slug,
    })

    if (sortKey) {
      createNodeField({
        name: 'sortKey',
        node,
        value: sortKey,
      })
    }
  }
}
