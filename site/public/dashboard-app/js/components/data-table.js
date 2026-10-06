import { formatCurrency, formatNumber, formatPercent } from '../formatters.js';
import { createCSVButton } from '../utils/export.js';

export function createDataTable(container, {
  columns,
  rows,
  sortable = true,
  defaultSort = null,
  csvFilename = null,
  rowClass = null,  // (row) => className string or null
}) {
  const card = document.createElement('div');
  card.className = 'card';

  const wrapper = document.createElement('div');
  wrapper.className = 'data-table-wrapper';

  const table = document.createElement('table');
  table.className = 'data-table';

  // State
  let sortKey = defaultSort ? defaultSort.key : null;
  let sortDir = defaultSort ? defaultSort.direction : 'asc';
  let sortedRows = [...rows];

  // Sort function
  function sortRows() {
    if (!sortKey) return;
    const col = columns.find(c => c.key === sortKey);
    sortedRows.sort((a, b) => {
      let va = a[sortKey];
      let vb = b[sortKey];
      if (col && (col.type === 'number' || col.type === 'currency' || col.type === 'percent' || col.type === 'qs' || col.type === 'roas')) {
        va = parseFloat(va) || 0;
        vb = parseFloat(vb) || 0;
      } else {
        va = String(va || '').toLowerCase();
        vb = String(vb || '').toLowerCase();
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Render thead
  function renderHead() {
    const thead = table.querySelector('thead') || document.createElement('thead');
    thead.innerHTML = '';
    const tr = document.createElement('tr');

    columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.label;

      if (col.align === 'right') {
        th.style.textAlign = 'right';
      }

      if (sortable) {
        th.style.cursor = 'pointer';
        const icon = document.createElement('span');
        icon.className = 'sort-icon';
        if (sortKey === col.key) {
          th.classList.add('sorted');
          icon.textContent = sortDir === 'asc' ? ' \u25B2' : ' \u25BC';
        } else {
          icon.textContent = ' \u25B2';
          icon.style.opacity = '0.3';
        }
        th.appendChild(icon);

        th.addEventListener('click', () => {
          if (sortKey === col.key) {
            sortDir = sortDir === 'asc' ? 'desc' : 'asc';
          } else {
            sortKey = col.key;
            sortDir = 'asc';
          }
          sortRows();
          renderHead();
          renderBody();
        });
      }

      tr.appendChild(th);
    });

    thead.appendChild(tr);
    if (!table.querySelector('thead')) {
      table.appendChild(thead);
    }
  }

  // Render cell
  function renderCell(col, value) {
    const td = document.createElement('td');

    if (col.align === 'right' || col.type === 'number' || col.type === 'currency' || col.type === 'percent' || col.type === 'roas') {
      td.className = 'num';
    }

    switch (col.type) {
      case 'text':
        td.textContent = value != null ? value : '';
        break;

      case 'number':
        td.textContent = formatNumber(value);
        break;

      case 'currency':
        td.textContent = formatCurrency(value);
        break;

      case 'percent':
        td.textContent = formatPercent(value);
        break;

      case 'badge': {
        const badge = document.createElement('span');
        const badgeClass = String(value || '').toLowerCase().replace(/\s+/g, '-');
        badge.className = `badge badge-${badgeClass}`;
        badge.textContent = value;
        td.appendChild(badge);
        td.className = '';
        break;
      }

      case 'qs': {
        const qs = document.createElement('span');
        const numVal = parseFloat(value) || 0;
        let qsClass = 'qs-bad';
        if (numVal >= 7) qsClass = 'qs-good';
        else if (numVal >= 5) qsClass = 'qs-ok';
        qs.className = `qs-indicator ${qsClass}`;
        qs.textContent = value;
        td.appendChild(qs);
        td.className = '';
        break;
      }

      case 'roas': {
        const numVal = parseFloat(value) || 0;
        td.textContent = numVal.toFixed(2) + 'x';
        if (numVal >= 2) {
          td.classList.add('highlight-positive');
        } else if (numVal < 1.5) {
          td.classList.add('highlight-negative');
        }
        break;
      }

      default:
        td.textContent = value != null ? value : '';
    }

    return td;
  }

  // Render tbody
  function renderBody() {
    let tbody = table.querySelector('tbody');
    if (tbody) {
      tbody.innerHTML = '';
    } else {
      tbody = document.createElement('tbody');
      table.appendChild(tbody);
    }

    sortedRows.forEach(row => {
      const tr = document.createElement('tr');
      if (rowClass) {
        const cls = rowClass(row);
        if (cls) tr.className = cls;
      }
      columns.forEach(col => {
        tr.appendChild(renderCell(col, row[col.key]));
      });
      tbody.appendChild(tr);
    });
  }

  // Initial sort
  if (defaultSort) {
    sortRows();
  }

  renderHead();
  renderBody();

  wrapper.appendChild(table);
  card.appendChild(wrapper);

  // Add CSV export button if filename provided
  if (csvFilename) {
    card.style.position = 'relative';
    const csvBtn = createCSVButton(() => ({
      headers: columns.map(c => c.label),
      rows: sortedRows.map(row => columns.map(c => row[c.key] ?? '')),
    }), csvFilename);
    card.appendChild(csvBtn);
  }

  container.appendChild(card);

  return card;
}
