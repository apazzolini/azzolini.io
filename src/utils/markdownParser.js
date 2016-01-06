import marked from 'marked';
import hljs from 'highlight.js';
import yaml from 'js-yaml';
import moment from 'moment';

(function initializeMarked() {
  const renderer = new marked.Renderer();

  // We want to render manually instead of using highlight.js's
  // highlightAuto function for performance reasons.
  renderer.code = (code, language) => {
    if (!language || !hljs.getLanguage(language)) {
      return `<pre><code class="hljs">${code}</code></pre>`;
    }

    const highlightedCode = hljs.highlight(language, code).value;
    return `<pre><code class="hljs ${language}">${highlightedCode}</code></pre>`;
  };

  renderer.image = (href, title, text) => {
    return `<img src="${href}" alt="${text}" /> <span class="caption">${text}</span>`;
  };

  marked.setOptions({
    renderer
  });
})();

function headerExists(content) {
  return content.indexOf('---') === 0;
}

function stripHeader(content) {
  return content.substring(content.indexOf('---', 1) + 3);
}

function getFormattedDate(header) {
  if (header.date) {
    return moment(header.date).format('MMMM YYYY');
  } else {
    return '';
  }
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
  if (headerExists(content)) {
    const header = parseHeader(content);
    const mdTitle = `# ${header.title}`;
    const mdDate = getFormattedDate(header);
    return marked(`${mdTitle}\n\n${stripHeader(content)}\n\n${mdDate}`);
  } else {
    return marked(content);
  }
}
