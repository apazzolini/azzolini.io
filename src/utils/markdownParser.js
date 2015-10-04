import marked from 'marked';
import yaml from 'js-yaml';

function headerExists(content) {
  return content.indexOf('---') === 0;
}

function stripHeader(content) {
  return content.substring(content.indexOf('---', 1) + 3);
}

export function parseHeader(content) {
  try {
    const frontMatter = content.substring(3, content.indexOf('---', 1));
    return yaml.safeLoad(frontMatter);
  } catch (e) {
    console.log(e);
    return null;
  }
}

export function parseMarkdown(content) {
  const mdContent = headerExists(content) ? stripHeader(content) : content;
  return marked(mdContent);
}


