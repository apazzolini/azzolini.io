import marked from 'marked';

export default function parse(content) {
  return marked(content);
}
