import marked from 'marked';
import hljs from 'highlight.js';
import yaml from 'js-yaml';

(function initializeMarked() {
  marked.setOptions({
    langPrefix: 'hljs ',
    highlight: (code) => hljs.highlightAuto(code).value
  });
})();

function headerExists(content) {
  return content.indexOf('---') === 0;
}

function stripHeader(content) {
  return content.substring(content.indexOf('---', 1) + 3);
}

export function parseHeader(content) {
  const frontMatter = content.substring(3, content.indexOf('---', 1));
  return yaml.safeLoad(frontMatter, {
    schema: yaml.JSON_SCHEMA
  });
}

export function isHeaderValid(content) {
  try {
    const header = parseHeader(content);

    if (!header || !header.slug) {
      return false;
    }

    if (header.type === 'post' && !header.title) {
      return false;
    }
  } catch (e) {
    return false;
  }

  return true;
}

export function parseMarkdown(content) {
  const mdContent = headerExists(content) ? stripHeader(content) : content;
  return marked(mdContent);
}
