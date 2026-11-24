/*
 * Help Library block.
 * Lists the help articles authored in the "help-articles" sheet (published at
 * /help-articles.json), grouped by section, with a search box. DocIQ in the
 * Daily Care App block answers from the same sheet: one content source, two experiences.
 * Optional block cell: a different sheet path, e.g. /help-articles.json
 */
function el(tag, attrs = {}, text = '') {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  if (text) e.textContent = text;
  return e;
}

async function fetchArticles(path) {
  try {
    const resp = await fetch(path);
    if (!resp.ok) return [];
    const json = await resp.json();
    return (json.data || []).filter((r) => r.title && r.text);
  } catch (e) {
    return [];
  }
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const cellText = block.textContent.trim();
  let path = '/help-articles.json';
  if (link) path = new URL(link.href).pathname;
  else if (cellText.startsWith('/')) path = cellText;

  const articles = await fetchArticles(path);
  block.textContent = '';

  if (!articles.length) {
    block.append(el('p', { class: 'help-library-empty' }, 'No help articles are published yet.'));
    return;
  }

  const search = el('input', {
    type: 'search',
    class: 'help-library-search',
    placeholder: `Search ${articles.length} help articles`,
    'aria-label': 'Search help articles',
  });
  const count = el('p', { class: 'help-library-count', 'aria-live': 'polite' });
  const list = el('div', { class: 'help-library-list' });

  const sections = [...new Set(articles.map((a) => a.section || 'Help'))];
  sections.forEach((sec) => {
    const group = el('section', { class: 'help-library-section' });
    group.append(el('h3', {}, sec));
    articles.filter((a) => (a.section || 'Help') === sec).forEach((a) => {
      const item = el('details', { class: 'help-library-item' });
      item.dataset.search = `${a.title} ${a.text} ${sec}`.toLowerCase();
      item.append(el('summary', {}, a.title), el('p', {}, a.text));
      group.append(item);
    });
    list.append(group);
  });

  const update = () => {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    list.querySelectorAll('.help-library-item').forEach((item) => {
      const hit = !q || q.split(/\s+/).every((w) => item.dataset.search.includes(w));
      item.hidden = !hit;
      if (hit) shown += 1;
    });
    list.querySelectorAll('.help-library-section').forEach((g) => {
      g.hidden = !g.querySelector('.help-library-item:not([hidden])');
    });
    count.textContent = q ? `${shown} of ${articles.length} articles match` : `${articles.length} articles`;
  };
  search.addEventListener('input', update);
  update();

  block.append(search, count, list);
}
