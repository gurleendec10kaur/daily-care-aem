/*
 * Table block: turns authored rows into a data table.
 * The first row is the header. Variant "striped" adds zebra rows.
 */
export default function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  [...block.children].forEach((row, i) => {
    const tr = document.createElement('tr');
    [...row.children].forEach((cell) => {
      const c = document.createElement(i === 0 ? 'th' : 'td');
      c.innerHTML = cell.innerHTML;
      tr.append(c);
    });
    (i === 0 ? thead : tbody).append(tr);
  });
  table.append(thead, tbody);
  const wrap = document.createElement('div');
  wrap.className = 'table-scroll';
  wrap.append(table);
  block.replaceChildren(wrap);
}
