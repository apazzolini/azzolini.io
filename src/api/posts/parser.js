import marked from 'marked';

export function parseMarkdown(post) {
  return marked(post.content);
}
